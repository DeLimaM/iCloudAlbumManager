import asyncio
import datetime
import json
import os
import shutil
import sys
import pyicloud
import threading
import eel
from exceptions import *


class ICloudAlbumSync:
    def __init__(self) -> None:
        """
        Constructor for ICloudAlbumSync class
        """
        self.api = None
        self.download_directory = os.getcwd()
        self.conf_path = os.path.join(os.getcwd(), 'conf.json')
        self.cancel_flags = {}
        self.download_threads = {}
        self.albums = []
        self.cookie_directory = os.path.join(os.getcwd(), 'cookies')
        self.require_2fa_result = None
        self.is_logged_in = False
        self.albums_infos = {}

        self.load_conf()

    def load_conf(self) -> None:
        """
        Load the configuration file
        """
        try:
            if os.path.exists(self.conf_path):
                with open(self.conf_path, 'r') as file:
                    conf_data = json.load(file)
                    self.download_directory = conf_data.get('download_directory', self.download_directory)
        except Exception as e:
            raise LoadConfException(f"Error loading conf file: {e}")

    def save_conf(self) -> None:
        """
        Save the configuration file
        """
        try:
            conf_data = {
                'download_directory': self.download_directory,
            }

            with open(self.conf_path, 'w') as file:
                json.dump(conf_data, file, indent=4)
        except Exception as e:
            raise SaveConfException(f"Error saving conf file: {e}")

    def get_album(self,album_name):
        return self.api.photos.albums[album_name]

    def load_albums(self) -> None:
        """
        Load the albums
        """
        try:
            if not self.is_logged_in:
                print(f"[main.py] load_albums : Not logged in")
                return
            self.albums = []
            for album in self.api.photos.albums:
                self.albums.append(album)
            for album in self.albums:
                album_info = {
                    'name': album,
                    'num_photos': len(self.api.photos.albums[album]),
                    'is_on_disk': self.is_on_disk(album),
                    'disk_path': os.path.join(self.download_directory, album) if self.is_on_disk(album) else ''
                }
                self.albums_infos[album] = album_info
        except Exception as e:
            raise LoadAlbumsException(f"Error loading albums: {e}")

    def set_download_directory(self, directory: str) -> None:
        """
        Set the download directory

        :param directory: path to the download directory
        """
        try:
            if directory == self.download_directory:
                print(f"[main.py] set_download_directory : Specified directory is already the download directory.")
            elif os.path.exists(directory) and os.path.isdir(directory):
                previous_directory = self.download_directory
                self.download_directory = directory
                self.save_conf()
                print(f"[main.py] set_download_directory : Changed download directory from {previous_directory} to {self.download_directory}")
            else:
                print(f"[main.py] set_download_directory : Directory does not exist: {directory}")
        except Exception as e:
            raise SetDownloadDirectoryException(f"Error setting download directory: {e}")

    def sync_album(self, album_name: str) -> None:
        """
        Sync an album

        :param album_name: name of the album to sync
        """
        if album_name in self.download_threads:
            print(f"[main.py] sync_album : Album '{album_name}' is already being downloaded.")
            return

        self.download_threads[album_name] = threading.Thread(target=self.download_album, args=(album_name,))
        self.download_threads[album_name].start()
        print(f"[main.py] sync_album : Started download of album '{album_name}'.")

    def set_cancel_flag(self, album_name: str, flag: bool) -> None:
        """
        Set the cancel flag for an album

        :param album_name: name of the album to set the flag for
        :param flag: value of the flag
        """
        self.cancel_flags[album_name] = flag
        print(f"[main.py] set_cancel_flag : Cancel flag for album '{album_name}' set to {flag}.")

    def download_album(self, album_name: str) -> None:
        """
        Download an album

        :param album_name: name of the album to download
        """
        print(f"[main.py] download_album : Downloading album '{album_name}'...")
        album = self.api.photos.albums[album_name]
        self.cancel_flags[album_name] = False
        num_photos = len(album)
        count = 0
        eel.updateAlbumProgressBar(album_name, 0)
        if not os.path.exists(os.path.join(self.download_directory, album_name)):
            os.makedirs(os.path.join(self.download_directory, album_name))
        for photo in album:
            if self.cancel_flags[album_name]:
                print(f"[main.py] download_album :  Download of album '{album_name}' cancelled.")
                self.download_threads.pop(album_name)
                eel.removeCancelIcon(album_name)
                eel.updateAlbumProgressBar(album_name, 0)
                return

            self.download_photo(photo, os.path.join(self.download_directory, album_name))
            count += 1
            eel.updateAlbumProgressBar(album_name, count*100/num_photos)
        print(f"[main.py] download_album : Download of album '{album_name}' completed.")
        eel.removeCancelIcon(album_name)
        self.cleanup_download(album_name)

    @staticmethod
    def download_photo(photo, download_path: str) -> None:
        """
        Download a photo

        :param photo: photo to download
        :param download_path: path to download the photo to
        """
        filepath = os.path.join(download_path, photo.filename)
        if os.path.exists(filepath):
            print(f"[main.py] download_photo : Photo already exists: {photo.filename}")
            return
        print(f"[main.py] download_photo : Downloading photo: {photo.filename}")
        with photo.download().raw as photo_data:
            with open(filepath, 'wb') as opened_file:
                shutil.copyfileobj(photo_data, opened_file)

    def cleanup_download(self, album_name: str) -> None:
        """
        Cleanup after an album download

        :param album_name: name of the album to cleanup
        """
        if album_name in self.download_threads:
            del self.download_threads[album_name]
        if album_name in self.cancel_flags:
            del self.cancel_flags[album_name]

    def delete_album(self, album_name: str) -> None:
        """
        Delete an album

        :param album_name: name of the album to delete
        """
        try:
            if album_name in self.albums:
                album_path = os.path.join(self.download_directory, album_name)
                if os.path.exists(album_path):
                    eel.updateAlbumProgressBar(album_name, 0)
                    shutil.rmtree(album_path)
                    eel.updateAlbumProgressBar(album_name, 100)
                    print(f"[main.py] delete_album : Album '{album_name}' deleted.")
                else:
                    raise DeleteAlbumException(f"[main.py] delete_album : Album '{album_name}' does not exist.")
        except Exception as e:
            raise DeleteAlbumException(f"Error deleting album: {e}")
            
    def is_on_disk(self, album_name: str) -> bool:
        """
        Check if an album is on disk

        :param album_name: name of the album to check
        :return: True if the album is on disk, False otherwise
        """
        return os.path.exists(os.path.join(self.download_directory, album_name))

    def on_2fa_response(self, response: str) -> None:
        """
        Callback for 2FA required

        :param response: 2FA code
        """
        print("[main.py] on_2FA_required : 2FA code entered")
        self.require_2fa_result = response

        validation_result = self.api.validate_2fa_code(self.require_2fa_result)
        if not validation_result:
            print("[main.py] log_in : Invalid 2FA code")
            eel.Alert("Invalid 2FA code. Please try again.")
        else:
            print("[main.py] log_in : Valid 2FA code")
            self.require_2fa_result = None
            self.check_trust()

    def check_trust(self):
        if not self.api.is_trusted_session:
            print("[main.py] log_in : Session is not trusted. Requesting trust...")
            result = self.api.trust_session()
            if not result:
                print("[main.py] log_in : Failed to request trust")
                return
            else:
                print("[main.py] log_in : Trust requested")
        else:
            print("[main.py] log_in : Session is trusted")
        self.is_logged_in = True
        self.end_login()

    def end_login(self):
        if self.is_logged_in:
            print("[main.py] log_in : Logged in")
            self.load_albums()
            eel.loggedIn()
        else:
            print("[main.py] log_in : Failed to log in")
            eel.Alert("Failed to log in. Please try again.")

    def log_in(self, username: str, password: str) -> None:
        """
        Log in to iCloud

        :param username: iCloud username
        :param password: iCloud password
        """
        print("[main.py] log_in : Logging in...")
        try:
            self.api = pyicloud.PyiCloudService(username, password, cookie_directory=self.cookie_directory)

            if self.api.requires_2fa:
                print("[main.py] log_in : Two-factor authentication required")
                print("[main.py] log_in : Waiting for code...")

                eel.require2FA()(self.on_2fa_response)

            # not implemented yet
            # if 2sa required
            elif self.api.requires_2sa:
                import click
                print("[main.py] log_in : Two-step authentication required. Trusted devices are:")

                devices = self.api.trusted_devices
                for i, device in enumerate(devices):
                    print(
                        "  %s: %s" % (i, device.get('deviceName',
                                                    "SMS to %s" % device.get('phoneNumber')))
                    )

                device = click.prompt('Which device would you like to use?', default=0)
                device = devices[device]
                if not self.api.send_verification_code(device):
                    print("Failed to send verification code")
                    sys.exit(1)

                code = click.prompt('Please enter validation code')
                if not self.api.validate_verification_code(device, code):
                    print("Failed to verify verification code")
                    sys.exit(1)

            else:
                self.is_logged_in = True
                self.end_login()

        except Exception as e:
            raise StartApiException(f"Error starting api: {e}")
