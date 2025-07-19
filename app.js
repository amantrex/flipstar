// --- Constants and State Variables ---
const boardSize = 10;
const maxFlips = 10;
const gameDuration = 30;

// Use const for elements that are not reassigned
const board = document.getElementById('game-board');
const status = document.getElementById('status');
const timer = document.getElementById('timer');
const replayButton = document.getElementById('replay');
const hint = document.getElementById('hint');
const flipSound = document.getElementById('flip-sound');
const starSound = document.getElementById('star-sound');
const failSound = document.getElementById('fail-sound');
const rulesBtn = document.getElementById('rules-btn');
const rulesModal = document.getElementById('rules-modal');
const closeRules = document.getElementById('close-rules');

const tiles = [];
const getIndex = (row, col) => row * boardSize + col;

let flipCount;
let starFound;
let timeLeft;
let timerInterval;
let gameStarted;
let starTile;


// --- Game Initialization ---
function initGame() {
  board.innerHTML = '';
  tiles.length = 0;
  flipCount = 0;
  starFound = false;
  timeLeft = gameDuration;
  gameStarted = false;

  timer.textContent = `Time left: ${gameDuration}s`;
  status.textContent = `Flips left: ${maxFlips}`;
  
  hint.style.display = 'block'; // Keep it visible for layout consistency
  hint.textContent = ''; // Clear its content
  replayButton.style.display = 'none';
  clearInterval(timerInterval);

  // --- Tile Placement ---
  const allIndices = [...Array(boardSize * boardSize).keys()];
  
  // Use the robust Fisher-Yates shuffle algorithm
  const shuffle = arr => {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };
  shuffle(allIndices);

  const greenTiles = allIndices.slice(0, 5);
  const blueTiles = allIndices.slice(5, 10);
  starTile = allIndices[10];

  for (let i = 0; i < boardSize * boardSize; i++) {
    const tile = document.createElement('div');
    tile.classList.add('tile');
    tile.dataset.index = i;
    tile.dataset.flipped = 'false';

    if (greenTiles.includes(i)) {
      tile.dataset.type = 'green';
    } else if (blueTiles.includes(i)) {
      tile.dataset.type = 'blue';
    } else {
      tile.dataset.type = 'normal';
    }

    board.appendChild(tile);
    tiles.push(tile);

    tile.addEventListener('click', () => {
      if (tile.dataset.flipped === 'true' || flipCount >= maxFlips || starFound) return;
      if (!gameStarted) {
        startTimer();
        gameStarted = true;
      }
      flipTile(i, true);
    });
  }
}

// --- Game Logic Functions ---
function startTimer() {
  timerInterval = setInterval(() => {
    timeLeft--;
    timer.textContent = `Time left: ${timeLeft}s`;
    if (timeLeft <= 0 && !starFound) {
      endGame('Time is up! You lose!', true);
    }
  }, 1000);
}

function flipTile(index, isUserClick = false) {
  // Bug Fix: Increment flip count at the start of a user-initiated flip
  if (isUserClick) {
    flipSound.play();
    flipCount++;
    status.textContent = `Flips left: ${maxFlips - flipCount}`;
  }

  const queue = [index];
  const visited = new Set();

  while (queue.length > 0) {
    const currentIndex = queue.shift();
    const tile = tiles[currentIndex];
    if (!tile || tile.dataset.flipped === 'true' || visited.has(currentIndex)) continue;

    visited.add(currentIndex);
    tile.dataset.flipped = 'true';
    tile.classList.add('flipped');
    
    // Add specific class for CSS styling on the flipped state
    if (tile.dataset.type === 'green') tile.classList.add('green-tile');
    if (tile.dataset.type === 'blue') tile.classList.add('blue-tile');

    if (+tile.dataset.index === starTile) {
      tile.classList.add('star-glow');
      starSound.play();
      starFound = true;
      clearInterval(timerInterval);
      // Use a timeout to let the flip animation mostly finish before showing the win message
      setTimeout(() => endGame('You found the star! You win!'), 500);
      return; // Exit function early on win
    }

    const row = Math.floor(currentIndex / boardSize);
    const col = currentIndex % boardSize;

    // Expand green tiles
    if (tile.dataset.type === 'green') {
      [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dr, dc]) => {
        const r = row + dr, c = col + dc;
        if (r >= 0 && r < boardSize && c >= 0 && c < boardSize)
          queue.push(getIndex(r, c));
      });
    }

    // Expand blue tiles
    if (tile.dataset.type === 'blue') {
      [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([dr, dc]) => {
        const r = row + dr, c = col + dc;
        if (r >= 0 && r < boardSize && c >= 0 && c < boardSize)
          queue.push(getIndex(r, c));
      });
    }
  }
  
  if (isUserClick && !starFound) {
    if (flipCount >= maxFlips) {
        // Delay end game message to allow flip animation to play
        setTimeout(() => endGame('Out of flips! You lose!', true), 500);
    } else {
      provideHint(index);
    }
  }
}

function revealStar() {
  const starTileEl = tiles[starTile];
  if (starTileEl.dataset.flipped === 'false') {
    starTileEl.dataset.flipped = 'true';
    starTileEl.classList.add('flipped', 'star-glow');
  }
}

function endGame(message, lost = false) {
  clearInterval(timerInterval);
  status.textContent = message;
  if (lost) failSound.play();
  revealStar();
  hint.textContent = '';
  replayButton.style.display = 'block';
}

// --- Helper Functions ---
function calculateManhattanDistance(index) {
  const starRow = Math.floor(starTile / boardSize);
  const starCol = starTile % boardSize;
  const currentRow = Math.floor(index / boardSize);
  const currentCol = index % boardSize;
  return Math.abs(starRow - currentRow) + Math.abs(starCol - currentCol);
}

function provideHint(index) {
  const distance = calculateManhattanDistance(index);
  hint.textContent = `Distance to star: ${distance}`;
}

// --- Event Listeners ---
replayButton.addEventListener('click', initGame);

rulesBtn.addEventListener('click', () => {
  rulesModal.style.display = 'flex';
});

closeRules.addEventListener('click', () => {
  rulesModal.style.display = 'none';
});

rulesModal.addEventListener('click', (e) => {
  // Close modal if user clicks on the background overlay
  if (e.target === rulesModal) {
    rulesModal.style.display = 'none';
  }
});

// --- Start the Game ---
initGame();