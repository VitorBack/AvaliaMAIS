// modal-avaliacao.js - Modal para avaliar mídias

const API_BASE_URL = 'http://localhost:8000';

const MODAL_AVALIACAO = {
    modalElement: null,
    midiaAtual: null,

    // Inicializa o modal
    init() {
        this.criarModal();
        this.setupEventListeners();
    },

    // Cria a estrutura HTML do modal
    criarModal() {
        const modalHTML = `
            <div id="modal-avaliacao" class="modal-overlay">
                <div class="modal-content">
                    <button class="modal-close" id="close-modal">
                        <i class='bx bx-x'></i>
                    </button>

                    <div class="modal-header">
                        <img id="modal-poster" src="" alt="Poster">
                        <div class="modal-info">
                            <h2 id="modal-title">Título</h2>
                            <p id="modal-type">Tipo</p>
                            <p id="modal-date">Data</p>
                        </div>
                    </div>

                    <div class="modal-body">
                        <div class="avaliacao-form">
                            <div class="rating-section">
                                <label>Sua Nota:</label>
                                <div class="star-rating" id="star-rating">
                                    ${this.criarEstrelas()}
                                </div>
                                <span class="rating-value" id="rating-value">0.0</span>
                            </div>

                            <div class="critica-section">
                                <label for="critica-input">Sua Crítica (opcional):</label>
                                <textarea 
                                    id="critica-input" 
                                    placeholder="Escreva sua opinião sobre essa mídia..."
                                    maxlength="500"
                                    rows="5"
                                ></textarea>
                                <span class="char-count" id="char-count">0/500</span>
                            </div>

                            <div class="modal-actions">
                                <button class="btn-secondary" id="cancel-btn">Cancelar</button>
                                <button class="btn-primary" id="save-avaliacao">Salvar Avaliação</button>
                            </div>

                            <div id="avaliacao-existente" class="avaliacao-existente" style="display: none;">
                                <p class="aviso-info">
                                    <i class='bx bx-info-circle'></i>
                                    Você já avaliou esta mídia
                                </p>
                                <button class="btn-danger" id="delete-avaliacao">
                                    <i class='bx bx-trash'></i> Deletar Avaliação
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modalElement = document.getElementById('modal-avaliacao');
    },

    // Cria as estrelas de rating
    criarEstrelas() {
        let html = '';
        for (let i = 1; i <= 10; i++) {
            html += `<i class='bx bxs-star star' data-rating="${i}"></i>`;
        }
        return html;
    },

    // Setup dos event listeners
    setupEventListeners() {
        // Fechar modal
        const closeBtn = document.getElementById('close-modal');
        const cancelBtn = document.getElementById('cancel-btn');
        
        closeBtn.addEventListener('click', () => this.fechar());
        cancelBtn.addEventListener('click', () => this.fechar());

        // Clicar fora do modal
        this.modalElement.addEventListener('click', (e) => {
            if (e.target === this.modalElement) {
                this.fechar();
            }
        });

        // Rating stars
        const stars = this.modalElement.querySelectorAll('.star');
        stars.forEach(star => {
            star.addEventListener('click', (e) => {
                const rating = e.target.getAttribute('data-rating');
                this.setRating(rating);
            });

            star.addEventListener('mouseenter', (e) => {
                const rating = e.target.getAttribute('data-rating');
                this.highlightStars(rating);
            });
        });

        const starRating = document.getElementById('star-rating');
        starRating.addEventListener('mouseleave', () => {
            const currentRating = starRating.getAttribute('data-current-rating') || 0;
            this.highlightStars(currentRating);
        });

        // Contador de caracteres
        const criticaInput = document.getElementById('critica-input');
        const charCount = document.getElementById('char-count');
        criticaInput.addEventListener('input', () => {
            charCount.textContent = `${criticaInput.value.length}/500`;
        });

        // Salvar avaliação
        const saveBtn = document.getElementById('save-avaliacao');
        saveBtn.addEventListener('click', () => this.salvarAvaliacao());

        // Deletar avaliação
        const deleteBtn = document.getElementById('delete-avaliacao');
        deleteBtn.addEventListener('click', () => this.deletarAvaliacao());
    },

    // Define rating
    setRating(rating) {
        const starRating = document.getElementById('star-rating');
        starRating.setAttribute('data-current-rating', rating);
        this.highlightStars(rating);
        document.getElementById('rating-value').textContent = rating + '.0';
    },

    // Destaca estrelas
    highlightStars(rating) {
        const stars = this.modalElement.querySelectorAll('.star');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    },

    // Abre modal com dados da mídia
    async abrir(midia) {
        // Normaliza o objeto de mídia para garantir que tem media_type
        this.midiaAtual = {
            ...midia,
            media_type: midia.media_type || this.detectarTipoMidia(midia)
        };
        
        // Preenche informações
        const poster = this.midiaAtual.poster_path 
            ? (this.midiaAtual.media_type === 'book' ? this.midiaAtual.poster_path : `https://image.tmdb.org/t/p/w500${this.midiaAtual.poster_path}`)
            : 'https://placehold.co/300x450/cccccc/333333?text=Sem+Capa';
        
        document.getElementById('modal-poster').src = poster;
        document.getElementById('modal-title').textContent = this.midiaAtual.title || this.midiaAtual.name || 'Sem título';
        document.getElementById('modal-type').textContent = this.getTipoTexto(this.midiaAtual.media_type);
        
        const data = this.midiaAtual.release_date || this.midiaAtual.first_air_date || '';
        document.getElementById('modal-date').textContent = data ? data.slice(0, 4) : 'Data desconhecida';

        // Limpa form
        this.setRating(0);
        document.getElementById('critica-input').value = '';
        document.getElementById('char-count').textContent = '0/500';

        // Verifica se já existe avaliação
        await this.verificarAvaliacaoExistente();

        // Mostra modal
        this.modalElement.classList.add('show');
        document.body.style.overflow = 'hidden';
    },

    // Fecha modal
    fechar() {
        this.modalElement.classList.remove('show');
        document.body.style.overflow = 'auto';
        this.midiaAtual = null;
    },

    // Verifica se usuário já avaliou
    async verificarAvaliacaoExistente() {
        const usuario = AUTH_GUARD.obterUsuario();
        if (!usuario || !this.midiaAtual) return;

        const midiaId = this.midiaAtual.id.toString();

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/avaliacoes/midia/${midiaId}?user_id=${usuario.id}`
            );

            if (response.ok) {
                const avaliacao = await response.json();
                
                // Preenche com dados existentes
                this.setRating(Math.floor(avaliacao.nota_final));
                document.getElementById('critica-input').value = avaliacao.critica || '';
                document.getElementById('char-count').textContent = `${(avaliacao.critica || '').length}/500`;
                
                // Mostra aviso e botão de deletar
                document.getElementById('avaliacao-existente').style.display = 'block';
                this.midiaAtual.avaliacaoId = avaliacao.id;
            } else {
                document.getElementById('avaliacao-existente').style.display = 'none';
            }
        } catch (error) {
            console.error('Erro ao verificar avaliação:', error);
        }
    },

    // Salva avaliação
    async salvarAvaliacao() {
        const usuario = AUTH_GUARD.obterUsuario();
        if (!usuario) {
            alert('Você precisa estar logado para avaliar!');
            return;
        }

        const rating = document.getElementById('star-rating').getAttribute('data-current-rating');
        if (!rating || rating == 0) {
            alert('Por favor, selecione uma nota!');
            return;
        }

        const critica = document.getElementById('critica-input').value.trim();

        // Garante que media_type está definido
        const mediaType = this.midiaAtual.media_type || this.detectarTipoMidia(this.midiaAtual);

        const avaliacaoData = {
            id_midia: this.midiaAtual.id.toString(),
            tipo_midia: mediaType, // Agora garante que está definido
            nota_final: parseFloat(rating),
            critica: critica || null,
            titulo_midia: this.midiaAtual.title || this.midiaAtual.name,
            poster_path: this.midiaAtual.poster_path
        };

        // Log para debug - pode remover depois
        console.log('📤 Enviando avaliação:', avaliacaoData);

        try {
            const response = await fetch(`${API_BASE_URL}/api/avaliacoes/${usuario.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(avaliacaoData)
            });

            const data = await response.json();

            if (response.ok) {
                console.log('✅ Avaliação salva:', data);
                alert('Avaliação salva com sucesso!');
                this.fechar();
                
                // Dispara evento customizado para atualizar UI
                document.dispatchEvent(new CustomEvent('avaliacao-salva'));
            } else {
                console.error('❌ Erro do servidor:', data);
                alert(data.detail || 'Erro ao salvar avaliação');
            }
        } catch (error) {
            console.error('❌ Erro ao salvar avaliação:', error);
            alert('Erro ao conectar com o servidor');
        }
    },

    // Deleta avaliação
    async deletarAvaliacao() {
        if (!confirm('Deseja realmente deletar esta avaliação?')) return;

        const usuario = AUTH_GUARD.obterUsuario();
        const avaliacaoId = this.midiaAtual.avaliacaoId;

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/avaliacoes/${avaliacaoId}?user_id=${usuario.id}`,
                { method: 'DELETE' }
            );

            if (response.ok) {
                alert('Avaliação deletada com sucesso!');
                this.fechar();
                document.dispatchEvent(new CustomEvent('avaliacao-deletada'));
            } else {
                alert('Erro ao deletar avaliação');
            }
        } catch (error) {
            console.error('Erro ao deletar avaliação:', error);
            alert('Erro ao conectar com o servidor');
        }
    },

    // Detecta tipo de mídia baseado nas propriedades do objeto
    detectarTipoMidia(midia) {
        // Se já tem media_type, usa ele
        if (midia.media_type) return midia.media_type;
        
        // Se tem 'name' (série) ou 'first_air_date'
        if (midia.name || midia.first_air_date) return 'tv';
        
        // Se tem 'title' (filme) ou 'release_date'
        if (midia.title || midia.release_date) {
            // Verifica se não é livro (livros também têm title)
            if (midia.volumeInfo || midia.raw?.volumeInfo) return 'book';
            return 'movie';
        }
        
        // Se tem dados de livro do Google Books
        if (midia.volumeInfo || midia.raw?.volumeInfo) return 'book';
        
        // Default para filme
        return 'movie';
    },

    getTipoTexto(tipo) {
        const tipos = {
            'movie': 'Filme',
            'tv': 'Série',
            'book': 'Livro'
        };
        return tipos[tipo] || tipo;
    }
};

// Inicializa quando o DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    MODAL_AVALIACAO.init();
});

// Exporta para uso global
window.MODAL_AVALIACAO = MODAL_AVALIACAO;