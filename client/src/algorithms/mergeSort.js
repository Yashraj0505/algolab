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
 *   - comparisons: total comparisons made
 *   - swaps: total moves/placements made
 */
export function* mergeSort(inputArray) {
  const array = [...inputArray];
  const n = array.length;
  const metrics = { comparisons: 0, swaps: 0 };

  
  const frames = [];
  mergeSortRecursive(array, 0, n - 1, frames, metrics);

  
  const allSorted = Array.from({ length: n }, (_, i) => i);
  frames.push({
    array: [...array],
    comparing: [],
    swapped: [],
    sorted: allSorted,
    activeRange: [0, n - 1],
    phase: 'done',
    phaseDetail: 'Array is fully sorted!',
    comparisons: metrics.comparisons,
    swaps: metrics.swaps,
  });

  for (const frame of frames) {
    yield frame;
  }
}


function mergeSortRecursive(array, left, right, frames, metrics) {
  if (left >= right) return;

  const mid = Math.floor((left + right) / 2);

  
  frames.push({
    array: [...array],
    comparing: [],
    swapped: [],
    sorted: [],
    activeRange: [left, right],
    dividePoint: mid,
    phase: 'dividing',
    phaseDetail: `Splitting [${left}..${right}] into [${left}..${mid}] and [${mid + 1}..${right}]`,
    comparisons: metrics.comparisons,
    swaps: metrics.swaps,
  });

  
  mergeSortRecursive(array, left, mid, frames, metrics);

  
  mergeSortRecursive(array, mid + 1, right, frames, metrics);

  
  merge(array, left, mid, right, frames, metrics);
}

/**
 * Merge two sorted sub-arrays: array[left..mid] and array[mid+1..right]
 */
function merge(array, left, mid, right, frames, metrics) {
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
    comparisons: metrics.comparisons,
    swaps: metrics.swaps,
  });

  // Compare elements from both halves and place the smaller one
  while (i < leftArr.length && j < rightArr.length) {
    // Highlight the two elements being compared
    metrics.comparisons++;
    frames.push({
      array: [...array],
      comparing: [left + i, mid + 1 + j],
      swapped: [],
      sorted: [],
      activeRange: [left, right],
      phase: 'merging',
      phaseDetail: `Comparing ${leftArr[i]} vs ${rightArr[j]}`,
      comparisons: metrics.comparisons,
      swaps: metrics.swaps,
    });

    if (leftArr[i] <= rightArr[j]) {
      array[k] = leftArr[i];
      i++;
    } else {
      array[k] = rightArr[j];
      j++;
    }

    // Show the element placed into its merged position
    metrics.swaps++;
    frames.push({
      array: [...array],
      comparing: [],
      swapped: [k],
      sorted: [],
      activeRange: [left, right],
      phase: 'merging',
      phaseDetail: `Placed ${array[k]} at position ${k}`,
      comparisons: metrics.comparisons,
      swaps: metrics.swaps,
    });

    k++;
  }

  // Copy remaining elements from left sub-array
  while (i < leftArr.length) {
    array[k] = leftArr[i];
    metrics.swaps++;
    frames.push({
      array: [...array],
      comparing: [],
      swapped: [k],
      sorted: [],
      activeRange: [left, right],
      phase: 'merging',
      phaseDetail: `Placed remaining ${leftArr[i]} at position ${k}`,
      comparisons: metrics.comparisons,
      swaps: metrics.swaps,
    });
    i++;
    k++;
  }

  // Copy remaining elements from right sub-array
  while (j < rightArr.length) {
    array[k] = rightArr[j];
    metrics.swaps++;
    frames.push({
      array: [...array],
      comparing: [],
      swapped: [k],
      sorted: [],
      activeRange: [left, right],
      phase: 'merging',
      phaseDetail: `Placed remaining ${rightArr[j]} at position ${k}`,
      comparisons: metrics.comparisons,
      swaps: metrics.swaps,
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

export const mergeSortCode = `function mergeSort(array, left, right) {
  if (left >= right) return;
  
  const mid = Math.floor((left + right) / 2);
  
  // Divide: split into halves
  mergeSort(array, left, mid);
  mergeSort(array, mid + 1, right);
  
  // Merge: combine sorted halves
  merge(array, left, mid, right);
}

function merge(array, left, mid, right) {
  const leftArr = array.slice(left, mid + 1);
  const rightArr = array.slice(mid + 1, right + 1);
  
  let i = 0, j = 0, k = left;
  
  // Compare and merge
  while (i < leftArr.length && j < rightArr.length) {
    if (leftArr[i] <= rightArr[j]) {
      array[k++] = leftArr[i++];
    } else {
      array[k++] = rightArr[j++];
    }
  }
  
  // Copy remaining elements
  while (i < leftArr.length) array[k++] = leftArr[i++];
  while (j < rightArr.length) array[k++] = rightArr[j++];
}`;
