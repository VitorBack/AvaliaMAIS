const searchInput = document.getElementById('search-input');
const searchIcon = document.getElementById('search-icon');

const resultsArea = document.getElementById('search-results');
const resultsList = document.getElementById('results-list');
const isCategoryPage = window.location.pathname.includes('filmes.html') ||
                       window.location.pathname.includes('series.html') ||
                       window.location.pathname.includes('livros.html');

let currentSearchQuery = '';
let currentSearchPage = 1;
const PER_PAGE = 12;

document.addEventListener('DOMContentLoaded', () => {
    if (searchIcon) searchIcon.addEventListener('click', handleSearch);
    if (searchInput) searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    if (!isCategoryPage) {
        showTopSectionsOnHome();
    }
});

function clearResultsArea() {
    if (resultsList) resultsList.innerHTML = '';
    if (resultsArea) resultsArea.style.display = 'none';
}

function showResultsArea() {
    if (resultsArea) resultsArea.style.display = 'block';
}

async function showTopSectionsOnHome() {
    if (!resultsArea) return;

    resultsArea.style.display = 'block';
    // resultsArea.innerHTML = `
    //     <h2>Em alta – Top avaliados</h2>
    //     <section id="top-filmes" class="home-section">
    //         <h3>Filmes</h3>
    //         <div class="home-grid" id="top-filmes-list"></div>
    //     </section>

    //     <section id="top-series" class="home-section">
    //         <h3>Séries</h3>
    //         <div class="home-grid" id="top-series-list"></div>
    //     </section>

    //     <section id="top-livros" class="home-section">
    //         <h3>Livros</h3>
    //         <div class="home-grid" id="top-livros-list"></div>
    //     </section>
    // `;

    try {
        const [moviesData, seriesData, booksData] = await Promise.all([
            fetchTopRatedMovies(1),
            fetchTopRatedSeries(1),
            fetchBooks(1, "best+books")
        ]);

        const topMovies = (moviesData.results || []).slice(0, 12);
        const topSeries = (seriesData.results || []).slice(0, 12);
        const topBooks = (booksData.items || []).slice(0, 12).map(normalizeBookItem);

        renderHomeSection('top-filmes-list', topMovies);
        renderHomeSection('top-series-list', topSeries);
        renderHomeSection('top-livros-list', topBooks);

    } catch (err) {
        console.error("Erro ao carregar top sections:", err);
    }
}

function renderHomeSection(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    items.forEach(item => container.appendChild(createMediaCardElement(item)));
}

function handleSearch() {
    const query = searchInput.value.trim();
    if (!query) {
        clearResultsArea();
        if (!isCategoryPage) showTopSectionsOnHome();
        return;
    }

    currentSearchQuery = query;
    currentSearchPage = 1;

    if (isCategoryPage) {
        const evt = new CustomEvent('category-search', { detail: { query, page: currentSearchPage } });
        document.dispatchEvent(evt);
    } else {
        searchGlobal(query, currentSearchPage);
    }
}

async function searchGlobal(query, page = 1) {
    if (!resultsArea) return;
    resultsArea.style.display = 'block';
    resultsArea.innerHTML = `<h2>Resultados da pesquisa para "${query}"</h2>
        <section id="found-filmes" class="home-section">
            <h3>Filmes</h3>
            <div class="home-grid" id="found-filmes-list"></div>
        </section>
        <section id="found-series" class="home-section">
            <h3>Séries</h3>
            <div class="home-grid" id="found-series-list"></div>
        </section>
        <section id="found-books" class="home-section">
            <h3>Livros</h3>
            <div class="home-grid" id="found-books-list"></div>
        </section>
    `;

    const filmsListEl = document.getElementById('found-filmes-list');
    const seriesListEl = document.getElementById('found-series-list');
    const booksListEl = document.getElementById('found-books-list');

    filmsListEl.innerHTML = `<p class="text-center p-6">Buscando filmes...</p>`;
    seriesListEl.innerHTML = `<p class="text-center p-6">Buscando séries...</p>`;
    booksListEl.innerHTML = `<p class="text-center p-6">Buscando livros...</p>`;

    try {
        const [moviesData, seriesData, booksData] = await Promise.all([
            fetchMovies(1, query),
            fetchSeries(1, query),
            fetchBooks(1, query)
        ]);

        const movies = (moviesData.results || []).slice(0, 12);
        const series = (seriesData.results || []).slice(0, 12);
        const books = (booksData.items || []).slice(0, 12).map(normalizeBookItem);

        if (movies.length) {
            filmsListEl.innerHTML = '';
            movies.forEach(m => filmsListEl.appendChild(createMediaCardElement({ ...m, media_type: 'movie' })));
        } else {
            filmsListEl.innerHTML = `<p>Nenhum filme encontrado.</p>`;
        }

        if (series.length) {
            seriesListEl.innerHTML = '';
            series.forEach(s => seriesListEl.appendChild(createMediaCardElement({ ...s, media_type: 'tv' })));
        } else {
            seriesListEl.innerHTML = `<p>Nenhuma série encontrada.</p>`;
        }

        if (books.length) {
            booksListEl.innerHTML = '';
            books.forEach(b => booksListEl.appendChild(createMediaCardElement(b)));
        } else {
            booksListEl.innerHTML = `<p>Nenhum livro encontrado.</p>`;
        }

    } catch (err) {
        console.error('Erro na busca global:', err);
        if (filmsListEl) filmsListEl.innerHTML = `<p>Erro ao buscar filmes.</p>`;
        if (seriesListEl) seriesListEl.innerHTML = `<p>Erro ao buscar séries.</p>`;
        if (booksListEl) booksListEl.innerHTML = `<p>Erro ao buscar livros.</p>`;
    }
}

function createMediaCardElement(item) {
    const title = item.title || item.name || "Sem título";
    const dateStr = (item.release_date || item.first_air_date || item.raw?.volumeInfo?.publishedDate || "—").toString();
    const year = dateStr ? (dateStr.slice(0,4) || "—") : "—";
    const rating = (item.vote_average || 0).toFixed(1);
    let imgSrc = '';

    if (item.media_type === 'book') {
        imgSrc = item.poster_path || (item.raw?.volumeInfo?.imageLinks?.thumbnail) || 'https://placehold.co/500x750/cccccc/333333?text=Sem%20Capa';
    } else {
        imgSrc = item.poster_path ? `${IMG_URL}${item.poster_path}` : 'https://placehold.co/500x750/cccccc/333333?text=Sem%20Capa';
    }

    const card = document.createElement('div');
    card.className = 'media-card';
    card.innerHTML = `
        <img src="${imgSrc}" alt="${title}" onerror="this.onerror=null;this.src='https://placehold.co/500x750/cccccc/333333?text=Sem%20Capa'">
        <div class="media-info">
            <div class="media-bottom">
                <span class="media-rating">⭐ ${rating}</span>
                <span class="media-date">${year}</span>
            </div>
            <h3 class="media-title">${title}</h3>
        </div>
        <button class="btn-avaliar">
            <i class='bx bx-star'></i> Avaliar
        </button>
    `;
    
    // Ao clicar no botão avaliar, abre o modal
    const btnAvaliar = card.querySelector('.btn-avaliar');
    btnAvaliar.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.MODAL_AVALIACAO) {
            window.MODAL_AVALIACAO.abrir(item);
        }
    });

    return card;
}

window.createMediaCardElement = createMediaCardElement;