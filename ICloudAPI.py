from pyicloud import PyiCloudService
from PhotoAlbum import PhotoAlbum

# temp
import dotenv
import os

dotenv.load_dotenv('login.env')
stored_username = os.getenv('ID')
stored_password = os.getenv('PASSWORD')


class ICloudApi:
    _instance = None

    # ----------- Constructor -----------
    def __new__(cls, username, password, cookie_directory='cookies'):
        if cls._instance is None:
            cls._instance = super(ICloudApi, cls).__new__(cls)
            # using stored username and password for now
            cls._instance._api = PyiCloudService(stored_username,
                                                 stored_password,
                                                 cookie_directory=cookie_directory)
            cls._instance._albums = {}
        return cls._instance

    # ----------- Properties -----------
    @property
    def get_albums(self):
        return self._albums

    @property
    def is_trusted_session(self):
        return self._api.is_trusted_session

    @property
    def require_2fa(self):
        return self._api.requires_2fa

    # ----------- Methods -----------
    def trust_session(self):
        self._api.trust_session()

    def validate_2fa_code(self, code):
        return self._api.validate_2fa_code(code)

    def load_albums(self):
        for album in self._api.photos.albums:
            self._albums[album] = PhotoAlbum(album, len(self._api.photos.albums[album]))

    def get_photos(self, album_name):
        return self._api.photos.albums[album_name].photos


