
let nextId = 0;
function makeNode(value) {
  return { id: nextId++, value, left: null, right: null };
}

function cloneTree(node) {
  if (!node) return null;
  return {
    id: node.id,
    value: node.value,
    left: cloneTree(node.left),
    right: cloneTree(node.right),
  };
}

function countNodes(node) {
  if (!node) return 0;
  return 1 + countNodes(node.left) + countNodes(node.right);
}

function minNode(node) {
  while (node.left) node = node.left;
  return node;
}

function insertNode(node, value) {
  if (!node) return makeNode(value);
  if (value < node.value) node.left = insertNode(node.left, value);
  else if (value > node.value) node.right = insertNode(node.right, value);
  return node;
}

function deleteNode(node, value) {
  if (!node) return null;
  if (value < node.value) {
    node.left = deleteNode(node.left, value);
  } else if (value > node.value) {
    node.right = deleteNode(node.right, value);
  } else {
    if (!node.left) return node.right;
    if (!node.right) return node.left;
    const successor = minNode(node.right);
    node.value = successor.value;
    node.right = deleteNode(node.right, successor.value);
  }
  return node;
}

function collectIds(node, out = []) {
  if (!node) return out;
  collectIds(node.left, out);
  out.push(node.id);
  collectIds(node.right, out);
  return out;
}

export function* bstInsert(root, value) {
  nextId = countNodes(root); // keep ids stable
  const path = [];   // node ids visited
  const edges = [];  // { from, to } ids

  let current = root;

  while (current) {
    path.push(current.id);
    yield {
      root: cloneTree(root),
      highlightedNodes: [...path],
      highlightedEdges: [...edges],
      pathNodes: [...path],
      message: `Comparing ${value} with ${current.value} → go ${value < current.value ? 'left' : 'right'}`,
      phase: 'traversing',
      targetValue: value,
      activeLine: value < current.value ? 4 : 6,
    };

    if (value === current.value) {
      yield {
        root: cloneTree(root),
        highlightedNodes: [current.id],
        highlightedEdges: [],
        pathNodes: [...path],
        message: `${value} already exists in the tree!`,
        phase: 'duplicate',
        targetValue: value,
        activeLine: 8,
      };
      return;
    }

    const next = value < current.value ? current.left : current.right;
    if (next) edges.push({ from: current.id, to: next.id });
    current = next;
  }

  root = insertNode(root, value);
  
  function findNew(node, val) {
    if (!node) return null;
    if (node.value === val && node.left === null && node.right === null) return node;
    const l = findNew(node.left, val);
    if (l) return l;
    return findNew(node.right, val);
  }
  
  function findInserted(node, val, parentPath) {
    if (!node) return null;
    if (node.value === val) {
      return node;
    }
    const inLeft = findInserted(node.left, val, parentPath);
    if (inLeft) return inLeft;
    return findInserted(node.right, val, parentPath);
  }

  const newNode = findNew(root, value);
  const newId = newNode ? newNode.id : -1;

  yield {
    root: cloneTree(root),
    highlightedNodes: [...path, newId],
    highlightedEdges: [],
    pathNodes: [...path],
    message: `Inserted ${value} ✓`,
    phase: 'inserted',
    targetValue: value,
    newNodeId: newId,
    activeLine: 3,
  };

  // Final clean frame
  yield {
    root: cloneTree(root),
    highlightedNodes: [newId],
    highlightedEdges: [],
    pathNodes: [],
    message: `Done! ${value} inserted into BST`,
    phase: 'done',
    targetValue: value,
    newNodeId: newId,
    activeLine: 8,
  };

  return root; // caller can use this
}

export function* bstSearch(root, value) {
  const path = [];

  let current = root;

  while (current) {
    path.push(current.id);
    yield {
      root: cloneTree(root),
      highlightedNodes: [...path],
      highlightedEdges: [],
      pathNodes: [...path],
      message: `Checking ${current.value}… ${value === current.value ? 'Found!' : value < current.value ? 'Go left' : 'Go right'}`,
      phase: 'searching',
      targetValue: value,
      activeLine: 13,
    };

    if (current.value === value) {
      yield {
        root: cloneTree(root),
        highlightedNodes: [current.id],
        highlightedEdges: [],
        pathNodes: [...path],
        message: `✓ Found ${value}!`,
        phase: 'found',
        targetValue: value,
        foundId: current.id,
        activeLine: 14,
      };
      return;
    }

    current = value < current.value ? current.left : current.right;
  }

  yield {
    root: cloneTree(root),
    highlightedNodes: [],
    highlightedEdges: [],
    pathNodes: [],
    message: `✗ ${value} not found in the BST`,
    phase: 'notfound',
    targetValue: value,
    activeLine: 14,
  };
}

