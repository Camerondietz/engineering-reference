// app/content/databases.tsx

export default function DatabasesPage() {
  return (
    <article className="prose">
      <h1>Databases</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#relational">Relational (SQL)</a></li>
            <li><a href="#nosql">NoSQL</a></li>
            <li><a href="#indexes-queries">Indexes &amp; Query Plans</a></li>
            <li><a href="#transactions">Transactions &amp; ACID</a></li>
            <li><a href="#products">Common Products</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            A database is durable storage with a query language and a
            concurrency model. Pick the model that matches your access
            pattern — that decision dwarfs almost everything else.
          </p>

          <h2 id="overview">Overview</h2>
          <p>
            Two big families dominate: <strong>relational</strong> (tables,
            SQL, schemas) and <strong>NoSQL</strong> (document, key-value,
            wide-column, graph). For industrial systems, add{" "}
            <strong>time-series</strong> historians.
          </p>

          <h2 id="relational">Relational (SQL)</h2>
          <ul>
            <li>Tables, rows, columns; foreign keys enforce relationships.</li>
            <li>Normalization (1NF–3NF, BCNF) reduces redundancy; denormalize for read perf.</li>
            <li>Joins: inner, left/right outer, full outer, cross.</li>
            <li>Set operations: UNION, INTERSECT, EXCEPT.</li>
            <li>Window functions for analytics (ROW_NUMBER, RANK, LAG/LEAD).</li>
            <li>CTEs (WITH ...) and recursive CTEs.</li>
          </ul>

          <h2 id="nosql">NoSQL</h2>
          <ul>
            <li><strong>Document</strong> — MongoDB, Couchbase. JSON-like records.</li>
            <li><strong>Key-value</strong> — Redis, DynamoDB, Memcached.</li>
            <li><strong>Wide-column</strong> — Cassandra, HBase, ScyllaDB.</li>
            <li><strong>Graph</strong> — Neo4j, Neptune, ArangoDB.</li>
            <li><strong>Time-series</strong> — InfluxDB, TimescaleDB, OSIsoft PI, AVEVA Historian.</li>
            <li><strong>Search</strong> — Elasticsearch, OpenSearch, Meilisearch.</li>
          </ul>

          <h2 id="indexes-queries">Indexes &amp; Query Plans</h2>
          <ul>
            <li>B-tree index — default; range + equality.</li>
            <li>Hash index — equality only.</li>
            <li>Composite / covering indexes — match query predicates.</li>
            <li>EXPLAIN / EXPLAIN ANALYZE — read the plan; chase the slow node.</li>
            <li>Avoid SELECT *, leading wildcard LIKE, functions on indexed columns.</li>
          </ul>

          <h2 id="transactions">Transactions &amp; ACID</h2>
          <ul>
            <li><strong>Atomicity</strong> — all or nothing.</li>
            <li><strong>Consistency</strong> — constraints preserved.</li>
            <li><strong>Isolation</strong> — read uncommitted → read committed → repeatable read → serializable.</li>
            <li><strong>Durability</strong> — committed data survives crash.</li>
            <li>CAP theorem — pick two of consistency, availability, partition tolerance under partition.</li>
          </ul>

          <h2 id="products">Common Products</h2>
          <ul>
            <li><strong>OLTP:</strong> PostgreSQL, MySQL/MariaDB, SQL Server, Oracle.</li>
            <li><strong>OLAP / warehouse:</strong> Snowflake, BigQuery, Redshift, Databricks.</li>
            <li><strong>Embedded:</strong> SQLite, DuckDB.</li>
            <li><strong>Historians:</strong> AVEVA (OSIsoft) PI, GE Proficy, Ignition Tag History.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
