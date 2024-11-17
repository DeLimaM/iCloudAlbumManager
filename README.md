# iCloudAlbumManager
An app to download/manage iCloud photos albums.
Initially written using [Eel](https://github.com/python-eel/Eel), I switched to [Django](https://www.djangoproject.com/) because Eel was adding unnecessary complexity to the code.
I quickly realised that Django was way too overkill for this project (which is only a local app), so I rewrited it using Flask.
The interaction with iCloud is handled thanks to the [PyIcloud](https://github.com/picklepete/pyicloud) library. 
Sadly the [PyIcloud](https://github.com/picklepete/pyicloud) library does not seems maintained anymore, so i don't think I'll take time evolving this project.
