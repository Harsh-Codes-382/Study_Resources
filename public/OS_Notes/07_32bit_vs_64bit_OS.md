# 07 — 32-Bit vs 64-Bit OS

## The core facts

| | 32-bit | 64-bit |
| --- | --- | --- |
| Register width | 32 bits | 64 bits |
| Addressable memory | 2³² addresses ≈ **4 GB** | 2⁶⁴ addresses ≈ **17,179,869,184 GB** |
| Data per instruction cycle | 4 bytes | 8 bytes |

> In one second, a CPU can execute anywhere from thousands to billions of instruction cycles, depending on its design.

## Advantages of 64-bit over 32-bit

**a. Addressable memory** — 32-bit CPU addresses 2³² locations; 64-bit CPU addresses 2⁶⁴.

**b. Resource usage** — Installing more RAM on a 32-bit OS system doesn't help performance. Upgrade the same system to 64-bit Windows and you'll notice a difference.

**c. Performance** — All calculations happen in registers. When doing math in your code, operands are loaded from memory into registers, so larger registers let you perform larger calculations at the same time. A 32-bit processor can execute 4 bytes of data in one instruction cycle; a 64-bit processor can execute 8 bytes in one instruction cycle.

**d. Compatibility** — A 64-bit CPU can run both 32-bit and 64-bit OSes. A 32-bit CPU can only run a 32-bit OS.

**e. Better graphics performance** — 8-byte graphics calculations make graphics-intensive apps run faster.
