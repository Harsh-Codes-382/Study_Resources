# 04 — IPv4 Addressing and Classes

## What is an IPv4 address?

An **IP address** is a **32-bit** dynamic address of a node in the network. An IPv4 address has **4 octets of 8 bits** each, with each octet taking a value **up to 255**.

Written in dotted-decimal form:

```
192.168.1.10
 |   |   | |
 |   |   | +-- 4th octet (0–255)
 |   |   +---- 3rd octet
 |   +-------- 2nd octet
 +------------ 1st octet
```

## IPv4 Classes

IPv4 classes are differentiated based on the number of hosts supported. There are **five** classes, determined by the **first octet** of the IP address:

| Class | Start Address | End Address | Usage |
| :---: | --- | --- | --- |
| **A** | 0.0.0.0 | 127.255.255.255 | Used for **large networks** |
| **B** | 128.0.0.0 | 191.255.255.255 | Used for **medium-size networks** |
| **C** | 192.0.0.0 | 223.255.255.255 | Used for **local area networks** |
| **D** | 224.0.0.0 | 239.255.255.255 | Reserved for **multicasting** |
| **E** | 240.0.0.0 | 255.255.255.254 | Study and R&D |

## Public vs Private IP addresses

- **Private IP address** — three ranges of IP addresses are reserved for private use. These are **not valid on the internet**. To access the internet from a private IP, you must use a **proxy server** or a **NAT server**.
- **Public IP address** — a public IP address is one taken from the **Internet Service Provider** (ISP), which facilitates communication on the internet.

## MAC address vs IP address

Both are used to uniquely identify a device — but they identify **different things**.

| | MAC Address | IP Address |
| --- | --- | --- |
| Assigned by | The **NIC card manufacturer** (baked into hardware) | The **Internet Service Provider** |
| What it identifies | The **physical** identity of the device on a network | The **network connection** the device is using |
| Scope | Local (link layer) | Global (network layer) |

**Key intuition:** MAC identifies the *device*; IP identifies where the device is currently *connected in the network*.

## `ipconfig` vs `ifconfig`

Both view and configure network interfaces — different OSes:

| Command | Full form | Where |
| --- | --- | --- |
| `ipconfig` | Internet Protocol Configuration | **Microsoft Windows** |
| `ifconfig` | Interface Configuration | **macOS, Linux, UNIX** |
