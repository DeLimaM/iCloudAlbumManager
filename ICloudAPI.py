from pyicloud import PyiCloudService
from PhotoAlbum import PhotoAlbum


class ICloudApi:
    _instance = None

    # ----------- Constructor -----------
    def __new__(cls, username, password, cookie_directory='cookies'):
        if cls._instance is None:
            cls._instance = super(ICloudApi, cls).__new__(cls)
            cls._instance._api = PyiCloudService(username, password, cookie_directory=cookie_directory)
            cls._instance._albums = {}
            cls._instance._load_albums()
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

    def _load_albums(self):
        for album in self._api.photos.albums:
            self._albums[album] = PhotoAlbum(album, len(self._api.photos.albums[album]))


