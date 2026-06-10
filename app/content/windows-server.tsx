// app/content/windows-server.tsx

export default function WindowsServerPage() {
  return (
    <article className="prose">
      <h1>Windows Server</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#roles">Common Roles</a></li>
            <li><a href="#active-directory">Active Directory</a></li>
            <li><a href="#powershell">PowerShell</a></li>
            <li><a href="#hyper-v">Hyper-V</a></li>
            <li><a href="#patching">Patching &amp; Hardening</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            Windows Server is Microsoft&rsquo;s server OS family. It is the
            backbone of identity (Active Directory), file/print, virtualization
            (Hyper-V), and Microsoft application stacks (SQL Server,
            Exchange, SharePoint, IIS) in most enterprise environments.
          </p>

          <h2 id="overview">Overview</h2>
          <p>
            Recent supported versions: 2019, 2022, 2025. Editions split into
            <strong> Standard</strong> and <strong>Datacenter</strong>;
            Datacenter gives unlimited Windows VM rights and Storage Spaces
            Direct. Install options: Desktop Experience or Server Core.
          </p>

          <h2 id="roles">Common Roles</h2>
          <ul>
            <li>Active Directory Domain Services (AD DS).</li>
            <li>DNS, DHCP.</li>
            <li>File &amp; Storage Services (SMB, DFS, iSCSI).</li>
            <li>Hyper-V virtualization.</li>
            <li>IIS web server.</li>
            <li>Remote Desktop Services (RDS).</li>
            <li>Windows Server Update Services (WSUS).</li>
            <li>Print &amp; certificate services (AD CS).</li>
          </ul>

          <h2 id="active-directory">Active Directory</h2>
          <ul>
            <li>Forest → domain → OU → object.</li>
            <li>Group Policy (GPO) — central config push to users/computers.</li>
            <li>Sites &amp; replication; FSMO roles (Schema, Domain Naming, PDC, RID, Infrastructure).</li>
            <li>Kerberos auth; LDAP queries; SYSVOL replication via DFS-R.</li>
            <li>Trust types: external, forest, realm, shortcut.</li>
          </ul>

          <h2 id="powershell">PowerShell</h2>
          <ul>
            <li>Object-pipeline shell — <code>Get-Service | Where Status -eq &apos;Running&apos;</code>.</li>
            <li>Modules: ActiveDirectory, Hyper-V, DNSServer, GroupPolicy, Pester.</li>
            <li>Remoting: <code>Enter-PSSession</code>, <code>Invoke-Command</code> over WinRM.</li>
            <li>Desired State Configuration (DSC) for idempotent config.</li>
            <li>PowerShell 7 (cross-platform) coexists with built-in 5.1.</li>
          </ul>

          <h2 id="hyper-v">Hyper-V</h2>
          <ul>
            <li>Type-1 hypervisor, free with Windows Server.</li>
            <li>Generation 1 (BIOS) vs Generation 2 (UEFI + Secure Boot) VMs.</li>
            <li>Live Migration, Failover Clustering, Storage Migration.</li>
            <li>Checkpoints (standard / production) — not a backup.</li>
            <li>Integration Services for guest enlightenment.</li>
          </ul>

          <h2 id="patching">Patching &amp; Hardening</h2>
          <ul>
            <li>WSUS, Windows Update for Business, SCCM/Intune, Azure Update Manager.</li>
            <li>Microsoft Security Baselines (Security Compliance Toolkit).</li>
            <li>Disable SMBv1, enforce SMB signing, prefer LDAPS over LDAP.</li>
            <li>LAPS for local admin password rotation.</li>
            <li>Restrict NTLM; deploy Credential Guard, Device Guard.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
