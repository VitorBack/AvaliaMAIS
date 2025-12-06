const API_KEY = '9ba1a055686151e8c41aa42a7c19aa21';
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";

async function fetchTMDB(path) {
    const url = `${BASE_URL}${path}${path.includes('?') ? '&' : '?'}api_key=${API_KEY}&language=pt-BR`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            console.error(`Erro TMDB ${response.status}:`, url);
            throw new Error(`TMDB falhou: ${response.status}`);
        }

        return response.json();
    } catch (err) {
        console.error("Erro fetchTMDB():", err);
        throw err;
    }
}

async function fetchMovies(page = 1, query = "") {
    if (query && query.trim().length > 0) {
        return fetchTMDB(`/search/movie?query=${encodeURIComponent(query)}&page=${page}`);
    }
    return fetchTMDB(`/movie/popular?page=${page}`);
}

async function fetchTopRatedMovies(page = 1) {
    return fetchTMDB(`/movie/top_rated?page=${page}`);
}

async function fetchSeries(page = 1, query = "") {
    if (query && query.trim().length > 0) {
        return fetchTMDB(`/search/tv?query=${encodeURIComponent(query)}&page=${page}`);
    }
    return fetchTMDB(`/tv/popular?page=${page}`);
}

async function fetchTopRatedSeries(page = 1) {
    return fetchTMDB(`/tv/top_rated?page=${page}`);
}

/**
 * Google Books: busca básica com paginação (maxResults=12)
 * Retorna um objeto parecido com TMDB: { items: [...], totalItems }
 */
async function fetchBooks(page = 1, query = "") {
    const perPage = 12;
    const startIndex = (page - 1) * perPage;
    const q = query && query.trim().length > 0 ? encodeURIComponent(query) : "best+books";
    const url = `https://www.googleapis.com/books/v1/volumes?q=${q}&startIndex=${startIndex}&maxResults=${perPage}&langRestrict=pt`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Google Books error ${res.status}`);
        return res.json(); // items, totalItems
    } catch (err) {
        console.error("Erro fetchBooks():", err);
        return { items: [], totalItems: 0 };
    }
}

/* Útil para templates, converte um item do Google Books para formato similar */
function normalizeBookItem(item) {
    return {
        id: item.id,
        title: item.volumeInfo?.title || "Sem título",
        release_date: item.volumeInfo?.publishedDate || "—",
        vote_average: (item.volumeInfo?.averageRating || 0) * 2, // para manter escala 0-10
        poster_path: item.volumeInfo?.imageLinks?.thumbnail || null,
        media_type: "book",
        raw: item
    };
}

// ============================================================================
// FUNÇÕES PARA POPULAR OS TOP 10 NA HOME
// ============================================================================

/**
 * Carrega e popula o Top 10 de Filmes
 */
async function loadTop10Movies() {
    try {
        const data = await fetchTopRatedMovies(1);
        const top10 = data.results.slice(0, 10).map(movie => ({
            id: movie.id,
            title: movie.title,
            poster: movie.poster_path ? `${IMG_URL}${movie.poster_path}` : 'https://via.placeholder.com/200x300?text=Sem+Imagem',
            rating: movie.vote_average,
            release_date: movie.release_date,
            media_type: 'movie'
        }));

        populateTop10Slider('#top10-filmes', top10);
    } catch (err) {
        console.error('Erro ao carregar Top 10 Filmes:', err);
    }
}

/**
 * Carrega e popula o Top 10 de Séries
 */
async function loadTop10Series() {
    try {
        const data = await fetchTopRatedSeries(1);
        const top10 = data.results.slice(0, 10).map(serie => ({
            id: serie.id,
            title: serie.name,
            poster: serie.poster_path ? `${IMG_URL}${serie.poster_path}` : 'https://via.placeholder.com/200x300?text=Sem+Imagem',
            rating: serie.vote_average,
            release_date: serie.first_air_date,
            media_type: 'tv'
        }));

        populateTop10Slider('#top10-series', top10);
    } catch (err) {
        console.error('Erro ao carregar Top 10 Séries:', err);
    }
}

/**
 * Carrega e popula o Top 10 de Livros
 * Usa uma query específica para livros mais bem avaliados
 */
async function loadTop10Books() {
    try {
        // Busca por livros bestsellers/clássicos
        const queries = [
            'subject:fiction+bestseller',
            'subject:classics',
            'inauthor:"Paulo Coelho"',
            'subject:literatura+brasileira'
        ];
        
        const randomQuery = queries[Math.floor(Math.random() * queries.length)];
        const url = `https://www.googleapis.com/books/v1/volumes?q=${randomQuery}&maxResults=10&orderBy=relevance&langRestrict=pt`;
        
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Google Books error ${res.status}`);
        const data = await res.json();

        const top10 = (data.items || []).slice(0, 10).map(book => {
            const normalized = normalizeBookItem(book);
            return {
                id: normalized.id,
                title: normalized.title,
                poster: normalized.poster_path || 'https://via.placeholder.com/200x300?text=Sem+Imagem',
                rating: normalized.vote_average || 'N/A',
                release_date: normalized.release_date,
                media_type: 'book'
            };
        });

        populateTop10Slider('#top10-livros', top10);
    } catch (err) {
        console.error('Erro ao carregar Top 10 Livros:', err);
    }
}

/**
 * Inicializa todos os Top 10 na página home
 * Chame essa função quando a página carregar
 */
function initTop10Sections() {
    // Verifica se estamos na página home
    if (document.getElementById('top10-filmes')) {
        loadTop10Movies();
    }
    
    if (document.getElementById('top10-series')) {
        loadTop10Series();
    }
    
    if (document.getElementById('top10-livros')) {
        loadTop10Books();
    }
}

// Inicializa automaticamente quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTop10Sections);
} else {
    initTop10Sections();
}