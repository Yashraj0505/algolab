/**
 * BST Operations — generators that yield visualization frames.
 *
 * Each frame: { root, highlightedNodes, highlightedEdges, message, phase, targetValue, pathNodes }
 */

// ─── Node factory ───────────────────────────────────────────────────────────
let nextId = 0;
function makeNode(value) {
  return { id: nextId++, value, left: null, right: null };
}

// ─── Deep-clone a BST (ids preserved) ───────────────────────────────────────
function cloneTree(node) {
  if (!node) return null;
  return {
    id: node.id,
    value: node.value,
    left: cloneTree(node.left),
    right: cloneTree(node.right),
  };
}

// ─── Count nodes ─────────────────────────────────────────────────────────────
function countNodes(node) {
  if (!node) return 0;
  return 1 + countNodes(node.left) + countNodes(node.right);
}

// ─── In-order min ────────────────────────────────────────────────────────────
function minNode(node) {
  while (node.left) node = node.left;
  return node;
}

// ─── Pure insert (no animation) ─────────────────────────────────────────────
function insertNode(node, value) {
  if (!node) return makeNode(value);
  if (value < node.value) node.left = insertNode(node.left, value);
  else if (value > node.value) node.right = insertNode(node.right, value);
  return node;
}

// ─── Pure delete ─────────────────────────────────────────────────────────────
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

// ─── Collect IDs along inorder traversal ─────────────────────────────────────
function collectIds(node, out = []) {
  if (!node) return out;
  collectIds(node.left, out);
  out.push(node.id);
  collectIds(node.right, out);
  return out;
}

// ═══════════════════════════════════════════════════════════════════════════════
// INSERT generator
// ═══════════════════════════════════════════════════════════════════════════════
export function* bstInsert(root, value) {
  nextId = countNodes(root); // keep ids stable
  const path = [];   // node ids visited
  const edges = [];  // { from, to } ids

  let current = root;

  // ── Animate the search path ──────────────────────────────────────────────
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
      };
      return;
    }

    const next = value < current.value ? current.left : current.right;
    if (next) edges.push({ from: current.id, to: next.id });
    current = next;
  }

  // ── Insert the node ──────────────────────────────────────────────────────
  root = insertNode(root, value);  // mutates in-place for the last null slot

  // find the new node
  function findNew(node, val) {
    if (!node) return null;
    if (node.value === val && node.left === null && node.right === null) return node;
    const l = findNew(node.left, val);
    if (l) return l;
    return findNew(node.right, val);
  }
  // Find newly inserted node (it's a leaf with the inserted value)
  function findInserted(node, val, parentPath) {
    if (!node) return null;
    if (node.value === val) {
      // Check if it's on the right path
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
  };

  return root; // caller can use this
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEARCH generator
// ═══════════════════════════════════════════════════════════════════════════════
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
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// DELETE generator
// ═══════════════════════════════════════════════════════════════════════════════
export function* bstDelete(root, value) {
  const path = [];
  let current = root;

  // ── Traverse to find the node ────────────────────────────────────────────
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
    };
    return;
  }

  // ── Found it — show deletion phase ──────────────────────────────────────
  const deletedId = current.id;

  // Describe the case
  let caseMsg = '';
  if (!current.left && !current.right) caseMsg = 'Leaf node — simply remove it';
  else if (!current.left || !current.right) caseMsg = 'One child — replace with child';
  else {
    const succ = minNode(current.right);
    caseMsg = `Two children — replace with in-order successor (${succ.value})`;
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
  };

  // ── Perform deletion ─────────────────────────────────────────────────────
  root = deleteNode(root, value);

  yield {
    root: cloneTree(root),
    highlightedNodes: [],
    highlightedEdges: [],
    pathNodes: [],
    message: `✓ ${value} deleted from BST`,
    phase: 'done',
    targetValue: value,
  };

  return root;
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
}`;
