
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

// ---------- CADASTRO ----------
registerForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = registerForm.querySelector('input[type="email"]').value;
    const nome = registerForm.querySelector('input[placeholder="Nome Completo"]').value;
    const senha = registerForm.querySelector('input[placeholder="Senha"]').value;
    const confirmar = registerForm.querySelector('input[placeholder="Confirmar Senha"]').value;

    if (senha !== confirmar) {
        alert("As senhas não coincidem!");
        return;
    }

    // Salva no localStorage
    localStorage.setItem("usuarioEmail", email);
    localStorage.setItem("usuarioNome", nome);
    localStorage.setItem("usuarioSenha", senha);

    alert("Cadastro realizado com sucesso!");

    // Volta para o login
    showLoginForm();
});


// ---------- LOGIN ----------
loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const emailDigitado = loginForm.querySelector('input[type="email"]').value;
    const senhaDigitada = loginForm.querySelector('input[type="password"]').value;

    const emailSalvo = localStorage.getItem("usuarioEmail");
    const senhaSalva = localStorage.getItem("usuarioSenha");

    if (emailDigitado === emailSalvo && senhaDigitada === senhaSalva) {
        alert("Login realizado com sucesso!");
        window.location.href = "home.html"; // Redireciona para o site principal
    } else {
        alert("Usuário ou senha incorretos.");
    }
});
