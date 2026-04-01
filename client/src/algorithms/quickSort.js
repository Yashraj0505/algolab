/**
 * Quick Sort — generator that yields visualization frames.
 * Each frame: { array, comparing, swapped, sorted, pivot }
 */
export function* quickSort(inputArray) {
  const array = [...inputArray];
  const sorted = new Set();

  // Stack-based iterative quicksort for generator compatibility
  const stack = [[0, array.length - 1]];

  while (stack.length > 0) {
    const [low, high] = stack.pop();
    if (low >= high) {
      if (low === high) sorted.add(low);
      continue;
    }

    // Partition
    const pivotVal = array[high];
    let pivotIdx = low;

    // Highlight pivot
    yield { array: [...array], comparing: [], swapped: [], sorted: [...sorted], pivot: high };

    for (let j = low; j < high; j++) {
      // Compare current element with pivot
      yield { array: [...array], comparing: [j, high], swapped: [], sorted: [...sorted], pivot: high };

      if (array[j] < pivotVal) {
        // Swap
        [array[pivotIdx], array[j]] = [array[j], array[pivotIdx]];
        yield { array: [...array], comparing: [], swapped: [pivotIdx, j], sorted: [...sorted], pivot: high };
        pivotIdx++;
      }
    }

    // Place pivot in correct position
    [array[pivotIdx], array[high]] = [array[high], array[pivotIdx]];
    sorted.add(pivotIdx);
    yield { array: [...array], comparing: [], swapped: [pivotIdx, high], sorted: [...sorted], pivot: pivotIdx };

    // Push sub-arrays onto stack (right first so left is processed first)
    stack.push([pivotIdx + 1, high]);
    stack.push([low, pivotIdx - 1]);
  }

  // Mark all as sorted
  for (let i = 0; i < array.length; i++) sorted.add(i);
  yield { array: [...array], comparing: [], swapped: [], sorted: [...sorted] };
}

export const quickSortInfo = {
  name: 'Quick Sort',
  timeComplexity: 'O(n log n) avg, O(n²) worst',
  spaceComplexity: 'O(log n)',
  description: 'Selects a pivot element, partitions the array around it, then recursively sorts the partitions.',
};
