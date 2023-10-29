import os
import shutil
from threading import Thread

import ICloudAPI


class ICloudAlbumManager:

    # ----------- Constructor -----------
    def __init__(self):
        """
        Constructor
        """
        self._api = None
        self._download_threads = {}
        self._cancel_flags = {}

    # ----------- Properties -----------
    @property
    def is_trusted_session(self) -> bool:
        """
        Check if the current session is trusted
        :return: True if trusted, False otherwise
        """
        return self._api.is_trusted_session

    @property
    def is_logged_in(self) -> bool:
        """
        Check if the user is logged in
        :return: True if logged in, False otherwise
        """
        return self._api is not None

    @property
    def get_albums(self) -> dict:
        """
        Get the albums
        :return: dict of albums
        """
        result = {}
        for album in self._api.get_albums:
            result[album] = self._api.get_albums[album].to_dict()
        return result

    # ----------- Methods -----------
    def trust_session(self):
        """
        Trust the current session
        """
        self._api.trust_session()

    def validate_2fa_code(self, code: str) -> bool:
        """
        Validate a 2fa code
        :param code: code to validate
        :return: True if the code is valid, False otherwise
        """
        return self._api.validate_2fa_code(code)

    def login(self, username: str, password: str) -> bool:
        """
        Login to iCloud
        :param username: username to login with
        :param password: password to login with
        :return: True if 2fa needed, False otherwise
        """
        self._api = ICloudAPI.ICloudApi(username, password)
        return self._api.require_2fa

    def load_albums(self):
        """
        Load the albums from the iCloud API
        """
        self._api.load_albums()

    @staticmethod
    def _download_photo(photo, path: str) -> None:
        """
        Download a photo
        :param photo: photo to download
        :param path: path to download the photo to
        """
        print(f"Downloading {photo}...")
        if os.path.exists(path):
            print(f"File {path} already exists!")
            return
        with photo.download().raw as data:
            with open(path, 'wb') as file:
                shutil.copyfileobj(data, file)

    def download_album(self, album_name: str) -> None:
        """
        Download an album
        :param album_name: name of the album to download
        """
        album = self._api.get_albums[album_name]
        if album is None:
            print(f"Album {album_name} does not exist!")
            return
        if album_name in self._download_threads:
            print(f"Album {album_name} is already being downloaded!")
            return
        self._cancel_flags[album_name] = False
        path = os.path.join(os.getcwd(), album_name)
        self._download_threads[album_name] = Thread(target=self._download_album, args=(album_name, path))
        self._download_threads[album_name].start()
        print(f"Downloading album {album_name}...")

    def _download_album(self, album_name: str, path: str) -> None:
        """
        Download an album
        :param album_name: name of the album to download
        :param path: path to download the album to
        """
        if not os.path.exists(path):
            os.mkdir(album_name)
        for photo in self._api.get_photos(album_name):
            if self._cancel_flags[album_name]:
                print(f"Album {album_name} download canceled!")
                self._cleanup_download(album_name)
                return

            self._download_photo(photo, os.path.join(album_name, os.path.join(path, photo.filename)))
        print(f"Album {album_name} download completed!")
        self._cleanup_download(album_name)

    def set_cancel_flag(self, album_name: str, flag: bool) -> None:
        """
        Set the cancel flag for an album
        :param album_name: name of the album to set the flag for
        :param flag: value of the flag
        """
        self._cancel_flags[album_name] = flag

    def _cleanup_download(self, album_name: str) -> None:
        """
        Cleanup after an album download
        :param album_name: name of the album to cleanup
        """
        if album_name in self._download_threads:
            del self._download_threads[album_name]
        if album_name in self._cancel_flags:
            del self._cancel_flags[album_name]

    def delete_album(self, album_name: str) -> None:
        """
        Delete an album
        :param album_name: name of the album to delete
        """
        if not self._api.get_albums[album_name].is_on_disk:
            print(f"Album {album_name} is not on disk!")
            return
        path = os.path.join(os.getcwd(), album_name)
        shutil.rmtree(path)
        print(f"Album {album_name} deleted!")

