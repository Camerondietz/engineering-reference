// app/content/web-development.tsx

export default function WebDevelopmentPage() {
  return (
    <article className="prose">
      <h1>Web Development</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#frontend">Frontend</a></li>
            <li><a href="#backend">Backend</a></li>
            <li><a href="#data-layer">Data Layer</a></li>
            <li><a href="#deployment">Build &amp; Deployment</a></li>
            <li><a href="#performance-security">Performance &amp; Security</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            Web development builds applications delivered through a browser
            or HTTP API — from a static landing page to a real-time
            multiplayer app or a global SaaS platform.
          </p>

          <h2 id="overview">Overview</h2>
          <p>
            Every web app is a stack: <strong>browser → network → app server
            → data store</strong>. Modern teams add CDNs, edge runtimes, and
            asynchronous job queues. The architecture decisions usually
            matter more than the framework.
          </p>

          <h2 id="frontend">Frontend</h2>
          <ul>
            <li>HTML, CSS, JavaScript / TypeScript — the unavoidable trio.</li>
            <li>Frameworks: <strong>React, Vue, Svelte, Solid, Angular</strong>.</li>
            <li>Meta-frameworks: <strong>Next.js, Nuxt, SvelteKit, Remix, Astro</strong>.</li>
            <li>Styling: Tailwind, CSS Modules, vanilla-extract, styled-components.</li>
            <li>State: Redux/RTK, Zustand, Pinia, Jotai, TanStack Query.</li>
            <li>Accessibility: semantic HTML, ARIA, WCAG 2.2.</li>
          </ul>

          <h2 id="backend">Backend</h2>
          <ul>
            <li><strong>Node.js</strong> (Express, Fastify, NestJS).</li>
            <li><strong>Python</strong> (FastAPI, Django, Flask).</li>
            <li><strong>Go</strong> (net/http, Gin, Echo).</li>
            <li><strong>Java/Kotlin</strong> (Spring Boot, Ktor).</li>
            <li><strong>C#</strong> (ASP.NET Core).</li>
            <li><strong>Ruby</strong> (Rails), <strong>PHP</strong> (Laravel, Symfony).</li>
            <li>APIs: REST, GraphQL, tRPC, gRPC, WebSocket.</li>
          </ul>

          <h2 id="data-layer">Data Layer</h2>
          <ul>
            <li>SQL: Postgres, MySQL, SQLite, SQL Server.</li>
            <li>NoSQL: MongoDB, Redis, DynamoDB.</li>
            <li>ORMs: Prisma, Drizzle, TypeORM, SQLAlchemy, Hibernate.</li>
            <li>Object storage: S3, R2, GCS, Azure Blob.</li>
            <li>Queues: SQS, RabbitMQ, Kafka, Redis Streams.</li>
          </ul>

          <h2 id="deployment">Build &amp; Deployment</h2>
          <ul>
            <li>Bundlers: Vite, Webpack, Rspack, esbuild, Turbopack, Parcel.</li>
            <li>CI/CD: GitHub Actions, GitLab CI, CircleCI, Jenkins.</li>
            <li>Hosts: Vercel, Netlify, Cloudflare Pages, Fly.io, Render, AWS, GCP, Azure.</li>
            <li>Containers + orchestration: Docker, Kubernetes, ECS, Cloud Run.</li>
          </ul>

          <h2 id="performance-security">Performance &amp; Security</h2>
          <ul>
            <li>Core Web Vitals: LCP, INP, CLS.</li>
            <li>Caching: HTTP cache, CDN, service worker, Redis.</li>
            <li>OWASP Top 10 — XSS, SQLi, CSRF, IDOR, SSRF.</li>
            <li>CSP, HSTS, SameSite cookies, Subresource Integrity.</li>
            <li>Authn/Authz: OAuth 2.0 / OIDC, JWT, session cookies, RBAC.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
