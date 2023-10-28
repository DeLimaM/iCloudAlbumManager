from flask import Flask, render_template, request, redirect, url_for, jsonify
from ICloudAlbumManager import ICloudAlbumManager

app = Flask(__name__)

albumManager = ICloudAlbumManager()


# --------------------------------- Routes ---------------------------------

@app.route('/')
def root():
    print(f"route : {request.path}")
    return redirect(url_for('login'))


@app.route('/login', methods=['GET', 'POST'])
def login():
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
    print(f"route : {request.path}")
    if not albumManager.is_logged_in:
        return jsonify({'error': 'Not logged in'})
    albumManager.load_albums()
    albums = albumManager.get_albums
    return jsonify(albums=albums)


@app.route('/index', methods=['GET'])
def index():
    print(f"route : {request.path}")
    if not albumManager.is_logged_in:
        return redirect(url_for('login'))
    return render_template('index.html', albums=albumManager.get_albums)


# --------------------------------- Helpers ---------------------------------

def check_trust():
    if not albumManager.is_trusted_session:
        print("Trusting session...")
        albumManager.trust_session()


# --------------------------------- Main ---------------------------------

if __name__ == '__main__':
    app.run(debug=True)
