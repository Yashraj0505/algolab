// ─── Red-Black Tree — generator-based animation ──────────────────────────────

const RED = 'RED';
const BLACK = 'BLACK';
let rbtNextId = 0;

function makeNode(value) {
  return { id: rbtNextId++, value, color: RED, left: null, right: null, parent: null };
}

// Deep clone without parent refs (for frame snapshots)
function cloneTree(node) {
  if (!node) return null;
  const n = { id: node.id, value: node.value, color: node.color, left: null, right: null };
  n.left = cloneTree(node.left);
  n.right = cloneTree(node.right);
  return n;
}

function isRed(node) { return node !== null && node.color === RED; }
function setColor(node, color) { if (node) node.color = color; }

// Compute black-height map: node.id -> black-height (blacks from node to leaf, not counting node itself)
function computeBlackHeights(node, map = new Map()) {
  if (!node) return 0;
  const l = computeBlackHeights(node.left, map);
  const r = computeBlackHeights(node.right, map);
  const bh = Math.max(l, r) + (node.color === BLACK ? 1 : 0);
  map.set(node.id, bh);
  return bh;
}

function countNodes(node) {
  if (!node) return 0;
  return 1 + countNodes(node.left) + countNodes(node.right);
}

function mkFrame(root, opts = {}) {
  const bhMap = new Map();
  computeBlackHeights(root, bhMap);
  return {
    root: cloneTree(root),
    blackHeights: bhMap,
    highlightedNodes: [],
    rotatingNodes: [],
    recoloredNodes: [],
    phase: 'idle',
    message: '',
    activeLine: 1,
    ...opts,
  };
}

// ─── Rotations (in-place, returns new subtree root) ──────────────────────────

function rotateLeft(root, x) {
  const y = x.right;
  x.right = y.left;
  if (y.left) y.left.parent = x;
  y.parent = x.parent;
  if (!x.parent) root = y;
  else if (x === x.parent.left) x.parent.left = y;
  else x.parent.right = y;
  y.left = x;
  x.parent = y;
  return root;
}

function rotateRight(root, x) {
  const y = x.left;
  x.left = y.right;
  if (y.right) y.right.parent = x;
  y.parent = x.parent;
  if (!x.parent) root = y;
  else if (x === x.parent.right) x.parent.right = y;
  else x.parent.left = y;
  y.right = x;
  x.parent = y;
  return root;
}

function getRoot(node) {
  while (node.parent) node = node.parent;
  return node;
}

// ─── Insert Fix-up ────────────────────────────────────────────────────────────

function* insertFixup(root, z) {
  while (z.parent && z.parent.color === RED) {
    const parent = z.parent;
    const grandparent = parent.parent;
    if (!grandparent) break;

    if (parent === grandparent.left) {
      const uncle = grandparent.right;
      if (uncle && uncle.color === RED) {
        // Case 1: Uncle is RED → recolor
        yield mkFrame(root, {
          highlightedNodes: [z.id, parent.id, uncle.id, grandparent.id],
          recoloredNodes: [parent.id, uncle.id, grandparent.id],
          phase: 'recoloring',
          message: `Case 1: Uncle RED → Recolor parent, uncle BLACK; grandparent RED`,
          activeLine: 5,
        });
        setColor(parent, BLACK);
        setColor(uncle, BLACK);
        setColor(grandparent, RED);
        z = grandparent;
      } else {
        if (z === parent.right) {
          // Case 2: Triangle (LR) → left rotate parent
          yield mkFrame(root, {
            highlightedNodes: [z.id, parent.id, grandparent.id],
            rotatingNodes: [parent.id, z.id],
            phase: 'rotating',
            message: `Case 2: Triangle (LR) → Left rotate parent`,
            activeLine: 8,
          });
          z = parent;
          root = rotateLeft(root, z);
        }
        // Case 3: Line (LL) → right rotate grandparent
        const p = z.parent;
        const gp = p.parent;
        yield mkFrame(root, {
          highlightedNodes: [z.id, p.id, gp.id],
          rotatingNodes: [p.id, gp.id],
          phase: 'rotating',
          message: `Case 3: Line (LL) → Right rotate grandparent, swap colors`,
          activeLine: 11,
        });
        setColor(p, BLACK);
        setColor(gp, RED);
        root = rotateRight(root, gp);
      }
    } else {
      // Mirror cases
      const uncle = grandparent.left;
      if (uncle && uncle.color === RED) {
        yield mkFrame(root, {
          highlightedNodes: [z.id, parent.id, uncle.id, grandparent.id],
          recoloredNodes: [parent.id, uncle.id, grandparent.id],
          phase: 'recoloring',
          message: `Case 1 (mirror): Uncle RED → Recolor parent, uncle BLACK; grandparent RED`,
          activeLine: 5,
        });
        setColor(parent, BLACK);
        setColor(uncle, BLACK);
        setColor(grandparent, RED);
        z = grandparent;
      } else {
        if (z === parent.left) {
          yield mkFrame(root, {
            highlightedNodes: [z.id, parent.id, grandparent.id],
            rotatingNodes: [parent.id, z.id],
            phase: 'rotating',
            message: `Case 2 (mirror): Triangle (RL) → Right rotate parent`,
            activeLine: 8,
          });
          z = parent;
          root = rotateRight(root, z);
        }
        const p = z.parent;
        const gp = p.parent;
        yield mkFrame(root, {
          highlightedNodes: [z.id, p.id, gp.id],
          rotatingNodes: [p.id, gp.id],
          phase: 'rotating',
          message: `Case 3 (mirror): Line (RR) → Left rotate grandparent, swap colors`,
          activeLine: 11,
        });
        setColor(p, BLACK);
        setColor(gp, RED);
        root = rotateLeft(root, gp);
      }
    }
    root = getRoot(root);
  }
  root = getRoot(root);
  root.color = BLACK;
  return root;
}

