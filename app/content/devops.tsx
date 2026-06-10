// app/content/devops.tsx

export default function DevopsPage() {
  return (
    <article className="prose">
      <h1>DevOps</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#pillars">Pillars</a></li>
            <li><a href="#ci-cd">CI/CD</a></li>
            <li><a href="#iac">Infrastructure as Code</a></li>
            <li><a href="#observability">Observability</a></li>
            <li><a href="#tools">Tools</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            DevOps unifies software development and IT operations. The goal:
            ship changes faster, more reliably, with shorter feedback loops
            — by automating builds, tests, deployments, and operations.
          </p>

          <h2 id="overview">Overview</h2>
          <p>
            The reference metrics come from DORA: <strong>deployment
            frequency, lead time for change, change failure rate, mean time
            to restore</strong>. Elite performers deploy on demand, in under
            an hour, with &lt;15% failures, and recover in &lt;1 hour.
          </p>

          <h2 id="pillars">Pillars</h2>
          <ul>
            <li><strong>Culture</strong> — shared ownership; no &ldquo;throw over the wall&rdquo;.</li>
            <li><strong>Automation</strong> — everything that can be a script.</li>
            <li><strong>Lean flow</strong> — small batches, trunk-based development.</li>
            <li><strong>Measurement</strong> — DORA, SLOs, error budgets.</li>
            <li><strong>Sharing</strong> — internal docs, runbooks, blameless postmortems.</li>
          </ul>

          <h2 id="ci-cd">CI/CD</h2>
          <ul>
            <li>CI — every commit builds, tests, lints, packages.</li>
            <li>CD — every green build is potentially deployable.</li>
            <li>Strategies: blue/green, canary, feature flags, dark launches.</li>
            <li>Artifact registries: Docker Hub, ECR, Artifactory, GitHub Packages.</li>
            <li>Pipelines: GitHub Actions, GitLab CI, Jenkins, CircleCI, Argo CD, Tekton.</li>
          </ul>

          <h2 id="iac">Infrastructure as Code</h2>
          <ul>
            <li><strong>Terraform / OpenTofu</strong> — cloud-agnostic resource provisioning.</li>
            <li><strong>Pulumi</strong> — IaC in real programming languages.</li>
            <li><strong>CloudFormation, Bicep, ARM</strong> — vendor-specific.</li>
            <li><strong>Ansible, Chef, Puppet, Salt</strong> — config management.</li>
            <li><strong>Helm, Kustomize</strong> — Kubernetes packaging.</li>
            <li>State management &amp; remote backends are non-optional.</li>
          </ul>

          <h2 id="observability">Observability</h2>
          <ul>
            <li>Three pillars: metrics, logs, traces.</li>
            <li>OpenTelemetry for instrumentation.</li>
            <li>SLO/SLI/SLA: define what &ldquo;working&rdquo; means; alert on burn rate.</li>
            <li>Tools: Prometheus + Grafana, Datadog, New Relic, Dynatrace, Honeycomb, Splunk, ELK/EFK.</li>
          </ul>

          <h2 id="tools">Tools</h2>
          <ul>
            <li>Version control: Git, GitHub, GitLab, Bitbucket.</li>
            <li>Containers: Docker, Podman, BuildKit.</li>
            <li>Orchestration: Kubernetes, ECS, Nomad.</li>
            <li>Secrets: Vault, AWS Secrets Manager, SOPS.</li>
            <li>Incident: PagerDuty, Opsgenie, Statuspage.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
