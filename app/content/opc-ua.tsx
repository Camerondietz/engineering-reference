// app/content/opc-ua.tsx

export default function OpcUaPage() {
  return (
    <article className="prose">
      <h1>OPC UA</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#information-model">Information Model</a></li>
            <li><a href="#services">Services &amp; Communication</a></li>
            <li><a href="#security">Security</a></li>
            <li><a href="#pubsub">PubSub &amp; TSN</a></li>
            <li><a href="#tools">Tools</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            OPC UA (Unified Architecture, IEC 62541) is the modern,
            platform-independent successor to classic OPC. It is the de-facto
            standard for vendor-neutral industrial data exchange.
          </p>

          <h2 id="overview">Overview</h2>
          <ul>
            <li>Cross-platform — Windows, Linux, embedded; not tied to DCOM.</li>
            <li>Service-oriented architecture; binary or HTTPS / JSON encoding.</li>
            <li>Both transport (client/server &amp; pub/sub) and information modeling.</li>
            <li>Maintained by the OPC Foundation.</li>
          </ul>

          <h2 id="information-model">Information Model</h2>
          <ul>
            <li>Address space made of <strong>Nodes</strong>: Objects, Variables, Methods, ObjectTypes, References.</li>
            <li>Strong typing via TypeDefinitions; subtype inheritance.</li>
            <li>Browsable namespace — drill from server root to any tag.</li>
            <li><strong>Companion Specifications</strong> standardize models per industry: PackML, MTConnect, AutoID, EUROMAP, VDMA Robotics, IEC 61850-OPC UA, Pump &amp; Vacuum, etc.</li>
          </ul>

          <h2 id="services">Services &amp; Communication</h2>
          <ul>
            <li>Sessions over Secure Channels.</li>
            <li>Read, Write, Browse, Call (methods).</li>
            <li>Subscriptions with MonitoredItems for change notifications.</li>
            <li>Historical access (HA) for time-series data.</li>
            <li>Alarms &amp; Conditions (A&amp;C) for event/alarm models.</li>
            <li>Default ports: 4840 (opc.tcp), 443 (opc.https).</li>
          </ul>

          <h2 id="security">Security</h2>
          <ul>
            <li>Three security modes: None, Sign, SignAndEncrypt.</li>
            <li>X.509 certificates for client &amp; server identity; trust lists must be exchanged.</li>
            <li>User authentication: anonymous, username/password, certificate, JWT (OAuth2).</li>
            <li>Always disable Security = None on production.</li>
            <li>GDS (Global Discovery Server) automates certificate management.</li>
          </ul>

          <h2 id="pubsub">PubSub &amp; TSN</h2>
          <ul>
            <li>OPC UA PubSub adds publish/subscribe over UDP multicast or MQTT/AMQP brokers.</li>
            <li>Suited for one-to-many distribution, e.g. line-to-cloud.</li>
            <li>OPC UA over TSN (Time-Sensitive Networking, IEEE 802.1) targets deterministic field-level control.</li>
          </ul>

          <h2 id="tools">Tools</h2>
          <ul>
            <li><strong>Clients:</strong> UaExpert (Unified Automation), Prosys OPC UA Browser, Ignition.</li>
            <li><strong>SDKs:</strong> open62541 (C), Eclipse Milo (Java), node-opcua, FreeOpcUa (Python), Unified Automation SDKs.</li>
            <li><strong>Servers:</strong> Kepware, Matrikon, Cogent DataHub, Siemens Simatic, Ignition, Codesys.</li>
            <li><strong>Testing:</strong> OPC Foundation Compliance Test Tool (CTT).</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
