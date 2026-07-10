# 06 — TCP/IP Model and TCP vs UDP

## The TCP/IP Reference Model

The **TCP/IP** reference model is a compressed version of the OSI model with only **4 layers**. It was developed by the US Department of Defence (DoD).

> **Correction.** The source says "in the 1860s" — that's a typo. TCP/IP was designed by the US DoD in the **1960s–70s**; the TCP/IP protocol suite as we know it was standardized in the early **1980s**.

The name of this model comes from its two core protocols — **TCP** (Transmission Control Protocol) and **IP** (Internet Protocol).

```mermaid
flowchart TB
    A4[4. Application - HTTP, SMTP, DNS, RTP]
    A3[3. Transport - TCP, UDP]
    A2[2. Internet - IP, ICMP]
    A1[1. Link - Ethernet, SONET]
    A4 --> A3 --> A2 --> A1
```

### 1. Link

Decides which links — serial lines, classic Ethernet — must be used to meet the needs of the connectionless internet layer.
**Examples:** SONET, Ethernet.

### 2. Internet

The **most important layer** — holds the whole architecture together. Delivers IP packets to where they are supposed to be delivered.
**Examples:** IP, ICMP.

### 3. Transport

Its functionality is almost the same as the OSI transport layer. Enables peer entities on the network to carry on a conversation.
**Examples:** TCP, UDP (User Datagram Protocol).

### 4. Application

Contains all the higher-level protocols.
**Examples:** HTTP, SMTP, RTP, DNS.

## OSI vs TCP/IP (side by side)

```mermaid
flowchart LR
    subgraph OSI["OSI - 7 layers"]
      O7[Application]
      O6[Presentation]
      O5[Session]
      O4[Transport]
      O3[Network]
      O2[Data Link]
      O1[Physical]
    end
    subgraph TCP["TCP/IP - 4 layers"]
      T4[Application]
      T3[Transport]
      T2[Internet]
      T1[Link]
    end
    O7 -.-> T4
    O6 -.-> T4
    O5 -.-> T4
    O4 -.-> T3
    O3 -.-> T2
    O2 -.-> T1
    O1 -.-> T1
```

The upper three OSI layers collapse into TCP/IP's single **Application** layer; the bottom two collapse into **Link**.

## TCP vs UDP

Both are **transport-layer** protocols — but with very different priorities.

| | **TCP** | **UDP** |
| --- | --- | --- |
| Connection | **Connection-oriented** — 3-way handshake, tears down cleanly | **Connectionless** — just fire and forget |
| Speed | Slower | **Faster** |
| Reliability | Retransmits lost packets | No retransmission |
| Error checking | **Extensive** — flow control, acknowledgements | Basic — checksums only |
| Use cases | HTTP, email, file transfer | DNS lookups, video streaming, gaming, VoIP |

**Key intuition:** TCP asks *"did you get it?"* every time. UDP just shouts and moves on. That's why UDP is much faster, simpler, and more efficient — but retransmission of lost data packets is only possible with TCP.
