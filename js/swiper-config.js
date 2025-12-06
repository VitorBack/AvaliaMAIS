// SWIPER PARALLAX (Banner original)
const swiperParallax = new Swiper(".parallax-slider", {   
    spaceBetween: 15,
    slidesPerView: 1,
    speed: 600,
    parallax: true,
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
});

// CONFIGURAÇÃO DOS SWIPERS TOP 10
const swiperConfig = {
    slidesPerView: 2,
    spaceBetween: 20,
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
    breakpoints: {
        480: {
            slidesPerView: 2,
            spaceBetween: 15
        },
        640: {
            slidesPerView: 3,
            spaceBetween: 20
        },
        768: {
            slidesPerView: 4,
            spaceBetween: 20
        },
        1024: {
            slidesPerView: 5,
            spaceBetween: 25
        },
        1280: {
            slidesPerView: 6,
            spaceBetween: 30
        }
    }
};

// Inicializa os Swipers Top 10 após o DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    // Swiper Top 10 Filmes
    const swiperFilmes = new Swiper("#top10-filmes", swiperConfig);
    
    // Swiper Top 10 Séries
    const swiperSeries = new Swiper("#top10-series", swiperConfig);
    
    // Swiper Top 10 Livros
    const swiperLivros = new Swiper("#top10-livros", swiperConfig);
});

// FUNÇÃO AUXILIAR PARA CRIAR CARDS TOP 10
function createTop10Card(item, rank) {
    const imageUrl = item.poster || item.image || 'https://via.placeholder.com/200x300?text=Sem+Imagem';
    const title = item.title || item.name || 'Título não disponível';
    const rating = item.rating || item.vote_average || 'N/A';
    
    return `
        <div class="swiper-slide">
            <div class="top10-card" data-id="${item.id}">
                <div class="rank-badge">${rank}</div>
                <img src="${imageUrl}" alt="${title}">
                <div class="card-info">
                    <h3>${title}</h3>
                    <div class="rating">
                        <i class='bx bxs-star'></i>
                        <span>${typeof rating === 'number' ? rating.toFixed(1) : rating}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// FUNÇÃO PARA POPULAR OS SLIDERS TOP 10
function populateTop10Slider(sliderId, items) {
    const slider = document.querySelector(`${sliderId} .swiper-wrapper`);
    if (!slider) return;
    
    slider.innerHTML = items.map((item, index) => 
        createTop10Card(item, index + 1)
    ).join('');
    
    // Atualiza o swiper após inserir os cards
    const swiperInstance = document.querySelector(sliderId).swiper;
    if (swiperInstance) {
        swiperInstance.update();
    }
}

