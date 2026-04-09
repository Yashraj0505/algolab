// ─── Default DAG ──────────────────────────────────────────────────────────────
// 6 nodes representing a task dependency graph
export const TOPO_NODES = [
  { id: '0', label: 'A\n(Compile)', x: 120,  y: 200 },
  { id: '1', label: 'B\n(Test)',    x: 300,  y: 80  },
  { id: '2', label: 'C\n(Lint)',    x: 300,  y: 320 },
  { id: '3', label: 'D\n(Build)',   x: 500,  y: 200 },
  { id: '4', label: 'E\n(Package)', x: 680,  y: 80  },
  { id: '5', label: 'F\n(Deploy)',  x: 680,  y: 320 },
];

// Directed edges (dependencies)
export const TOPO_EDGES = [
  { from: '0', to: '1' },
  { from: '0', to: '2' },
  { from: '1', to: '3' },
  { from: '2', to: '3' },
  { from: '3', to: '4' },
  { from: '3', to: '5' },
];

// Build adjacency list (directed)
function buildAdj(nodes, edges) {
  const adj = {};
  nodes.forEach(n => { adj[n.id] = []; });
  edges.forEach(({ from, to }) => { adj[from].push(to); });
  return adj;
}

// ─── Topological Sort Generator (iterative DFS) ───────────────────────────────
export function* topoSort(
  nodes = TOPO_NODES,
  edges = TOPO_EDGES
) {
  const adj = buildAdj(nodes, edges);
  const visited = new Set();
  const inStack = new Set();   // for cycle detection
  const result = [];           // nodes in topo order (pushed on finish)

  let frames = [];

  // We'll collect all DFS frames first using a sync sub-generator, then yield
  // Actually, let's use an iterative approach with explicit stack

  const WHITE = 'unvisited';
  const GRAY  = 'inStack';
  const BLACK = 'visited';

  const color = {};
  nodes.forEach(n => { color[n.id] = WHITE; });

  // Stack entries: { node, neighborIdx }
  const dfsStack = [];

  yield {
    nodes,
    edges,
    color: { ...color },
    dfsStack: [],
    result: [],
    currentNode: null,
    phase: 'init',
    message: 'Starting Topological Sort. Will run DFS and push nodes to a stack on finish.',
    activeLine: 1,
  };

  for (const start of nodes.map(n => n.id)) {
    if (color[start] !== WHITE) continue;

    dfsStack.push({ node: start, neighborIdx: 0 });
    color[start] = GRAY;
    inStack.add(start);

    yield {
      nodes,
      edges,
      color: { ...color },
      dfsStack: dfsStack.map(e => e.node),
      result: [...result],
      currentNode: start,
      phase: 'push',
      message: `DFS from ${nodes.find(n => n.id === start).label.split('\n')[0]}. Marking as IN-STACK (gray).`,
      activeLine: 3,
    };

    while (dfsStack.length > 0) {
      const top = dfsStack[dfsStack.length - 1];
      const { node: u } = top;
      const neighbors = adj[u];

      if (top.neighborIdx < neighbors.length) {
        const v = neighbors[top.neighborIdx];
        top.neighborIdx++;

        yield {
          nodes,
          edges,
          color: { ...color },
          dfsStack: dfsStack.map(e => e.node),
          result: [...result],
          currentNode: u,
          currentEdge: { from: u, to: v },
          phase: 'exploring',
          message: `Exploring edge ${nodes.find(n=>n.id===u).label.split('\n')[0]} → ${nodes.find(n=>n.id===v).label.split('\n')[0]}. Neighbor is ${color[v] === WHITE ? 'unvisited' : color[v]}.`,
          activeLine: 6,
        };

        if (color[v] === WHITE) {
          color[v] = GRAY;
          inStack.add(v);
          dfsStack.push({ node: v, neighborIdx: 0 });

          yield {
            nodes,
            edges,
            color: { ...color },
            dfsStack: dfsStack.map(e => e.node),
            result: [...result],
            currentNode: v,
            currentEdge: { from: u, to: v },
            phase: 'push',
            message: `Pushed ${nodes.find(n=>n.id===v).label.split('\n')[0]} onto DFS stack. Marking gray.`,
            activeLine: 8,
          };
        }
      } else {
        // All neighbors of u explored — pop and record
        dfsStack.pop();
        color[u] = BLACK;
        inStack.delete(u);
        result.unshift(u); // push to front → topo order

        yield {
          nodes,
          edges,
          color: { ...color },
          dfsStack: dfsStack.map(e => e.node),
          result: [...result],
          currentNode: u,
          currentEdge: null,
          phase: 'finished',
          message: `✅ ${nodes.find(n=>n.id===u).label.split('\n')[0]} finished! Added to front of result. Order so far: [${result.map(id => nodes.find(n=>n.id===id).label.split('\n')[0]).join(' → ')}]`,
          activeLine: 11,
        };
      }
    }
  }

  yield {
    nodes,
    edges,
    color: { ...color },
    dfsStack: [],
    result: [...result],
    currentNode: null,
    currentEdge: null,
    phase: 'done',
    message: `🎉 Topological Order: ${result.map(id => nodes.find(n=>n.id===id).label.split('\n')[0]).join(' → ')}`,
    activeLine: 14,
  };
}

// ─── Info & Code ─────────────────────────────────────────────────────────────
export const topoSortInfo = {
  name: 'Topological Sort',
  description: 'Order vertices in a Directed Acyclic Graph (DAG) such that every directed edge u→v has u before v. Uses iterative DFS with a finish stack.',
  timeComplexity: 'O(V + E)',
  spaceComplexity: 'O(V)',
};

export const topoSortCode = `function topoSort(graph) {
  const color = {}; // WHITE / GRAY / BLACK
  const result = [];

  function dfs(u) {
    color[u] = 'GRAY'; // in current DFS path

    for (const v of graph.adj[u]) {
      if (color[v] === 'GRAY')
        throw new Error('Cycle detected!'); // not a DAG
      if (color[v] === 'WHITE')
        dfs(v); // recurse
    }

    color[u] = 'BLACK'; // fully explored
    result.unshift(u);  // prepend → topo order
  }

  for (const v of graph.nodes) {
    color[v] = 'WHITE';
  }
  for (const v of graph.nodes) {
    if (color[v] === 'WHITE') dfs(v);
  }

  return result;
}`;