export function* bstDelete(root, value) {
  const path = [];
  let current = root;

  while (current) {
    path.push(current.id);
    yield {
      root: cloneTree(root),
      highlightedNodes: [...path],
      highlightedEdges: [],
      pathNodes: [...path],
      message: `Looking for ${value}: checking ${current.value}`,
      phase: 'searching',
      targetValue: value,
      activeLine: value < current.value ? 23 : (value > current.value ? 25 : 27),
    };

    if (current.value === value) break;
    current = value < current.value ? current.left : current.right;
  }

  if (!current) {
    yield {
      root: cloneTree(root),
      highlightedNodes: [],
      highlightedEdges: [],
      pathNodes: [],
      message: `✗ ${value} not found — cannot delete`,
      phase: 'notfound',
      targetValue: value,
      activeLine: 22,
    };
    return;
  }

  const deletedId = current.id;

  let caseMsg = '';
  let activeLine = 22;
  if (!current.left && !current.right) { caseMsg = 'Leaf node — simply remove it'; activeLine = 28; }
  else if (!current.left) { caseMsg = 'One child — replace with right child'; activeLine = 28; }
  else if (!current.right) { caseMsg = 'One child — replace with left child'; activeLine = 29; }
  else {
    const succ = minNode(current.right);
    caseMsg = `Two children — replace with in-order successor (${succ.value})`;
    activeLine = 34;
  }

  yield {
    root: cloneTree(root),
    highlightedNodes: [deletedId],
    highlightedEdges: [],
    pathNodes: [...path],
    message: `Deleting ${value}: ${caseMsg}`,
    phase: 'deleting',
    targetValue: value,
    deletedId,
    activeLine,
  };

  root = deleteNode(root, value);

  yield {
    root: cloneTree(root),
    highlightedNodes: [],
    highlightedEdges: [],
    pathNodes: [],
    message: `✓ ${value} deleted from BST`,
    phase: 'done',
    targetValue: value,
    activeLine: 36,
  };

  return root;
}

export function* bstInorder(root) {
  const result = [];
  const visitedIds = [];

  function* traverse(node, fromId) {
    yield { activeLine: 41, phase: 'traversing', currentId: node ? node.id : fromId };
    if (!node) return;

    yield { activeLine: 42, phase: 'traversing', currentId: node.id };
    yield* traverse(node.left, node.id);

    result.push(node.value);
    visitedIds.push(node.id);
    yield { activeLine: 43, phase: 'found', currentId: node.id, foundId: node.id };

    yield { activeLine: 44, phase: 'traversing', currentId: node.id };
    yield* traverse(node.right, node.id);
  }

  for (const frame of traverse(root, null)) {
    yield {
      root: cloneTree(root),
      highlightedNodes: frame.currentId !== null ? [...visitedIds, frame.currentId] : [...visitedIds],
      highlightedEdges: [],
      pathNodes: [],
      message: `Inorder: [${result.join(', ')}]`,
      phase: frame.phase,
      targetValue: null,
      foundId: frame.foundId,
      activeLine: frame.activeLine,
    };
  }

  yield {
    root: cloneTree(root),
    highlightedNodes: [...visitedIds],
    highlightedEdges: [],
    pathNodes: [],
    message: `Done! Inorder sequence: [${result.join(', ')}]`,
    phase: 'done',
    activeLine: 45,
  };
}

export function* bstPreorder(root) {
  const result = [];
  const visitedIds = [];

  function* traverse(node, fromId) {
    yield { activeLine: 49, phase: 'traversing', currentId: node ? node.id : fromId };
    if (!node) return;

    result.push(node.value);
    visitedIds.push(node.id);
    yield { activeLine: 50, phase: 'found', currentId: node.id, foundId: node.id };

    yield { activeLine: 51, phase: 'traversing', currentId: node.id };
    yield* traverse(node.left, node.id);

    yield { activeLine: 52, phase: 'traversing', currentId: node.id };
    yield* traverse(node.right, node.id);
  }

  for (const frame of traverse(root, null)) {
    yield {
      root: cloneTree(root),
      highlightedNodes: frame.currentId !== null ? [...visitedIds, frame.currentId] : [...visitedIds],
      highlightedEdges: [],
      pathNodes: [],
      message: `Preorder: [${result.join(', ')}]`,
      phase: frame.phase,
      targetValue: null,
      foundId: frame.foundId,
      activeLine: frame.activeLine,
    };
  }

  yield {
    root: cloneTree(root),
    highlightedNodes: [...visitedIds],
    highlightedEdges: [],
    pathNodes: [],
    message: `Done! Preorder sequence: [${result.join(', ')}]`,
    phase: 'done',
    activeLine: 53,
  };
}

