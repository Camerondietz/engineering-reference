// app/content/cloud-computing.tsx

export default function CloudComputingPage() {
  return (
    <article className="prose">
      <h1>Cloud Computing</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#service-models">Service Models</a></li>
            <li><a href="#deployment-models">Deployment Models</a></li>
            <li><a href="#core-services">Core Services</a></li>
            <li><a href="#design-patterns">Design Patterns</a></li>
            <li><a href="#providers">Providers</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            Cloud computing delivers on-demand compute, storage, networking,
            and platform services over the internet, billed by usage. It
            trades upfront capex for opex and engineering effort for
            managed services.
          </p>

          <h2 id="overview">Overview</h2>
          <p>
            The advantage is elasticity and managed services; the trap is
            sprawl, lock-in, and unbounded bills. Sound architecture, cost
            tagging, and FinOps practices are as important as the technical
            design.
          </p>

          <h2 id="service-models">Service Models</h2>
          <ul>
            <li><strong>IaaS</strong> — VMs, networks, storage (EC2, GCE, Azure VM).</li>
            <li><strong>PaaS</strong> — managed runtimes &amp; databases (App Engine, App Service, Heroku).</li>
            <li><strong>SaaS</strong> — finished applications (Microsoft 365, Salesforce).</li>
            <li><strong>FaaS / Serverless</strong> — event-driven functions (Lambda, Cloud Functions, Azure Functions).</li>
            <li><strong>CaaS</strong> — managed containers (ECS, GKE, AKS, Cloud Run).</li>
          </ul>

          <h2 id="deployment-models">Deployment Models</h2>
          <ul>
            <li>Public, private, hybrid, multi-cloud.</li>
            <li>Edge cloud — compute close to data (CloudFront Functions, Cloudflare Workers).</li>
            <li>Sovereign / regulated clouds (GovCloud, EU sovereign).</li>
          </ul>

          <h2 id="core-services">Core Services</h2>
          <ul>
            <li><strong>Compute</strong> — VMs, containers, serverless.</li>
            <li><strong>Storage</strong> — object (S3), block (EBS), file (EFS/NFS).</li>
            <li><strong>Networking</strong> — VPC, subnets, load balancers, CDN, VPN, DNS.</li>
            <li><strong>Databases</strong> — RDS, DynamoDB, Cosmos DB, BigQuery.</li>
            <li><strong>Identity</strong> — IAM, roles, policies, federation.</li>
            <li><strong>Observability</strong> — CloudWatch, Stackdriver, Azure Monitor.</li>
            <li><strong>AI/ML</strong> — SageMaker, Vertex AI, Azure ML, Bedrock.</li>
          </ul>

          <h2 id="design-patterns">Design Patterns</h2>
          <ul>
            <li>Stateless compute + external state.</li>
            <li>Auto-scaling groups + load balancers.</li>
            <li>Multi-AZ for HA; multi-region for DR.</li>
            <li>Event-driven (SQS, EventBridge, Pub/Sub).</li>
            <li>Infrastructure as code (Terraform, Pulumi, CloudFormation, Bicep).</li>
            <li>Least privilege IAM; secret managers; KMS-managed keys.</li>
          </ul>

          <h2 id="providers">Providers</h2>
          <ul>
            <li><strong>AWS</strong> — broadest service catalog.</li>
            <li><strong>Microsoft Azure</strong> — strong with Microsoft stack &amp; hybrid.</li>
            <li><strong>Google Cloud</strong> — data &amp; AI strengths.</li>
            <li><strong>Oracle Cloud, IBM Cloud, Alibaba Cloud.</strong></li>
            <li><strong>Niche / dev:</strong> Cloudflare, Fly.io, Vercel, DigitalOcean, Hetzner.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
