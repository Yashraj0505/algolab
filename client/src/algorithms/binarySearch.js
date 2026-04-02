export function* binarySearch(inputArray) {
  const array = [...inputArray].sort((a, b) => a - b);
  const target = array[Math.floor(Math.random() * array.length)];

  let low = 0;
  let high = array.length - 1;
  const eliminated = new Set();
  let comparisons = 0;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);

    yield {
      array: [...array],
      low,
      high,
      mid,
      found: -1,
      target,
      eliminated: [...eliminated],
      comparisons,
    };

    comparisons++;
    if (array[mid] === target) {
      yield {
        array: [...array],
        low,
        high,
        mid,
        found: mid,
        target,
        eliminated: [...eliminated],
        comparisons,
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
    comparisons,
  };
}

export const binarySearchInfo = {
  name: 'Binary Search',
  timeComplexity: 'O(log n)',
  spaceComplexity: 'O(1)',
  description: 'Searches a sorted array by repeatedly dividing the search interval in half.',
};

export const binarySearchCode = `function binarySearch(array, target) {
  let low = 0;
  let high = array.length - 1;
  
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    
    // Check if target found
    if (array[mid] === target) {
      return mid;
    }
    
    // Eliminate left half
    if (array[mid] < target) {
      low = mid + 1;
    } 
    // Eliminate right half
    else {
      high = mid - 1;
    }
  }
  
  return -1; // Not found
}`;
