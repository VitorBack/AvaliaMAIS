const API_BASE_URL = 'http://localhost:8000';

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

// ========== FUNÇÕES PARA ALTERNAR ENTRE LOGIN E CADASTRO ==========

function showRegisterForm() {
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
}

function showLoginForm() {
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
}

// Event listeners para os links
document.addEventListener('DOMContentLoaded', () => {
    const showRegisterLink = document.getElementById('show-register-link');
    const showLoginLink = document.getElementById('show-login-link');

    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            showRegisterForm();
        });
    }

    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            showLoginForm();
        });
    }

    // Verifica se já está logado
    if (estaLogado() && window.location.pathname.includes('login.html')) {
        window.location.href = 'home.html';
    }
});

// ========== FUNÇÕES DE ARMAZENAMENTO DE SESSÃO ==========

function salvarSessao(userData) {
    sessionStorage.setItem('usuarioLogado', JSON.stringify(userData));
}

function obterSessao() {
    const data = sessionStorage.getItem('usuarioLogado');
    return data ? JSON.parse(data) : null;
}

function limparSessao() {
    sessionStorage.removeItem('usuarioLogado');
}

function estaLogado() {
    return obterSessao() !== null;
}

// ========== CADASTRO ==========
registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = registerForm.querySelector('input[type="email"]').value;
    const nome = registerForm.querySelector('input[placeholder="Nome Completo"]').value;
    const senha = registerForm.querySelector('input[placeholder="Senha"]').value;
    const confirmar = registerForm.querySelector('input[placeholder="Confirmar Senha"]').value;

    // Validações básicas
    if (senha !== confirmar) {
        alert("As senhas não coincidem!");
        return;
    }

    if (senha.length < 6) {
        alert("A senha deve ter no mínimo 6 caracteres!");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nome: nome,
                email: email,
                senha: senha
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Cadastro realizado com sucesso! Faça login para continuar.");
            registerForm.reset();
            showLoginForm();
        } else {
            alert(data.detail || "Erro ao cadastrar. Tente novamente.");
        }
    } catch (error) {
        console.error("Erro no cadastro:", error);
        alert("Erro ao conectar com o servidor. Verifique se o backend está rodando.");
    }
});

// ========== LOGIN ==========
loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = loginForm.querySelector('input[type="email"]').value;
    const senha = loginForm.querySelector('input[type="password"]').value;

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                senha: senha
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Salva dados do usuário na sessão
            salvarSessao(data.user);
            
            alert(`Bem-vindo(a), ${data.user.nome}!`);
            window.location.href = "home.html";
        } else {
            alert(data.detail || "Usuário ou senha incorretos.");
        }
    } catch (error) {
        console.error("Erro no login:", error);
        alert("Erro ao conectar com o servidor. Verifique se o backend está rodando.");
    }
});

// ========== EXPORTAR FUNÇÕES PARA USO GLOBAL ==========
window.auth = {
    estaLogado,
    obterSessao,
    limparSessao,
    salvarSessao
};

// Exporta funções para uso em outros contextos (se necessário)
window.showRegisterForm = showRegisterForm;
window.showLoginForm = showLoginForm;