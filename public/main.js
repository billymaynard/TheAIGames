const views = document.querySelectorAll('.view');
const cards = document.querySelectorAll('.card');
const backButtons = document.querySelectorAll('.back-home');

const tttDifficultySection = document.querySelector('[data-section="difficulty"]');
const tttBoardSection = document.querySelector('[data-section="board"]');
const tttGrid = document.getElementById('ttt-grid');
const tttStatus = document.querySelector('[data-game="ttt-status"]');
const tttReset = document.querySelector('[data-game="ttt-reset"]');
let tttLevel = 'easy';

const c4BoardSection = document.querySelector('[data-section="c4-board"]');
const c4Grid = document.getElementById('c4-grid');
const c4Status = document.querySelector('[data-game="c4-status"]');
const c4Reset = document.querySelector('[data-game="c4-reset"]');
let c4Level = 'easy';

function showView(target) {
  views.forEach((v) => {
    v.classList.toggle('hidden', v.dataset.view !== target && v.dataset.view !== 'home');
    if (target === 'home' && v.dataset.view === 'home') {
      v.classList.remove('hidden');
    }
  });
}

cards.forEach((card) => {
  const target = card.dataset.target;
  if (!target) return;
  card.addEventListener('click', () => {
    showView(target);
  });
});

backButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    showView('home');
  });
});

// Tic Tac Toe logic
const tttState = {
  board: Array(9).fill(null),
  current: 'X',
  locked: false,
};

function renderTttBoard() {
  tttGrid.innerHTML = '';
  tttState.board.forEach((cell, idx) => {
    const div = document.createElement('div');
    div.className = 'cell';
    div.textContent = cell ?? '';
    div.addEventListener('click', () => handleTttMove(idx));
    tttGrid.appendChild(div);
  });
  updateTttStatus();
}

function handleTttMove(index) {
  if (tttState.locked || tttState.board[index]) return;
  tttState.board[index] = 'X';
  tttState.current = 'O';
  renderTttBoard();
  if (checkTttEnd()) return;
  tttState.locked = true;
  setTimeout(() => {
    const aiMove = minimaxTtt(tttState.board, 'O', tttLevelDepth(tttLevel)).index;
    if (aiMove !== undefined) {
      tttState.board[aiMove] = 'O';
    }
    tttState.current = 'X';
    tttState.locked = false;
    renderTttBoard();
    checkTttEnd();
  }, 200);
}

function tttLevelDepth(level) {
  switch (level) {
    case 'easy':
      return 2;
    case 'medium':
      return 6;
    case 'hard':
      return 9;
    default:
      return 4;
  }
}

function minimaxTtt(board, player, depth) {
  const winner = tttWinner(board);
  if (winner === 'X') return { score: -10 };
  if (winner === 'O') return { score: 10 };
  if (board.every(Boolean) || depth === 0) return { score: 0 };

  const moves = [];
  board.forEach((cell, idx) => {
    if (cell) return;
    const newBoard = board.slice();
    newBoard[idx] = player;
    const result = minimaxTtt(newBoard, player === 'O' ? 'X' : 'O', depth - 1);
    moves.push({ index: idx, score: result.score });
  });

  if (player === 'O') {
    return moves.reduce((best, move) => (move.score > best.score ? move : best), {
      score: -Infinity,
    });
  } else {
    return moves.reduce((best, move) => (move.score < best.score ? move : best), {
      score: Infinity,
    });
  }
}

function tttWinner(board) {
  const wins = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const [a, b, c] of wins) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return board.every(Boolean) ? 'draw' : null;
}

function checkTttEnd() {
  const winner = tttWinner(tttState.board);
  if (!winner) return false;
  tttState.locked = true;
  if (winner === 'draw') {
    tttStatus.textContent = 'Draw! Restart to try again.';
  } else {
    tttStatus.textContent = `${winner} wins!`;
  }
  return true;
}

function updateTttStatus() {
  if (!tttWinner(tttState.board)) {
    tttStatus.textContent = `Your turn (${tttState.current})`;
  }
}

document.querySelector('[data-action="solo"]').addEventListener('click', () => {
  tttDifficultySection.classList.remove('hidden');
});

document.querySelectorAll('[data-level]').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-level]').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    tttLevel = btn.dataset.level;
    tttBoardSection.classList.remove('hidden');
    resetTtt();
  });
});

tttReset.addEventListener('click', resetTtt);

function resetTtt() {
  tttState.board = Array(9).fill(null);
  tttState.current = 'X';
  tttState.locked = false;
  renderTttBoard();
}

// Connect 4 logic
const C4_ROWS = 6;
const C4_COLS = 7;
let c4Board = Array.from({ length: C4_ROWS }, () => Array(C4_COLS).fill(0));
let c4Current = 1;
let c4Locked = false;

