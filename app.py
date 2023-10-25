from flask import Flask, render_template, request
from ICloudAlbumManager import ICloudAlbumManager

app = Flask(__name__)

albumManager = ICloudAlbumManager()


# --------------------------------- Routes ---------------------------------

@app.route('/')
def root():
    return render_template('login.html')


@app.route('/login', methods=['POST'])
def login():
    username = request.form['username']
    password = request.form['password']
    try:
        requires_2fa = albumManager.login(username, password)
        if requires_2fa:
            print("Two-factor authentication required.")
            return render_template('2fa.html')
        else:
            check_trust()
            print(f"Logged in successfully as {username}")
            return render_template('index.html', albums=albumManager.get_albums)
    except Exception as e:
        print(f"Failed to log in as {username} due to {e} in {__name__}")
        return render_template('login.html')


@app.route('/2fa', methods=['POST'])
def two_factor():
    code = request.form['code']
    try:
        result = albumManager.validate_2fa_code(code)
        if result:
            check_trust()
            print("Two-factor authentication succeeded!")
            return render_template('index.html')
        else:
            print("Two-factor authentication failed!")
            return render_template('login.html')
    except Exception as e:
        print(f"Two-factor authentication failed because of {e}")
        return render_template('login.html')


# --------------------------------- Helpers ---------------------------------

def check_trust():
    if not albumManager.is_trusted_session:
        print("Trusting session...")
        albumManager.trust_session()


# --------------------------------- Main ---------------------------------

if __name__ == '__main__':
    app.run(debug=True)
