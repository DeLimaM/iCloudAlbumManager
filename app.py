import os
import tkinter as tk
from tkinter.filedialog import askdirectory
import eel
from main import ICloudAlbumSync
import threading
import dotenv

# for development purposes
isOffline = False
fake_albums_names = [str(i) for i in range(100)]

eel.init('web', allowed_extensions=['.js', '.html'])

global api
try:
    api = ICloudAlbumSync()
    print("[app.py] : Starting app.py")
except Exception as e:
    print(f"[app.py] : {e}")
    eel.Alert(str(e))
    exit(1)


@eel.expose
def load_albums():
    try:
        api.load_albums()
    except Exception as e:
        print(f"[app.py] : {e}")
        eel.Alert(str(e))
        return


@eel.expose
def log_in(username, password):
    try:
        dotenv.load_dotenv("login.env")
        username = os.getenv("ID")
        password = os.getenv("PASSWORD")
        if not isOffline:
            eel.spawn(api.log_in, username, password)
    except Exception as e:
        print(f"[app.py] : {e}")
        eel.Alert(str(e))
        return


@eel.expose
def is_on_disk(album_name: str) -> bool:
    try:
        if not isOffline:
            return api.is_on_disk(album_name)
        else:
            return True
    except Exception as e:
        print(f"[app.py] is_on_disk : {e}")
        eel.Alert(str(e))


@eel.expose
def sync_album(album_name: str):
    try:
        api.sync_album(album_name)
    except Exception as e:
        print(f"[app.py] sync_album : {e}")
        eel.Alert(str(e))
        return


@eel.expose
def cancel_download(album_name: str) -> None:
    print(f"[app.py] cancel_download : Cancelling download of album {album_name}")
    try:
        api.set_cancel_flag(album_name, True)
        return
    except Exception as e:
        print(f"[app.py] : {e}")
        eel.Alert(str(e))
        return


@eel.expose
def delete_album(album_name: str):
    try:
        print(f"[app.py] delete_album : Deleting album {album_name}")
        api.delete_album(album_name)
    except Exception as e:
        print(f"[app.py] : {e}")
        eel.Alert(str(e))
        return


@eel.expose
def get_albums_infos():
    albums = {}
    try:
        if not api.is_logged_in:
            print("[app.py] get_albums : Not logged in")
            return
        else:
            albums = api.albums_infos
            return albums
    except Exception as e:
        print(f"[app.py] get_albums : {e}")
        eel.Alert(str(e))
        return


@eel.expose
def set_download_directory():
    root = tk.Tk()
    root.attributes("-topmost", True)
    root.withdraw()
    directory = askdirectory()
    try:
        api.set_download_directory(directory)
    except Exception as e:
        print(f"[app.py] set_download_directory : {e}")
        eel.Alert(str(e))
        return


eel.start('login.html', mode='chrome', size=(1920, 1080))

