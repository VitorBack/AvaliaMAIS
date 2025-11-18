// ===========================================
// js/search-logic.js - Script para lidar com a busca de filmes/séries/livros
// ===========================================

const resultsArea = document.getElementById('results-area');
const resultsList = document.getElementById('results-list');
const mainContent = document.getElementById('main-content');
const searchInput = document.getElementById('search-input');
const searchIcon = document.getElementById('search-icon');
const paginationControls = document.getElementById('pagination-controls'); 
let isSearching = false; 

// Estado para busca e paginação
let currentSearchQuery = '';
let currentSearchPage = 1;

document.addEventListener('DOMContentLoaded', () => {
    // Adiciona listener ao ícone de busca
    if (searchIcon) {
        searchIcon.addEventListener('click', () => {
            handleSearch();
        });
    }

    // Adiciona listener para a tecla Enter no input
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }
    
    // Listener de paginação para resultados de busca
    if (paginationControls) {
        paginationControls.addEventListener('click', (e) => {
            const targetButton = e.target.closest('.page-button');
            if (targetButton && isSearching) {
                const page = targetButton.getAttribute('data-page');
                let newPage = currentSearchPage;

                if (page === 'next') {
                    newPage++;
                } else if (page === 'prev' && currentSearchPage > 1) {
                    newPage--;
                } else {
                    newPage = parseInt(page);
                }
                
                if (newPage !== currentSearchPage) {
                    currentSearchPage = newPage;
                    // Recarrega a busca com a nova página
                    searchMedia(currentSearchQuery, currentSearchPage);
                }
            }
        });
    }
});

/**
 * Inicia o processo de busca global.
 */
function handleSearch() {
    const query = searchInput.value.trim();
    if (!query) return;

    // Resetar o estado da busca
    isSearching = true;
    currentSearchQuery = query;
    currentSearchPage = 1;
    
    // Inicia a busca (multi-mídia)
    searchMedia(query, 1);
}


/**
 * Executa a busca na API do TMDB (multi) e Google Books.
 * @param {string} query Termo de busca.
 * @param {number} page Número da página (TMDB).
 */
async function searchMedia(query, page) {
    if (!resultsList || !mainContent) return;

    resultsList.innerHTML = `<p class="text-center p-8">Buscando por "${query}" na página ${page}...</p>`;
    paginationControls.innerHTML = '';
    
    let tmdbResults = [];
    let bookResults = [];
    let tmdbTotalPages = 1;

    try {
        // --- 1. Busca TMDB (Filmes e Séries) ---
        // Construção da query string: ?query=...&page=...
        // fetchTMDB adiciona o cabeçalho Authorization e o &language=pt-BR
        const tmdbPath = `/search/multi?query=${encodeURIComponent(query)}&page=${page}`; 
        const tmdbData = await fetchTMDB(tmdbPath);

        tmdbResults = tmdbData.results
            .filter(item => item.media_type !== 'person') 
            .map(item => ({...item, media_type: item.media_type})); 
        tmdbTotalPages = tmdbData.total_pages > 500 ? 500 : tmdbData.total_pages; 

        // --- 2. Busca Google Books (Apenas na primeira página) ---
        const googleBase = typeof GOOGLE_BOOKS_BASE_URL !== 'undefined' ? GOOGLE_BOOKS_BASE_URL : 'https://www.googleapis.com/books/v1/volumes';
        
        if (page === 1) {
            const googleUrl = `${googleBase}?q=${encodeURIComponent(query)}&maxResults=10`;
            const bookResponse = await fetch(googleUrl);
            const bookData = await bookResponse.json();

            bookResults = bookData.items ? bookData.items.map(item => ({
                title: item.volumeInfo.title || 'Título Desconhecido',
                overview: item.volumeInfo.description,
                vote_average: (item.volumeInfo.averageRating || 0) * 2, 
                media_type: 'book',
                volumeInfo: item.volumeInfo, 
                poster_path: item.volumeInfo.imageLinks ? item.volumeInfo.imageLinks.thumbnail : null
            })) : [];
        }

        // --- 3. Combina e Exibe ---
        const combinedResults = [...tmdbResults, ...bookResults];

        if (combinedResults.length > 0) {
            displaySearchResults(combinedResults);
            renderPaginationControls(page, tmdbTotalPages);
        } else {
            resultsList.innerHTML = `<p class="text-center p-8">Nenhum resultado encontrado para "${query}".</p>`;
        }

    } catch (error) {
        console.error("Erro durante a busca de mídia:", error);
        resultsList.innerHTML = `<p class="text-center p-8 text-red-500">Falha ao realizar a busca. Verifique sua conexão ou Token da API.</p>`;
    }
}

/**
 * Renderiza a lista de resultados (Cards).
 * Esta função também é chamada por category-page-loader.js
 * @param {Array<Object>} results Array de objetos de filmes, séries ou livros.
 */
function displaySearchResults(results) {
    if (!resultsList) return;
    resultsList.innerHTML = ''; 

    results.forEach(item => {
        const title = item.title || item.name;
        const overview = item.overview || item.volumeInfo?.description || 'Descrição não disponível.';
        const rating = (item.vote_average || 0).toFixed(1);
        const mediaType = item.media_type === 'movie' ? 'Filme' : (item.media_type === 'tv' ? 'Série' : 'Livro');
        
        let imageSrc = item.poster_path 
            ? (item.media_type === 'book' && item.poster_path.startsWith('http') ? item.poster_path : `${IMG_URL}${item.poster_path}`)
            : 'https://placehold.co/500x750/cccccc/333333?text=Sem%20Capa';
        
        const shortOverview = overview.length > 150 ? overview.substring(0, 147) + '...' : overview;

        const card = document.createElement('div');
        card.className = 'media-card';
        card.innerHTML = `
            <img src="${imageSrc}" alt="Pôster de ${title}" onerror="this.onerror=null; this.src='https://placehold.co/500x750/cccccc/333333?text=Sem%20Capa';">
            <div class="card-info">
                <h3 class="card-title">${title}</h3>
                <p class="card-type">${mediaType}</p>
                <div class="card-rating">
                    <i class='bx bxs-star'></i> ${rating}
                </div>
                <p class="card-overview">${shortOverview}</p>
                <button class="card-button">Ver Detalhes</button>
            </div>
        `;
        resultsList.appendChild(card);
    });
}
// Exporta a função para que category-page-loader possa usá-la.
window.displaySearchResults = displaySearchResults; 
window.renderPaginationControls = renderPaginationControls; 

/**
 * Renderiza os botões de paginação. (Função duplicada para garantir o escopo,
 * mas category-page-loader.js tem a versão principal.)
 * @param {number} page 
 * @param {number} totalPages 
 */
function renderPaginationControls(page, totalPages) {
    const controls = document.getElementById('pagination-controls');
    if (!controls) return;

    controls.innerHTML = '';
    const maxButtons = 5; 
    
    const startPage = Math.max(1, page - Math.floor(maxButtons / 2));
    const endPage = Math.min(totalPages, startPage + maxButtons - 1);
    
    if (page > 1) {
        controls.innerHTML += `<button class="page-button" data-page="${page - 1}"><i class='bx bx-chevron-left'></i></button>`;
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const activeClass = i === page ? 'active' : '';
        controls.innerHTML += `<button class="page-button ${activeClass}" data-page="${i}">${i}</button>`;
    }

    if (page < totalPages) {
        controls.innerHTML += `<button class="page-button" data-page="${page + 1}"><i class='bx bx-chevron-right'></i></button>`;
    }
}