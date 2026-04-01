/**
 * Bubble Sort — generator that yields visualization frames.
 * Each frame: { array, comparing, swapped, sorted }
 */
export function* bubbleSort(inputArray) {
  const array = [...inputArray];
  const n = array.length;
  const sorted = new Set();

  for (let i = 0; i < n - 1; i++) {
    let didSwap = false;

    for (let j = 0; j < n - 1 - i; j++) {
      // Highlight the two elements being compared
      yield { array: [...array], comparing: [j, j + 1], swapped: [], sorted: [...sorted] };

      if (array[j] > array[j + 1]) {
        // Swap
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
        didSwap = true;
        yield { array: [...array], comparing: [], swapped: [j, j + 1], sorted: [...sorted] };
      }
    }

    // Mark last unsorted position as sorted
    sorted.add(n - 1 - i);

    if (!didSwap) break;
  }

  // Mark all remaining as sorted
  for (let i = 0; i < n; i++) sorted.add(i);
  yield { array: [...array], comparing: [], swapped: [], sorted: [...sorted] };
}

export const bubbleSortInfo = {
  name: 'Bubble Sort',
  timeComplexity: 'O(n²)',
  spaceComplexity: 'O(1)',
  description: 'Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
};
