# 01 — Networks and Network Topologies

## What is a network?

A **network** is a set of devices connected by a physical media link. In a network, two or more nodes are connected by a physical link, or two or more networks are connected by one or more nodes. A network is a collection of devices connected to each other to allow the sharing of data.

## Node and Link

A network is a setup of two or more computers directly connected by physical media like optical fiber or coaxial cable.

- The **physical medium** of connection is the **link**.
- The **computers** it connects are called **nodes**.

## Network Topology

**Network topology** specifies the layout of a computer network — how devices and cables are connected to each other.

```mermaid
flowchart TB
    T[Types of Network Topology]
    T --> S[Star]
    T --> R[Ring]
    T --> B[Bus]
    T --> M[Mesh]
    T --> TR[Tree]
    T --> H[Hybrid]
```

## Star

- All nodes are connected to a single device known as the **central device** (hub/switch).
- Requires more cable than other topologies, but is **robust** — a failure in one cable only disconnects the specific computer connected to it.
- If the central device is damaged, the whole network fails.
- Very easy to install, manage and troubleshoot. Commonly used in **office and home networks**.

```mermaid
flowchart TB
    C((Central Device))
    N1[Computer 1] --- C
    N2[Computer 2] --- C
    N3[Computer 3] --- C
    N4[Computer 4] --- C
    N5[Computer 5] --- C
```

## Ring

- Nodes are connected to exactly two neighbouring nodes, forming a single continuous path for transmission.
- Does **not** need a central server to control connectivity.
- If a single node is damaged, the whole network fails.
- Rarely used — expensive, difficult to install and manage.
- Examples: **SONET**, **SDH**.

```mermaid
flowchart LR
    A[Node A] --- B[Node B] --- C[Node C] --- D[Node D] --- E[Node E] --- A
```

## Bus

- All nodes are connected to a **single central cable** known as the **bus**.
- Acts as a **shared communication medium** — any device sending data puts it on the bus, and the bus delivers it to all attached devices.
- Useful for a small number of devices.
- If the bus is damaged, the whole network fails.

```mermaid
flowchart TB
    BUS[==================== BUS ====================]
    N1[PC 1] --- BUS
    N2[PC 2] --- BUS
    N3[PC 3] --- BUS
    N4[PC 4] --- BUS
```

## Mesh

- Every node is individually connected to other nodes.
- Does **not** need a central switch or hub.
- Two variants:
  - **Fully connected mesh** — every node is connected to every other node.
  - **Partially connected mesh** — not every node is connected to every other node.
- Robust — a failure in one cable only disconnects the specific computer on that cable.
- Rarely used — installation and configuration are difficult as connectivity grows.
- **Cabling cost is high** — requires bulk wiring.

```mermaid
flowchart TB
    A[Node A] --- B[Node B]
    A --- C[Node C]
    A --- D[Node D]
    B --- C
    B --- D
    C --- D
```

## Tree

- A combination of **star and bus** topology — also known as **expanded star topology**.
- All the star networks are connected to a single bus.
- **Ethernet** protocol is used.
- The network is divided into segments (star networks) that can be easily maintained. If one segment is damaged, other segments are unaffected.
- Depends on the "main bus" — if the bus breaks, the whole network is damaged.

```mermaid
flowchart TB
    Bus[==== Main Bus ====]
    H1((Hub 1)) --- Bus
    H2((Hub 2)) --- Bus
    H3((Hub 3)) --- Bus
    A1[PC] --- H1
    A2[PC] --- H1
    B1[PC] --- H2
    B2[PC] --- H2
    C1[PC] --- H3
    C2[PC] --- H3
```

## Hybrid

- A combination of different topologies forming a resulting topology.
- If a star topology is connected with another star topology, the result is still a **star**. If a star topology is connected with a *different* topology, the result is a **hybrid** topology.
- Provides **flexibility** — can be implemented across different network environments.
