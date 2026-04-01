/**
 * Binary Search — generator that yields visualization frames.
 * Each frame: { array, low, high, mid, found, target, sorted }
 *
 * Unlike sorting, binary search works on a pre-sorted array.
 * We generate a sorted array and pick a random target.
 */
export function* binarySearch(inputArray) {
  // Sort the array first (binary search requires sorted input)
  const array = [...inputArray].sort((a, b) => a - b);
  const target = array[Math.floor(Math.random() * array.length)];

  let low = 0;
  let high = array.length - 1;
  const eliminated = new Set();

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);

    // Show current search window
    yield {
      array: [...array],
      low,
      high,
      mid,
      found: -1,
      target,
      eliminated: [...eliminated],
    };

    if (array[mid] === target) {
      // Found!
      yield {
        array: [...array],
        low,
        high,
        mid,
        found: mid,
        target,
        eliminated: [...eliminated],
      };
      return;
    } else if (array[mid] < target) {
      // Eliminate left half
      for (let i = low; i <= mid; i++) eliminated.add(i);
      low = mid + 1;
    } else {
      // Eliminate right half
      for (let i = mid; i <= high; i++) eliminated.add(i);
      high = mid - 1;
    }
  }

  // Not found (shouldn't happen since target is from array)
  yield {
    array: [...array],
    low,
    high,
    mid: -1,
    found: -1,
    target,
    eliminated: [...eliminated],
  };
}

export const binarySearchInfo = {
  name: 'Binary Search',
  timeComplexity: 'O(log n)',
  spaceComplexity: 'O(1)',
  description: 'Searches a sorted array by repeatedly dividing the search interval in half.',
};
