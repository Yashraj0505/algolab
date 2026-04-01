/**
 * Merge Sort (Classic Recursive / Top-Down) — generator that yields visualization frames.
 *
 * This implements the textbook divide-and-conquer merge sort:
 *   1. DIVIDE — Split the array into two halves (shown with blue highlight on active region)
 *   2. RECURSE — Recursively sort each half
 *   3. MERGE — Merge the two sorted halves (comparing + placing elements)
 *
 * Each frame includes:
 *   - array: current state of the full array
 *   - comparing: indices being compared
 *   - swapped: indices where elements were just placed
 *   - sorted: indices fully sorted
 *   - activeRange: [start, end] of the sub-array currently being processed
 *   - phase: 'dividing' | 'merging' | 'done' — current step label
 *   - phaseDetail: human-readable description of what's happening
 */
export function* mergeSort(inputArray) {
  const array = [...inputArray];
  const n = array.length;

  // Collect all visualization frames via recursive helper
  const frames = [];
  mergeSortRecursive(array, 0, n - 1, frames);

  // Final frame — everything sorted
  const allSorted = Array.from({ length: n }, (_, i) => i);
  frames.push({
    array: [...array],
    comparing: [],
    swapped: [],
    sorted: allSorted,
    activeRange: [0, n - 1],
    phase: 'done',
    phaseDetail: 'Array is fully sorted!',
  });

  for (const frame of frames) {
    yield frame;
  }
}

/**
 * Recursive merge sort — the classic top-down approach.
 */
function mergeSortRecursive(array, left, right, frames) {
  if (left >= right) return;

  const mid = Math.floor((left + right) / 2);

  // ── DIVIDE: show which range we're splitting ──
  frames.push({
    array: [...array],
    comparing: [],
    swapped: [],
    sorted: [],
    activeRange: [left, right],
    dividePoint: mid,
    phase: 'dividing',
    phaseDetail: `Splitting [${left}..${right}] into [${left}..${mid}] and [${mid + 1}..${right}]`,
  });

  // Recurse left half
  mergeSortRecursive(array, left, mid, frames);

  // Recurse right half
  mergeSortRecursive(array, mid + 1, right, frames);

  // ── MERGE: merge the two sorted halves ──
  merge(array, left, mid, right, frames);
}

/**
 * Merge two sorted sub-arrays: array[left..mid] and array[mid+1..right]
 */
function merge(array, left, mid, right, frames) {
  const leftArr = array.slice(left, mid + 1);
  const rightArr = array.slice(mid + 1, right + 1);

  let i = 0;       // pointer for left sub-array
  let j = 0;       // pointer for right sub-array
  let k = left;    // pointer for main array

  // Show merge start
  frames.push({
    array: [...array],
    comparing: [],
    swapped: [],
    sorted: [],
    activeRange: [left, right],
    phase: 'merging',
    phaseDetail: `Merging [${left}..${mid}] and [${mid + 1}..${right}]`,
  });

  // Compare elements from both halves and place the smaller one
  while (i < leftArr.length && j < rightArr.length) {
    // Highlight the two elements being compared
    frames.push({
      array: [...array],
      comparing: [left + i, mid + 1 + j],
      swapped: [],
      sorted: [],
      activeRange: [left, right],
      phase: 'merging',
      phaseDetail: `Comparing ${leftArr[i]} vs ${rightArr[j]}`,
    });

    if (leftArr[i] <= rightArr[j]) {
      array[k] = leftArr[i];
      i++;
    } else {
      array[k] = rightArr[j];
      j++;
    }

    // Show the element placed into its merged position
    frames.push({
      array: [...array],
      comparing: [],
      swapped: [k],
      sorted: [],
      activeRange: [left, right],
      phase: 'merging',
      phaseDetail: `Placed ${array[k]} at position ${k}`,
    });

    k++;
  }

  // Copy remaining elements from left sub-array
  while (i < leftArr.length) {
    array[k] = leftArr[i];
    frames.push({
      array: [...array],
      comparing: [],
      swapped: [k],
      sorted: [],
      activeRange: [left, right],
      phase: 'merging',
      phaseDetail: `Placed remaining ${leftArr[i]} at position ${k}`,
    });
    i++;
    k++;
  }

  // Copy remaining elements from right sub-array
  while (j < rightArr.length) {
    array[k] = rightArr[j];
    frames.push({
      array: [...array],
      comparing: [],
      swapped: [k],
      sorted: [],
      activeRange: [left, right],
      phase: 'merging',
      phaseDetail: `Placed remaining ${rightArr[j]} at position ${k}`,
    });
    j++;
    k++;
  }
}

export const mergeSortInfo = {
  name: 'Merge Sort',
  timeComplexity: 'O(n log n)',
  spaceComplexity: 'O(n)',
  description: 'Divides the array in half, recursively sorts each half, then merges the sorted halves back together.',
};
