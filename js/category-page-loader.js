/* category-page-loader.js — versão atualizada */
const GOOGLE_BOOKS_BASE_URL = 'https://www.googleapis.com/books/v1/volumes';
const RESULTS_PER_PAGE = 24; // por página
let currentPage = 1;
let currentCategory = '';
let currentEndpoint = '';

document.addEventListener('DOMContentLoaded', () => {
    const pathname = window.location.pathname;

    if (pathname.includes('filmes.html')) {
        currentEndpoint = '/movie/popular';
        currentCategory = 'movie';
    } else if (pathname.includes('series.html')) {
        currentEndpoint = '/tv/popular';
        currentCategory = 'tv';
    } else if (pathname.includes('livros.html')) {
        currentEndpoint = `${GOOGLE_BOOKS_BASE_URL}?q=best+books&maxResults=${RESULTS_PER_PAGE}`;
        currentCategory = 'book';
    }

    // Pagination click handler
    const paginationControls = document.getElementById('pagination-controls');
    if (paginationControls) {
        paginationControls.addEventListener('click', (e) => {
            const targetButton = e.target.closest('.page-button');
            if (!targetButton) return;
            const pageAttr = targetButton.getAttribute('data-page');
            let newPage = currentPage;
            if (pageAttr === 'next') newPage++;
            else if (pageAttr === 'prev' && currentPage > 1) newPage--;
            else newPage = parseInt(pageAttr);

            if (newPage !== currentPage) {
                currentPage = newPage;
                loadCategoryPage(currentCategory, currentEndpoint, currentPage);
            }
        });
    }

    // Listen for category-search event from search-logic (only on category pages)
    document.addEventListener('category-search', (e) => {
        const q = e.detail.query;
        const p = e.detail.page || 1;
        // On category pages we search only that type
        searchCategoryOnly(currentCategory, q, p);
    });

    // Initial load
    setTimeout(() => {
        if (currentCategory) loadCategoryPage(currentCategory, currentEndpoint, currentPage);
    }, 40);
});

async function loadCategoryPage(type, endpoint, page) {
    const resultsList = document.getElementById('results-list');
    if (!resultsList) return;
    resultsList.innerHTML = `<p class="text-center p-8">Carregando página ${page}...</p>`;

    try {
        let results = [];
        let totalPages = 1;

        if (type === 'book') {
            const books = await fetchBooks(page, "");
            results = (books.items || []).map(normalizeBookItem);
            totalPages = Math.ceil((books.totalItems || results.length) / RESULTS_PER_PAGE) || 1;
        } else if (type === 'movie') {
            const data = await fetchMovies(page, "");
            results = data.results || [];
            totalPages = Math.ceil((data.total_results || (results.length)) / RESULTS_PER_PAGE) || data.total_pages || 1;
        } else if (type === 'tv') {
            const data = await fetchSeries(page, "");
            results = data.results || [];
            totalPages = Math.ceil((data.total_results || (results.length)) / RESULTS_PER_PAGE) || data.total_pages || 1;
        }

        if (results.length === 0) {
            resultsList.innerHTML = `<p class="text-center p-8">Nenhum item encontrado.</p>`;
            renderPaginationControls(page, totalPages);
            return;
        }

    
        const sliceStart = 0;
        const itemsToRender = results.slice(sliceStart, RESULTS_PER_PAGE);

        resultsList.innerHTML = '';
        itemsToRender.forEach(item => {
            resultsList.appendChild(window.createMediaCardElement(item));
        });

        renderPaginationControls(page, totalPages);

    } catch (err) {
        console.error("Erro loadCategoryPage():", err);
        resultsList.innerHTML = `<p class="text-center p-8 text-red-400">Erro ao carregar catálogo.</p>`;
    }
}

async function searchCategoryOnly(type, query, page = 1) {
    const resultsList = document.getElementById('results-list');
    if (!resultsList) return;
    resultsList.innerHTML = `<p class="text-center p-8">Buscando "${query}"...</p>`;

    try {
        let results = [];
        let totalPages = 1;
        if (type === 'movie') {
            const data = await fetchMovies(page, query);
            results = data.results || [];
            totalPages = data.total_pages || 1;
        } else if (type === 'tv') {
            const data = await fetchSeries(page, query);
            results = data.results || [];
            totalPages = data.total_pages || 1;
        } else if (type === 'book') {
            const books = await fetchBooks(page, query);
            results = (books.items || []).map(normalizeBookItem);
            totalPages = Math.ceil((books.totalItems || results.length) / RESULTS_PER_PAGE) || 1;
        }

        resultsList.innerHTML = '';
        if (results.length === 0) {
            resultsList.innerHTML = `<p class="text-center p-8">Nenhum resultado para "${query}".</p>`;
            renderPaginationControls(page, totalPages);
            return;
        }

        results.slice(0, RESULTS_PER_PAGE).forEach(item => {
            resultsList.appendChild(window.createMediaCardElement(item));
        });

        renderPaginationControls(page, totalPages);

    } catch (err) {
        console.error("Erro searchCategoryOnly():", err);
        resultsList.innerHTML = `<p class="text-center p-8 text-red-400">Erro na busca.</p>`;
    }
}

function renderPaginationControls(page, totalPages) {
    const controls = document.getElementById('pagination-controls');
    if (!controls) return;
    controls.innerHTML = '';

    const maxButtons = 5;
    const startPage = Math.max(1, page - Math.floor(maxButtons / 2));
    const endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (page > 1) controls.innerHTML += `<button class="page-button" data-page="${page - 1}"><i class='bx bx-chevron-left'></i></button>`;
    for (let i = startPage; i <= endPage; i++) {
        const active = i === page ? 'active' : '';
        controls.innerHTML += `<button class="page-button ${active}" data-page="${i}">${i}</button>`;
    }
    if (page < totalPages) controls.innerHTML += `<button class="page-button" data-page="${page + 1}"><i class='bx bx-chevron-right'></i></button>`;
}
