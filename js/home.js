// FILMES POPULARES
fetchTMDB("/movie/popular").then(data => {
    fillSwiper("#filmesSwiper", data.results);
});

// SÉRIES POPULARES
fetchTMDB("/tv/popular").then(data => {
    fillSwiper("#seriesSwiper", data.results);
});

// LIVROS — vamos puxar como "documentaries" até usar Google Books
fetchTMDB("/discover/movie&with_genres=99").then(data => {
    fillSwiper("#livrosSwiper", data.results);
});


function fillSwiper(selector, items) {
    const wrapper = document.querySelector(`${selector} .swiper-wrapper`);

    items.slice(0, 20).forEach(item => {
        const card = `
            <div class="swiper-slide">
                <div class="card">
                    <img src="${IMG_URL + item.poster_path}">
                    <h3>${item.title || item.name}</h3>
                </div>
            </div>
        `;
        wrapper.innerHTML += card;
    });

    createSwiper(selector);
}
