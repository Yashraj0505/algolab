// ─── AVL Tree — generator-based animation ────────────────────────────────────

let avlNextId = 0;

function makeNode(value) {
  return { id: avlNextId++, value, left: null, right: null, height: 1 };
}

function cloneTree(node) {
  if (!node) return null;
  return { id: node.id, value: node.value, height: node.height, left: cloneTree(node.left), right: cloneTree(node.right) };
}

function height(node) { return node ? node.height : 0; }
function updateHeight(node) { node.height = 1 + Math.max(height(node.left), height(node.right)); }
function balanceFactor(node) { return node ? height(node.left) - height(node.right) : 0; }

function collectBF(node, map = new Map()) {
  if (!node) return map;
  map.set(node.id, balanceFactor(node));
  collectBF(node.left, map);
  collectBF(node.right, map);
  return map;
}

function minNode(node) { while (node.left) node = node.left; return node; }

function rotateRight(y) {
  const x = y.left;
  y.left = x.right; x.right = y;
  updateHeight(y); updateHeight(x);
  return x;
}

function rotateLeft(x) {
  const y = x.right;
  x.right = y.left; y.left = x;
  updateHeight(x); updateHeight(y);
  return y;
}

function rotationLabel(bf, node) {
  if (bf > 1) return balanceFactor(node.left) >= 0 ? 'LL → Right Rotation' : 'LR → Left-Right Rotation';
  return balanceFactor(node.right) <= 0 ? 'RR → Left Rotation' : 'RL → Right-Left Rotation';
}

function countNodes(node) {
  if (!node) return 0;
  return 1 + countNodes(node.left) + countNodes(node.right);
}

// mkFrame always clones from the current root so the full tree is shown
function mkFrame(root, opts = {}) {
  return {
    root: cloneTree(root),
    balanceFactors: collectBF(root),
    highlightedNodes: [],
    rotatingNodes: [],
    unbalancedNode: null,
    newNodeId: null,
    deletedId: null,
    phase: 'idle',
    message: '',
    activeLine: 1,
    ...opts,
  };
}

// ─── AVL Insert generator ─────────────────────────────────────────────────────

export function* avlInsert(root, value) {
  avlNextId = countNodes(root);

  // r holds the current root reference so inner frames always show the full tree
  const r = { root, newId: -1 };

  function* go(node, path) {
    // Base: insert new node
    if (!node) {
      const n = makeNode(value);
      r.newId = n.id;
      return n;
    }

    path.push(node.id);

    // Step: show comparison
    yield mkFrame(r.root, {
      highlightedNodes: [...path],
      phase: 'traversing',
      message: `Comparing ${value} with ${node.value} → go ${value < node.value ? 'left ←' : 'right →'}`,
      activeLine: value < node.value ? 3 : 5,
    });

    if (value === node.value) {
      yield mkFrame(r.root, {
        highlightedNodes: [node.id],
        phase: 'duplicate',
        message: `${value} already exists!`,
        activeLine: 7,
      });
      return node;
    }

    // Recurse down
    if (value < node.value) node.left = yield* go(node.left, path);
    else node.right = yield* go(node.right, path);

    // Back up: update height, check BF
    updateHeight(node);
    const bf = balanceFactor(node);

    yield mkFrame(r.root, {
      highlightedNodes: [node.id],
      newNodeId: r.newId,
      phase: 'checking',
      message: `Node ${node.value} — BF = ${bf >= 0 ? '+' : ''}${bf}${Math.abs(bf) <= 1 ? ' ✓' : ''}`,
      activeLine: 9,
    });

    if (Math.abs(bf) > 1) {
      const label = rotationLabel(bf, node);

      yield mkFrame(r.root, {
        highlightedNodes: [node.id],
        unbalancedNode: node.id,
        newNodeId: r.newId,
        phase: 'unbalanced',
        message: `Node ${node.value} unbalanced! BF=${bf >= 0 ? '+' : ''}${bf} → ${label}`,
        activeLine: 12,
      });

      // Apply rotation
      if (bf > 1 && balanceFactor(node.left) >= 0) node = rotateRight(node);
      else if (bf > 1) { node.left = rotateLeft(node.left); node = rotateRight(node); }
      else if (bf < -1 && balanceFactor(node.right) <= 0) node = rotateLeft(node);
      else { node.right = rotateRight(node.right); node = rotateLeft(node); }

      yield mkFrame(node, {
        rotatingNodes: [node.id, node.left?.id, node.right?.id].filter(Boolean),
        newNodeId: r.newId,
        phase: 'rotating',
        message: `${label} applied ✓ — subtree balanced`,
        activeLine: 16,
      });
    }

    return node;
  }

  root = yield* go(root, []);
  r.root = root;

  yield mkFrame(root, {
    highlightedNodes: [r.newId],
    newNodeId: r.newId,
    phase: 'done',
    message: `✓ ${value} inserted — AVL tree balanced`,
    activeLine: 20,
  });

  return root;
}

// ─── AVL Delete generator ─────────────────────────────────────────────────────

