---
title: "Dijkstra's Shortest Path Algorithm"
topic: "Algorithms"
subtopic: "Graph Theory"
date: "2025-01-12"
description: "Finding shortest paths from a source vertex to all vertices in weighted graphs"
tags: ["graph-theory", "shortest-path", "greedy-algorithms"]
draft: false
---

# Dijkstra's Shortest Path Algorithm

Dijkstra's algorithm finds the shortest path from a source vertex to all other vertices in a weighted graph with non-negative edge weights.

## Algorithm Overview

1. Initialize distances: Set source distance to 0, all others to infinity
2. Create a priority queue (min-heap) with all vertices
3. While queue is not empty:
   - Extract vertex $u$ with minimum distance
   - For each neighbor $v$ of $u$:
     - If distance through $u$ is shorter, update distance to $v$

## Time Complexity

Using different data structures:

| Data Structure | Time Complexity |
|----------------|-----------------|
| Array | $O(V^2)$ |
| Binary Heap | $O((V + E) \log V)$ |
| Fibonacci Heap | $O(E + V \log V)$ |

where $V$ is the number of vertices and $E$ is the number of edges.

## Mathematical Formulation

For each edge $(u, v)$ with weight $w(u,v)$:

$$
d[v] = \min(d[v], d[u] + w(u,v))
$$

The algorithm maintains the **invariant**: for all extracted vertices, $d[u]$ is the shortest distance from source.

## Implementation

```python
import heapq
from collections import defaultdict

def dijkstra(graph, source):
    # Initialize distances
    distances = {vertex: float('infinity') for vertex in graph}
    distances[source] = 0

    # Priority queue: (distance, vertex)
    pq = [(0, source)]
    visited = set()

    while pq:
        current_dist, u = heapq.heappop(pq)

        # Skip if already visited
        if u in visited:
            continue
        visited.add(u)

        # Update distances to neighbors
        for v, weight in graph[u]:
            if v not in visited:
                new_dist = current_dist + weight

                if new_dist < distances[v]:
                    distances[v] = new_dist
                    heapq.heappush(pq, (new_dist, v))

    return distances

# Example usage
graph = {
    'A': [('B', 4), ('C', 2)],
    'B': [('C', 1), ('D', 5)],
    'C': [('D', 8), ('E', 10)],
    'D': [('E', 2)],
    'E': []
}

distances = dijkstra(graph, 'A')
print(distances)  # {'A': 0, 'B': 4, 'C': 2, 'D': 9, 'E': 11}
```

## Path Reconstruction

To reconstruct the actual shortest paths, maintain a predecessor array:

```python
def dijkstra_with_path(graph, source):
    distances = {vertex: float('infinity') for vertex in graph}
    distances[source] = 0
    predecessors = {vertex: None for vertex in graph}

    pq = [(0, source)]
    visited = set()

    while pq:
        current_dist, u = heapq.heappop(pq)

        if u in visited:
            continue
        visited.add(u)

        for v, weight in graph[u]:
            if v not in visited:
                new_dist = current_dist + weight

                if new_dist < distances[v]:
                    distances[v] = new_dist
                    predecessors[v] = u
                    heapq.heappush(pq, (new_dist, v))

    return distances, predecessors

def reconstruct_path(predecessors, source, target):
    path = []
    current = target

    while current is not None:
        path.append(current)
        current = predecessors[current]

    return path[::-1]  # Reverse to get source -> target
```

## Limitations

1. **Non-negative weights only**: For negative weights, use Bellman-Ford
2. **Single source**: For all-pairs shortest paths, use Floyd-Warshall
3. **Optimal substructure**: Path must be optimal at every step

## Applications

- **GPS Navigation**: Finding shortest routes
- **Network Routing**: Determining optimal packet paths
- **Social Networks**: Finding degrees of separation
- **Game AI**: Pathfinding for NPCs

## Comparison with Other Algorithms

- **vs Bellman-Ford**: Dijkstra faster but requires non-negative weights
- **vs A***: A* uses heuristics for faster goal-directed search
- **vs BFS**: BFS for unweighted graphs (equivalent to Dijkstra with unit weights)
