import ICloudAPI


class ICloudAlbumManager:

    # ----------- Constructor -----------
    def __init__(self):
        self._api = None

    # ----------- Properties -----------
    @property
    def is_trusted_session(self):
        return self._api.is_trusted_session

    @property
    def is_logged_in(self):
        return self._api is not None

    @property
    def get_albums(self) -> dict:
        result = {}
        for album in self._api.get_albums:
            result[album] = self._api.get_albums[album].to_dict()
        return result

    # ----------- Methods -----------
    def trust_session(self):
        self._api.trust_session()

    def validate_2fa_code(self, code):
        return self._api.validate_2fa_code(code)

    def login(self, username, password):
        self._api = ICloudAPI.ICloudApi(username, password)
        return self._api.require_2fa

    def load_albums(self):
        self._api.load_albums()

