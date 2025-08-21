document.addEventListener('DOMContentLoaded', () => {
  // --- DADOS DOS ARTISTAS ---
  const artists = [
    { id: 1, name: 'Vincent van Gogh', bio: 'Pintor pós-impressionista holandês que se tornou uma das figuras mais famosas e influentes da história da arte ocidental.', x: 300, y: 350 },
    { id: 2, name: 'Frida Kahlo', bio: 'Pintora mexicana conhecida por seus muitos retratos, autorretratos e obras inspiradas na natureza e nos artefatos do México.', x: 800, y: 950 },
    { id: 3, name: 'Leonardo da Vinci', bio: 'Um polímata italiano do Renascimento cujas áreas de interesse incluíam invenção, pintura, escultura, arquitectura, ciência e muito mais.', x: 1500, y: 500 },
    { id: 4, name: 'Amy Winehouse', bio: 'Cantora e compositora britânica, conhecida por sua voz poderosa e emotiva e por sua mistura eclética de gêneros musicais, incluindo soul, jazz e R&B.', x: 500, y: 1300 },
    { id: 5, name: 'Wolfgang Amadeus Mozart', bio: 'Prolífico e influente compositor do período clássico. Compôs mais de 600 obras, muitas reconhecidas como ápices da música sinfónica, concertante, operística, coral e pianística.', x: 1700, y: 1700 },
    { id: 6, name: 'Clarice Lispector', bio: 'Escritora e jornalista brasileira nascida na Ucrânia. É considerada uma das escritoras brasileiras mais importantes do século XX e a maior representante do modernismo brasileiro.', x: 1200, y: 300 }
  ];

  // --- REFERÊNCIAS AO DOM ---
  const gameWrapper = document.getElementById('game-wrapper');
  const gameContainer = document.getElementById('game-container');
  const butterfly = document.getElementById('butterfly');
  const modal = document.getElementById('artist-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBio = document.getElementById('modal-bio');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const proximityIndicator = document.createElement('div');
  const miniMap = document.getElementById('mini-map');
  const viewIndicator = document.getElementById('view-indicator');
  const playerMini = document.getElementById('player-mini');

  proximityIndicator.id = 'proximity-indicator';
  gameContainer.appendChild(proximityIndicator);

  // --- ESTADO DO JOGO ---
  let playerPos = { x: 100, y: 100 };
  let targetPos = { x: 100, y: 100 };
  let nearbyArtistId = null;
  let proximityLevel = 0;
  let viewOffset = { x: 0, y: 0 };
  const PLAYER_SPEED = 5;
  const INTERACTION_RADIUS = 80;
  const CLOSE_RADIUS = 40;
  const MAP_WIDTH = 2000;
  const MAP_HEIGHT = 2000;
  const VIEW_WIDTH = gameWrapper.offsetWidth;
  const VIEW_HEIGHT = gameWrapper.offsetHeight;

  // Controles de teclado
  const keys = { ArrowUp:false, ArrowDown:false, ArrowLeft:false, ArrowRight:false };

  // --- FUNÇÕES ---
  function init(){
    artists.forEach(artist => {
      const tombstone = document.createElement('div');
      tombstone.className = 'tombstone';
      tombstone.style.left = `${artist.x}px`;
      tombstone.style.top = `${artist.y}px`;
      tombstone.dataset.artistId = artist.id;

      const tombstoneAura = document.createElement('div');
      tombstoneAura.className = 'tombstone-aura';
      tombstone.appendChild(tombstoneAura);

      gameContainer.appendChild(tombstone);

      // ponto no minimapa
      const miniPoint = document.createElement('div');
      miniPoint.className = 'mini-point';
      miniPoint.style.left = `${artist.x / MAP_WIDTH * 150}px`;
      miniPoint.style.top  = `${artist.y / MAP_HEIGHT * 150}px`;
      miniMap.appendChild(miniPoint);
    });

    updateView();
    updateMiniMap();
    gameLoop();
  }

  function updateButterflyPosition(){
    playerPos.x += (targetPos.x - playerPos.x) * 0.2;
    playerPos.y += (targetPos.y - playerPos.y) * 0.2;

    butterfly.style.left = `${playerPos.x}px`;
    butterfly.style.top  = `${playerPos.y}px`;

    updateView();
    updateMiniMap();
  }

  function updateMovement(){
    if (keys.ArrowUp)    targetPos.y -= PLAYER_SPEED;
    if (keys.ArrowDown)  targetPos.y += PLAYER_SPEED;
    if (keys.ArrowLeft)  targetPos.x -= PLAYER_SPEED;
    if (keys.ArrowRight) targetPos.x += PLAYER_SPEED;

    targetPos.x = Math.max(0, Math.min(targetPos.x, MAP_WIDTH - butterfly.offsetWidth));
    targetPos.y = Math.max(0, Math.min(targetPos.y, MAP_HEIGHT - butterfly.offsetHeight));
  }

  function updateView(){
    viewOffset.x = -playerPos.x + VIEW_WIDTH / 2;
    viewOffset.y = -playerPos.y + VIEW_HEIGHT / 2;

    viewOffset.x = Math.min(0, Math.max(viewOffset.x, VIEW_WIDTH - MAP_WIDTH));
    viewOffset.y = Math.min(0, Math.max(viewOffset.y, VIEW_HEIGHT - MAP_HEIGHT));

    gameContainer.style.transform = `translate(${viewOffset.x}px, ${viewOffset.y}px)`;
  }

  function updateMiniMap(){
    playerMini.style.left = `${playerPos.x / MAP_WIDTH * 150}px`;
    playerMini.style.top  = `${playerPos.y / MAP_HEIGHT * 150}px`;

    const viewX = (-viewOffset.x / MAP_WIDTH) * 150;
    const viewY = (-viewOffset.y / MAP_HEIGHT) * 150;
    const viewWidth  = (VIEW_WIDTH  / MAP_WIDTH)  * 150;
    const viewHeight = (VIEW_HEIGHT / MAP_HEIGHT) * 150;

    viewIndicator.style.left = `${viewX}px`;
    viewIndicator.style.top  = `${viewY}px`;
    viewIndicator.style.width  = `${viewWidth}px`;
    viewIndicator.style.height = `${viewHeight}px`;
  }

  function checkInteraction(){
    const tombstones = document.querySelectorAll('.tombstone');
    let closestDistance = INTERACTION_RADIUS;
    let closestTombstone = null;
    proximityLevel = 0;

  tombstones.forEach(t => {
  t.classList.remove('interactive', 'close');
  const aura = t.querySelector('.tombstone-aura');
  if (aura) aura.style.opacity = '0';   // <-- REMOVER ESTA LINHA
});

    for (const tombstone of tombstones){
      const tombstoneX = parseInt(tombstone.style.left,10) + tombstone.offsetWidth/2;
      const tombstoneY = parseInt(tombstone.style.top,10)  + tombstone.offsetHeight/2;
      const playerCenterX = playerPos.x + butterfly.offsetWidth/2;
      const playerCenterY = playerPos.y + butterfly.offsetHeight/2;

      const distance = Math.hypot(playerCenterX - tombstoneX, playerCenterY - tombstoneY);

      if (distance < closestDistance){
        closestDistance = distance;
        closestTombstone = tombstone;
      }
    }

    if (closestTombstone){
      proximityLevel = 1 - (closestDistance / INTERACTION_RADIUS);
      updateProximityIndicator(closestTombstone, proximityLevel);

      const aura = closestTombstone.querySelector('.tombstone-aura');

      if (closestDistance < CLOSE_RADIUS){
        closestTombstone.classList.add('interactive','close');
        nearbyArtistId = closestTombstone.dataset.artistId;

        if (aura){
          aura.style.opacity = '0.7';
          aura.style.transform = `scale(${1.2 + proximityLevel * 0.3})`;
        }

        if (proximityLevel > 0.8 && Math.random() > 0.7){
          createParticleEffect(closestTombstone);
        }
      } else {
        closestTombstone.classList.add('interactive');
        nearbyArtistId = closestTombstone.dataset.artistId;

        if (aura){
          aura.style.opacity = (0.3 + proximityLevel * 0.4).toString();
          aura.style.transform = `scale(${1 + proximityLevel * 0.2})`;
        }
      }
    } else {
      nearbyArtistId = null;
      proximityIndicator.style.opacity = '0';
    }
  }

  function updateProximityIndicator(tombstone, level){
    const tombstoneX = parseInt(tombstone.style.left,10) + tombstone.offsetWidth/2;
    const tombstoneY = parseInt(tombstone.style.top,10)  + tombstone.offsetHeight/2;
    const playerCenterX = playerPos.x + butterfly.offsetWidth/2;
    const playerCenterY = playerPos.y + butterfly.offsetHeight/2;

    const indicatorX = playerCenterX + (tombstoneX - playerCenterX) * 0.7;
    const indicatorY = playerCenterY + (tombstoneY - playerCenterY) * 0.7;

    proximityIndicator.style.left = `${indicatorX}px`;
    proximityIndicator.style.top  = `${indicatorY}px`;
    proximityIndicator.style.opacity = level.toString();
    proximityIndicator.style.transform = `scale(${0.5 + level * 0.5})`;

    const hue = 120 - (level * 120); // Verde -> Vermelho
    proximityIndicator.style.background = `radial-gradient(circle, hsla(${hue}, 90%, 55%, .95) 0%, hsla(${hue}, 90%, 55%, .55) 55%, hsla(${hue}, 90%, 55%, 0) 100%)`;
  }

  function createParticleEffect(tombstone){
    for (let i = 0; i < 3; i++){
      const particle = document.createElement('div');
      particle.className = 'particle';

      const tombstoneX = parseInt(tombstone.style.left,10) + tombstone.offsetWidth/2;
      const tombstoneY = parseInt(tombstone.style.top,10)  + tombstone.offsetHeight/2;

      particle.style.left = `${tombstoneX}px`;
      particle.style.top  = `${tombstoneY}px`;

      const angle = Math.random() * Math.PI * 2;
      const distance = 20 + Math.random() * 30;

      gameContainer.appendChild(particle);

      setTimeout(() => {
        particle.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`;
        particle.style.opacity = '0';
      }, 10);

      setTimeout(() => {
        particle.parentNode?.removeChild(particle);
      }, 1000);
    }
  }

  function openModal(artistId){
    const artist = artists.find(a => a.id == artistId);
    if (!artist) return;
    modalTitle.textContent = artist.name;
    modalBio.textContent = artist.bio;
    modal.classList.add('active');
  }
  function closeModal(){ modal.classList.remove('active') }

  function gameLoop(){
    updateMovement();
    updateButterflyPosition();
    checkInteraction();
    requestAnimationFrame(gameLoop);
  }

  // --- CONTROLES ---
  document.addEventListener('keydown', e => {
    if (Object.prototype.hasOwnProperty.call(keys, e.key)){
      keys[e.key] = true;
      butterfly.classList.add('moving');
    }
    if ((e.key === 'e' || e.key === 'E') && nearbyArtistId){
      openModal(nearbyArtistId);
    }
  });

  document.addEventListener('keyup', e => {
    if (Object.prototype.hasOwnProperty.call(keys, e.key)){
      keys[e.key] = false;
      if (!keys.ArrowUp && !keys.ArrowDown && !keys.ArrowLeft && !keys.ArrowRight){
        butterfly.classList.remove('moving');
      }
    }
  });

  modalCloseBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal() });

  // --- START ---
  init();
});