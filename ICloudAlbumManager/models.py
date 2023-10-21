from django.db import models
from django.contrib.auth.models import User
from django import forms


class iCloudUser(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    username = models.CharField(max_length=255)
    password = models.CharField(max_length=255)


class iCloudLoginForm(forms.Form):
    username = forms.CharField(label='iCloud Username')
    password = forms.CharField(label='iCloud Password', widget=forms.PasswordInput)


class TwoFactorAuthForm(forms.Form):
    code = forms.CharField(max_length=6, label="Enter 2FA Code", widget=forms.NumberInput)
