/* ----- CONSTANTS ----- */


/* ----- CACHED ELEMENT REFERENCES ----- */
const easyButton = document.getElementById("easy");
const mediumButton = document.getElementById("medium");
const hardButton = document.getElementById("hard");
const sudokuGrid = document.getElementById("sudoku-grid");
const winModal = document.getElementById("winModal");
const playAgainButton = document.getElementById("playAgain");
const quitButton = document.getElementById("quit");
const playAgainGameOverButton = document.getElementById("playAgainGameOver");
const quitGameOverButton = document.getElementById("quitGameOver");
const timerDisplay = document.getElementById("timer");

/* ----- EVENT LISTENERS ----- */
document.addEventListener("DOMContentLoaded", () => {
  easyButton.addEventListener("click", () => generateGrid("easy"));
  mediumButton.addEventListener("click", () => generateGrid("medium"));
  hardButton.addEventListener("click", () => generateGrid("hard"));
  playAgainButton.addEventListener("click", playAgain);
  quitButton.addEventListener("click", quitGame);
  playAgainGameOverButton.addEventListener("click", playAgain);
  quitGameOverButton.addEventListener("click", quitGame);
});

/* ----- VARIABLES ----- */
let currentDifficulty = "";
let timerInterval;

/* ----- FUNCTIONS ----- */
// Generate a completed Sudoku board
function generateCompleteBoard() {
  const board = Array.from({ length: 9 }, () => Array(9).fill(0));
  fillBoard(board);
  return board;
};

// Fill the grid with valid, random inputs
function fillBoard(board) {
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        nums.sort(() => Math.random() - 0.5); // Shuffle numbers
        for (let num of nums) {
          if (isValidInBoard(board, row, col, num)) {
            board[row][col] = num;
            if (fillBoard(board)) {
              return true;
            }
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
};

// Ensure board inputs are valid
function isValidInBoard(board, row, col, num) {
  for (let i = 0; i < 9; i++) {
    if (
      board[row][i] === num ||
      board[i][col] === num ||
      board[Math.floor(row / 3) * 3 + Math.floor(i / 3)][
        Math.floor(col / 3) * 3 + (i % 3)
      ] === num
    ) {
      return false;
    }
  }
  return true;
};

// Generate a puzzle by removing inputs from a valid, completed board
function createPuzzle(board, difficulty) {
  const levels = {
    easy: 35, // Number of cells to remove for easy puzzles
    medium: 45, // Number of cells to remove for medium puzzles
    hard: 54, // Number of cells to remove for hard puzzles
  };

  const puzzle = board.map((row) => [...row]);
  let cellsToRemove = levels[difficulty];

  while (cellsToRemove > 0) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (puzzle[row][col] !== 0) {
      const backup = puzzle[row][col];
      puzzle[row][col] = 0;

      if (!hasUniqueSolution(puzzle)) {
        puzzle[row][col] = backup;
      } else {
        cellsToRemove--;
      }
    }
  }
  return puzzle;
};

// Ensure that the puzzle has 1 possible solution only
function hasUniqueSolution(board) {
  let solutions = 0;

  function solve(board) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isValidInBoard(board, row, col, num)) {
              board[row][col] = num;
              solve(board);
              board[row][col] = 0;
            }
          }
          return;
        }
      }
    }
    solutions++;
  }

  solve(board);
  return solutions === 1;
};

// Generate grid elements
function generateGrid(difficulty) {
  currentDifficulty = difficulty;
  sudokuGrid.innerHTML = ""; // Clear existing grid
  const completeBoard = generateCompleteBoard();
  const puzzle = createPuzzle(completeBoard, difficulty);

  for (let i = 0; i < 81; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    const value = puzzle[Math.floor(i / 9)][i % 9];
    if (value !== 0) {
      cell.textContent = value;
      cell.setAttribute("contenteditable", "false");
    } else {
      cell.setAttribute("contenteditable", "true");
      cell.addEventListener("input", (event) => {
        validateInput(event);
        if (checkCompletion()) {
          showWinModal();
          clearInterval(timerInterval);
        }
      });
    }
    cell.addEventListener("click", () => selectCell(cell));
    sudokuGrid.appendChild(cell);
  }
  clearInterval(timerInterval);
  startTimer(300, timerDisplay);
};

// Start the timer for a new game
function startTimer(duration, display) {
  let timer = duration, minutes, seconds;
  timerInterval = setInterval(() => {
    minutes = parseInt(timer / 60, 10);
    seconds = parseInt(timer % 60, 10);

    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    display.textContent = "Time left: " + minutes + ":" + seconds;

    if (--timer < 0) {
      clearInterval(timerInterval);
      showGameOverModal();
    }
  }, 1000);
};

// Ensure inputs by the user are valid
function validateInput(event) {
  const cell = event.target;
  const value = cell.textContent;
  if (value < "1" || value > "9" || !isValid(cell, value)) {
    cell.textContent = "";
    event.preventDefault();
  }
};

// Winning Game Logic
function isValid(cell, value) {
  const cells = Array.from(sudokuGrid.children);
  const index = cells.indexOf(cell);
  const row = Math.floor(index / 9);
  const col = index % 9;

  // Check row
  for (let i = 0; i < 9; i++) {
    if (
      cells[row * 9 + i].textContent === value &&
      cells[row * 9 + i] !== cell
    ) {
      return false;
    }
  }

  // Check column
  for (let i = 0; i < 9; i++) {
    if (
      cells[i * 9 + col].textContent === value &&
      cells[i * 9 + col] !== cell
    ) {
      return false;
    }
  }

  // Check 3x3 subgrid
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (
        cells[(startRow + i) * 9 + (startCol + j)].textContent === value &&
        cells[(startRow + i) * 9 + (startCol + j)] !== cell
      ) {
        return false;
      }
    }
  }

  return true;
};

// Ensure grid has been filled with valid inputs
function checkCompletion() {
  const cells = Array.from(sudokuGrid.children);

  for (let i = 0; i < 81; i++) {
    const cell = cells[i];
    const value = cell.textContent;
    if (value === "" || !isValid(cell, value)) {
      return false;
    }
  }

  return true;
};

function selectCell(cell) {
  clearHighlights();
  cell.classList.add("selected");

  const cells = Array.from(sudokuGrid.children);
  const index = cells.indexOf(cell);
  const row = Math.floor(index / 9);
  const col = index % 9;

  // Highlight row
  for (let i = 0; i < 9; i++) {
    cells[row * 9 + i].classList.add("related");
  }

  // Highlight column
  for (let i = 0; i < 9; i++) {
    cells[i * 9 + col].classList.add("related");
  }

  // Highlight 3x3 subgrid
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      cells[(startRow + i) * 9 + (startCol + j)].classList.add("related");
    }
  }
};

function clearHighlights() {
  const cells = Array.from(sudokuGrid.children);
  cells.forEach((cell) => {
    cell.classList.remove("selected", "related");
  });
};

function showWinModal() {
  winModal.style.display = "block";
};

function showGameOverModal() {
  gameOverModal.style.display = "block";
}

function playAgain() {
  winModal.style.display = "none";
  generateGrid(currentDifficulty);
};

function quitGame() {
  winModal.style.display = "none";
  sudokuGrid.innerHTML = "";
};
