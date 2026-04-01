/**
 * Bubble Sort — generator that yields visualization frames.
 * Each frame: { array, comparing, swapped, sorted, comparisons, swaps, activeLine }
 */
export function* bubbleSort(inputArray) {
  const array = [...inputArray];
  const n = array.length;
  const sorted = new Set();
  let comparisons = 0;
  let swaps = 0;

  yield { array: [...array], comparing: [], swapped: [], sorted: [...sorted], comparisons, swaps, activeLine: 1 };

  for (let i = 0; i < n - 1; i++) {
    yield { array: [...array], comparing: [], swapped: [], sorted: [...sorted], comparisons, swaps, activeLine: 2 };
    let didSwap = false;

    for (let j = 0; j < n - 1 - i; j++) {
      yield { array: [...array], comparing: [], swapped: [], sorted: [...sorted], comparisons, swaps, activeLine: 4 };
      // Highlight the two elements being compared
      comparisons++;
      yield { array: [...array], comparing: [j, j + 1], swapped: [], sorted: [...sorted], comparisons, swaps, activeLine: 6 };

      if (array[j] > array[j + 1]) {
        yield { array: [...array], comparing: [j, j + 1], swapped: [], sorted: [...sorted], comparisons, swaps, activeLine: 8 };
        // Swap
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
        swaps++;
        didSwap = true;
        yield { array: [...array], comparing: [], swapped: [j, j + 1], sorted: [...sorted], comparisons, swaps, activeLine: 9 };
      }
    }

    // Mark last unsorted position as sorted
    sorted.add(n - 1 - i);
    yield { array: [...array], comparing: [], swapped: [], sorted: [...sorted], comparisons, swaps, activeLine: 14 };

    if (!didSwap) break;
  }

  // Mark all remaining as sorted
  for (let i = 0; i < n; i++) sorted.add(i);
  yield { array: [...array], comparing: [], swapped: [], sorted: [...sorted], comparisons, swaps, activeLine: 18 };
}

export const bubbleSortInfo = {
  name: 'Bubble Sort',
  timeComplexity: 'O(n²)',
  spaceComplexity: 'O(1)',
  description: 'Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
};

export const bubbleSortCode = `function bubbleSort(array) {
  const n = array.length;
  for (let i = 0; i < n - 1; i++) {
    let didSwap = false;
    for (let j = 0; j < n - 1 - i; j++) {
      // Compare adjacent elements
      if (array[j] > array[j + 1]) {
        // Swap if out of order
        [array[j], array[j+1]] = [array[j+1], array[j]];
        didSwap = true;
      }
    }
    // Mark position as sorted
    if (!didSwap) break;
  }
  // All elements sorted
  return array;
}`;
