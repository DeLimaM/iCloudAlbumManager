from flask import Flask, render_template, request
import pyicloud

app = Flask(__name__)
api = None


@app.route('/')
def root():
    return render_template('login.html')


@app.route('/login', methods=['POST'])
def login():
    username = request.form['username']
    password = request.form['password']
    try:
        global api # This is a bad idea, but I'm lazy and this is a small project
        api = pyicloud.PyiCloudService(username, password, cookie_directory='cookies')
        if api.requires_2fa:
            print("Two-factor authentication required.")
            return render_template('2fa.html')
        else:
            if not api.is_trusted_session:
                print("Trusting session...")
                api.trust_session()
            print(f"Logged in successfully as {username}")
            return render_template('index.html', albums=api.photos.albums)
    except Exception as e:
        print(f"Failed to log in as {username} due to {e}")
        return render_template('login.html')


@app.route('/2fa', methods=['POST'])
def two_factor():
    code = request.form['code']
    try:
        result = api.validate_2fa_code(code)
        if result:
            if not api.is_trusted_session:
                print("Trusting session...")
                api.trust_session()
            print("Two-factor authentication succeeded!")
            return render_template('index.html')
        else:
            print("Two-factor authentication failed!")
            return render_template('login.html')
    except Exception as e:
        print(f"Two-factor authentication failed because of {e}")
        return render_template('login.html')


@app.route('/index')
def index():
    return render_template('index.html', albums=api.photos.albums)


if __name__ == '__main__':
    app.run(debug=True)
