// ─── Heap — generator-based animation ────────────────────────────────────────

function mkFrame(array, opts = {}) {
  return {
    array: [...array],
    heapSize: array.length,
    comparing: [],
    swapping: [],
    sorted: [],
    heapified: [],
    activeLine: 1,
    message: '',
    phase: 'idle',
    ...opts,
  };
}

// ─── Min Heap Insert ──────────────────────────────────────────────────────────

export function* minHeapInsert(inputArray, value) {
  const arr = [...inputArray];
  arr.push(value);
  let i = arr.length - 1;

  yield mkFrame(arr, {
    comparing: [i],
    phase: 'insert',
    message: `Inserted ${value} at index ${i} — bubbling up`,
    activeLine: 2,
  });

  while (i > 0) {
    const parent = Math.floor((i - 1) / 2);

    yield mkFrame(arr, {
      comparing: [i, parent],
      phase: 'comparing',
      message: `Compare arr[${i}]=${arr[i]} with parent arr[${parent}]=${arr[parent]}`,
      activeLine: 4,
    });

    if (arr[i] < arr[parent]) {
      [arr[i], arr[parent]] = [arr[parent], arr[i]];
      yield mkFrame(arr, {
        swapping: [i, parent],
        phase: 'swap',
        message: `arr[${i}] < parent → Swap ${arr[parent]} ↔ ${arr[i]}`,
        activeLine: 6,
      });
      i = parent;
    } else {
      yield mkFrame(arr, {
        heapified: [i],
        phase: 'done',
        message: `arr[${i}] ≥ parent — heap property satisfied ✓`,
        activeLine: 8,
      });
      break;
    }
  }

  yield mkFrame(arr, {
    heapified: Array.from({ length: arr.length }, (_, k) => k),
    phase: 'done',
    message: `✓ ${value} inserted — Min Heap property restored`,
    activeLine: 10,
  });

  return arr;
}

// ─── Max Heap Insert ──────────────────────────────────────────────────────────

export function* maxHeapInsert(inputArray, value) {
  const arr = [...inputArray];
  arr.push(value);
  let i = arr.length - 1;

  yield mkFrame(arr, {
    comparing: [i],
    phase: 'insert',
    message: `Inserted ${value} at index ${i} — bubbling up`,
    activeLine: 2,
  });

  while (i > 0) {
    const parent = Math.floor((i - 1) / 2);

    yield mkFrame(arr, {
      comparing: [i, parent],
      phase: 'comparing',
      message: `Compare arr[${i}]=${arr[i]} with parent arr[${parent}]=${arr[parent]}`,
      activeLine: 4,
    });

    if (arr[i] > arr[parent]) {
      [arr[i], arr[parent]] = [arr[parent], arr[i]];
      yield mkFrame(arr, {
        swapping: [i, parent],
        phase: 'swap',
        message: `arr[${i}] > parent → Swap ${arr[parent]} ↔ ${arr[i]}`,
        activeLine: 6,
      });
      i = parent;
    } else {
      yield mkFrame(arr, {
        heapified: [i],
        phase: 'done',
        message: `arr[${i}] ≤ parent — heap property satisfied ✓`,
        activeLine: 8,
      });
      break;
    }
  }

  yield mkFrame(arr, {
    heapified: Array.from({ length: arr.length }, (_, k) => k),
    phase: 'done',
    message: `✓ ${value} inserted — Max Heap property restored`,
    activeLine: 10,
  });

  return arr;
}

// ─── Heapify Down (shared) ────────────────────────────────────────────────────

