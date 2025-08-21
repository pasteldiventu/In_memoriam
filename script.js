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
    const proximityIndicator = document.createElement('div');
    proximityIndicator.id = 'proximity-indicator';
    gameContainer.appendChild(proximityIndicator);

    // --- ESTADO DO JOGO ---
    let playerPos = { x: 50, y: 50 };
    let targetPos = { x: 50, y: 50 };
    let nearbyArtistId = null;
    let proximityLevel = 0; // 0 a 1 indicando o nível de proximidade
    const PLAYER_SPEED = 5;
    const INTERACTION_RADIUS = 80; // Aumentado para ter zonas de proximidade
    const CLOSE_RADIUS = 40; // Raio para interação imediata

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
            
            // Adiciona aura sutil à lápide
            const tombstoneAura = document.createElement('div');
            tombstoneAura.className = 'tombstone-aura';
            tombstone.appendChild(tombstoneAura);
            
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
        
        butterfly.style.left = `${playerPos.x}px`;
        butterfly.style.top = `${playerPos.y}px`;
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
        let closestDistance = INTERACTION_RADIUS;
        let closestTombstone = null;
        proximityLevel = 0;
        
        // Remove destaque de todas as lápides
        tombstones.forEach(t => {
            t.classList.remove('interactive', 'close');
            const aura = t.querySelector('.tombstone-aura');
            if (aura) aura.style.opacity = '0';
        });

        // Encontra a lápide mais próxima
        for (const tombstone of tombstones) {
            const tombstoneX = parseInt(tombstone.style.left, 10) + tombstone.offsetWidth/2;
            const tombstoneY = parseInt(tombstone.style.top, 10) + tombstone.offsetHeight/2;
            
            const playerCenterX = playerPos.x + butterfly.offsetWidth/2;
            const playerCenterY = playerPos.y + butterfly.offsetHeight/2;

            // Calcula a distância entre os centros
            const distance = Math.sqrt(
                Math.pow(playerCenterX - tombstoneX, 2) + Math.pow(playerCenterY - tombstoneY, 2)
            );

            if (distance < closestDistance) {
                closestDistance = distance;
                closestTombstone = tombstone;
            }
        }

        // Atualiza indicadores de proximidade
        if (closestTombstone) {
            // Calcula o nível de proximidade (0 a 1)
            proximityLevel = 1 - (closestDistance / INTERACTION_RADIUS);
            
            // Atualiza o indicador visual
            updateProximityIndicator(closestTombstone, proximityLevel);
            
            // Adiciona efeitos visuais baseados na proximidade
            if (closestDistance < CLOSE_RADIUS) {
                closestTombstone.classList.add('interactive', 'close');
                nearbyArtistId = closestTombstone.dataset.artistId;
                
                // Efeito de pulsação mais intenso
                const aura = closestTombstone.querySelector('.tombstone-aura');
                if (aura) {
                    aura.style.opacity = '0.7';
                    aura.style.transform = `scale(${1.2 + proximityLevel * 0.3})`;
                }
                
                // Adiciona efeito de partículas (opcional)
                if (proximityLevel > 0.8 && Math.random() > 0.7) {
                    createParticleEffect(closestTombstone);
                }
            } else {
                closestTombstone.classList.add('interactive');
                nearbyArtistId = closestTombstone.dataset.artistId;
                
                // Efeito de pulsação suave
                const aura = closestTombstone.querySelector('.tombstone-aura');
                if (aura) {
                    aura.style.opacity = (0.3 + proximityLevel * 0.4).toString();
                    aura.style.transform = `scale(${1 + proximityLevel * 0.2})`;
                }
            }
        } else {
            nearbyArtistId = null;
            proximityIndicator.style.opacity = '0';
        }
    }

    /**
     * Atualiza o indicador visual de proximidade.
     */
    function updateProximityIndicator(tombstone, level) {
        const rect = tombstone.getBoundingClientRect();
        const containerRect = gameContainer.getBoundingClientRect();
        
        // Posiciona o indicador entre a borboleta e a lápide
        const tombstoneX = parseInt(tombstone.style.left, 10) + tombstone.offsetWidth/2;
        const tombstoneY = parseInt(tombstone.style.top, 10) + tombstone.offsetHeight/2;
        
        const playerCenterX = playerPos.x + butterfly.offsetWidth/2;
        const playerCenterY = playerPos.y + butterfly.offsetHeight/2;
        
        // Ponto intermediário (70% em direção à lápide)
        const indicatorX = playerCenterX + (tombstoneX - playerCenterX) * 0.7;
        const indicatorY = playerCenterY + (tombstoneY - playerCenterY) * 0.7;
        
        proximityIndicator.style.left = `${indicatorX}px`;
        proximityIndicator.style.top = `${indicatorY}px`;
        proximityIndicator.style.opacity = level.toString();
        proximityIndicator.style.transform = `scale(${0.5 + level * 0.5})`;
        
        // Muda a cor baseado na proximidade
        const hue = 120 - (level * 120); // Verde para vermelho
        proximityIndicator.style.backgroundColor = `hsl(${hue}, 80%, 60%)`;
    }

    /**
     * Cria efeito de partículas ao redor da lápide (opcional).
     */
    function createParticleEffect(tombstone) {
        for (let i = 0; i < 3; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const tombstoneRect = tombstone.getBoundingClientRect();
            const containerRect = gameContainer.getBoundingClientRect();
            
            const x = tombstoneRect.left - containerRect.left + tombstone.offsetWidth/2;
            const y = tombstoneRect.top - containerRect.top + tombstone.offsetHeight/2;
            
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            
            // Direção aleatória
            const angle = Math.random() * Math.PI * 2;
            const distance = 20 + Math.random() * 30;
            
            gameContainer.appendChild(particle);
            
            // Animação
            setTimeout(() => {
                particle.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`;
                particle.style.opacity = '0';
            }, 10);
            
            // Remove após animação
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 1000);
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
            
            // Adiciona classe de movimento para animação da borboleta
            butterfly.classList.add('moving');
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
            
            // Remove classe de movimento se nenhuma tecla está pressionada
            if (!keys.ArrowUp && !keys.ArrowDown && !keys.ArrowLeft && !keys.ArrowRight) {
                butterfly.classList.remove('moving');
            }
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
})