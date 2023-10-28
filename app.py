from flask import Flask, render_template, request, redirect, url_for, jsonify
from ICloudAlbumManager import ICloudAlbumManager

app = Flask(__name__)

albumManager = ICloudAlbumManager()


# --------------------------------- Routes ---------------------------------

@app.route('/')
def root():
    return redirect(url_for('login'))


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        try:
            if albumManager.is_logged_in:
                albumManager.log_out()
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


@app.route('/index', methods=['GET'])
def index():
    return render_template('index.html', albums=albumManager.get_albums)


@app.route('/update_albums', methods=['POST'])
def update_albums() -> dict:
    try:
        albumManager.load_albums()
        return redirect(url_for('index'))
    except Exception as e:
        print(f"Failed to load albums due to {e}")
        return


# --------------------------------- Helpers ---------------------------------

def check_trust():
    if not albumManager.is_trusted_session:
        print("Trusting session...")
        albumManager.trust_session()


# --------------------------------- Main ---------------------------------

if __name__ == '__main__':
    app.run(debug=True)
