const cells = document.querySelectorAll(".cell");
const status = document.getElementById("status");
const resetBtn = document.getElementById("reset");

// ======================
// SCORE UI (PRECISA EXISTIR NO HTML)
// ======================
const scoreXEl = document.getElementById("score-x");
const scoreOEl = document.getElementById("score-o");

const STORAGE_KEY = "tic_tac_score";

const DEFAULT_SCORE = {
  X: 0,
  O: 0
};

let score = loadScore();

// ======================
// GAME STATE
// ======================
let board = Array(9).fill("");
let gameActive = true;

const human = "X";
const ai = "O";

const winConditions = [
  [0,1,2],
  [3,4,5],
  [6,7,8],
  [0,3,6],
  [1,4,7],
  [2,5,8],
  [0,4,8],
  [2,4,6]
];

// ======================
// STORAGE
// ======================
function loadScore() {
  const data = localStorage.getItem(STORAGE_KEY);

  if (!data) return { ...DEFAULT_SCORE };

  try {
    const parsed = JSON.parse(data);

    if (typeof parsed.X !== "number" || typeof parsed.O !== "number") {
      return { ...DEFAULT_SCORE };
    }

    return parsed;

  } catch {
    return { ...DEFAULT_SCORE };
  }
}

function saveScore() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(score));
}

// ======================
// UI SCORE UPDATE
// ======================
function updateScoreUI() {
  scoreXEl.textContent = score.X;
  scoreOEl.textContent = score.O;
}

// ======================
// JOGADA BASE
// ======================
function playMove(index, player) {
  board[index] = player;
  cells[index].textContent = player;
}

// ======================
// CLICK PLAYER
// ======================
cells.forEach((cell, index) => {
  cell.addEventListener("click", () => {
    if (!gameActive || board[index] !== "") return;

    playMove(index, human);

    if (checkEnd(human)) return;

    status.textContent = "Vez da IA...";
    setTimeout(aiMove, 200);
  });
});

// ======================
// IA
// ======================
function aiMove() {
  if (!gameActive) return;

  let bestScore = -Infinity;
  let move;

  for (let i = 0; i < board.length; i++) {
    if (board[i] === "") {
      board[i] = ai;
      let score = minimax(board, 0, false);
      board[i] = "";

      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }

  if (move === undefined) return;

  playMove(move, ai);
  checkEnd(ai);
}

// ======================
// MINIMAX
// ======================
function minimax(newBoard, depth, isMaximizing) {
  if (checkWinnerSimple(newBoard, ai)) return 10 - depth;
  if (checkWinnerSimple(newBoard, human)) return depth - 10;
  if (!newBoard.includes("")) return 0;

  if (isMaximizing) {
    let best = -Infinity;

    for (let i = 0; i < newBoard.length; i++) {
      if (newBoard[i] === "") {
        newBoard[i] = ai;
        best = Math.max(best, minimax(newBoard, depth + 1, false));
        newBoard[i] = "";
      }
    }

    return best;
  } else {
    let best = Infinity;

    for (let i = 0; i < newBoard.length; i++) {
      if (newBoard[i] === "") {
        newBoard[i] = human;
        best = Math.min(best, minimax(newBoard, depth + 1, true));
        newBoard[i] = "";
      }
    }

    return best;
  }
}

// ======================
// WIN CHECK
// ======================
function checkWinnerSimple(b, player) {
  return winConditions.some(c =>
    b[c[0]] === player &&
    b[c[1]] === player &&
    b[c[2]] === player
  );
}

// ======================
// FIM DE JOGO + SCORE
// ======================
function checkEnd(player) {
  if (checkWinnerSimple(board, player)) {
    gameActive = false;

    if (player === human) {
      score.X++;
      status.textContent = "Você venceu!";
    } else {
      score.O++;
      status.textContent = "IA venceu!";
    }

    saveScore();
    updateScoreUI();
    return true;
  }

  if (!board.includes("")) {
    gameActive = false;
    status.textContent = "Empate!";
    return true;
  }

  status.textContent = "Sua vez";
  return false;
}

// ======================
// RESET JOGO
// ======================
resetBtn.addEventListener("click", () => {
  board = Array(9).fill("");
  gameActive = true;

  status.textContent = "Sua vez";

  cells.forEach(c => {
    c.textContent = "";
    c.style.background = "";
    c.style.color = "";
  });
});

// ======================
// RESET PLACAR (SEGREDO PRO)
// ======================
document.addEventListener("keydown", (e) => {
  if (e.key === "r") {
    score = { X: 0, O: 0 };
    saveScore();
    updateScoreUI();
  }
});

// ======================
// INIT
// ======================
updateScoreUI();

score = { X: 0, O: 0 };
localStorage.removeItem(STORAGE_KEY);
updateScoreUI();