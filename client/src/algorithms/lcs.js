// ─── LCS (Longest Common Subsequence) DP — generator-based animation ────────

/**
 * Generator that builds the LCS DP table cell-by-cell,
 * then backtracks through it to find the actual subsequence.
 *
 * Yields frames of the shape:
 * {
 *   dp, i, j, phase, activeCell, filledCells, matchCells,
 *   str1, str2, lcsResult, backtrackPath, activeLine, message
 * }
 */
export function* lcs(s1, s2) {
    const m = s1.length;
    const n = s2.length;

    // Initialise (m+1) × (n+1) table with zeros
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    const filledCells = new Set();   // "r,c" strings already computed
    const matchCells = new Set();   // cells where characters matched

    // ── Phase 1: Filling ──────────────────────────────────────────────────────
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            // Show we're about to compute this cell
            yield {
                dp: dp.map(r => [...r]),
                i, j,
                phase: 'filling',
                activeCell: [i, j],
                filledCells: new Set(filledCells),
                matchCells: new Set(matchCells),
                str1: s1, str2: s2,
                lcsResult: null,
                backtrackPath: [],
                activeLine: 4,
                message: `Comparing "${s1[i - 1]}" (i=${i}) with "${s2[j - 1]}" (j=${j})`,
            };

            if (s1[i - 1] === s2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
                matchCells.add(`${i},${j}`);

                yield {
                    dp: dp.map(r => [...r]),
                    i, j,
                    phase: 'filling',
                    activeCell: [i, j],
                    filledCells: new Set(filledCells),
                    matchCells: new Set(matchCells),
                    str1: s1, str2: s2,
                    lcsResult: null,
                    backtrackPath: [],
                    activeLine: 5,
                    message: `Match! dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + 1 = ${dp[i][j]}`,
                };
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);

                yield {
                    dp: dp.map(r => [...r]),
                    i, j,
                    phase: 'filling',
                    activeCell: [i, j],
                    filledCells: new Set(filledCells),
                    matchCells: new Set(matchCells),
                    str1: s1, str2: s2,
                    lcsResult: null,
                    backtrackPath: [],
                    activeLine: 8,
                    message: `No match → dp[${i}][${j}] = max(dp[${i - 1}][${j}], dp[${i}][${j - 1}]) = ${dp[i][j]}`,
                };
            }

            filledCells.add(`${i},${j}`);
        }
    }

    // ── Phase 2: Backtracking ─────────────────────────────────────────────────
    const backtrackPath = [];
    let bi = m, bj = n;
    const lcsChars = [];

    while (bi > 0 && bj > 0) {
        backtrackPath.push([bi, bj]);

        if (s1[bi - 1] === s2[bj - 1]) {
            lcsChars.push(s1[bi - 1]);

            yield {
                dp: dp.map(r => [...r]),
                i: bi, j: bj,
                phase: 'backtracking',
                activeCell: [bi, bj],
                filledCells: new Set(filledCells),
                matchCells: new Set(matchCells),
                str1: s1, str2: s2,
                lcsResult: null,
                backtrackPath: [...backtrackPath],
                activeLine: 12,
                message: `Match "${s1[bi - 1]}" → add to LCS, move diagonally ↖`,
            };

            bi--;
            bj--;
        } else if (dp[bi - 1][bj] > dp[bi][bj - 1]) {
            yield {
                dp: dp.map(r => [...r]),
                i: bi, j: bj,
                phase: 'backtracking',
                activeCell: [bi, bj],
                filledCells: new Set(filledCells),
                matchCells: new Set(matchCells),
                str1: s1, str2: s2,
                lcsResult: null,
                backtrackPath: [...backtrackPath],
                activeLine: 14,
                message: `dp[${bi - 1}][${bj}] > dp[${bi}][${bj - 1}] → move up ↑`,
            };

            bi--;
        } else {
            yield {
                dp: dp.map(r => [...r]),
                i: bi, j: bj,
                phase: 'backtracking',
                activeCell: [bi, bj],
                filledCells: new Set(filledCells),
                matchCells: new Set(matchCells),
                str1: s1, str2: s2,
                lcsResult: null,
                backtrackPath: [...backtrackPath],
                activeLine: 16,
                message: `dp[${bi}][${bj - 1}] ≥ dp[${bi - 1}][${bj}] → move left ←`,
            };

            bj--;
        }
    }

    const lcsResult = lcsChars.reverse().join('');

    // ── Phase 3: Done ─────────────────────────────────────────────────────────
    yield {
        dp: dp.map(r => [...r]),
        i: 0, j: 0,
        phase: 'done',
        activeCell: null,
        filledCells: new Set(filledCells),
        matchCells: new Set(matchCells),
        str1: s1, str2: s2,
        lcsResult,
        backtrackPath: [...backtrackPath],
        activeLine: 18,
        message: `LCS = "${lcsResult}" (length ${lcsResult.length})`,
    };
}

// ─── Info ────────────────────────────────────────────────────────────────────
export const lcsInfo = {
    name: 'Longest Common Subsequence',
    timeComplexity: 'O(m·n)',
    spaceComplexity: 'O(m·n)',
};

// ─── Pseudocode (used in CodePanel) ─────────────────────────────────────────
export const lcsCode = `function LCS(X, Y):
    m = length(X)
    n = length(Y)

    // Build DP table
    for i = 1 to m:
        for j = 1 to n:
            if X[i-1] == Y[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j],
                               dp[i][j-1])

    // Backtrack to find LCS
    i = m, j = n
    while i > 0 and j > 0:
        if X[i-1] == Y[j-1]:
            add X[i-1] to result
            i--, j--
        else if dp[i-1][j] > dp[i][j-1]:
            i--
        else:
            j--

    return reverse(result)`;