// ─── RBT Insert generator ─────────────────────────────────────────────────────

export function* rbtInsert(root, value) {
  rbtNextId = countNodes(root);

  // BST insert
  const z = makeNode(value);
  let y = null;
  let x = root;
  const path = [];

  while (x !== null) {
    y = x;
    path.push(x.id);
    yield mkFrame(root, {
      highlightedNodes: [...path],
      phase: 'traversing',
      message: `Comparing ${value} with ${x.value} → go ${value < x.value ? 'left ←' : value > x.value ? 'right →' : 'duplicate!'}`,
      activeLine: 2,
    });
    if (value === x.value) {
      yield mkFrame(root, { highlightedNodes: [x.id], phase: 'duplicate', message: `${value} already exists!`, activeLine: 3 });
      return root;
    }
    x = value < x.value ? x.left : x.right;
  }

  z.parent = y;
  if (!y) {
    root = z;
  } else if (value < y.value) {
    y.left = z;
  } else {
    y.right = z;
  }

  yield mkFrame(root, {
    highlightedNodes: [z.id],
    phase: 'inserted',
    message: `Inserted ${value} as RED node — now fixing violations`,
    activeLine: 4,
  });

  root = yield* insertFixup(root, z);
  root = getRoot(root);

  yield mkFrame(root, {
    highlightedNodes: [z.id],
    phase: 'done',
    message: `✓ ${value} inserted — Red-Black properties restored`,
    activeLine: 14,
  });

  return root;
}

// ─── Delete helpers ───────────────────────────────────────────────────────────

function rbTransplant(root, u, v) {
  if (!u.parent) root = v;
  else if (u === u.parent.left) u.parent.left = v;
  else u.parent.right = v;
  if (v) v.parent = u.parent;
  return root;
}

function treeMinimum(node) {
  while (node.left) node = node.left;
  return node;
}

// Sentinel nil node for delete fixup
function makeNil(parent) {
  return { id: -1, value: null, color: BLACK, left: null, right: null, parent };
}

