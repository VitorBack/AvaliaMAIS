
// ===========================================
// js/category-page-loader.js - Script para carregar a página de catálogo com Paginação
// ===========================================

const GOOGLE_BOOKS_BASE_URL = 'https://www.googleapis.com/books/v1/volumes';
const RESULTS_PER_PAGE = 20; // Padrão da TMDB para resultados
let currentPage = 1; // Página inicial
let currentCategory = ''; // Armazena o tipo de mídia ativo ('movie', 'tv', 'book')
let currentEndpoint = ''; // Armazena o endpoint base (e.g., '/movie/popular')

document.addEventListener('DOMContentLoaded', () => {
    // 1. Determina a categoria e endpoint ao carregar a página
    const pathname = window.location.pathname;

    if (pathname.includes('filmes.html')) {
        currentEndpoint = '/movie/popular';
        currentCategory = 'movie';
    } else if (pathname.includes('series.html')) {
        currentEndpoint = '/tv/popular';
        currentCategory = 'tv';
    } else if (pathname.includes('livros.html')) {
        // Google Books
        currentEndpoint = `${GOOGLE_BOOKS_BASE_URL}?q=melhores+livros+popular&maxResults=${RESULTS_PER_PAGE}`;
        currentCategory = 'book';
    }
    
    // 2. Adiciona o listener para os botões de paginação
    const paginationControls = document.getElementById('pagination-controls');
    if (paginationControls) {
        paginationControls.addEventListener('click', (e) => {
            const targetButton = e.target.closest('.page-button');
            if (targetButton) {
                const page = targetButton.getAttribute('data-page');
                let newPage = currentPage;

                if (page === 'next') {
                    newPage++;
                } else if (page === 'prev' && currentPage > 1) {
                    newPage--;
                } else {
                    newPage = parseInt(page);
                }
                
                if (newPage !== currentPage) {
                    currentPage = newPage;
                    loadCategoryPage(currentCategory, currentEndpoint, currentPage);
                }
            }
        });
    }

    // 3. Carrega a primeira página se o endpoint for definido
    if (currentEndpoint) {
        loadCategoryPage(currentCategory, currentEndpoint, currentPage);
    }
});

/**
 * Função principal para buscar e renderizar os dados do catálogo em uma página específica.
 */
async function loadCategoryPage(type, endpoint, page) {
    let results = [];
    let totalPages = 10; 
    const resultsList = document.getElementById('results-list');
    
    if (!resultsList) return;
    resultsList.innerHTML = `<p class="text-center p-8">Carregando página ${page} de ${type === 'movie' ? 'Filmes' : (type === 'tv' ? 'Séries' : 'Livros')}...</p>`;
    
    try {
        if (type === 'book') {
            // Lógica para Google Books (sem mudanças)
            const startIndex = (page - 1) * RESULTS_PER_PAGE;
            const bookEndpoint = `${endpoint}&startIndex=${startIndex}`;
            
            const response = await fetch(bookEndpoint);
            const data = await response.json();
            
            // Mapeamento dos resultados
            results = data.items ? data.items.map(item => ({
                title: item.volumeInfo.title || 'Título Desconhecido',
                overview: item.volumeInfo.description,
                vote_average: (item.volumeInfo.averageRating || 0) * 2,
                media_type: 'book',
                volumeInfo: item.volumeInfo, 
                poster_path: item.volumeInfo.imageLinks ? item.volumeInfo.imageLinks.thumbnail : null
            })) : [];
            
            totalPages = results.length > 0 ? page + 5 : page; 
            
        } else {
            // TMDB (Filmes ou Séries) - LÓGICA DE URL CORRETA PARA V4
            // Endpoint base (ex: /movie/popular) + parâmetro 'page'.
            const tmdbPath = `${endpoint}?page=${page}`; 
            
            // fetchTMDB adiciona o cabeçalho Authorization e o '&language=pt-BR'.
            const data = await fetchTMDB(tmdbPath);
            
            // Mapeia os resultados
            results = data.results.map(item => ({...item, media_type: type}));
            totalPages = data.total_pages > 500 ? 500 : data.total_pages; 
        }
    } catch (error) {
        console.error(`Erro ao carregar a página ${page} de ${type}:`, error);
        resultsList.innerHTML = `<p class="text-center p-8 text-red-400">Não foi possível carregar o catálogo. Verifique o console para detalhes ou sua chave API.</p>`;
        renderPaginationControls(page, totalPages);
        return;
    }
    
    // 3. Exibe o resultado e a paginação
    if (results.length > 0) {
        if (typeof displaySearchResults === 'function') {
            displaySearchResults(results); 
            renderPaginationControls(page, totalPages);
        } else {
            resultsList.innerHTML = `<p class="text-center p-8 text-red-400">Erro: A função displaySearchResults (de search-logic.js) não foi carregada.</p>`;
        }
    } else {
        resultsList.innerHTML = `<p class="text-center p-8">Nenhum ${type} popular encontrado na página ${page}.</p>`;
        renderPaginationControls(page, totalPages);
    }
}

/**
 * Renderiza os botões de paginação no elemento #pagination-controls.
 * @param {number} currentPage - A página atualmente ativa.
 * @param {number} totalPages - O número total de páginas (real ou simplificado).
 */
function renderPaginationControls(page, totalPages) {
    const controls = document.getElementById('pagination-controls');
    if (!controls) return;

    controls.innerHTML = '';
    const maxButtons = 5; 
    
    const startPage = Math.max(1, page - Math.floor(maxButtons / 2));
    const endPage = Math.min(totalPages, startPage + maxButtons - 1);
    
    // Botão de página anterior (<<)
    if (page > 1) {
        controls.innerHTML += `<button class="page-button" data-page="${page - 1}"><i class='bx bx-chevron-left'></i></button>`;
    }
    
    // Botões de 1 a 10 (simplificando a lógica de exibição de botões próximos)
    for (let i = startPage; i <= endPage; i++) {
        const activeClass = i === page ? 'active' : '';
        controls.innerHTML += `<button class="page-button ${activeClass}" data-page="${i}">${i}</button>`;
    }

    // Botão de próxima página (>>)
    if (page < totalPages) {
        controls.innerHTML += `<button class="page-button" data-page="${page + 1}"><i class='bx bx-chevron-right'></i></button>`;
    }
}