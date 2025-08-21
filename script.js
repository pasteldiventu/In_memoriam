document.addEventListener('DOMContentLoaded', () => {
    // --- DADOS DOS ARTISTAS ---
    const artists = [
        { id: 1, name: 'Vincent van Gogh', bio: 'Pintor pós-impressionista holandês que se tornou uma das figuras mais famosas e influentes da história da arte ocidental.', x: 100, y: 150 },
        { id: 2, name: 'Frida Kahlo', bio: 'Pintora mexicana conhecida por seus muitos retratos, autorretratos e obras inspiradas na natureza e nos artefatos do México.', x: 400, y: 450 },
        { id: 3, name: 'Leonardo da Vinci', bio: 'Um polímata italiano do Renascimento cujas áreas de interesse incluíam invenção, pintura, escultura, arquitetura, ciência e muito mais.', x: 650, y: 200 },
        { id: 4, name: 'Amy Winehouse', bio: 'Cantora e compositora britânica, conhecida por sua voz poderosa e emotiva e por sua mistura eclética de gêneros musicais, incluindo soul, jazz e R&B.', x: 250, y: 300 }
    ];

    // --- REFERÊNCIAS AOS ELEMENTOS DO DOM ---
    const gameContainer = document.getElementById('game-container');
    const butterfly = document.getElementById('butterfly');
    const modal = document.getElementById('artist-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBio = document.getElementById('modal-bio');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    // --- ESTADO DO JOGO ---
    let playerPos = { x: 50, y: 50 };
    let targetPos = { x: 50, y: 50 }; // Para interpolação suave
    let nearbyArtistId = null;
    const PLAYER_SPEED = 5; // Reduzido para melhor interpolação
    const INTERACTION_RADIUS = 40;
    
    // Controles de teclado
    const keys = {
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false
    };

    // --- FUNÇÕES ---

    /**
     * Inicializa o jogo, gerando as lápides na tela.
     */
    function init() {
        artists.forEach(artist => {
            const tombstone = document.createElement('div');
            tombstone.className = 'tombstone';
            tombstone.style.left = `${artist.x}px`;
            tombstone.style.top = `${artist.y}px`;
            tombstone.dataset.artistId = artist.id;
            gameContainer.appendChild(tombstone);
        });
        
        // Inicia o loop de animação
        gameLoop();
    }

    /**
     * Atualiza a posição do elemento da borboleta no DOM com interpolação suave.
     */
    function updateButterflyPosition() {
        // Interpolação suave (lerp)
        playerPos.x += (targetPos.x - playerPos.x) * 0.2;
        playerPos.y += (targetPos.y - playerPos.y) * 0.2;
        
        butterfly.style.left = playerPos.x + 'px';
        butterfly.style.top = playerPos.y + 'px';
    }
    
    /**
     * Atualiza a posição alvo com base nas teclas pressionadas.
     */
    function updateMovement() {
        if (keys.ArrowUp) targetPos.y -= PLAYER_SPEED;
        if (keys.ArrowDown) targetPos.y += PLAYER_SPEED;
        if (keys.ArrowLeft) targetPos.x -= PLAYER_SPEED;
        if (keys.ArrowRight) targetPos.x += PLAYER_SPEED;

        // Mantém dentro dos limites
        targetPos.x = Math.max(0, Math.min(targetPos.x, gameContainer.offsetWidth - butterfly.offsetWidth));
        targetPos.y = Math.max(0, Math.min(targetPos.y, gameContainer.offsetHeight - butterfly.offsetHeight));
    }
    
    /**
     * Verifica a proximidade da borboleta com as lápides.
     */
    function checkInteraction() {
        const tombstones = document.querySelectorAll('.tombstone');
        let artistFound = false;
        
        // Remove destaque de todas as lápides
        tombstones.forEach(t => t.classList.remove('interactive'));

        for (const tombstone of tombstones) {
            const tombstoneX = parseInt(tombstone.style.left, 10);
            const tombstoneY = parseInt(tombstone.style.top, 10);

            // Calcula a distância entre o centro da borboleta e o da lápide
            const distance = Math.sqrt(
                Math.pow(playerPos.x - tombstoneX, 2) + Math.pow(playerPos.y - tombstoneY, 2)
            );

            if (distance < INTERACTION_RADIUS) {
                nearbyArtistId = tombstone.dataset.artistId;
                tombstone.classList.add('interactive'); // Adiciona destaque visual
                artistFound = true;
                break; // Interage com apenas uma lápide por vez
            }
        }

        if (!artistFound) {
            nearbyArtistId = null;
        }
    }

    /**
     * Abre o modal com as informações do artista.
     * @param {number} artistId - O ID do artista a ser exibido.
     */
    function openModal(artistId) {
        const artist = artists.find(a => a.id == artistId);
        if (artist) {
            modalTitle.textContent = artist.name;
            modalBio.textContent = artist.bio;
            modal.classList.add('active');
        }
    }

    /**
     * Fecha o modal.
     */
    function closeModal() {
        modal.classList.remove('active');
    }

    /**
     * Loop principal do jogo para animação suave.
     */
    function gameLoop() {
        updateMovement();
        updateButterflyPosition();
        checkInteraction();
        requestAnimationFrame(gameLoop);
    }

    // --- EVENT LISTENERS ---

    // Controle de teclado - pressionar
    document.addEventListener('keydown', (e) => {
        if (keys.hasOwnProperty(e.key)) {
            keys[e.key] = true;
        }
        
        // Interação com a tecla E
        if ((e.key === 'e' || e.key === 'E') && nearbyArtistId) {
            openModal(nearbyArtistId);
        }
    });

    // Controle de teclado - soltar
    document.addEventListener('keyup', (e) => {
        if (keys.hasOwnProperty(e.key)) {
            keys[e.key] = false;
        }
    });

    // Fechar o modal
    modalCloseBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        // Fecha se o clique for no fundo do modal, e não no conteúdo
        if (e.target === modal) {
            closeModal();
        }
    });

    // --- INICIALIZAÇÃO DO JOGO ---
    init();
});