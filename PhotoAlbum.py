import os
import shutil


class PhotoAlbum:
    # ----------- Constructor -----------
    def __init__(self, name, photos):
        self._name = name
        self._photos_count = photos

    def __len__(self):
        return self._photos_count

    # ----------- Properties -----------
    @property
    def get_name(self):
        return self._name

    @property
    def get_photos_number(self):
        return self._photos_count

    @property
    def is_on_disk(self):
        return os.path.exists(os.path.join(os.getcwd(), self._name))

    # ----------- Methods -----------
    def to_dict(self):
        return {'photo_count': self._photos_count, 'on_disk': self.is_on_disk}


