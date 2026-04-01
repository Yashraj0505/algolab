/**
 * Binary Tree Builder — generator that yields visualization frames.
 */
export function* binaryTreeBuilder(mode, data) {
  const tree = { root: null, nodes: [] };

  if (mode === 'manual') {
    for (const value of data) {
      tree.root = insert(tree.root, value, tree.nodes);
      yield { ...tree, lastInserted: value };
    }
  } else {
    const values = Array.from({ length: data.count || 7 }, () =>
      Math.floor(Math.random() * 100) + 1
    );
    for (const value of values) {
      tree.root = insert(tree.root, value, tree.nodes);
      yield { ...tree, lastInserted: value };
    }
  }
}

function insert(node, value, nodes) {
  if (!node) {
    const newNode = { value, left: null, right: null, id: nodes.length };
    nodes.push(newNode);
    return newNode;
  }
  if (value < node.value) {
    node.left = insert(node.left, value, nodes);
  } else {
    node.right = insert(node.right, value, nodes);
  }
  return node;
}

export function* inorder(node) {
  if (!node) return;
  yield* inorder(node.left);
  yield { highlight: node };
  yield* inorder(node.right);
}

export function* preorder(node) {
  if (!node) return;
  yield { highlight: node };
  yield* preorder(node.left);
  yield* preorder(node.right);
}

export function* postorder(node) {
  if (!node) return;
  yield* postorder(node.left);
  yield* postorder(node.right);
  yield { highlight: node };
}

export const binaryTreeInfo = {
  name: 'Binary Tree Builder',
  description: 'Build binary search trees manually or auto-generate them.',
};
