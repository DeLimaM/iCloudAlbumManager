from django.shortcuts import render
from ICloudAlbumManager.models import iCloudLoginForm, TwoFactorAuthForm
import pyicloud


def login_view(request):
    if request.method == 'POST':
        form = iCloudLoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            try:
                icloud = pyicloud.PyiCloudService(username, password)
                if icloud.requires_2fa:
                    request.session['icloud_username'] = username
                    request.session['icloud_password'] = password
                    request.session['icloud_requires_2fa'] = True
                    return render(request, 'ask_2fa_code.html')
                else:
                    print("Login successful.")
                    return render(request, 'index.html', {'username': username, 'password': password})
            except Exception as e:
                print("Failed to log in: %s" % (e))
                return render(request, 'login.html', {'form': form, 'error': f'Error: {str(e)}'})
    else:
        form = iCloudLoginForm()
    return render(request, 'login.html', {'form': form})


def handle_2fa(request):
    form_2fa = TwoFactorAuthForm()
    if request.method == 'POST':
        print('Handling 2FA form submission.')
        form_2fa = TwoFactorAuthForm(request.POST)
        if form_2fa.is_valid():
            print('2FA form is valid.')
            code = form_2fa.cleaned_data['code']
            try:
                username = request.session.get('icloud_username')
                password = request.session.get('icloud_password')
                requires_2fa = request.session.get('icloud_requires_2fa')
                if username and requires_2fa:
                    print('2FA code received. Validating...')
                    icloud = pyicloud.PyiCloudService(username, password)
                    print('iCloud object created.')
                    validated = icloud.validate_2fa_code(code)
                    if not validated:
                        print('2FA code invalid.')
                        form_2fa.add_error('code', 'Invalid 2FA code.')
                        return render(request, 'ask_2fa_code.html', {'form_2fa': form_2fa})
                    else:
                        print('2FA code validated.')
                        if not icloud.is_trusted_session:
                            print('Trusting session...')
                            trusted = icloud.trust_session()
                            if not trusted:
                                print('Could not trust session.')
                                form_2fa.add_error('code', 'Could not trust session.')
                                return render(request, 'login.html', {'form_2fa': form_2fa})
                            else:
                                print('Session trusted.')
                                request.session['icloud_requires_2fa'] = False
                                return render(request, 'index.html')
                else:
                    form_2fa.add_error('code', 'Invalid session data.')
            except Exception as e:
                print('Error: %s' % (e))
                form_2fa.add_error('code', f'Error: {str(e)}')

    return render(request, 'ask_2fa_code.html', {'form_2fa': form_2fa})


def index(request):
    return render(request, 'index.html')


