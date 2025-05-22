const boardSize = 10;
const maxFlips = 10;
let flipCount = 0;
let starFound = false;
let timeLeft = 30;
let timerInterval;
let gameStarted = false;  // Flag to track if the game has started

const board = document.getElementById('game-board');
const status = document.getElementById('status');
const timer = document.getElementById('timer');
const replayButton = document.getElementById('replay');
const hint = document.getElementById('hint');  // Hint element

const flipSound = document.getElementById('flip-sound');
const starSound = document.getElementById('star-sound');
const failSound = document.getElementById('fail-sound');

const tiles = [];
const getIndex = (row, col) => row * boardSize + col;

let starTile; // Declare starTile outside initGame to persist

function initGame() {
  board.innerHTML = '';
  tiles.length = 0;
  flipCount = 0;
  starFound = false;
  timeLeft = 30;
  gameStarted = false;
  timer.textContent = `Time left: 30s`;
  status.textContent = `Flips left: ${maxFlips}`;
  hint.textContent = ''; // Clear hint
  replayButton.style.display = 'none';
  clearInterval(timerInterval); // Clear any existing timer

  // Tile Placement
  const allIndices = [...Array(boardSize * boardSize).keys()];
  const shuffle = arr => arr.sort(() => Math.random() - 0.5);
  shuffle(allIndices);

  const greenTiles = allIndices.slice(0, 5);
  const blueTiles = allIndices.slice(5, 10);
  starTile = allIndices[10]; // Assign value to starTile

  for (let i = 0; i < boardSize * boardSize; i++) {
    const tile = document.createElement('div');
    tile.classList.add('tile');
    tile.dataset.index = i;
    tile.dataset.flipped = 'false';

    if (greenTiles.includes(i)) {
      tile.dataset.type = 'green';
      tile.classList.add('green-tile');
    } else if (blueTiles.includes(i)) {
      tile.dataset.type = 'blue';
      tile.classList.add('blue-tile');
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

function revealStar() {
  const starTileEl = tiles[starTile];
  if (!starTileEl.classList.contains('flipped')) {
    starTileEl.dataset.flipped = 'true';
    starTileEl.classList.add('flipped', 'star-glow');
    starTileEl.textContent = '★';
  }
}

function endGame(message, lost = false) {
    clearInterval(timerInterval);
    status.textContent = message;
    if (lost) failSound.play();
    revealStar();
    hint.style.display = 'none';
    replayButton.style.display = 'inline-block';
  }

  function startTimer() {
    timerInterval = setInterval(() => {
      timeLeft--;
      timer.textContent = `Time left: ${timeLeft}s`;
      if (timeLeft <= 0 && !starFound) {
        endGame('Time is up! You lose!', true);
      }
    }, 1000);
  }

  function calculateManhattanDistance(index) {
      const starRow = Math.floor(starTile / boardSize);
      const starCol = starTile % boardSize;
      const currentRow = Math.floor(index / boardSize);
      const currentCol = index % boardSize;
      return Math.abs(starRow - currentRow) + Math.abs(starCol - currentCol);
  }

  function provideHint(index) {
      if (starFound) return;
      const distance = calculateManhattanDistance(index);
      hint.textContent = `Distance to the star: ${distance}`;
  }

  function flipTile(index, isUserClick = false) {
    const queue = [index];
    const visited = new Set();

    while (queue.length > 0) {
      const currentIndex = queue.shift();
      const tile = tiles[currentIndex];
      if (!tile || tile.dataset.flipped === 'true' || visited.has(currentIndex)) continue;

      visited.add(currentIndex);
      tile.dataset.flipped = 'true';
      tile.classList.add('flipped');
      tile.textContent = '';

      if (+tile.dataset.index === starTile) {
        tile.textContent = '★';
        tile.classList.add('star-glow');
        starSound.play();
        starFound = true;
        endGame('You found the star! You win!');
        return;
      }

      const row = Math.floor(currentIndex / boardSize);
      const col = currentIndex % boardSize;

      if (tile.dataset.type === 'green') {
        [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr,dc]) => {
          const r = row + dr, c = col + dc;
          if (r >= 0 && r < boardSize && c >= 0 && c < boardSize)
            queue.push(getIndex(r,c));
        });
      }

      if (tile.dataset.type === 'blue') {
        [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([dr,dc]) => {
          const r = row + dr, c = col + dc;
          if (r >= 0 && r < boardSize && c >= 0 && c < boardSize)
            queue.push(getIndex(r,c));
        });
      }
    }

    if (isUserClick) {
      flipSound.play();
      flipCount++;
      if (!starFound) {
        if (flipCount >= maxFlips) {
          endGame('Out of flips! You lose!', true);
        } else {
          status.textContent = `Flips left: ${maxFlips - flipCount}`;
          provideHint(index); // Provide the hint
        }
      }
    }
  }

  replayButton.addEventListener('click', () => {
    initGame();
  });

    const rulesBtn = document.getElementById('rules-btn');
    const rulesModal = document.getElementById('rules-modal');
    const closeRules = document.getElementById('close-rules');

    rulesBtn.addEventListener('click', () => {
      rulesModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    });

    closeRules.addEventListener('click', () => {
      rulesModal.style.display = 'none';
      document.body.style.overflow = '';
    });

    rulesModal.addEventListener('click', (e) => {
      if (e.target === rulesModal) {
      rulesModal.style.display = 'none';
      document.body.style.overflow = '';
      }
    });

  initGame();