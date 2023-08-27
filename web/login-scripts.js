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
});

async function handleLogIn() {
    /* Handle the login button click */
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === "" || password === "") {
        alert("Please fill in all the fields");
    } else {
        document.getElementById('login').value = "Logging in...";
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