function renderC4() {
  c4Grid.innerHTML = '';
  for (let r = 0; r < C4_ROWS; r++) {
    for (let c = 0; c < C4_COLS; c++) {
      const cell = document.createElement('div');
      cell.className = 'c4-cell';
      const value = c4Board[r][c];
      if (value === 1) cell.classList.add('player');
      if (value === 2) cell.classList.add('cpu');
      cell.addEventListener('click', () => handleC4Move(c));
      c4Grid.appendChild(cell);
    }
  }
  updateC4Status();
}

function handleC4Move(col) {
  if (c4Locked) return;
  if (!dropPiece(col, 1)) return;
  renderC4();
  if (checkC4End()) return;
  c4Locked = true;
  setTimeout(() => {
    const aiMove = bestC4Move(c4Board, depthForLevel(c4Level));
    dropPiece(aiMove, 2);
    renderC4();
    c4Locked = false;
    checkC4End();
  }, 250);
}

function dropPiece(col, player) {
  for (let r = C4_ROWS - 1; r >= 0; r--) {
    if (c4Board[r][col] === 0) {
      c4Board[r][col] = player;
      return true;
    }
  }
  return false;
}

function depthForLevel(level) {
  switch (level) {
    case 'easy':
      return 2;
    case 'medium':
      return 4;
    case 'hard':
      return 5;
    default:
      return 3;
  }
}

function bestC4Move(board, depth) {
  let bestScore = -Infinity;
  let bestCol = 0;
  for (let col = 0; col < C4_COLS; col++) {
    const row = getOpenRow(board, col);
    if (row === -1) continue;
    const temp = board.map((r) => r.slice());
    temp[row][col] = 2;
    const score = minimaxC4(temp, depth - 1, false, -Infinity, Infinity);
    if (score > bestScore) {
      bestScore = score;
      bestCol = col;
    }
  }
  return bestCol;
}

function minimaxC4(board, depth, maximizing, alpha, beta) {
  const result = evaluateC4(board);
  if (result !== null || depth === 0) return scoreResult(result);

  if (maximizing) {
    let maxEval = -Infinity;
    for (let col = 0; col < C4_COLS; col++) {
      const row = getOpenRow(board, col);
      if (row === -1) continue;
      const temp = board.map((r) => r.slice());
      temp[row][col] = 2;
      const evalScore = minimaxC4(temp, depth - 1, false, alpha, beta);
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let col = 0; col < C4_COLS; col++) {
      const row = getOpenRow(board, col);
      if (row === -1) continue;
      const temp = board.map((r) => r.slice());
      temp[row][col] = 1;
      const evalScore = minimaxC4(temp, depth - 1, true, alpha, beta);
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

function scoreResult(result) {
  if (result === 2) return 1000;
  if (result === 1) return -1000;
  if (result === 'draw') return 0;
  return 0;
}

function getOpenRow(board, col) {
  for (let r = C4_ROWS - 1; r >= 0; r--) {
    if (board[r][col] === 0) return r;
  }
  return -1;
}

function evaluateC4(board) {
  const lines = [];

  // horizontal
  for (let r = 0; r < C4_ROWS; r++) {
    for (let c = 0; c < C4_COLS - 3; c++) {
      lines.push([board[r][c], board[r][c + 1], board[r][c + 2], board[r][c + 3]]);
    }
  }

  // vertical
  for (let c = 0; c < C4_COLS; c++) {
    for (let r = 0; r < C4_ROWS - 3; r++) {
      lines.push([board[r][c], board[r + 1][c], board[r + 2][c], board[r + 3][c]]);
    }
  }

  // diagonals
  for (let r = 0; r < C4_ROWS - 3; r++) {
    for (let c = 0; c < C4_COLS - 3; c++) {
      lines.push([board[r][c], board[r + 1][c + 1], board[r + 2][c + 2], board[r + 3][c + 3]]);
    }
  }
  for (let r = 3; r < C4_ROWS; r++) {
    for (let c = 0; c < C4_COLS - 3; c++) {
      lines.push([board[r][c], board[r - 1][c + 1], board[r - 2][c + 2], board[r - 3][c + 3]]);
    }
  }

  for (const line of lines) {
    if (line.every((v) => v === 1)) return 1;
    if (line.every((v) => v === 2)) return 2;
  }

  if (board.every((row) => row.every((cell) => cell !== 0))) return 'draw';
  return null;
}

function checkC4End() {
  const result = evaluateC4(c4Board);
  if (!result) return false;
  c4Locked = true;
  if (result === 1) c4Status.textContent = 'You win! Great job.';
  else if (result === 2) c4Status.textContent = 'CPU wins. Try again!';
  else c4Status.textContent = 'Draw. Restart to continue.';
  return true;
}

function updateC4Status() {
  c4Status.textContent = 'Drop a piece to begin.';
}

document.querySelectorAll('[data-c4-level]').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-c4-level]').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    c4Level = btn.dataset.c4Level;
    c4BoardSection.classList.remove('hidden');
    resetC4();
  });
});

c4Reset.addEventListener('click', resetC4);

function resetC4() {
  c4Board = Array.from({ length: C4_ROWS }, () => Array(C4_COLS).fill(0));
  c4Current = 1;
  c4Locked = false;
  renderC4();
}

// init
renderTttBoard();
renderC4();
