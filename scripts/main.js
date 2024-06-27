/* ----- CONSTANTS ----- */
const puzzles = {
  easy: [
    "530070000600195000098000060800060003400803001700020006060000280000419005000080079",
    "100920000524010000000000070050008102000000000402700090060000000000030945000071006",
  ],
  medium: [
    "030050040008010500460000012070502080000603000040109030250000098001020600080060020",
    "200080300060070084030500209000105408000000000402706000301007040720040060004010003",
  ],
  hard: [
    "000000907000420180000705026100904000050000040000507009920108000034059000507000000",
    "100007090030020008009600500005300900010080002600004000300000010040000007007000300",
  ],
};

/* ----- CACHED ELEMENT REFERENCES ----- */
const easyButton = document.getElementById("easy");
const mediumButton = document.getElementById("medium");
const hardButton = document.getElementById("hard");
const sudokuGrid = document.getElementById("sudoku-grid");
const winModal = document.getElementById("winModal");
const playAgainButton = document.getElementById("playAgain");
const quitButton = document.getElementById("quit");

/* ----- EVENT LISTENERS ----- */
document.addEventListener("DOMContentLoaded", () => {
  easyButton.addEventListener("click", () => generateGrid("easy"));
  mediumButton.addEventListener("click", () => generateGrid("medium"));
  hardButton.addEventListener("click", () => generateGrid("hard"));
  playAgainButton.addEventListener("click", playAgain);
  quitButton.addEventListener("click", quitGame);
});

/* ----- FUNCTIONS ----- */
function generateGrid(difficulty) {
  sudokuGrid.innerHTML = ""; // Clear existing grid

  // Get a random puzzle from the selected difficulty
  const puzzle =
    puzzles[difficulty][Math.floor(Math.random() * puzzles[difficulty].length)];

  // Generate a 9x9 grid
  for (let i = 0; i < 81; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    if (puzzle[i] !== "0") {
      cell.textContent = puzzle[i];
      cell.setAttribute("contenteditable", "false");
    } else {
      cell.setAttribute("contenteditable", "true");
      cell.addEventListener("input", (event) => {
        validateInput(event);
        if (checkCompletion()) {
          showWinModal();
        }
      });
    }
    cell.addEventListener("click", () => selectCell(cell));
    sudokuGrid.appendChild(cell);
  }

  // Log 'difficulty level' to the console.
  console.log(`Grid generated with difficulty: ${difficulty}`);
};

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

function playAgain() {
  winModal.style.display = "none";
  generateGrid(difficulty);
};

function quitGame() {
  winModal.style.display = "none";
  sudokuGrid.innerHTML = "";
};
