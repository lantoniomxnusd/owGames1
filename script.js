const levelSelect = document.getElementById('levelSelect');
let cards = [];
let tries = 0;
let flippedCards = [];
let matched = [];
let fireworks = null;

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function createCard(cardData, index) {
  const card = document.createElement('div');
  card.classList.add('card');
  card.dataset.word = cardData.word;
  card.dataset.index = index;

  const front = document.createElement('div');
  front.classList.add('front');

  if (cardData.type === 'image') {
    const img = document.createElement('img');
    img.src = cardData.content;
    img.alt = cardData.word;
    img.style.maxWidth = '90%';
    front.appendChild(img);
  } else {
    front.textContent = cardData.content;
  }

  const back = document.createElement('div');
  back.classList.add('back');
  back.textContent = '?';

  card.appendChild(front);
  card.appendChild(back);

  card.addEventListener('click', () => handleCardClick(card));

  return card;
}

function handleCardClick(card) {
  if (
    flippedCards.length === 2 ||
    card.classList.contains('flip') ||
    matched.includes(card.dataset.index)
  ) return;

  card.classList.add('flip');
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    tries++;
    document.getElementById('tries').textContent = tries;
    const [card1, card2] = flippedCards;

    if (card1.dataset.word === card2.dataset.word) {
      matched.push(card1.dataset.index, card2.dataset.index);
      document.getElementById('successSound').play();

      // Confetti for matches
      confetti({
        particleCount: 200,
        spread: 120,
        startVelocity: 45,
        origin: { x: 0, y: 0.5 }
      });
      confetti({
        particleCount: 200,
        spread: 120,
        origin: { x: 1, y: 0.5 }
      });

      flippedCards = [];

      // Fireworks for game win
    if (matched.length >= cards.length) {
      launchFireworks();
    }

    } else {
      setTimeout(() => {
        card1.classList.remove('flip');
        card2.classList.remove('flip');
        document.getElementById('failSound').play();
        flippedCards = [];
      }, 750);
    }
  }
}


function launchFireworks() {
  stopFireworks();
  const container = document.getElementById('fireworks-container');
  container.innerHTML = '';

  fireworks = new window.Fireworks.Fireworks(container, {
    rocketsPoint: { min: 0, max: 100 },
    hue: { min: 0, max: 360 },
    speed: 3,
    acceleration: 1.1,
    friction: 0.96,
    gravity: 1.5,
    particles: 80,
    trace: 4,
    explosion: 6,
    autoresize: true,
    brightness: { min: 50, max: 80 },
    decay: { min: 0.015, max: 0.03 },
    mouse: { click: false, move: false }
  });

  fireworks.start();
  console.log('Fireworks started');

  // Stop fireworks after 10 seconds
  setTimeout(() => {
    console.log('Stopping fireworks');
    stopFireworks();
    removeWinMessage();
  }, 10000);

  // Show a non-blocking win message on screen immediately
  showWinMessage(`You won in ${tries} tries! 🎉`);
}

function showWinMessage(message) {
  let msg = document.getElementById('winMessage');
  if (!msg) {
    msg = document.createElement('div');
    msg.id = 'winMessage';
    msg.style.position = 'fixed';
    msg.style.top = '20px';
    msg.style.left = '50%';
    msg.style.transform = 'translateX(-50%)';
    msg.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    msg.style.color = '#fff';
    msg.style.padding = '15px 30px';
    msg.style.borderRadius = '10px';
    msg.style.fontSize = '1.5rem';
    msg.style.zIndex = '10000';
    msg.style.pointerEvents = 'none'; // click-through
    msg.style.userSelect = 'none';
    document.body.appendChild(msg);
  }
  msg.textContent = message;
}

function removeWinMessage() {
  const msg = document.getElementById('winMessage');
  if (msg) {
    msg.remove();
  }
}


function stopFireworks() {
  if (fireworks) {
    fireworks.stop();
    fireworks = null;
  }
  document.getElementById('fireworks-container').innerHTML = '';
}

async function setupGame() {
  // Stop any running fireworks when starting new game
  stopFireworks();
  
  const level = levelSelect.value;
  const gameBoard = document.getElementById('gameBoard');
  gameBoard.innerHTML = '';
  document.getElementById('tries').textContent = '0';
  tries = 0;
  flippedCards = [];
  matched = [];

  const res = await fetch(`levels/${level}.json`);
  const words = await res.json();

  const images = words.map(word => ({
    type: 'image',
    content: `images/${word.replace(/\s/g, '_')}.webp`,
    word
  }));

  const textCards = words.map(word => ({
    type: 'text',
    content: word,
    word
  }));

  cards = shuffle([...images, ...textCards]);

  cards.forEach((card, index) => {
    gameBoard.appendChild(createCard(card, index));
  });
}


document.getElementById('resetBtn').addEventListener('click', setupGame);
levelSelect.addEventListener('change', setupGame);

// Start the game on first load
setupGame();


if (typeof Fireworks === 'undefined') {
  console.error('Fireworks library not loaded! Check script order and URL');
}

function testFireworks() {
  const container = document.getElementById('fireworks-container');
  container.innerHTML = ''; // Clear previous
  container.style.width = '100vw';
  container.style.height = '100vh';

  console.log('Trying to create fireworks:', window.Fireworks);
  if (!window.Fireworks || !window.Fireworks.Fireworks) {
    console.error('Fireworks class not found in window.Fireworks!');
    return;
  }

  const fw = new window.Fireworks.Fireworks(container, {
    autoresize: true,
    opacity: 0.8,
    acceleration: 1.05,
    friction: 0.97,
    gravity: 1.5,
    particles: 100,
    trace: 3,
    explosion: 5
  });

  fw.start();
}
