import { DEFAULT_GRAPH_NODES, DEFAULT_GRAPH_EDGES } from './dijkstra';

// ─── Union-Find (Disjoint Set Union) ─────────────────────────────────────────
function makeUF(nodes) {
  const parent = {};
  const rank = {};
  nodes.forEach(n => { parent[n.id] = n.id; rank[n.id] = 0; });
  return { parent, rank };
}

function find(uf, x) {
  if (uf.parent[x] !== x) uf.parent[x] = find(uf, uf.parent[x]);
  return uf.parent[x];
}

function union(uf, x, y) {
  const rx = find(uf, x);
  const ry = find(uf, y);
  if (rx === ry) return false;
  if (uf.rank[rx] < uf.rank[ry]) { uf.parent[rx] = ry; }
  else if (uf.rank[rx] > uf.rank[ry]) { uf.parent[ry] = rx; }
  else { uf.parent[ry] = rx; uf.rank[rx]++; }
  return true;
}

function cloneUF(uf) {
  return { parent: { ...uf.parent }, rank: { ...uf.rank } };
}

// ─── Kruskal Generator ────────────────────────────────────────────────────────
export function* kruskal(
  nodes = DEFAULT_GRAPH_NODES,
  edges = DEFAULT_GRAPH_EDGES
) {
  // Sort edges by weight
  const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);
  const uf = makeUF(nodes);
  const mstEdges = [];
  const rejectedEdges = [];

  yield {
    nodes,
    edges,
    sortedEdges: [...sortedEdges],
    mstEdges: [],
    rejectedEdges: [],
    currentEdge: null,
    dsuf: cloneUF(uf),
    phase: 'init',
    message: `Edges sorted by weight: ${sortedEdges.map(e => `${e.from}-${e.to}(${e.weight})`).join(', ')}. Processing greedily…`,
    activeLine: 1,
  };

  for (const edge of sortedEdges) {
    const { from, to, weight } = edge;

    yield {
      nodes,
      edges,
      sortedEdges: [...sortedEdges],
      mstEdges: [...mstEdges],
      rejectedEdges: [...rejectedEdges],
      currentEdge: edge,
      dsuf: cloneUF(uf),
      phase: 'considering',
      message: `Considering edge ${from}–${to} (w=${weight}). Check if they are in the same component…`,
      activeLine: 5,
    };

    const rootFrom = find(uf, from);
    const rootTo = find(uf, to);

    if (rootFrom === rootTo) {
      // Would form a cycle — reject
      rejectedEdges.push(edge);

      yield {
        nodes,
        edges,
        sortedEdges: [...sortedEdges],
        mstEdges: [...mstEdges],
        rejectedEdges: [...rejectedEdges],
        currentEdge: edge,
        dsuf: cloneUF(uf),
        phase: 'rejected',
        message: `❌ Rejected ${from}–${to}: both in same component (root=${rootFrom}). Would form a cycle!`,
        activeLine: 8,
      };
    } else {
      // Accept edge — union the two sets
      union(uf, from, to);
      mstEdges.push(edge);

      yield {
        nodes,
        edges,
        sortedEdges: [...sortedEdges],
        mstEdges: [...mstEdges],
        rejectedEdges: [...rejectedEdges],
        currentEdge: edge,
        dsuf: cloneUF(uf),
        phase: 'accepted',
        message: `✅ Accepted ${from}–${to} (w=${weight})! Union(${rootFrom}, ${rootTo}). MST has ${mstEdges.length} edge${mstEdges.length !== 1 ? 's' : ''}.`,
        activeLine: 11,
      };

      if (mstEdges.length === nodes.length - 1) break;
    }
  }

  const totalWeight = mstEdges.reduce((s, e) => s + e.weight, 0);

  yield {
    nodes,
    edges,
    sortedEdges: [...sortedEdges],
    mstEdges: [...mstEdges],
    rejectedEdges: [...rejectedEdges],
    currentEdge: null,
    dsuf: cloneUF(uf),
    phase: 'done',
    message: `🎉 MST complete! ${mstEdges.length} edges, total weight = ${totalWeight}. Edges: ${mstEdges.map(e => `${e.from}-${e.to}(${e.weight})`).join(', ')}.`,
    activeLine: 14,
  };
}

// ─── Info & Code ─────────────────────────────────────────────────────────────
export const kruskalInfo = {
  name: "Kruskal's MST",
  description: "Build a Minimum Spanning Tree by greedily picking the cheapest edge that does not create a cycle, using Union-Find to detect cycles efficiently.",
  timeComplexity: 'O(E log E)',
  spaceComplexity: 'O(V)',
};

export const kruskalCode = `function kruskal(graph) {
  const edges = graph.edges.sort((a,b) => a.weight - b.weight);
  const uf = new UnionFind(graph.nodes);
  const mst = [];

  for (const { from, to, weight } of edges) {
    // Check if adding this edge creates a cycle
    if (uf.find(from) !== uf.find(to)) {
      uf.union(from, to);   // merge components
      mst.push({ from, to, weight });
      if (mst.length === graph.nodes.length - 1)
        break; // MST complete
    }
  }
  return mst;
}

// Union-Find helpers
class UnionFind {
  find(x) {
    if (this.parent[x] !== x)
      this.parent[x] = this.find(this.parent[x]);
    return this.parent[x];
  }
  union(x, y) {
    const rx = this.find(x), ry = this.find(y);
    if (rx === ry) return false;
    // Merge by rank
    if (this.rank[rx] < this.rank[ry]) this.parent[rx] = ry;
    else if (this.rank[rx] > this.rank[ry]) this.parent[ry] = rx;
    else { this.parent[ry] = rx; this.rank[rx]++; }
    return true;
  }
}`;
