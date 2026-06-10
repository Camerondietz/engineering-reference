// app/content/cybersecurity.tsx

export default function CybersecurityPage() {
  return (
    <article className="prose">
      <h1>Cybersecurity</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#cia-triad">CIA Triad &amp; AAA</a></li>
            <li><a href="#threats">Threats &amp; Attack Types</a></li>
            <li><a href="#controls">Controls</a></li>
            <li><a href="#frameworks">Frameworks &amp; Standards</a></li>
            <li><a href="#tools">Tools</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            Cybersecurity protects information and systems from unauthorized
            access, disruption, or modification. In industrial environments
            it spans OT and IT — and the cost of failure is measured in
            downtime, safety, and physical damage.
          </p>

          <h2 id="overview">Overview</h2>
          <p>
            The defender&rsquo;s job is to reduce attack surface, detect
            intrusions early, and recover quickly. Defense in depth assumes
            any one layer will fail.
          </p>

          <h2 id="cia-triad">CIA Triad &amp; AAA</h2>
          <ul>
            <li><strong>Confidentiality</strong> — only authorized parties read data.</li>
            <li><strong>Integrity</strong> — data is unaltered and trustworthy.</li>
            <li><strong>Availability</strong> — systems are reachable when needed.</li>
            <li><strong>Authentication</strong> — prove identity.</li>
            <li><strong>Authorization</strong> — grant scoped access (RBAC, ABAC, least privilege).</li>
            <li><strong>Accounting / Auditing</strong> — log what happened.</li>
          </ul>

          <h2 id="threats">Threats &amp; Attack Types</h2>
          <ul>
            <li>Phishing, spear-phishing, business email compromise.</li>
            <li>Malware — ransomware, RAT, worm, rootkit, supply-chain.</li>
            <li>Credential attacks — brute force, password spraying, credential stuffing.</li>
            <li>Web — SQLi, XSS, CSRF, SSRF, IDOR (OWASP Top 10).</li>
            <li>Network — MITM, ARP spoof, DNS poisoning, DDoS.</li>
            <li>OT-specific — PLC logic tampering, HMI compromise, lateral movement IT→OT.</li>
          </ul>

          <h2 id="controls">Controls</h2>
          <ul>
            <li>MFA, password managers, hardware tokens (FIDO2/WebAuthn).</li>
            <li>Patch management, EDR/XDR, application allow-listing.</li>
            <li>Network segmentation, firewalls, IDS/IPS.</li>
            <li>Backups (3-2-1) tested for restore.</li>
            <li>Incident response plan, tabletop exercises.</li>
            <li>Security awareness training.</li>
          </ul>

          <h2 id="frameworks">Frameworks &amp; Standards</h2>
          <ul>
            <li><strong>NIST CSF</strong> (Identify, Protect, Detect, Respond, Recover).</li>
            <li><strong>NIST SP 800-53 / 800-171</strong>.</li>
            <li><strong>ISO/IEC 27001 / 27002</strong>.</li>
            <li><strong>CIS Controls v8</strong>.</li>
            <li><strong>IEC 62443</strong> — industrial automation &amp; control systems security.</li>
            <li><strong>SOC 2</strong>, <strong>PCI DSS</strong>, <strong>HIPAA</strong>.</li>
          </ul>

          <h2 id="tools">Tools</h2>
          <ul>
            <li><strong>Recon / pen-test:</strong> nmap, Burp Suite, Metasploit, Kali Linux.</li>
            <li><strong>Forensics:</strong> Wireshark, Volatility, Autopsy.</li>
            <li><strong>SIEM / SOAR:</strong> Splunk, Elastic, Sentinel, QRadar.</li>
            <li><strong>Vulnerability:</strong> Nessus, Qualys, OpenVAS.</li>
            <li><strong>OT:</strong> Dragos, Claroty, Nozomi.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
