// auth-guard.js - Proteção de rotas e gerenciamento de sessão

const AUTH_GUARD = {
    // Verifica se o usuário está logado
    estaLogado() {
        const sessao = sessionStorage.getItem('usuarioLogado');
        return sessao !== null;
    },

    // Obtém dados do usuário logado
    obterUsuario() {
        const data = sessionStorage.getItem('usuarioLogado');
        return data ? JSON.parse(data) : null;
    },

    // Salva sessão do usuário
    salvarSessao(userData) {
        sessionStorage.setItem('usuarioLogado', JSON.stringify(userData));
    },

    // Remove sessão (logout)
    logout() {
        sessionStorage.removeItem('usuarioLogado');
        window.location.href = 'login.html';
    },

    // Protege páginas que precisam de autenticação
    protegerPagina() {
        const paginasPublicas = ['login.html', 'index.html', ''];
        const paginaAtual = window.location.pathname.split('/').pop();

        if (!this.estaLogado() && !paginasPublicas.includes(paginaAtual)) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    },

    // Redireciona para home se já estiver logado (na página de login)
    redirecionarSeLogado() {
        const paginaAtual = window.location.pathname.split('/').pop();
        if (this.estaLogado() && (paginaAtual === 'login.html' || paginaAtual === 'index.html')) {
            window.location.href = 'home.html';
        }
    },

    // Atualiza UI com informações do usuário
    atualizarHeaderUsuario() {
        const usuario = this.obterUsuario();
        if (!usuario) return;

        const userArea = document.querySelector('.user-area');
        if (userArea) {
            // Obtém o primeiro nome
            const primeiroNome = usuario.nome.split(' ')[0];
            
            userArea.innerHTML = `
                <div class="user-dropdown">
                    <button class="user-button">
                        <i class='bx bxs-user-circle'></i>
                        <span class="user-name">${primeiroNome}</span>
                        <i class='bx bx-chevron-down'></i>
                    </button>
                    <div class="user-menu">
                        <a href="avaliacoes.html">
                            <i class='bx bx-star'></i> Minhas Avaliações
                        </a>
                        <a href="#" id="logout-button">
                            <i class='bx bx-log-out'></i> Sair
                        </a>
                    </div>
                </div>
            `;

            // Toggle dropdown
            const userButton = userArea.querySelector('.user-button');
            const userMenu = userArea.querySelector('.user-menu');
            
            userButton.addEventListener('click', (e) => {
                e.stopPropagation();
                userMenu.classList.toggle('show');
            });

            // Fechar dropdown ao clicar fora
            document.addEventListener('click', () => {
                userMenu.classList.remove('show');
            });

            // Logout
            const logoutButton = document.getElementById('logout-button');
            logoutButton.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('Deseja realmente sair?')) {
                    this.logout();
                }
            });
        }
    }
};

// Executa automaticamente ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    // Verifica se precisa redirecionar (página de login quando já está logado)
    AUTH_GUARD.redirecionarSeLogado();
    
    // Protege páginas privadas
    if (AUTH_GUARD.protegerPagina()) {
        // Atualiza header se estiver logado
        AUTH_GUARD.atualizarHeaderUsuario();
    }
});

// Exporta para uso global
window.AUTH_GUARD = AUTH_GUARD;