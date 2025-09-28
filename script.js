const aRowsInput = document.getElementById('a-rows');
const aColsInput = document.getElementById('a-cols');
const bColsInput = document.getElementById('b-cols');

const aRowsLabel = document.getElementById('a-rows-label');
const aColsLabel = document.getElementById('a-cols-label');
const bRowsLabel = document.getElementById('b-rows-label');
const bColsLabel = document.getElementById('b-cols-label');

const matrixAContainer = document.getElementById('matrix-a');
const matrixBContainer = document.getElementById('matrix-b');
const resultContainer = document.getElementById('matrix-result');
const controlGroups = Array.from(
  document.querySelectorAll('.matrix-section:first-of-type .matrix-panel .controls')
);

const state = {
  aRows: parseInt(aRowsInput.value, 10),
  aCols: parseInt(aColsInput.value, 10),
  bCols: parseInt(bColsInput.value, 10),
  matrixA: [],
  matrixB: []
};

function init() {
  updateLabels();
  buildMatrices();
  equalizeControlsHeight();
  bindEvents();
  updateResult();
}

function bindEvents() {
  aRowsInput.addEventListener('input', () => {
    state.aRows = parseInt(aRowsInput.value, 10);
    updateLabels();
    buildMatrix(state.matrixA, matrixAContainer, state.aRows, state.aCols);
    updateResult();
  });

  aColsInput.addEventListener('input', () => {
    state.aCols = parseInt(aColsInput.value, 10);
    state.matrixB = reshapeMatrix(state.matrixB, state.aCols, state.bCols);
    updateLabels();
    buildMatrix(state.matrixA, matrixAContainer, state.aRows, state.aCols);
    buildMatrix(state.matrixB, matrixBContainer, state.aCols, state.bCols);
    updateResult();
  });

  bColsInput.addEventListener('input', () => {
    state.bCols = parseInt(bColsInput.value, 10);
    updateLabels();
    buildMatrix(state.matrixB, matrixBContainer, state.aCols, state.bCols);
    updateResult();
  });
}

function updateLabels() {
  aRowsLabel.textContent = state.aRows;
  aColsLabel.textContent = state.aCols;
  bRowsLabel.textContent = state.aCols;
  bColsLabel.textContent = state.bCols;
}

function buildMatrices() {
  state.matrixA = reshapeMatrix(state.matrixA, state.aRows, state.aCols);
  state.matrixB = reshapeMatrix(state.matrixB, state.aCols, state.bCols);
  buildMatrix(state.matrixA, matrixAContainer, state.aRows, state.aCols);
  buildMatrix(state.matrixB, matrixBContainer, state.aCols, state.bCols);
}

function equalizeControlsHeight() {
  if (controlGroups.length === 0) return;

  let maxHeight = 0;
  controlGroups.forEach((group) => {
    group.style.minHeight = '';
  });

  controlGroups.forEach((group) => {
    maxHeight = Math.max(maxHeight, group.offsetHeight);
  });

  controlGroups.forEach((group) => {
    group.style.minHeight = `${maxHeight}px`;
  });
}

function reshapeMatrix(matrix, rows, cols) {
  const flat = matrix.flat();
  const resized = new Array(rows * cols).fill(0).map((_, index) => flat[index] ?? 0);
  const result = [];
  for (let r = 0; r < rows; r += 1) {
    result.push(resized.slice(r * cols, (r + 1) * cols));
  }
  return result;
}

function buildMatrix(matrix, container, rows, cols) {
  container.innerHTML = '';
  container.style.gridTemplateRows = `repeat(${rows}, auto)`;
  for (let r = 0; r < rows; r += 1) {
    const rowElement = document.createElement('div');
    rowElement.className = 'matrix-row';
    configureRowLayout(rowElement, cols);

    for (let c = 0; c < cols; c += 1) {
      const input = document.createElement('input');
      input.type = 'number';
      input.step = 'any';
      input.value = Number.isFinite(matrix[r]?.[c]) ? matrix[r][c] : 0;
      input.dataset.row = r;
      input.dataset.col = c;
      input.addEventListener('input', () => {
        const value = parseFloat(input.value);
        matrix[r][c] = Number.isFinite(value) ? value : 0;
        updateResult();
      });
      rowElement.appendChild(input);
    }

    container.appendChild(rowElement);
  }
}

function updateResult() {
  const product = multiplyMatrices(state.matrixA, state.matrixB);
  renderResult(product);
}

function multiplyMatrices(a, b) {
  const aRows = a.length;
  const aCols = a[0]?.length ?? 0;
  const bCols = b[0]?.length ?? 0;
  const result = Array.from({ length: aRows }, () => Array(bCols).fill(0));

  for (let i = 0; i < aRows; i += 1) {
    for (let k = 0; k < aCols; k += 1) {
      const aVal = a[i]?.[k] ?? 0;
      for (let j = 0; j < bCols; j += 1) {
        const bVal = b[k]?.[j] ?? 0;
        result[i][j] += aVal * bVal;
      }
    }
  }

  return result;
}

function renderResult(matrix) {
  resultContainer.innerHTML = '';
  const rows = matrix.length;
  const cols = matrix[0]?.length ?? 0;
  resultContainer.style.gridTemplateRows = `repeat(${rows}, auto)`;

  for (let r = 0; r < rows; r += 1) {
    const rowElement = document.createElement('div');
    rowElement.className = 'matrix-row';
    configureRowLayout(rowElement, cols);

    for (let c = 0; c < cols; c += 1) {
      const cell = document.createElement('div');
      cell.className = 'matrix-cell';
      cell.textContent = formatNumber(matrix[r][c]);
      rowElement.appendChild(cell);
    }

    resultContainer.appendChild(rowElement);
  }
}

function configureRowLayout(rowElement, cols) {
  const compact = cols <= 3;
  const trackSize = compact ? 'minmax(80px, 130px)' : 'minmax(80px, 1fr)';
  rowElement.style.gridTemplateColumns = `repeat(${cols}, ${trackSize})`;
  rowElement.style.justifyContent = compact ? 'center' : 'stretch';
}

function formatNumber(value) {
  if (!Number.isFinite(value)) return '0';
  const asString = value.toString();
  if (asString.includes('e')) {
    return Number(value.toFixed(6)).toString();
  }
  const [integerPart, fractionPart] = asString.split('.');
  if (!fractionPart) return integerPart;
  const trimmedFraction = fractionPart.replace(/0+$/, '');
  return trimmedFraction.length > 0 ? `${integerPart}.${trimmedFraction}` : integerPart;
}

init();
window.addEventListener('resize', equalizeControlsHeight);
