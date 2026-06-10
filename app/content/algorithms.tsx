// app/content/algorithms.tsx

export default function AlgorithmsPage() {
  return (
    <article className="prose">
      <h1>Algorithms</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#complexity">Complexity</a></li>
            <li><a href="#sorting">Sorting</a></li>
            <li><a href="#searching">Searching</a></li>
            <li><a href="#graphs">Graph Algorithms</a></li>
            <li><a href="#paradigms">Design Paradigms</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            An algorithm is a finite, well-defined sequence of steps that
            solves a problem. The right algorithm at scale can be the
            difference between milliseconds and hours.
          </p>

          <h2 id="overview">Overview</h2>
          <p>
            Picking algorithms is mostly picking <em>data structures</em>{" "}
            first — the structure constrains what operations are cheap. After
            that, the cost model (memory access, cache behavior, I/O) often
            matters more than raw Big-O.
          </p>

          <h2 id="complexity">Complexity</h2>
          <ul>
            <li><strong>O(1)</strong> — constant (hash lookup, array index).</li>
            <li><strong>O(log n)</strong> — binary search, balanced tree ops.</li>
            <li><strong>O(n)</strong> — linear scan.</li>
            <li><strong>O(n log n)</strong> — comparison-based sort, FFT.</li>
            <li><strong>O(n²)</strong> — naive pairwise (bubble sort).</li>
            <li><strong>O(2ⁿ), O(n!)</strong> — combinatorial; avoid for large n.</li>
            <li><strong>Space</strong> matters too — recursion depth, auxiliary arrays.</li>
          </ul>

          <h2 id="sorting">Sorting</h2>
          <ul>
            <li><strong>Quicksort</strong> — O(n log n) avg, O(n²) worst; in place.</li>
            <li><strong>Mergesort</strong> — O(n log n) worst; stable; O(n) extra.</li>
            <li><strong>Heapsort</strong> — O(n log n); in place; not stable.</li>
            <li><strong>Insertion sort</strong> — O(n²) but excellent on near-sorted / small n.</li>
            <li><strong>Counting / radix</strong> — O(n + k); integer keys only.</li>
            <li><strong>Timsort</strong> — hybrid; default in Python &amp; Java.</li>
          </ul>

          <h2 id="searching">Searching</h2>
          <ul>
            <li>Linear search — O(n).</li>
            <li>Binary search — O(log n) on sorted data.</li>
            <li>Hashing — O(1) expected; collisions, load factor.</li>
            <li>BFS / DFS for graphs and trees.</li>
            <li>A* — heuristic-guided shortest path.</li>
          </ul>

          <h2 id="graphs">Graph Algorithms</h2>
          <ul>
            <li><strong>Dijkstra</strong> — shortest path, non-negative weights, O((V+E) log V).</li>
            <li><strong>Bellman-Ford</strong> — handles negative edges, O(VE).</li>
            <li><strong>Floyd-Warshall</strong> — all-pairs, O(V³).</li>
            <li><strong>Kruskal / Prim</strong> — minimum spanning tree.</li>
            <li><strong>Topological sort</strong> — DAGs, scheduling.</li>
            <li><strong>Max flow</strong> — Edmonds-Karp, Dinic.</li>
          </ul>

          <h2 id="paradigms">Design Paradigms</h2>
          <ul>
            <li><strong>Divide &amp; conquer</strong> — mergesort, FFT, Karatsuba.</li>
            <li><strong>Dynamic programming</strong> — overlapping subproblems + memoization.</li>
            <li><strong>Greedy</strong> — locally optimal choices (when they work).</li>
            <li><strong>Backtracking</strong> — DFS with pruning (SAT, N-queens).</li>
            <li><strong>Branch &amp; bound</strong> — for optimization.</li>
            <li><strong>Randomized</strong> — Monte Carlo, Las Vegas.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
