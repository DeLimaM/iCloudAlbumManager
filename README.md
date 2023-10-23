# iCloudAlbumManager
An app to download/manage iCloud photos albums.
Developpement in progress (Currently rewriting from scratch to use Flask).
Initially written using [Eel](https://github.com/python-eel/Eel), I switched to [Django](https://www.djangoproject.com/) because Eel was adding unnecessary complexity to the code.
I quickly realised that Django was way too overkill for this project (which is only a loccal app), so I am now rewriting it using Flask.
The interaction with iCloud is handled thanks to the [PyIcloud](https://github.com/picklepete/pyicloud) library.