function* deleteFixup(root, x, xParent) {
  while (x !== root && (!x || x.color === BLACK)) {
    if (x === (xParent ? xParent.left : null)) {
      let w = xParent ? xParent.right : null;
      if (w && w.color === RED) {
        // Case 1: Sibling is RED
        yield mkFrame(root, {
          highlightedNodes: [xParent?.id, w?.id].filter(Boolean),
          rotatingNodes: [xParent?.id, w?.id].filter(Boolean),
          phase: 'rotating',
          message: `Delete Case 1: Sibling RED → Recolor & Left rotate parent`,
          activeLine: 20,
        });
        setColor(w, BLACK);
        setColor(xParent, RED);
        root = rotateLeft(root, xParent);
        root = getRoot(root);
        w = xParent.right;
      }
      if ((!w?.left || w.left.color === BLACK) && (!w?.right || w.right.color === BLACK)) {
        // Case 2: Sibling BLACK, both children BLACK
        yield mkFrame(root, {
          highlightedNodes: [xParent?.id, w?.id].filter(Boolean),
          recoloredNodes: [w?.id].filter(Boolean),
          phase: 'recoloring',
          message: `Delete Case 2: Sibling BLACK, no red child → Recolor sibling RED`,
          activeLine: 22,
        });
        setColor(w, RED);
        x = xParent;
        xParent = x.parent;
      } else {
        if (!w?.right || w.right.color === BLACK) {
          // Case 3: Sibling BLACK, left child RED
          yield mkFrame(root, {
            highlightedNodes: [w?.id, w?.left?.id].filter(Boolean),
            rotatingNodes: [w?.id, w?.left?.id].filter(Boolean),
            phase: 'rotating',
            message: `Delete Case 3: Sibling BLACK, left child RED → Right rotate sibling`,
            activeLine: 24,
          });
          setColor(w?.left, BLACK);
          setColor(w, RED);
          root = rotateRight(root, w);
          root = getRoot(root);
          w = xParent.right;
        }
        // Case 4: Sibling BLACK, right child RED
        yield mkFrame(root, {
          highlightedNodes: [xParent?.id, w?.id, w?.right?.id].filter(Boolean),
          rotatingNodes: [xParent?.id, w?.id].filter(Boolean),
          phase: 'rotating',
          message: `Delete Case 4: Sibling BLACK, right child RED → Left rotate parent`,
          activeLine: 26,
        });
        setColor(w, xParent ? xParent.color : BLACK);
        setColor(xParent, BLACK);
        setColor(w?.right, BLACK);
        root = rotateLeft(root, xParent);
        root = getRoot(root);
        x = root;
        xParent = null;
      }
    } else {
      // Mirror
      let w = xParent ? xParent.left : null;
      if (w && w.color === RED) {
        yield mkFrame(root, {
          highlightedNodes: [xParent?.id, w?.id].filter(Boolean),
          rotatingNodes: [xParent?.id, w?.id].filter(Boolean),
          phase: 'rotating',
          message: `Delete Case 1 (mirror): Sibling RED → Recolor & Right rotate parent`,
          activeLine: 20,
        });
        setColor(w, BLACK);
        setColor(xParent, RED);
        root = rotateRight(root, xParent);
        root = getRoot(root);
        w = xParent.left;
      }
      if ((!w?.right || w.right.color === BLACK) && (!w?.left || w.left.color === BLACK)) {
        yield mkFrame(root, {
          highlightedNodes: [xParent?.id, w?.id].filter(Boolean),
          recoloredNodes: [w?.id].filter(Boolean),
          phase: 'recoloring',
          message: `Delete Case 2 (mirror): Sibling BLACK, no red child → Recolor sibling RED`,
          activeLine: 22,
        });
        setColor(w, RED);
        x = xParent;
        xParent = x.parent;
      } else {
        if (!w?.left || w.left.color === BLACK) {
          yield mkFrame(root, {
            highlightedNodes: [w?.id, w?.right?.id].filter(Boolean),
            rotatingNodes: [w?.id, w?.right?.id].filter(Boolean),
            phase: 'rotating',
            message: `Delete Case 3 (mirror): Sibling BLACK, right child RED → Left rotate sibling`,
            activeLine: 24,
          });
          setColor(w?.right, BLACK);
          setColor(w, RED);
          root = rotateLeft(root, w);
          root = getRoot(root);
          w = xParent.left;
        }
        yield mkFrame(root, {
          highlightedNodes: [xParent?.id, w?.id, w?.left?.id].filter(Boolean),
          rotatingNodes: [xParent?.id, w?.id].filter(Boolean),
          phase: 'rotating',
          message: `Delete Case 4 (mirror): Sibling BLACK, left child RED → Right rotate parent`,
          activeLine: 26,
        });
        setColor(w, xParent ? xParent.color : BLACK);
        setColor(xParent, BLACK);
        setColor(w?.left, BLACK);
        root = rotateRight(root, xParent);
        root = getRoot(root);
        x = root;
        xParent = null;
      }
    }
  }
  if (x) x.color = BLACK;
  return getRoot(root);
}

// ─── RBT Delete generator ─────────────────────────────────────────────────────

