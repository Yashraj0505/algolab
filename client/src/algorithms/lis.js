// ─── LIS (Longest Increasing Subsequence) DP — generator-based animation ─────

/**
 * Generator that builds the LIS dp[] array element-by-element,
 * then backtracks to reconstruct the actual subsequence.
 *
 * Yields frames:
 * { arr, dp, parent, phase, activeIdx, compareIdx,
 *   filledIndices, lisIndices, lisResult, activeLine, message }
 *
 * activeLine mapping (matches C++ code below):
 *  8  → outer loop: pick arr[i]
 *  9  → inner loop: compare arr[j] < arr[i]
 *  10 → dp[i] = max(dp[i], dp[j]+1)
 *  17 → find max in dp[]
 *  20 → backtrack: find previous element
 *  25 → reverse result
 */
export function* lis(arr) {
    const n = arr.length;
    const dp = Array(n).fill(1);
    const parent = Array(n).fill(-1);
    const filledIndices = new Set();

    // ── Phase 1: Fill dp[] ────────────────────────────────────────────────────
    for (let i = 0; i < n; i++) {
        yield {
            arr: [...arr], dp: [...dp], parent: [...parent],
            phase: 'filling',
            activeIdx: i, compareIdx: null,
            filledIndices: new Set(filledIndices),
            lisIndices: new Set(),
            lisResult: null,
            activeLine: 8,
            message: `Processing arr[${i}] = ${arr[i]}`,
        };

        for (let j = 0; j < i; j++) {
            yield {
                arr: [...arr], dp: [...dp], parent: [...parent],
                phase: 'filling',
                activeIdx: i, compareIdx: j,
                filledIndices: new Set(filledIndices),
                lisIndices: new Set(),
                lisResult: null,
                activeLine: 9,
                message: `Comparing arr[${j}]=${arr[j]} < arr[${i}]=${arr[i]}?`,
            };

            if (arr[j] < arr[i] && dp[j] + 1 > dp[i]) {
                dp[i] = dp[j] + 1;
                parent[i] = j;

                yield {
                    arr: [...arr], dp: [...dp], parent: [...parent],
                    phase: 'filling',
                    activeIdx: i, compareIdx: j,
                    filledIndices: new Set(filledIndices),
                    lisIndices: new Set(),
                    lisResult: null,
                    activeLine: 10,
                    message: `dp[${i}] updated to ${dp[i]} (via dp[${j}]+1)`,
                };
            }
        }

        filledIndices.add(i);
    }

    // ── Phase 2: Find max ─────────────────────────────────────────────────────
    let maxLen = 1, maxIdx = 0;
    for (let i = 1; i < n; i++) {
        if (dp[i] > maxLen) { maxLen = dp[i]; maxIdx = i; }
    }

    yield {
        arr: [...arr], dp: [...dp], parent: [...parent],
        phase: 'backtracking',
        activeIdx: maxIdx, compareIdx: null,
        filledIndices: new Set(filledIndices),
        lisIndices: new Set(),
        lisResult: null,
        activeLine: 17,
        message: `Max LIS length = ${maxLen} ending at index ${maxIdx}`,
    };

    // ── Phase 3: Backtrack ────────────────────────────────────────────────────
    const lisIndices = new Set();
    let cur = maxIdx;
    const lisVals = [];

    while (cur !== -1) {
        lisIndices.add(cur);
        lisVals.push(arr[cur]);

        yield {
            arr: [...arr], dp: [...dp], parent: [...parent],
            phase: 'backtracking',
            activeIdx: cur, compareIdx: null,
            filledIndices: new Set(filledIndices),
            lisIndices: new Set(lisIndices),
            lisResult: null,
            activeLine: 20,
            message: `LIS includes arr[${cur}] = ${arr[cur]}, follow parent[${cur}] = ${parent[cur]}`,
        };

        cur = parent[cur];
    }

    lisVals.reverse();

    // ── Phase 4: Done ─────────────────────────────────────────────────────────
    yield {
        arr: [...arr], dp: [...dp], parent: [...parent],
        phase: 'done',
        activeIdx: null, compareIdx: null,
        filledIndices: new Set(filledIndices),
        lisIndices: new Set(lisIndices),
        lisResult: lisVals,
        activeLine: 25,
        message: `LIS = [${lisVals.join(', ')}] (length ${lisVals.length})`,
    };
}

// ─── Info ─────────────────────────────────────────────────────────────────────
export const lisInfo = {
    name: 'Longest Increasing Subsequence',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(n)',
};

// ─── Pseudocode ───────────────────────────────────────────────────────────────
// activeLine mapping:
//  8  → for i = 0 to n-1
//  9  →   if arr[j] < arr[i] and dp[j]+1 > dp[i]
//  10 →     dp[i] = dp[j] + 1
//  17 → maxIdx = index of max(dp)
//  20 → while cur != -1
//  25 → reverse(result)
export const lisCode = `function LIS(arr):
    n = length(arr)
    dp[0..n-1] = 1
    parent[0..n-1] = -1

    // Fill DP table
    for i = 0 to n-1:
        for j = 0 to i-1:
            if arr[j] < arr[i] and
               dp[j] + 1 > dp[i]:
                dp[i] = dp[j] + 1
                parent[i] = j

    // Find end of LIS
    maxIdx = index of max value in dp

    // Backtrack to build result
    result = []
    cur = maxIdx
    while cur != -1:
        result.prepend(arr[cur])
        cur = parent[cur]

    reverse(result)
    return result`;
