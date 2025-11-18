const API_KEY = "SUA_API_KEY_AQUI"; // crie a sua no site do TMDB
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";

async function fetchTMDB(endpoint) {
    const url = `${BASE_URL}${endpoint}?api_key=${API_KEY}&language=pt-BR`;

    const response = await fetch(url);
    return response.json();
}
