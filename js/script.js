
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

function showRegisterForm() {
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
    document.querySelector('.container h1').textContent = 'Cadastro';
}

function showLoginForm() {
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    document.querySelector('.container h1').textContent = 'Login';
}