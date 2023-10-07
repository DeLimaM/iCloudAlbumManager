var loggingIn = false;

document.addEventListener('DOMContentLoaded', function () {
    const savedUsername = localStorage.getItem('username');
    const savedPassword = localStorage.getItem('password');
    const checkbox = document.getElementById('remember-me');

    if (savedUsername) {
        document.getElementById('username').value = savedUsername;
        document.getElementById('password').value = savedPassword;
        checkbox.checked = true;
    }

    document.getElementById('remember-me').addEventListener('change', rememberMe);
    document.getElementById('login').addEventListener('click', handleLogIn);
    document.getElementById('input-switch').addEventListener('click', toggleTheme)

    setSavedTheme();
});

// toggle the theme
function toggleTheme() {
    let body = document.querySelector('body');
    if (body.classList.contains('dark-theme')) {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
    } else {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
    }
    localStorage.setItem('theme', body.classList);
}

async function handleLogIn() {
    /* Handle the login button click */
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (loggingIn) {
        alert("Already logging in...");
        return;
    }
    if (username === "" || password === "") {
        alert("Please fill in all the fields");
    } else {

        document.getElementById('login').value = "Logging in...";
        loggingIn = true;
        await eel.log_in(username, password)();
    }
}

function rememberMe() {
    /* Remember the username and password if the checkbox is checked */
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const checkbox = document.getElementById('remember-me');
    if (checkbox.checked) {
        localStorage.setItem('username', username);
        localStorage.setItem('password', password)
    } else {
        localStorage.removeItem('username');
        localStorage.removeItem('password');
    }
}

// set the saved theme
function setSavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    const themeCheckbox = document.getElementById('input-switch');
    if (savedTheme) {
      if (savedTheme==='light-theme') {
        themeCheckbox.click();
      }
    }
  }