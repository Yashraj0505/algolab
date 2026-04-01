/**
 * Quick Sort — generator that yields visualization frames.
 * Each frame: { array, comparing, swapped, sorted, pivot, comparisons, swaps, activeLine }
 */
export function* quickSort(inputArray) {
  const array = [...inputArray];
  const sorted = new Set();
  let comparisons = 0;
  let swaps = 0;

  // Stack-based iterative quicksort for generator compatibility
  const stack = [[0, array.length - 1]];
  yield { array: [...array], comparing: [], swapped: [], sorted: [...sorted], comparisons, swaps, activeLine: 1 };

  while (stack.length > 0) {
    yield { array: [...array], comparing: [], swapped: [], sorted: [...sorted], comparisons, swaps, activeLine: 3 };
    const [low, high] = stack.pop();
    if (low >= high) {
      if (low === high) sorted.add(low);
      continue;
    }

    // Partition
    const pivotVal = array[high];
    let pivotIdx = low;
    yield { array: [...array], comparing: [], swapped: [], sorted: [...sorted], comparisons, swaps, activeLine: 7 };

    // Highlight pivot
    yield { array: [...array], comparing: [], swapped: [], sorted: [...sorted], pivot: high, comparisons, swaps, activeLine: 9 };

    for (let j = low; j < high; j++) {
      yield { array: [...array], comparing: [], swapped: [], sorted: [...sorted], pivot: high, comparisons, swaps, activeLine: 11 };
      // Compare current element with pivot
      comparisons++;
      yield { array: [...array], comparing: [j, high], swapped: [], sorted: [...sorted], pivot: high, comparisons, swaps, activeLine: 13 };

      if (array[j] < pivotVal) {
        yield { array: [...array], comparing: [j, high], swapped: [], sorted: [...sorted], pivot: high, comparisons, swaps, activeLine: 15 };
        // Swap
        [array[pivotIdx], array[j]] = [array[j], array[pivotIdx]];
        swaps++;
        yield { array: [...array], comparing: [], swapped: [pivotIdx, j], sorted: [...sorted], pivot: high, comparisons, swaps, activeLine: 16 };
        pivotIdx++;
      }
    }

    // Place pivot in correct position
    [array[pivotIdx], array[high]] = [array[high], array[pivotIdx]];
    swaps++;
    sorted.add(pivotIdx);
    yield { array: [...array], comparing: [], swapped: [pivotIdx, high], sorted: [...sorted], pivot: pivotIdx, comparisons, swaps, activeLine: 21 };

    // Push sub-arrays onto stack (right first so left is processed first)
    stack.push([pivotIdx + 1, high]);
    stack.push([low, pivotIdx - 1]);
  }

  // Mark all as sorted
  for (let i = 0; i < array.length; i++) sorted.add(i);
  yield { array: [...array], comparing: [], swapped: [], sorted: [...sorted], comparisons, swaps, activeLine: 27 };
}

export const quickSortInfo = {
  name: 'Quick Sort',
  timeComplexity: 'O(n log n) avg, O(n²) worst',
  spaceComplexity: 'O(log n)',
  description: 'Selects a pivot element, partitions the array around it, then recursively sorts the partitions.',
};

export const quickSortCode = `function quickSort(array, low, high) {
  if (low >= high) return;
  
  const pivotVal = array[high];
  let pivotIdx = low;
  
  // Partition around pivot
  for (let j = low; j < high; j++) {
    if (array[j] < pivotVal) {
      // Swap elements
      [array[pivotIdx], array[j]] = 
        [array[j], array[pivotIdx]];
      pivotIdx++;
    }
  }
  
  // Place pivot in correct position
  [array[pivotIdx], array[high]] = 
    [array[high], array[pivotIdx]];
  
  // Recursively sort partitions
  quickSort(array, low, pivotIdx - 1);
  quickSort(array, pivotIdx + 1, high);
  
  return array;
}`;