export function* avlDelete(root, value) {
  const r = { root };

  function* go(node, path) {
    if (!node) {
      yield mkFrame(r.root, { phase: 'notfound', message: `✗ ${value} not found`, activeLine: 2 });
      return null;
    }

    path.push(node.id);

    yield mkFrame(r.root, {
      highlightedNodes: [...path],
      phase: 'searching',
      message: `Checking ${node.value} — ${value < node.value ? 'go left ←' : value > node.value ? 'go right →' : 'found!'}`,
      activeLine: value < node.value ? 3 : value > node.value ? 5 : 7,
    });

    if (value < node.value) {
      node.left = yield* go(node.left, path);
    } else if (value > node.value) {
      node.right = yield* go(node.right, path);
    } else {
      // Found
      yield mkFrame(r.root, {
        highlightedNodes: [node.id], deletedId: node.id,
        phase: 'deleting', message: `Deleting node ${node.value}`, activeLine: 8,
      });

      if (!node.left) return node.right;
      if (!node.right) return node.left;

      const succ = minNode(node.right);
      yield mkFrame(r.root, {
        highlightedNodes: [node.id, succ.id],
        phase: 'deleting',
        message: `Two children → inorder successor is ${succ.value}`,
        activeLine: 13,
      });
      node.value = succ.value;
      node.right = yield* go(node.right, []);
    }

    if (!node) return null;

    updateHeight(node);
    const bf = balanceFactor(node);

    yield mkFrame(r.root, {
      highlightedNodes: [node.id],
      phase: 'checking',
      message: `Node ${node.value} — BF = ${bf >= 0 ? '+' : ''}${bf}${Math.abs(bf) <= 1 ? ' ✓' : ''}`,
      activeLine: 9,
    });

    if (Math.abs(bf) > 1) {
      const label = rotationLabel(bf, node);

      yield mkFrame(r.root, {
        unbalancedNode: node.id,
        phase: 'unbalanced',
        message: `Node ${node.value} unbalanced! BF=${bf >= 0 ? '+' : ''}${bf} → ${label}`,
        activeLine: 12,
      });

      if (bf > 1 && balanceFactor(node.left) >= 0) node = rotateRight(node);
      else if (bf > 1) { node.left = rotateLeft(node.left); node = rotateRight(node); }
      else if (bf < -1 && balanceFactor(node.right) <= 0) node = rotateLeft(node);
      else { node.right = rotateRight(node.right); node = rotateLeft(node); }

      yield mkFrame(node, {
        rotatingNodes: [node.id, node.left?.id, node.right?.id].filter(Boolean),
        phase: 'rotating',
        message: `${label} applied ✓`,
        activeLine: 16,
      });
    }

    return node;
  }

  root = yield* go(root, []);
  r.root = root;

  yield mkFrame(root ?? r.root, {
    phase: 'done',
    message: `✓ Delete complete — AVL tree balanced`,
    activeLine: 20,
  });

  return root;
}

// ─── Build starter AVL tree (no animation) ───────────────────────────────────

function insertAVL(node, value) {
  if (!node) return makeNode(value);
  if (value < node.value) node.left = insertAVL(node.left, value);
  else if (value > node.value) node.right = insertAVL(node.right, value);
  else return node;
  updateHeight(node);
  const bf = balanceFactor(node);
  if (bf > 1 && balanceFactor(node.left) >= 0) return rotateRight(node);
  if (bf > 1) { node.left = rotateLeft(node.left); return rotateRight(node); }
  if (bf < -1 && balanceFactor(node.right) <= 0) return rotateLeft(node);
  if (bf < -1) { node.right = rotateRight(node.right); return rotateLeft(node); }
  return node;
}

export function buildAVL(values) {
  avlNextId = 0;
  let root = null;
  for (const v of values) root = insertAVL(root, v);
  return root;
}

// ─── Info & Code ──────────────────────────────────────────────────────────────

export const avlInfo = {
  name: 'AVL Tree',
  timeComplexity: 'O(log n)',
  spaceComplexity: 'O(n)',
};

export const avlInsertCode = `function insert(node, value) {
  if (!node) return new Node(value);
  if (value < node.value)
    node.left = insert(node.left, value);
  else if (value > node.value)
    node.right = insert(node.right, value);
  else return node; // duplicate

  updateHeight(node);
  const bf = balanceFactor(node);

  // LL Case
  if (bf > 1 && value < node.left.value)
    return rotateRight(node);
  // RR Case
  if (bf < -1 && value > node.right.value)
    return rotateLeft(node);
  // LR Case
  if (bf > 1 && value > node.left.value) {
    node.left = rotateLeft(node.left);
    return rotateRight(node);
  }
  // RL Case
  if (bf < -1 && value < node.right.value) {
    node.right = rotateRight(node.right);
    return rotateLeft(node);
  }
  return node;
}`;

export const avlDeleteCode = `function remove(node, value) {
  if (!node) return null;
  if (value < node.value)
    node.left = remove(node.left, value);
  else if (value > node.value)
    node.right = remove(node.right, value);
  else {
    if (!node.left) return node.right;
    if (!node.right) return node.left;
    // inorder successor
    let succ = node.right;
    while (succ.left) succ = succ.left;
    node.value = succ.value;
    node.right = remove(node.right, succ.value);
  }
  updateHeight(node);
  return rebalance(node);
}`;

export const avlCodeMap = {
  avlInsert: avlInsertCode,
  avlDelete: avlDeleteCode,
};