export function* rbtDelete(root, value) {
  // Find node
  let z = root;
  const path = [];
  while (z) {
    path.push(z.id);
    yield mkFrame(root, {
      highlightedNodes: [...path],
      phase: 'searching',
      message: `Searching: ${value} ${value < z.value ? '< ' + z.value + ' → left' : value > z.value ? '> ' + z.value + ' → right' : '= ' + z.value + ' found!'}`,
      activeLine: 16,
    });
    if (value === z.value) break;
    z = value < z.value ? z.left : z.right;
  }

  if (!z) {
    yield mkFrame(root, { phase: 'notfound', message: `✗ ${value} not found`, activeLine: 17 });
    return root;
  }

  yield mkFrame(root, {
    highlightedNodes: [z.id],
    phase: 'deleting',
    message: `Found ${value} — deleting node`,
    activeLine: 18,
  });

  let y = z;
  let yOrigColor = y.color;
  let x = null;
  let xParent = null;

  if (!z.left) {
    x = z.right;
    xParent = z.parent;
    root = rbTransplant(root, z, z.right);
  } else if (!z.right) {
    x = z.left;
    xParent = z.parent;
    root = rbTransplant(root, z, z.left);
  } else {
    y = treeMinimum(z.right);
    yOrigColor = y.color;
    x = y.right;
    if (y.parent === z) {
      xParent = y;
    } else {
      xParent = y.parent;
      root = rbTransplant(root, y, y.right);
      y.right = z.right;
      if (y.right) y.right.parent = y;
    }
    root = rbTransplant(root, z, y);
    y.left = z.left;
    if (y.left) y.left.parent = y;
    y.color = z.color;
  }

  if (!root) {
    yield mkFrame(null, { phase: 'done', message: `✓ ${value} deleted — tree is now empty`, activeLine: 28 });
    return null;
  }

  root = getRoot(root);

  if (yOrigColor === BLACK) {
    yield mkFrame(root, {
      phase: 'recoloring',
      message: `Deleted node was BLACK → fixing double-black`,
      activeLine: 19,
    });
    root = yield* deleteFixup(root, x, xParent);
  }

  root = getRoot(root);
  root.color = BLACK;

  yield mkFrame(root, {
    phase: 'done',
    message: `✓ ${value} deleted — Red-Black properties restored`,
    activeLine: 28,
  });

  return root;
}

// ─── RBT Search generator ─────────────────────────────────────────────────────

export function* rbtSearch(root, value) {
  let node = root;
  const path = [];
  while (node) {
    path.push(node.id);
    yield mkFrame(root, {
      highlightedNodes: [...path],
      phase: 'searching',
      message: `Comparing ${value} with ${node.value} → ${value < node.value ? 'go left ←' : value > node.value ? 'go right →' : 'found! ✓'}`,
      activeLine: value < node.value ? 30 : value > node.value ? 31 : 32,
    });
    if (value === node.value) {
      yield mkFrame(root, { highlightedNodes: [node.id], phase: 'found', message: `✓ ${value} found!`, activeLine: 32 });
      return root;
    }
    node = value < node.value ? node.left : node.right;
  }
  yield mkFrame(root, { phase: 'notfound', message: `✗ ${value} not found`, activeLine: 33 });
  return root;
}

// ─── Build starter RBT (no animation) ────────────────────────────────────────

function insertRBT(root, value) {
  rbtNextId = countNodes(root);
  const gen = rbtInsert(root, value);
  let result = root;
  let next = gen.next();
  while (!next.done) next = gen.next();
  // generator return value is the new root
  // We need to run it to completion and get the root from last frame
  return next.value ?? root;
}

export function buildRBT(values) {
  rbtNextId = 0;
  let root = null;
  for (const v of values) {
    // Run generator to completion
    const gen = rbtInsert(root, v);
    let res = gen.next();
    while (!res.done) res = gen.next();
    root = res.value ?? root;
    if (root) root = getRoot(root);
  }
  return root;
}

// ─── Info & Code ──────────────────────────────────────────────────────────────

export const rbtInfo = {
  name: 'Red-Black Tree',
  timeComplexity: 'O(log n)',
  spaceComplexity: 'O(n)',
};

export const rbtInsertCode = `function insert(root, value) {
  // 1. BST insert, color new node RED
  let z = new Node(value, RED);
  bstInsert(root, z);

  // 2. Fix violations
  while (z.parent?.color === RED) {
    if (uncle.color === RED) {
      // Case 1: Recolor
      parent.color = uncle.color = BLACK;
      grandparent.color = RED;
      z = grandparent;
    } else if (triangle) {
      // Case 2: Rotate to make line
      rotate(parent);
    } else {
      // Case 3: Rotate grandparent + recolor
      rotate(grandparent);
      swap colors;
    }
  }
  root.color = BLACK;
}`;

export const rbtDeleteCode = `function delete(root, value) {
  // Find node z
  let z = search(root, value);
  let yOrigColor = z.color;

  if (!z.left) transplant(z, z.right);
  else if (!z.right) transplant(z, z.left);
  else {
    // Inorder successor
    y = minimum(z.right);
    yOrigColor = y.color;
    transplant(y, y.right);
    replace(z, y);
  }

  if (yOrigColor === BLACK)
    deleteFixup(x); // fix double-black
}`;

export const rbtSearchCode = `function search(root, value) {
  let node = root;
  while (node) {
    if (value < node.value)
      node = node.left;   // go left
    else if (value > node.value)
      node = node.right;  // go right
    else
      return node;        // found!
  }
  return null; // not found
}`;

export const rbtCodeMap = {
  rbtInsert: rbtInsertCode,
  rbtDelete: rbtDeleteCode,
  rbtSearch: rbtSearchCode,
};
