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