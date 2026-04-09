// Matrix Chain Multiplication — generator-based animation

export function* mcm(dims) {
  const n = dims.length - 1;
  const dp = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0));
  const split = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0));
  const filledCells = new Set();

  for (let len = 2; len <= n; len++) {
    for (let i = 1; i <= n - len + 1; i++) {
      const j = i + len - 1;
      dp[i][j] = Infinity;

      yield {
        dp: dp.map(r => [...r]), split: split.map(r => [...r]),
        n, i, j, k: null, phase: 'filling',
        activeCell: [i, j], filledCells: new Set(filledCells),
        optimalCost: null, parenthesisation: null, activeLine: 6,
        message: `Chain length ${len}: initialising dp[${i}][${j}] = ∞`,
      };

      for (let k = i; k < j; k++) {
        const cost = dp[i][k] + dp[k + 1][j] + dims[i - 1] * dims[k] * dims[j];

        yield {
          dp: dp.map(r => [...r]), split: split.map(r => [...r]),
          n, i, j, k, phase: 'filling',
          activeCell: [i, j], filledCells: new Set(filledCells),
          optimalCost: null, parenthesisation: null, activeLine: 9,
          message: `k=${k}: cost = ${dp[i][k]} + ${dp[k+1][j]} + ${dims[i-1]}×${dims[k]}×${dims[j]} = ${cost}`,
        };

        if (cost < dp[i][j]) {
          dp[i][j] = cost;
          split[i][j] = k;
          yield {
            dp: dp.map(r => [...r]), split: split.map(r => [...r]),
            n, i, j, k, phase: 'filling',
            activeCell: [i, j], filledCells: new Set(filledCells),
            optimalCost: null, parenthesisation: null, activeLine: 11,
            message: `New best! dp[${i}][${j}] = ${cost}, split at k=${k}`,
          };
        }
      }
      filledCells.add(`${i},${j}`);
    }
  }

  const parenthesisation = buildParens(split, 1, n);
  yield {
    dp: dp.map(r => [...r]), split: split.map(r => [...r]),
    n, i: 1, j: n, k: null, phase: 'done',
    activeCell: [1, n], filledCells: new Set(filledCells),
    optimalCost: dp[1][n], parenthesisation, activeLine: 15,
    message: `Optimal cost = ${dp[1][n]} scalar multiplications`,
  };
}

const LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function buildParens(split, i, j) {
  if (i === j) return LABELS[i - 1];
  const k = split[i][j];
  return `(${buildParens(split, i, k)} × ${buildParens(split, k + 1, j)})`;
}

export const mcmInfo = {
  name: 'Matrix Chain Multiplication',
  timeComplexity: 'O(n³)',
  spaceComplexity: 'O(n²)',
};

export const mcmCode = `function MCM(dims):
  n = len(dims) - 1
  dp[i][i] = 0  for all i

  for len = 2 to n:
    for i = 1 to n-len+1:
      j = i + len - 1
      dp[i][j] = ∞
      for k = i to j-1:
        cost = dp[i][k] + dp[k+1][j]
               + dims[i-1]*dims[k]*dims[j]
        if cost < dp[i][j]:
          dp[i][j] = cost
          split[i][j] = k

  return dp[1][n]

function buildParens(split, i, j):
  if i == j: return letter(i)  // A, B, C, ...
  k = split[i][j]
  return "(" + buildParens(i,k)
             + " × "
             + buildParens(k+1,j) + ")"`;
