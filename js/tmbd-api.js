// ===========================================
// js/TMBD-api.js - Configuração e Funções da API TMDB (Usando Token V4)
// ===========================================

// --- VARIÁVEIS GLOBAIS DA API ---
// Este é o Access Token (v4) que você validou. Ele será usado no cabeçalho 'Authorization'.
const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5YmExYTA1NTY4NjE1MWU4YzQxYWE0MmE3YzE5YWEyMSIsInZlcnNpb24iOjF9.J_PKKtQZulOVDAQeT06eXt-W5-FHx4z5u5zEzS5OH2I";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";
// ---------------------------------

/**
 * Função genérica para buscar dados da API do TMDB, usando a autenticação Bearer Token (v4).
 *
 * @param {string} endpointQueryPath O caminho do endpoint TMDB (e.g., "/movie/popular?page=1" ou "/search/multi?query=duna").
 * @returns {Promise<Object>} Os dados JSON da resposta da API.
 */
async function fetchTMDB(endpointQueryPath) {
    // A URL final é construída com o endpoint e o idioma, SEM a chave API V3 no parâmetro.
    // O 'endpointQueryPath' deve incluir a paginação ou busca (ex: /movie/popular?page=1)
    const url = `${BASE_URL}${endpointQueryPath}&language=pt-BR`; 

    // Opções de requisição:
    const options = {
        method: 'GET',
        headers: {
            // A autenticação é feita aqui, via cabeçalho HTTP (Bearer Token V4)
            'Authorization': `Bearer ${ACCESS_TOKEN}`, 
            'accept': 'application/json'
        }
    };

    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            console.error(`TMDB API Erro: ${response.status} - URL: ${url}`);
            throw new Error(`TMDB API falhou com status: ${response.status}. Verifique o Access Token (v4).`);
        }

        return response.json();

    } catch (error) {
        console.error("Erro na operação fetchTMDB (Verifique sua conexão ou token):", error);
        throw error;
    }
}