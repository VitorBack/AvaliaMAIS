// ===========================================
// js/home.js (Modificado para usar filtros de Categoria)
// ===========================================

// Supondo que você tem um endpoint fetchTMDB(path) e IMG_URL
// no seu tmdb-api.js

document.addEventListener('DOMContentLoaded', () => {
    // Carrega todas as categorias populares na home
    loadCategory('movie', 'filmesSwiper');
    loadCategory('tv', 'seriesSwiper');
    loadCategory('book', 'livrosSwiper'); // A TMDB não tem livros, adapte para a sua fonte de dados (ex: Google Books)

    setupCategoryFilters();
});

async function loadCategory(type, selector) {
    // Lógica para carregar e preencher os swipers
    if (type === 'movie') {
        const data = await fetchTMDB("/movie/popular");
        fillSwiper(`#${selector}`, data.results);
    } else if (type === 'tv') {
        const data = await fetchTMDB("/tv/popular");
        fillSwiper(`#${selector}`, data.results);
    } else if (type === 'book') {
        // Implementar a busca de livros ou usar a TMDB com gênero 99 (documentary) como placeholder temporário
        // Exemplo: const data = await fetchGoogleBooks("ficção");
        // fillSwiper(`#${selector}`, data);
    }
}

// Seu código fillSwiper(selector, items) deve estar aqui
// ...

// Lógica para os botões de filtro
function setupCategoryFilters() {
    const filterContainer = document.getElementById('category-filters');
    const mainContent = document.getElementById('main-content');
    const allSections = mainContent.querySelectorAll('.swiper'); // Selecione todas as seções de sliders

    filterContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const filter = e.target.getAttribute('data-filter');
            
            // Remove a classe 'active' de todos os botões e adiciona ao clicado
            filterContainer.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');

            // Itera sobre as seções de sliders e exibe/esconde
            allSections.forEach(section => {
                const sectionId = section.id; // Assume que os IDs são 'filmesSwiper', 'seriesSwiper', 'livrosSwiper'
                
                if (filter === 'all') {
                    section.style.display = 'block'; // Mostra tudo
                } else if (filter === 'movie' && sectionId === 'filmesSwiper') {
                    section.style.display = 'block';
                } else if (filter === 'tv' && sectionId === 'seriesSwiper') {
                    section.style.display = 'block';
                } else if (filter === 'book' && sectionId === 'livrosSwiper') {
                    section.style.display = 'block';
                } else {
                    section.style.display = 'none'; // Esconde o restante
                }
            });
            
            // Lógica para filtros 'Avaliados' e 'Lançamentos' (você precisaria adaptar a função loadCategory para mudar o endpoint da API)
            // ...
        }
    });
}