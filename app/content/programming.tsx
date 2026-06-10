// app/content/programming.tsx

export default function ProgrammingPage() {
  return (
    <article className="prose">
      <h1>Programming</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#paradigms">Paradigms</a></li>
            <li><a href="#languages">Common Languages</a></li>
            <li><a href="#fundamentals">Fundamentals</a></li>
            <li><a href="#tooling">Tooling</a></li>
            <li><a href="#good-practice">Good Practice</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            Programming is the craft of writing instructions a computer can
            execute reliably. Good code is correct first, readable second,
            and clever last — in that order.
          </p>

          <h2 id="overview">Overview</h2>
          <p>
            Every program comes down to three primitives: <strong>sequence,
            selection, iteration</strong> — and a way to package them
            (functions, classes, modules). Most of what makes a codebase
            maintainable is naming, structure, and tests, not language
            choice.
          </p>

          <h2 id="paradigms">Paradigms</h2>
          <ul>
            <li><strong>Imperative</strong> — step-by-step state changes (C).</li>
            <li><strong>Object-oriented</strong> — encapsulation, inheritance, polymorphism (Java, C#).</li>
            <li><strong>Functional</strong> — pure functions, immutability (Haskell, Elixir, F#).</li>
            <li><strong>Procedural / structured</strong> — functions over data (Go, classic C).</li>
            <li><strong>Declarative</strong> — describe the result, not the steps (SQL, HTML).</li>
            <li><strong>Concurrent / async</strong> — threads, coroutines, actors, channels.</li>
          </ul>

          <h2 id="languages">Common Languages</h2>
          <ul>
            <li><strong>Systems:</strong> C, C++, Rust, Go, Zig.</li>
            <li><strong>Application:</strong> Python, Java, C#, Kotlin, Swift.</li>
            <li><strong>Web:</strong> JavaScript, TypeScript, PHP, Ruby.</li>
            <li><strong>Data &amp; scientific:</strong> Python, R, Julia, MATLAB.</li>
            <li><strong>Industrial:</strong> IEC 61131-3 (Ladder, ST, FBD), G-code, RAPID, KRL.</li>
          </ul>

          <h2 id="fundamentals">Fundamentals</h2>
          <ul>
            <li>Types — primitive, composite, generics.</li>
            <li>Control flow — if/else, loops, recursion, exceptions.</li>
            <li>Memory — stack vs heap, pointers vs references, GC vs manual.</li>
            <li>I/O — files, sockets, stdin/stdout, async vs blocking.</li>
            <li>Concurrency — threads, locks, channels, atomics.</li>
          </ul>

          <h2 id="tooling">Tooling</h2>
          <ul>
            <li><strong>Editors / IDEs:</strong> VS Code, JetBrains, Vim/Neovim, Emacs.</li>
            <li><strong>Version control:</strong> Git (+ GitHub, GitLab, Bitbucket).</li>
            <li><strong>Build / package:</strong> npm, pip, cargo, Maven, Gradle, Make, CMake, Bazel.</li>
            <li><strong>Test:</strong> pytest, JUnit, Jest, Go test, RSpec.</li>
            <li><strong>Lint / format:</strong> ESLint, Prettier, Black, Ruff, gofmt, clang-format.</li>
          </ul>

          <h2 id="good-practice">Good Practice</h2>
          <ul>
            <li>Small functions; single responsibility.</li>
            <li>Explicit over implicit; name things for what they mean.</li>
            <li>Fail fast — validate inputs at the boundary.</li>
            <li>Test the contract, not the implementation.</li>
            <li>Code review is the highest-ROI quality activity.</li>
            <li>Commit small, commit often, with clear messages.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
