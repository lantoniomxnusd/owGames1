const levelSelect = document.getElementById('levelSelect');
let cards = [];
let tries = 0;
let flippedCards = [];
let matched = [];

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

      confetti({
        particleCount:100,
        spread: 70, 
        origin: {y:0.6}
      });

      flippedCards = [];

      if (matched.length === cards.length) {
        setTimeout(() => alert(`You won in ${tries} tries! 🎉`), 300);
      }
    } else {
      setTimeout(() => {
        card1.classList.remove('flip');
        card2.classList.remove('flip');
        document.getElementById('failSound').play();
        flippedCards = [];
      }, 500);
    }
  }
}

async function setupGame() {
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
