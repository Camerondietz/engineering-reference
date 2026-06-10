// app/content/operating-systems.tsx

export default function OperatingSystemsPage() {
  return (
    <article className="prose">
      <h1>Operating Systems</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#processes-threads">Processes &amp; Threads</a></li>
            <li><a href="#memory">Memory Management</a></li>
            <li><a href="#filesystem-io">Filesystems &amp; I/O</a></li>
            <li><a href="#scheduling">Scheduling</a></li>
            <li><a href="#families">OS Families</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            An operating system manages hardware resources and gives
            programs a clean, multiplexed view of them. Its job: schedule
            CPU time, allocate memory, mediate I/O, and isolate processes.
          </p>

          <h2 id="overview">Overview</h2>
          <p>
            User-space code talks to the kernel through{" "}
            <strong>system calls</strong>. The kernel runs in privileged
            mode; everything else is sandboxed. Modern kernels are mostly
            monolithic (Linux, Windows NT) with loadable modules.
          </p>

          <h2 id="processes-threads">Processes &amp; Threads</h2>
          <ul>
            <li><strong>Process</strong> — isolated address space, own page tables, PID.</li>
            <li><strong>Thread</strong> — shares memory within a process; cheaper context switch.</li>
            <li>IPC: pipes, FIFOs, sockets, shared memory, message queues, signals.</li>
            <li>Synchronization: mutex, semaphore, condition variable, RW lock, atomics.</li>
            <li>Hazards: deadlock, livelock, priority inversion, race condition.</li>
          </ul>

          <h2 id="memory">Memory Management</h2>
          <ul>
            <li>Virtual memory + paging — typical page 4 KiB, huge pages 2 MiB / 1 GiB.</li>
            <li>TLB caches recent translations.</li>
            <li>Page faults — minor (allocate) vs major (disk).</li>
            <li>Allocators: brk/sbrk, mmap, slab, jemalloc, tcmalloc.</li>
            <li>OOM killer (Linux) reclaims pages under pressure.</li>
          </ul>

          <h2 id="filesystem-io">Filesystems &amp; I/O</h2>
          <ul>
            <li>POSIX filesystems: ext4, XFS, btrfs, ZFS, APFS.</li>
            <li>Windows: NTFS, ReFS.</li>
            <li>Inodes, dentries, journals, copy-on-write, snapshots.</li>
            <li>Block / character / network devices.</li>
            <li>Async I/O: epoll, kqueue, io_uring, IOCP.</li>
          </ul>

          <h2 id="scheduling">Scheduling</h2>
          <ul>
            <li>Preemptive multitasking; time slices (jiffies, ticks).</li>
            <li>Linux CFS &amp; EEVDF; real-time policies SCHED_FIFO, SCHED_RR.</li>
            <li>RTOS: FreeRTOS, Zephyr, VxWorks, QNX, RTEMS — used in embedded &amp; safety systems.</li>
            <li>Priority inheritance to prevent inversion.</li>
          </ul>

          <h2 id="families">OS Families</h2>
          <ul>
            <li><strong>Unix-like:</strong> Linux distros, *BSD, macOS (Darwin), Solaris.</li>
            <li><strong>Windows:</strong> NT-based (10, 11, Server 2019/2022/2025).</li>
            <li><strong>Mobile:</strong> Android (Linux), iOS (Darwin).</li>
            <li><strong>RTOS:</strong> see above.</li>
            <li><strong>Industrial:</strong> Windows IoT, Linux with PREEMPT_RT, VxWorks.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
