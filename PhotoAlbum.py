class PhotoAlbum:
    # ----------- Constructor -----------
    def __init__(self, name, photos):
        self._name = name
        self._photos_number = photos

    def __len__(self):
        return self._photos_number

    # ----------- Properties -----------
    @property
    def get_name(self):
        return self._name

    @property
    def get_photos_number(self):
        return self._photos_number

    # ----------- Methods -----------
    def to_dict(self):
        return {'name': self._name, 'photos': self._photos_number}
