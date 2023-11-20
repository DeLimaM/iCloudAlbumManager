import time

from flask import Flask, render_template, request, redirect, url_for, jsonify
from ICloudAlbumManager import ICloudAlbumManager

app = Flask(__name__)

albumManager = ICloudAlbumManager()


# --------------------------------- Routes ---------------------------------

@app.route('/')
def root():
    """
    Redirect to login page
    """
    print(f"route : {request.path}")
    return redirect(url_for('login'))


@app.route('/login', methods=['GET', 'POST'])
def login():
    """
    Login to iCloud
    """
    print(f"route : {request.path}")
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        try:
            requires_2fa = albumManager.login(username, password)
            if requires_2fa:
                print("Two-factor authentication required.")
                return redirect(url_for('two_factor'))
            else:
                check_trust()
                print(f"Logged in successfully as {username}")
                return redirect(url_for('index'))
        except Exception as e:
            print(f"Failed to log in as {username} due to {e} in {__name__}")
            return render_template('login.html')
    else:
        return render_template('login.html')


@app.route('/2fa', methods=['GET', 'POST'])
def two_factor():
    """
    Two-factor authentication
    """
    print(f"route : {request.path}")
    if request.method == 'POST':
        code = request.form['code']
        try:
            result = albumManager.validate_2fa_code(code)
            if result:
                check_trust()
                print("Two-factor authentication succeeded!")
                return redirect(url_for('index'))
            else:
                print("Two-factor authentication failed!")
                return render_template('login.html')
        except Exception as e:
            print(f"Two-factor authentication failed because of {e}")
            return render_template('login.html')
    else:
        return render_template('2fa.html')


@app.route('/load_albums', methods=['GET'])
def load_albums():
    """
    Load the albums from the iCloud API
    """
    print(f"route : {request.path}")
    if not albumManager.is_logged_in:
        return jsonify({'error': 'Not logged in'})
    albumManager.load_albums()
    albums = albumManager.get_albums
    return jsonify(albums=albums)


@app.route('/index', methods=['GET'])
def index():
    """
    Index page
    """
    print(f"route : {request.path}")
    if not albumManager.is_logged_in:
        return redirect(url_for('login'))
    return render_template('index.html', albums=albumManager.get_albums)


@app.route('/download_album/<album_name>', methods=['POST', 'GET'])
def download_album(album_name):
    """
    Download an album
    ::param album_name: name of the album to download
    """
    print(f"route : {request.path}")
    if not albumManager.is_logged_in:
        return jsonify({'error': 'Not logged in'})
    if album_name is None:
        return jsonify({'error': 'No album name provided'})
    if album_name not in albumManager.get_albums:
        return jsonify({'error': 'Album does not exist'})
    if albumManager.get_albums[album_name]['photo_count'] == 0:
        return jsonify({'error': 'Album is empty'})
    albumManager.download_album(album_name)
    return jsonify({'success': True})


@app.route('/delete_album/<album_name>', methods=['POST', 'GET'])
def delete_album(album_name):
    """
    Delete an album
    ::param album_name: name of the album to delete
    """
    print(f"route : {request.path}")
    if not albumManager.is_logged_in:
        return jsonify({'error': 'Not logged in'})
    if album_name is None:
        return jsonify({'error': 'No album name provided'})
    if album_name not in albumManager.get_albums:
        return jsonify({'error': 'Album does not exist'})
    albumManager.delete_album(album_name)
    return jsonify({'success': True})


@app.route('/pause_download/<album_name>', methods=['POST', 'GET'])
def pause_download(album_name):
    """
    Pause downloading an album
    ::param album_name: name of the album to pause
    """
    print(f"route : {request.path}")
    if not albumManager.is_logged_in:
        return jsonify({'error': 'Not logged in'})
    if album_name is None:
        return jsonify({'error': 'No album name provided'})
    if album_name not in albumManager.get_albums:
        return jsonify({'error': 'Album does not exist'})
    albumManager.pause_download(album_name)
    return jsonify({'success': True})


# --------------------------------- Helpers ---------------------------------
def check_trust():
    """
    Check if the session is trusted, and trust it if not
    """
    if not albumManager.is_trusted_session:
        print("Trusting session...")
        albumManager.trust_session()


# --------------------------------- Main ---------------------------------
if __name__ == '__main__':
    app.run(debug=True)