function* heapifyDown(arr, i, heapSize, isMin, sorted = []) {
  while (true) {
    let target = i;
    const l = 2 * i + 1;
    const r = 2 * i + 2;

    if (l < heapSize) {
      yield mkFrame(arr, {
        comparing: [target, l],
        sorted,
        heapSize,
        phase: 'comparing',
        message: `Compare arr[${target}]=${arr[target]} with left child arr[${l}]=${arr[l]}`,
        activeLine: 4,
      });
      if (isMin ? arr[l] < arr[target] : arr[l] > arr[target]) target = l;
    }

    if (r < heapSize) {
      yield mkFrame(arr, {
        comparing: [target, r],
        sorted,
        heapSize,
        phase: 'comparing',
        message: `Compare arr[${target}]=${arr[target]} with right child arr[${r}]=${arr[r]}`,
        activeLine: 5,
      });
      if (isMin ? arr[r] < arr[target] : arr[r] > arr[target]) target = r;
    }

    if (target === i) {
      yield mkFrame(arr, {
        heapified: [i],
        sorted,
        heapSize,
        phase: 'heapified',
        message: `Node ${arr[i]} at index ${i} is in correct position ✓`,
        activeLine: 8,
      });
      break;
    }

    yield mkFrame(arr, {
      swapping: [i, target],
      sorted,
      heapSize,
      phase: 'swap',
      message: `Swap arr[${i}]=${arr[i]} ↔ arr[${target}]=${arr[target]}`,
      activeLine: 7,
    });

    [arr[i], arr[target]] = [arr[target], arr[i]];
    i = target;
  }
}

// ─── Min Heap Extract ─────────────────────────────────────────────────────────

export function* minHeapExtract(inputArray) {
  if (inputArray.length === 0) return [];
  const arr = [...inputArray];

  yield mkFrame(arr, {
    comparing: [0],
    phase: 'extract',
    message: `Extract min: arr[0] = ${arr[0]}`,
    activeLine: 2,
  });

  const last = arr.length - 1;
  [arr[0], arr[last]] = [arr[last], arr[0]];

  yield mkFrame(arr, {
    swapping: [0, last],
    phase: 'swap',
    message: `Swap root with last element ${arr[last]}`,
    activeLine: 3,
  });

  const extracted = arr.pop();

  yield mkFrame(arr, {
    comparing: [0],
    phase: 'heapify',
    message: `Removed ${extracted} — heapifying down from root`,
    activeLine: 4,
  });

  yield* heapifyDown(arr, 0, arr.length, true);

  yield mkFrame(arr, {
    heapified: Array.from({ length: arr.length }, (_, k) => k),
    phase: 'done',
    message: `✓ Extracted min (${extracted}) — Min Heap restored`,
    activeLine: 10,
  });

  return arr;
}

// ─── Max Heap Extract ─────────────────────────────────────────────────────────

export function* maxHeapExtract(inputArray) {
  if (inputArray.length === 0) return [];
  const arr = [...inputArray];

  yield mkFrame(arr, {
    comparing: [0],
    phase: 'extract',
    message: `Extract max: arr[0] = ${arr[0]}`,
    activeLine: 2,
  });

  const last = arr.length - 1;
  [arr[0], arr[last]] = [arr[last], arr[0]];

  yield mkFrame(arr, {
    swapping: [0, last],
    phase: 'swap',
    message: `Swap root with last element ${arr[last]}`,
    activeLine: 3,
  });

  const extracted = arr.pop();

  yield mkFrame(arr, {
    comparing: [0],
    phase: 'heapify',
    message: `Removed ${extracted} — heapifying down from root`,
    activeLine: 4,
  });

  yield* heapifyDown(arr, 0, arr.length, false);

  yield mkFrame(arr, {
    heapified: Array.from({ length: arr.length }, (_, k) => k),
    phase: 'done',
    message: `✓ Extracted max (${extracted}) — Max Heap restored`,
    activeLine: 10,
  });

  return arr;
}

// ─── Build Heap (Heapify) ─────────────────────────────────────────────────────

export function* heapBuild(inputArray, isMin) {
  const arr = [...inputArray];
  const n = arr.length;
  const label = isMin ? 'Min' : 'Max';

  yield mkFrame(arr, {
    phase: 'start',
    message: `Building ${label} Heap from array — starting heapify from last non-leaf`,
    activeLine: 1,
  });

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    yield mkFrame(arr, {
      comparing: [i],
      phase: 'heapify',
      message: `Heapify down from index ${i} (value ${arr[i]})`,
      activeLine: 3,
    });
    yield* heapifyDown(arr, i, n, isMin);
  }

  yield mkFrame(arr, {
    heapified: Array.from({ length: n }, (_, k) => k),
    phase: 'done',
    message: `✓ ${label} Heap built successfully`,
    activeLine: 6,
  });

  return arr;
}

