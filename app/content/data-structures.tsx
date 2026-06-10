// app/content/data-structures.tsx

export default function DataStructuresPage() {
  return (
    <article className="prose">
      <h1>Data Structures</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#linear">Linear Structures</a></li>
            <li><a href="#trees">Trees</a></li>
            <li><a href="#hash">Hash-Based</a></li>
            <li><a href="#graphs">Graphs</a></li>
            <li><a href="#choosing">Choosing One</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            Data structures organize values so that operations on them are
            cheap. Picking the right structure usually beats micro-optimizing
            the wrong one.
          </p>

          <h2 id="overview">Overview</h2>
          <p>
            Trade-offs are universal: structures fast at lookup are often
            slow at insertion; ordered structures cost more to maintain than
            unordered; cache-friendly contiguous layouts beat &ldquo;asymptotically
            better&rdquo; ones at small n.
          </p>

          <h2 id="linear">Linear Structures</h2>
          <ul>
            <li><strong>Array</strong> — O(1) index, O(n) insert/delete in middle. Cache friendly.</li>
            <li><strong>Dynamic array (vector / list)</strong> — amortized O(1) append.</li>
            <li><strong>Linked list</strong> — O(1) insert/delete given node; O(n) lookup. Poor cache behavior.</li>
            <li><strong>Stack</strong> — LIFO; push/pop O(1).</li>
            <li><strong>Queue / Deque</strong> — FIFO; ring buffer or linked list.</li>
            <li><strong>String</strong> — usually a specialized array; immutable in many languages.</li>
          </ul>

          <h2 id="trees">Trees</h2>
          <ul>
            <li><strong>Binary tree</strong> — generic recursive structure.</li>
            <li><strong>BST</strong> — ordered; O(log n) avg, O(n) worst (degenerate).</li>
            <li><strong>Balanced BST</strong> — AVL, Red-Black; guaranteed O(log n).</li>
            <li><strong>B-tree / B+ tree</strong> — high fan-out; backbone of databases &amp; filesystems.</li>
            <li><strong>Heap</strong> — priority queue; insert &amp; extract O(log n).</li>
            <li><strong>Trie</strong> — prefix search on strings.</li>
            <li><strong>Segment / Fenwick tree</strong> — range queries.</li>
          </ul>

          <h2 id="hash">Hash-Based</h2>
          <ul>
            <li><strong>Hash map / set</strong> — expected O(1) lookup, insert, delete.</li>
            <li>Collision strategies: chaining, open addressing (linear, quadratic, double).</li>
            <li>Load factor target: ~0.5–0.75 for open addressing, higher for chaining.</li>
            <li><strong>Bloom filter</strong> — probabilistic set; no false negatives.</li>
            <li><strong>HyperLogLog</strong> — cardinality estimation in O(1) memory.</li>
          </ul>

          <h2 id="graphs">Graphs</h2>
          <ul>
            <li>Representation: <strong>adjacency list</strong> (sparse) or <strong>adjacency matrix</strong> (dense).</li>
            <li>Directed / undirected; weighted / unweighted; cyclic / acyclic.</li>
            <li>Union-Find (DSU) — near-O(1) connectivity queries.</li>
          </ul>

          <h2 id="choosing">Choosing One</h2>
          <ul>
            <li>Need ordered iteration → balanced BST or sorted array.</li>
            <li>Need fastest lookup by key → hash map.</li>
            <li>Need range queries → B-tree, segment tree.</li>
            <li>Need FIFO scheduling → deque or priority queue.</li>
            <li>Need duplicate detection at scale → Bloom filter + DB.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