export function* bstPostorder(root) {
  const result = [];
  const visitedIds = [];

  function* traverse(node, fromId) {
    yield { activeLine: 57, phase: 'traversing', currentId: node ? node.id : fromId };
    if (!node) return;

    yield { activeLine: 58, phase: 'traversing', currentId: node.id };
    yield* traverse(node.left, node.id);

    yield { activeLine: 59, phase: 'traversing', currentId: node.id };
    yield* traverse(node.right, node.id);

    result.push(node.value);
    visitedIds.push(node.id);
    yield { activeLine: 60, phase: 'found', currentId: node.id, foundId: node.id };
  }

  for (const frame of traverse(root, null)) {
    yield {
      root: cloneTree(root),
      highlightedNodes: frame.currentId !== null ? [...visitedIds, frame.currentId] : [...visitedIds],
      highlightedEdges: [],
      pathNodes: [],
      message: `Postorder: [${result.join(', ')}]`,
      phase: frame.phase,
      targetValue: null,
      foundId: frame.foundId,
      activeLine: frame.activeLine,
    };
  }

  yield {
    root: cloneTree(root),
    highlightedNodes: [...visitedIds],
    highlightedEdges: [],
    pathNodes: [],
    message: `Done! Postorder sequence: [${result.join(', ')}]`,
    phase: 'done',
    activeLine: 61,
  };
}

export function* bstBFS(root) {
  const result = [];
  const visitedIds = [];
  if (!root) return;
  const queue = [root];

  yield { activeLine: 64, phase: 'traversing' };

  while (queue.length > 0) {
    const node = queue.shift();

    result.push(node.value);
    visitedIds.push(node.id);
    yield {
      activeLine: 68, phase: 'found', currentId: node.id, foundId: node.id,
      root: cloneTree(root),
      highlightedNodes: [...visitedIds],
      highlightedEdges: [],
      pathNodes: [],
      message: `BFS: [${result.join(', ')}]`
    };

    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);

    yield {
      activeLine: 69, phase: 'traversing', currentId: node.id,
      root: cloneTree(root),
      highlightedNodes: [...visitedIds],
      highlightedEdges: [],
      pathNodes: [],
      message: `BFS: [${result.join(', ')}]`
    };
  }

  yield {
    root: cloneTree(root),
    highlightedNodes: [...visitedIds],
    highlightedEdges: [],
    pathNodes: [],
    message: `Done! BFS sequence: [${result.join(', ')}]`,
    phase: 'done',
    activeLine: 71,
  };
}

export function* bstDFS(root) {
  const result = [];
  const visitedIds = [];
  if (!root) return;
  const stack = [root];

  yield { activeLine: 75, phase: 'traversing' };

  while (stack.length > 0) {
    const node = stack.pop();

    result.push(node.value);
    visitedIds.push(node.id);
    yield {
      activeLine: 78, phase: 'found', currentId: node.id, foundId: node.id,
      root: cloneTree(root),
      highlightedNodes: [...visitedIds],
      highlightedEdges: [],
      pathNodes: [],
      message: `DFS: [${result.join(', ')}]`
    };

    if (node.right) stack.push(node.right);
    if (node.left) stack.push(node.left);

    yield {
      activeLine: 80, phase: 'traversing', currentId: node.id,
      root: cloneTree(root),
      highlightedNodes: [...visitedIds],
      highlightedEdges: [],
      pathNodes: [],
      message: `DFS: [${result.join(', ')}]`
    };
  }

  yield {
    root: cloneTree(root),
    highlightedNodes: [...visitedIds],
    highlightedEdges: [],
    pathNodes: [],
    message: `Done! DFS sequence: [${result.join(', ')}]`,
    phase: 'done',
    activeLine: 81,
  };
}

// ─── Build a starter BST from an array of values ────────────────────────────
export function buildBST(values) {
  nextId = 0;
  let root = null;
  for (const v of values) root = insertNode(root, v);
  return root;
}

export const bstInfo = {
  name: 'BST Operations',
  description: 'Visualize Insert, Search, and Delete on a Binary Search Tree with animated traversal paths.',
  timeComplexity: 'O(h)',
  spaceComplexity: 'O(h)',
};

export const bstCode = `// BST Insert
function insert(root, value) {
  if (!root) return new Node(value);
  if (value < root.value)
    root.left = insert(root.left, value);
  else if (value > root.value)
    root.right = insert(root.right, value);
  return root;
}

// BST Search
function search(root, value) {
  if (!root || root.value === value)
    return root;
  if (value < root.value)
    return search(root.left, value);
  return search(root.right, value);
}

// BST Delete
function deleteNode(root, value) {
  if (!root) return null;
  if (value < root.value)
    root.left = deleteNode(root.left, value);
  else if (value > root.value)
    root.right = deleteNode(root.right, value);
  else {
    if (!root.left) return root.right;
    if (!root.right) return root.left;
    // Two children: replace with inorder successor
    let succ = root.right;
    while (succ.left) succ = succ.left;
    root.value = succ.value;
    root.right = deleteNode(root.right, succ.value);
  }
  return root;
}

// BST Inorder
function inorder(root, res) {
  if (!root) return;
  inorder(root.left, res);
  res.push(root.value);
  inorder(root.right, res);
}

// BST Preorder
function preorder(root, res) {
  if (!root) return;
  res.push(root.value);
  preorder(root.left, res);
  preorder(root.right, res);
}

// BST Postorder
function postorder(root, res) {
  if (!root) return;
  postorder(root.left, res);
  postorder(root.right, res);
  res.push(root.value);
}`;