// ─── Heap Sort ────────────────────────────────────────────────────────────────

export function* heapSort(inputArray) {
  const arr = [...inputArray];
  const n = arr.length;

  // Phase 1: Build max heap
  yield mkFrame(arr, {
    phase: 'build',
    message: `Phase 1: Building Max Heap from array`,
    activeLine: 1,
  });

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    yield mkFrame(arr, {
      comparing: [i],
      phase: 'build',
      message: `Heapify down from index ${i}`,
      activeLine: 3,
    });
    yield* heapifyDown(arr, i, n, false);
  }

  yield mkFrame(arr, {
    heapified: Array.from({ length: n }, (_, k) => k),
    phase: 'build',
    message: `✓ Max Heap built — now extracting elements`,
    activeLine: 5,
  });

  // Phase 2: Extract max repeatedly
  const sorted = [];
  for (let end = n - 1; end > 0; end--) {
    yield mkFrame(arr, {
      comparing: [0],
      sorted: [...sorted],
      heapSize: end + 1,
      phase: 'extract',
      message: `Extract max arr[0]=${arr[0]} → place at index ${end}`,
      activeLine: 7,
    });

    [arr[0], arr[end]] = [arr[end], arr[0]];
    sorted.unshift(end);

    yield mkFrame(arr, {
      swapping: [0, end],
      sorted: [...sorted],
      heapSize: end,
      phase: 'swap',
      message: `Swapped root with arr[${end}]=${arr[end]} — now heapifying`,
      activeLine: 8,
    });

    yield* heapifyDown(arr, 0, end, false, [...sorted]);
  }

  sorted.unshift(0);
  yield mkFrame(arr, {
    sorted: [...sorted],
    heapSize: 0,
    phase: 'done',
    message: `✓ Heap Sort complete — array sorted in ascending order`,
    activeLine: 12,
  });

  return arr;
}

// ─── Info & Code ──────────────────────────────────────────────────────────────

export const heapInfo = {
  name: 'Heap',
  timeComplexity: 'O(n log n)',
  spaceComplexity: 'O(1)',
};

export const heapInsertCode = `function insert(heap, value) {
  heap.push(value);         // add at end
  let i = heap.length - 1;
  while (i > 0) {
    const p = Math.floor((i-1)/2);
    if (heap[i] < heap[p]) { // < for min, > for max
      swap(heap, i, p);
      i = p;
    } else break;           // heap property ok
  }
  return heap;
}`;

export const heapExtractCode = `function extractMin(heap) {
  const min = heap[0];      // root = min
  heap[0] = heap.pop();     // move last to root
  heapifyDown(heap, 0);     // restore property
  return min;
}
function heapifyDown(heap, i) {
  const n = heap.length;
  while (true) {
    let smallest = i;
    const l = 2*i+1, r = 2*i+2;
    if (l < n && heap[l] < heap[smallest]) smallest = l;
    if (r < n && heap[r] < heap[smallest]) smallest = r;
    if (smallest === i) break;
    swap(heap, i, smallest);
    i = smallest;
  }
}`;

export const heapBuildCode = `function buildHeap(arr) {
  const n = arr.length;
  // Start from last non-leaf node
  for (let i = Math.floor(n/2)-1; i >= 0; i--)
    heapifyDown(arr, i, n);
  return arr; // valid heap
}`;

export const heapSortCode = `function heapSort(arr) {
  const n = arr.length;
  // 1. Build max heap
  for (let i = Math.floor(n/2)-1; i >= 0; i--)
    heapifyDown(arr, i, n);
  // 2. Extract max repeatedly
  for (let end = n-1; end > 0; end--) {
    swap(arr, 0, end);      // move max to end
    heapifyDown(arr, 0, end); // restore heap
  }
  return arr; // sorted ascending
}`;

export const heapCodeMap = {
  minHeapInsert: heapInsertCode,
  maxHeapInsert: heapInsertCode,
  minHeapExtract: heapExtractCode,
  maxHeapExtract: heapExtractCode,
  heapBuildMin: heapBuildCode,
  heapBuildMax: heapBuildCode,
  heapSort: heapSortCode,
};
