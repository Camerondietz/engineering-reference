// app/content/virtualization.tsx

export default function VirtualizationPage() {
  return (
    <article className="prose">
      <h1>Virtualization</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#hypervisor-types">Hypervisor Types</a></li>
            <li><a href="#concepts">Core Concepts</a></li>
            <li><a href="#vms-vs-containers">VMs vs Containers</a></li>
            <li><a href="#platforms">Platforms</a></li>
            <li><a href="#operations">Operations</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            Virtualization abstracts physical hardware so multiple isolated
            operating systems can share the same host. It is the foundation
            of modern data centers, cloud platforms, and many industrial
            server consolidations.
          </p>

          <h2 id="overview">Overview</h2>
          <p>
            The hypervisor presents virtual CPUs, memory, storage, and
            network adapters to each VM. Modern CPUs (Intel VT-x, AMD-V,
            ARM virt) provide hardware extensions that make this near-native
            in performance.
          </p>

          <h2 id="hypervisor-types">Hypervisor Types</h2>
          <ul>
            <li><strong>Type 1 (bare-metal)</strong> — ESXi, Hyper-V Server, KVM, Xen, Proxmox VE.</li>
            <li><strong>Type 2 (hosted)</strong> — VMware Workstation/Fusion, VirtualBox, Parallels.</li>
          </ul>

          <h2 id="concepts">Core Concepts</h2>
          <ul>
            <li>vCPU pinning, NUMA awareness, CPU ready time.</li>
            <li>Memory overcommit, ballooning, transparent page sharing.</li>
            <li>Thin vs thick provisioning.</li>
            <li>Snapshots — point-in-time; not a backup.</li>
            <li>Live migration (vMotion, Hyper-V Live Migration) — zero-downtime moves.</li>
            <li>SR-IOV and PCIe pass-through for high-performance I/O.</li>
          </ul>

          <h2 id="vms-vs-containers">VMs vs Containers</h2>
          <ul>
            <li>VM — full OS, strong isolation, heavier (GBs).</li>
            <li>Container — shared kernel, lightweight (MBs), faster start.</li>
            <li>Both have a place; many environments run containers on top of VMs.</li>
          </ul>

          <h2 id="platforms">Platforms</h2>
          <ul>
            <li><strong>VMware vSphere / ESXi</strong> + vCenter — enterprise standard.</li>
            <li><strong>Microsoft Hyper-V</strong> + System Center / Failover Clustering.</li>
            <li><strong>KVM / QEMU</strong> + libvirt — Linux native.</li>
            <li><strong>Proxmox VE</strong> — KVM + LXC web UI.</li>
            <li><strong>Nutanix AHV, Citrix XenServer, Oracle VM.</strong></li>
            <li>HCI: Nutanix, vSAN, Azure Stack HCI.</li>
          </ul>

          <h2 id="operations">Operations</h2>
          <ul>
            <li>Right-size VMs — over-allocated vCPUs hurt performance.</li>
            <li>Use clusters with HA + DRS / affinity rules.</li>
            <li>Back up at hypervisor level (Veeam, Commvault, Nakivo).</li>
            <li>Patch hosts in rolling maintenance with live migration.</li>
            <li>Monitor CPU ready, memory swap, storage latency.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
