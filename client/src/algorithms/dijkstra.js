// ─── Default Graph ────────────────────────────────────────────────────────────
// 7 nodes (A–G), weighted undirected edges for Dijkstra / Kruskal
export const DEFAULT_GRAPH_NODES = [
  { id: 'A', label: 'A', x: 120, y: 240 },
  { id: 'B', label: 'B', x: 280, y: 100 },
  { id: 'C', label: 'C', x: 280, y: 380 },
  { id: 'D', label: 'D', x: 460, y: 240 },
  { id: 'E', label: 'E', x: 620, y: 100 },
  { id: 'F', label: 'F', x: 620, y: 380 },
  { id: 'G', label: 'G', x: 780, y: 240 },
];

export const DEFAULT_GRAPH_EDGES = [
  { from: 'A', to: 'B', weight: 4 },
  { from: 'A', to: 'C', weight: 2 },
  { from: 'B', to: 'D', weight: 5 },
  { from: 'B', to: 'C', weight: 1 },
  { from: 'C', to: 'D', weight: 8 },
  { from: 'C', to: 'F', weight: 10 },
  { from: 'D', to: 'E', weight: 2 },
  { from: 'D', to: 'F', weight: 6 },
  { from: 'E', to: 'G', weight: 3 },
  { from: 'F', to: 'G', weight: 1 },
];

// Build adjacency list from edges (undirected)
function buildAdjacency(nodes, edges) {
  const adj = {};
  nodes.forEach(n => { adj[n.id] = []; });
  edges.forEach(({ from, to, weight }) => {
    adj[from].push({ node: to, weight });
    adj[to].push({ node: from, weight });
  });
  return adj;
}

// ─── Dijkstra Generator ───────────────────────────────────────────────────────
export function* dijkstra(
  nodes = DEFAULT_GRAPH_NODES,
  edges = DEFAULT_GRAPH_EDGES,
  source = 'A'
) {
  const adj = buildAdjacency(nodes, edges);
  const INF = Infinity;

  // Initialize distances
  const dist = {};
  const prev = {};
  const visited = new Set();
  nodes.forEach(n => { dist[n.id] = INF; prev[n.id] = null; });
  dist[source] = 0;

  // Min-priority queue (simple array for small graphs)
  const pq = [{ node: source, dist: 0 }];

  yield {
    nodes,
    edges,
    distances: { ...dist },
    visited: [...visited],
    currentNode: null,
    relaxedEdge: null,
    prevMap: { ...prev },
    phase: 'init',
    message: `Starting Dijkstra from node ${source}. All distances = ∞ except ${source} = 0.`,
    activeLine: 1,
  };

  while (pq.length > 0) {
    // Extract minimum
    pq.sort((a, b) => a.dist - b.dist);
    const { node: u } = pq.shift();

    if (visited.has(u)) continue;
    visited.add(u);

    yield {
      nodes,
      edges,
      distances: { ...dist },
      visited: [...visited],
      currentNode: u,
      relaxedEdge: null,
      prevMap: { ...prev },
      phase: 'visiting',
      message: `Visiting node ${u} (dist = ${dist[u]}). Checking its neighbors…`,
      activeLine: 6,
    };

    for (const { node: v, weight } of adj[u]) {
      if (visited.has(v)) continue;

      const newDist = dist[u] + weight;

      yield {
        nodes,
        edges,
        distances: { ...dist },
        visited: [...visited],
        currentNode: u,
        relaxedEdge: { from: u, to: v },
        prevMap: { ...prev },
        phase: 'relaxing',
        message: `Edge ${u}→${v}: dist[${u}]=${dist[u]} + w=${weight} = ${newDist}. Current dist[${v}]=${dist[v] === INF ? '∞' : dist[v]}.`,
        activeLine: 9,
      };

      if (newDist < dist[v]) {
        dist[v] = newDist;
        prev[v] = u;
        pq.push({ node: v, dist: newDist });

        yield {
          nodes,
          edges,
          distances: { ...dist },
          visited: [...visited],
          currentNode: u,
          relaxedEdge: { from: u, to: v },
          prevMap: { ...prev },
          phase: 'updated',
          message: `✅ Relaxed! dist[${v}] updated to ${newDist}.`,
          activeLine: 11,
        };
      }
    }
  }

  // Build final shortest-path edges
  const pathEdges = [];
  nodes.forEach(n => {
    if (prev[n.id]) pathEdges.push({ from: prev[n.id], to: n.id });
  });

  yield {
    nodes,
    edges,
    distances: { ...dist },
    visited: [...visited],
    currentNode: null,
    relaxedEdge: null,
    prevMap: { ...prev },
    pathEdges,
    phase: 'done',
    message: `Done! Shortest distances from ${source}: ${nodes.map(n => `${n.id}=${dist[n.id] === INF ? '∞' : dist[n.id]}`).join(', ')}.`,
    activeLine: 16,
  };
}

// ─── Info & Code ─────────────────────────────────────────────────────────────
export const dijkstraInfo = {
  name: "Dijkstra's SSSP",
  description: "Find the shortest path from a source node to all other nodes in a weighted graph using a greedy approach with a priority queue.",
  timeComplexity: 'O((V + E) log V)',
  spaceComplexity: 'O(V)',
};

export const dijkstraCode = `function dijkstra(graph, source) {
  const dist = {}; // dist[v] = shortest known dist
  const prev = {}; // prev[v] = preceding node
  const visited = new Set();
  const pq = new MinPriorityQueue();

  // Initialize
  for (const v of graph.nodes) dist[v] = Infinity;
  dist[source] = 0;
  pq.enqueue(source, 0);

  while (!pq.isEmpty()) {
    const u = pq.dequeue(); // min dist node
    if (visited.has(u)) continue;
    visited.add(u);

    for (const { node: v, weight } of graph.adj[u]) {
      if (visited.has(v)) continue;
      const newDist = dist[u] + weight;
      if (newDist < dist[v]) {   // relaxation
        dist[v] = newDist;
        prev[v] = u;
        pq.enqueue(v, newDist);
      }
    }
  }
  return { dist, prev };
}`;
