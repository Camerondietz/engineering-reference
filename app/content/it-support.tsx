// app/content/it-support.tsx

export default function ItSupportPage() {
  return (
    <article className="prose">
      <h1>IT Support</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#tiers">Support Tiers</a></li>
            <li><a href="#workflow">Ticket Workflow</a></li>
            <li><a href="#common-issues">Common Issues</a></li>
            <li><a href="#tools">Tools</a></li>
            <li><a href="#certifications">Certifications</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            IT support keeps users and systems running — provisioning,
            troubleshooting, recovery, and documenting fixes so they don&rsquo;t
            recur. Good support combines technical skill with calm
            communication under time pressure.
          </p>

          <h2 id="overview">Overview</h2>
          <p>
            ITIL is the canonical framework. Daily work centers on{" "}
            <strong>incident, problem, change, request,</strong> and{" "}
            <strong>knowledge</strong> management — each backed by a
            ticketing system and an SLA.
          </p>

          <h2 id="tiers">Support Tiers</h2>
          <ul>
            <li><strong>Tier 1</strong> — front line; password resets, account unlocks, basic triage.</li>
            <li><strong>Tier 2</strong> — desktop/server admins; deeper troubleshooting.</li>
            <li><strong>Tier 3</strong> — engineers, vendor specialists, escalations.</li>
            <li><strong>Tier 4</strong> — vendor / OEM support.</li>
          </ul>

          <h2 id="workflow">Ticket Workflow</h2>
          <ol>
            <li>Receive (portal, email, phone, chat).</li>
            <li>Classify, prioritize (impact × urgency).</li>
            <li>Assign to queue / technician.</li>
            <li>Reproduce, diagnose, resolve.</li>
            <li>Document the fix in the knowledge base.</li>
            <li>Confirm resolution with the user; close.</li>
            <li>If recurring → open a problem ticket for root cause.</li>
          </ol>

          <h2 id="common-issues">Common Issues</h2>
          <ul>
            <li>Authentication — locked accounts, expired passwords, MFA reset.</li>
            <li>Connectivity — Wi-Fi, VPN, DNS, proxy, firewall, certificate.</li>
            <li>Printing — driver, queue, network share, color management.</li>
            <li>Email — quota, spam quarantine, Outlook profile, mailbox migration.</li>
            <li>Hardware — disk full, RAM, battery, power supply, peripherals.</li>
            <li>Application — install/repair, license, group membership.</li>
            <li>Performance — startup items, malware, fragmentation, telemetry.</li>
          </ul>

          <h2 id="tools">Tools</h2>
          <ul>
            <li><strong>ITSM:</strong> ServiceNow, Jira Service Management, Freshservice, Zendesk.</li>
            <li><strong>RMM:</strong> ConnectWise Automate, NinjaOne, Datto, N-able.</li>
            <li><strong>Remote control:</strong> ScreenConnect, TeamViewer, AnyDesk, Quick Assist.</li>
            <li><strong>Endpoint management:</strong> Intune, SCCM, Jamf, Workspace ONE.</li>
            <li><strong>Imaging:</strong> MDT, Autopilot, Clonezilla, FOG.</li>
          </ul>

          <h2 id="certifications">Certifications</h2>
          <ul>
            <li><strong>CompTIA</strong> A+, Network+, Security+.</li>
            <li><strong>Microsoft</strong> MD-102, AZ-104.</li>
            <li><strong>ITIL 4 Foundation.</strong></li>
            <li><strong>Cisco</strong> CCNA.</li>
            <li><strong>HDI</strong> Customer Service Representative.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
