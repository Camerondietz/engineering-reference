// app/content/linux.tsx

export default function LinuxPage() {
  return (
    <article className="prose">
      <h1>Linux</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#filesystem">Filesystem &amp; Layout</a></li>
            <li><a href="#commands">Essential Commands</a></li>
            <li><a href="#services">Services &amp; systemd</a></li>
            <li><a href="#users-perms">Users &amp; Permissions</a></li>
            <li><a href="#distros">Distros</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            Linux is a free, Unix-like operating system kernel that powers
            most servers, embedded devices, and supercomputers. Daily work
            happens in a shell — usually <code>bash</code> or <code>zsh</code>{" "}
            — and through systemd-managed services.
          </p>

          <h2 id="overview">Overview</h2>
          <p>
            A &ldquo;Linux system&rdquo; bundles the kernel with userland tools (GNU
            coreutils, BusyBox), a service manager (systemd, OpenRC), a
            package manager, and optional desktop. Distros differ mostly in
            package manager, release cadence, and defaults.
          </p>

          <h2 id="filesystem">Filesystem &amp; Layout</h2>
          <ul>
            <li><code>/etc</code> — config files.</li>
            <li><code>/var</code> — logs, caches, spool.</li>
            <li><code>/usr</code> — installed binaries &amp; libraries.</li>
            <li><code>/home</code> — user data.</li>
            <li><code>/opt</code> — third-party / vendor software.</li>
            <li><code>/proc</code>, <code>/sys</code> — kernel and device interfaces.</li>
            <li><code>/tmp</code> — ephemeral, cleared on reboot.</li>
          </ul>

          <h2 id="commands">Essential Commands</h2>
          <ul>
            <li><strong>Navigation:</strong> <code>ls</code>, <code>cd</code>, <code>pwd</code>, <code>find</code>, <code>tree</code>.</li>
            <li><strong>Files:</strong> <code>cp</code>, <code>mv</code>, <code>rm</code>, <code>ln -s</code>, <code>chmod</code>, <code>chown</code>.</li>
            <li><strong>Inspection:</strong> <code>cat</code>, <code>less</code>, <code>head</code>, <code>tail -f</code>, <code>grep</code>, <code>awk</code>, <code>sed</code>, <code>jq</code>.</li>
            <li><strong>Processes:</strong> <code>ps</code>, <code>top</code>, <code>htop</code>, <code>kill</code>, <code>nice</code>, <code>renice</code>.</li>
            <li><strong>Network:</strong> <code>ip a</code>, <code>ss -tlnp</code>, <code>ping</code>, <code>curl</code>, <code>dig</code>, <code>nmap</code>.</li>
            <li><strong>Storage:</strong> <code>df -h</code>, <code>du -sh</code>, <code>lsblk</code>, <code>mount</code>, <code>fdisk</code>, <code>parted</code>.</li>
            <li><strong>Archives:</strong> <code>tar czf</code>, <code>tar xzf</code>, <code>zstd</code>, <code>gzip</code>.</li>
          </ul>

          <h2 id="services">Services &amp; systemd</h2>
          <ul>
            <li><code>systemctl status / start / stop / restart / enable / disable name</code>.</li>
            <li><code>journalctl -u name -f</code> — follow logs.</li>
            <li>Unit files live in <code>/etc/systemd/system/</code>.</li>
            <li>Timers replace most cron jobs.</li>
            <li><code>systemd-analyze blame</code> finds slow boot units.</li>
          </ul>

          <h2 id="users-perms">Users &amp; Permissions</h2>
          <ul>
            <li><code>chmod 755 file</code> — owner rwx, group rx, world rx.</li>
            <li>Setuid/setgid/sticky bits (4/2/1) — special permissions.</li>
            <li><code>sudo -i</code>, <code>su -</code> — elevate privileges.</li>
            <li><code>useradd</code>, <code>groupadd</code>, <code>usermod -aG group user</code>.</li>
            <li>SSH keys in <code>~/.ssh/authorized_keys</code> beat passwords.</li>
          </ul>

          <h2 id="distros">Distros</h2>
          <ul>
            <li><strong>Debian / Ubuntu</strong> — apt; widely deployed.</li>
            <li><strong>RHEL / Rocky / AlmaLinux / Fedora</strong> — dnf; enterprise.</li>
            <li><strong>Arch</strong> — pacman; rolling.</li>
            <li><strong>Alpine</strong> — apk; small; popular in containers.</li>
            <li><strong>Yocto / Buildroot</strong> — custom embedded builds.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
