const boardSize = 4;
let board = [];
let historyStack = [];

function saveState() {
  if (historyStack.length >= 20) {
    historyStack.shift(); // Remove the oldest state if stack is full
  }
  historyStack.push(board.map(row => [...row]));
}

function createBoard() {
  board = Array.from({ length: boardSize }, () => Array(boardSize).fill(0));
  generateTile();
  generateTile();
  initializeGrid();
  updateBoard();
}

function generateTile() {
  const emptyCells = [];
  board.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell === 0) emptyCells.push({ rowIndex, colIndex });
    });
  });

  if (emptyCells.length) {
    const { rowIndex, colIndex } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    board[rowIndex][colIndex] = Math.random() < 0.9 ? 2 : 4;
  }
}

function updateBoard() {
  const gameBoard = document.getElementById('game-board');
  gameBoard.innerHTML = ''; // Clear previous tiles

  board.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell !== 0) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.dataset.value = cell;

        // Set position dynamically
        const x = colIndex * 110; // 100px tile + 10px gap
        const y = rowIndex * 110;
        tile.style.transform = `translate(${x}px, ${y}px)`;

        gameBoard.appendChild(tile);
      }
    });
  });
}

function slide(row) {
  const nonZeroTiles = row.filter(cell => cell !== 0);
  const newRow = [];
  while (nonZeroTiles.length > 0) {
    if (nonZeroTiles.length > 1 && nonZeroTiles[0] === nonZeroTiles[1]) {
      newRow.push(nonZeroTiles[0] * 2);
      nonZeroTiles.splice(0, 2);
    } else {
      newRow.push(nonZeroTiles.shift());
    }
  }
  while (newRow.length < boardSize) {
    newRow.push(0);
  }
  return newRow;
}

// Rotate board 90 degrees clockwise
function rotateBoardClockwise() {
  const newBoard = board[0].map((_, colIndex) =>
    board.map(row => row[colIndex]).reverse()
  );
  board = newBoard;
}

// Rotate board 90 degrees counterclockwise
function rotateBoardCounterClockwise() {
  const newBoard = board[0].map((_, colIndex) =>
    board.map(row => row[board.length - colIndex - 1])
  );
  board = newBoard;
}

function moveLeft() {
  saveState();
  board = board.map(row => slide(row));
  updateBoard();
}

function moveRight() {
  saveState();
  board = board.map(row => slide(row.reverse()).reverse());
  updateBoard();
}

function moveDown() {
  saveState(); // Save current state for revert
  rotateBoardClockwise(); // Rotate clockwise to make columns rows
  board = board.map(row => slide(row)); // Slide left
  rotateBoardCounterClockwise(); // Rotate back to original orientation
  updateBoard();
}


function moveUp() {
  saveState();
  rotateBoardCounterClockwise(); // Rotate counterclockwise to make columns rows
  board = board.map(row => slide(row)); // Slide left
  rotateBoardClockwise(); // Rotate back to original orientation
  updateBoard();
}

function revertMove() {
  if (historyStack.length > 0) {
    board = historyStack.pop(); // Restore the last saved state
    updateBoard();
  } else {
    alert("No moves to revert!");
  }
}

function restartGame() {
  historyStack = []; // Clear the stack
  board = Array(boardSize).fill().map(() => Array(boardSize).fill(0));
  generateTile();
  generateTile();
  updateBoard();
}

function revertMove() {
  if (historyStack.length > 0) {
    board = historyStack.pop(); // Restore the last saved state
    updateBoard(); // Refresh the game board
  } else {
    alert("No moves to revert!");
  }
}

function initializeGrid() {
  const gameBoard = document.getElementById('game-board');
  gameBoard.innerHTML = ''; // Clear previous content

  // Add static grid cells
  for (let i = 0; i < 16; i++) {
    const gridCell = document.createElement('div');
    gridCell.className = 'grid-cell';
    gameBoard.appendChild(gridCell);
  }
}

document.addEventListener('keydown', event => {
  switch (event.key) {
    case 'ArrowLeft':
      moveLeft();
      break;
    case 'ArrowRight':
      moveRight();
      break;
    case 'ArrowUp':
      moveUp();
      break;
    case 'ArrowDown':
      moveDown();
      break;
    default:
      return;
  }

  // Add a delay before generating a new tile
  setTimeout(() => {
    generateTile();
    updateBoard();
  }, 200); // Match transition duration in CSS
});

document.getElementById('reset-button').addEventListener('click', createBoard);

createBoard();
