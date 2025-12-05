// avaliacoes.js - Gerenciamento da página de avaliações

const API_BASE_URL = 'http://localhost:8000';

let todasAvaliacoes = [];
let filtroAtual = 'all';

document.addEventListener('DOMContentLoaded', () => {
    console.log('consultando avaliacoes');
    carregarAvaliacoes();
    setupFiltros();

    // Recarrega quando uma avaliação for deletada
    document.addEventListener('avaliacao-deletada', () => {
        carregarAvaliacoes();
    });
});

async function carregarAvaliacoes() {
    const usuario = AUTH_GUARD.obterUsuario();
    if (!usuario) return;

    const loading = document.getElementById('loading');
    const avaliacoesList = document.getElementById('avaliacoes-list');
    const emptyState = document.getElementById('empty-state');

    loading.style.display = 'flex';
    avaliacoesList.innerHTML = '';
    emptyState.style.display = 'none';
    console.log('consultando avaliacoes');

    try {
        const response = await fetch(`${API_BASE_URL}/api/avaliacoes/${usuario.id}`);
        console.log('consultando avaliacoes');
        if (!response.ok) {
            throw new Error('Erro ao carregar avaliações');
        }

        const data = await response.json();
        todasAvaliacoes = data.avaliacoes || [];

        loading.style.display = 'none';

        if (todasAvaliacoes.length === 0) {
            emptyState.style.display = 'flex';
            return;
        }
        console.log('renderizando avaliacoes');
        renderizarAvaliacoes(todasAvaliacoes);

    } catch (error) {
        console.log('Erro ao carregar avaliações');
        console.error('Erro ao carregar avaliações:', error);
        loading.style.display = 'none';
        avaliacoesList.innerHTML = `
            <div class="error-message">
                <i class='bx bx-error-circle'></i>
                <p>Erro ao carregar suas avaliações. Tente novamente.</p>
            </div>
        `;
    }
}

function renderizarAvaliacoes(avaliacoes) {
    const avaliacoesList = document.getElementById('avaliacoes-list');
    avaliacoesList.innerHTML = '';

    // Filtra por tipo se não for 'all'
    const avaliacoesFiltradas = filtroAtual === 'all' 
        ? avaliacoes 
        : avaliacoes.filter(av => av.tipo_midia === filtroAtual);

    if (avaliacoesFiltradas.length === 0) {
        avaliacoesList.innerHTML = `
            <div class="empty-filter">
                <p>Nenhuma avaliação encontrada nesta categoria.</p>
            </div>
        `;
        return;
    }

    avaliacoesFiltradas.forEach(avaliacao => {
        const card = criarCardAvaliacao(avaliacao);
        avaliacoesList.appendChild(card);
    });
}

function criarCardAvaliacao(avaliacao) {
    const card = document.createElement('div');
    card.className = 'avaliacao-card';

    const poster = avaliacao.poster_path 
        ? (avaliacao.tipo_midia === 'book' 
            ? avaliacao.poster_path 
            : `https://image.tmdb.org/t/p/w500${avaliacao.poster_path}`)
        : 'https://placehold.co/300x450/cccccc/333333?text=Sem+Capa';

    const tipoTexto = getTipoTexto(avaliacao.tipo_midia);
    const dataCriacao = new Date(avaliacao.criado_em).toLocaleDateString('pt-BR');

    // Cria estrelas visuais
    const estrelas = criarEstrelasVisuais(avaliacao.nota_final);

    card.innerHTML = `
        <div class="avaliacao-poster">
            <img src="${poster}" alt="${avaliacao.titulo_midia}" 
                 onerror="this.src='https://placehold.co/300x450/cccccc/333333?text=Sem+Capa'">
            <span class="avaliacao-tipo">${tipoTexto}</span>
        </div>
        
        <div class="avaliacao-content">
            <h3 class="avaliacao-titulo">${avaliacao.titulo_midia}</h3>
            
            <div class="avaliacao-rating">
                <div class="stars-display">${estrelas}</div>
                <span class="rating-number">${avaliacao.nota_final.toFixed(1)}</span>
            </div>

            ${avaliacao.critica ? `
                <div class="avaliacao-critica">
                    <p>${avaliacao.critica}</p>
                </div>
            ` : '<p class="sem-critica">Sem crítica escrita</p>'}

            <div class="avaliacao-footer">
                <span class="avaliacao-data">
                    <i class='bx bx-calendar'></i> ${dataCriacao}
                </span>
                <button class="btn-delete" onclick="deletarAvaliacao(${avaliacao.id})">
                    <i class='bx bx-trash'></i> Deletar
                </button>
            </div>
        </div>
    `;

    return card;
}

function criarEstrelasVisuais(nota) {
    const notaInteira = Math.floor(nota);
    let html = '';
    
    for (let i = 1; i <= 10; i++) {
        if (i <= notaInteira) {
            html += `<i class='bx bxs-star'></i>`;
        } else {
            html += `<i class='bx bx-star'></i>`;
        }
    }
    
    return html;
}

function setupFiltros() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active de todos
            filterBtns.forEach(b => b.classList.remove('active'));
            
            // Adiciona active no clicado
            btn.classList.add('active');
            
            // Atualiza filtro
            filtroAtual = btn.getAttribute('data-filter');
            
            // Re-renderiza
            renderizarAvaliacoes(todasAvaliacoes);
        });
    });
}

async function deletarAvaliacao(avaliacaoId) {
    if (!confirm('Deseja realmente deletar esta avaliação?')) return;

    const usuario = AUTH_GUARD.obterUsuario();

    try {
        const response = await fetch(
            `${API_BASE_URL}/api/avaliacoes/${avaliacaoId}?user_id=${usuario.id}`,
            { method: 'DELETE' }
        );

        if (response.ok) {
            alert('Avaliação deletada com sucesso!');
            carregarAvaliacoes();
        } else {
            alert('Erro ao deletar avaliação');
        }
    } catch (error) {
        console.error('Erro ao deletar avaliação:', error);
        alert('Erro ao conectar com o servidor');
    }
}

function getTipoTexto(tipo) {
    const tipos = {
        'movie': 'Filme',
        'tv': 'Série',
        'book': 'Livro'
    };
    return tipos[tipo] || tipo;
}

// Exporta para uso global
window.deletarAvaliacao = deletarAvaliacao;