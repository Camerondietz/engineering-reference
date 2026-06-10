// app/content/embedded-systems.tsx

export default function EmbeddedSystemsPage() {
  return (
    <article className="prose">
      <h1>Embedded Systems</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#microcontrollers">Microcontrollers</a></li>
            <li><a href="#peripherals">Peripherals &amp; Buses</a></li>
            <li><a href="#rtos">RTOS &amp; Bare-Metal</a></li>
            <li><a href="#firmware">Firmware Practices</a></li>
            <li><a href="#tools">Tools</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            Embedded systems are computers built into a larger product —
            engine controllers, washing machines, drones, medical pumps,
            industrial sensors. They run a focused job under hard constraints
            on power, cost, and time.
          </p>

          <h2 id="overview">Overview</h2>
          <p>
            Embedded engineers live close to the metal: registers,
            interrupts, DMA, watchdogs, bootloaders. The reward is
            determinism — you can usually account for every cycle.
          </p>

          <h2 id="microcontrollers">Microcontrollers</h2>
          <ul>
            <li><strong>ARM Cortex-M</strong> — M0/M0+/M3/M4/M7/M33 (STM32, NXP Kinetis, Nordic nRF, Microchip SAM).</li>
            <li><strong>RISC-V</strong> — ESP32-C3/C6, GD32V, SiFive.</li>
            <li><strong>AVR</strong> — ATmega, ATtiny (Arduino).</li>
            <li><strong>PIC</strong> — Microchip PIC16/18/24/32.</li>
            <li><strong>Espressif</strong> — ESP32 / ESP8266 with Wi-Fi/BLE.</li>
            <li><strong>SoCs / SoMs</strong> — i.MX, Zynq, Jetson when you need Linux.</li>
          </ul>

          <h2 id="peripherals">Peripherals &amp; Buses</h2>
          <ul>
            <li><strong>GPIO</strong>, pull-ups, open-drain.</li>
            <li><strong>UART</strong> — async serial; baud, parity, stop bits.</li>
            <li><strong>SPI</strong> — full-duplex master/slave; MISO/MOSI/SCK/CS.</li>
            <li><strong>I²C</strong> — 2-wire multi-drop; 7- or 10-bit addressing.</li>
            <li><strong>CAN / CAN FD</strong> — automotive &amp; industrial multi-master.</li>
            <li><strong>USB</strong> — Full/High/Super speed; CDC, HID classes.</li>
            <li><strong>ADC / DAC, PWM, timers, RTC.</strong></li>
          </ul>

          <h2 id="rtos">RTOS &amp; Bare-Metal</h2>
          <ul>
            <li>Bare-metal — super-loop or event-driven; simplest, hardest to grow.</li>
            <li>RTOS — FreeRTOS, Zephyr, ThreadX (Azure RTOS), RTEMS, ChibiOS, NuttX.</li>
            <li>Preemptive scheduling; priority inversion via priority inheritance.</li>
            <li>Synchronization — mutex, semaphore, queue, event flags.</li>
          </ul>

          <h2 id="firmware">Firmware Practices</h2>
          <ul>
            <li>Bootloader + application; A/B partitions for safe OTA.</li>
            <li>Watchdog timers + brown-out detect.</li>
            <li>Defensive I/O — saturate, debounce, range-check.</li>
            <li>HAL / driver split; mock hardware for unit tests.</li>
            <li>MISRA C / CERT C for safety-critical code.</li>
          </ul>

          <h2 id="tools">Tools</h2>
          <ul>
            <li><strong>IDEs:</strong> STM32CubeIDE, MPLAB X, PlatformIO, Keil μVision, IAR EWARM.</li>
            <li><strong>Debug:</strong> J-Link, ST-Link, Black Magic Probe, OpenOCD, GDB.</li>
            <li><strong>Analysis:</strong> Saleae logic analyzer, Bus Pirate, oscilloscope.</li>
            <li><strong>Toolchain:</strong> arm-none-eabi-gcc, LLVM.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
