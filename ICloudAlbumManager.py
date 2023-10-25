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
    def get_albums(self):
        return self._api.get_albums

    # ----------- Methods -----------
    def trust_session(self):
        self._api.trust_session()

    def validate_2fa_code(self, code):
        return self._api.validate_2fa_code(code)

    def login(self, username, password):
        self._api = ICloudAPI.ICloudApi(username, password)
        return self._api.require_2fa

