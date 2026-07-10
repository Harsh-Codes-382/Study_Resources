# 26 — Page Replacement Algorithms

## Setup

Whenever a **page fault** occurs — a process tries to access a page not currently in a frame — the OS must bring the page from swap space into a frame.

The OS does page replacement to accommodate the new page into a free frame. But if the system is running high-utilization and all frames are busy, the OS must **replace** one of the pages already in a frame with the new page.

The **page-replacement algorithm** decides which page is evicted. Some allocated page is swapped out, and the new page is swapped into the freed frame.

**Aim:** minimize the number of page faults.

## a. FIFO

- Allocate a frame to each incoming page; when replacement is needed, **replace the oldest** page.
- Easy to implement.
- Performance isn't always good, for two reasons:
  1. The page replaced may be an initialization module used long ago (a good candidate — fine).
  2. The page replaced may contain a heavily used variable that was initialized early and is still in constant use (bad — will cause a page fault again).
- **Belady's anomaly** is present with FIFO.
  - In LRU and Optimal, increasing the number of frames reduces page faults.
  - Belady found that in FIFO, increasing frames can sometimes **increase** page faults.
  - This is the strange behavior of FIFO in some cases.

## b. Optimal Page Replacement

- Find a page that is never referenced in the future — if such a page exists, replace it with the new page.
- If no such page exists, find the page **referenced farthest in the future** and replace it.
- **Lowest** page-fault rate among all algorithms.
- **Difficult to implement** — the OS would need future knowledge of the reference string, which is effectively impossible (similar to SJF scheduling).

## c. Least Recently Used (LRU)

If we use the recent past as an approximation of the near future, then we can replace the page that hasn't been used for the longest period.

**Can be implemented in two ways:**

1. **Counters**
   - Associate a time field with each page-table entry.
   - Replace the page with the smallest time value.
2. **Stack**
   - Keep a stack of page numbers.
   - Whenever a page is referenced, remove it from the stack and put it on top.
   - Most recently used is always on top; least recently used is always on the bottom.
   - Since entries can be removed from the middle, a **doubly linked list** is used.

## d. Counting-based Page Replacement

Keep a counter of how many references have been made to each page (reference counting).

**i. Least Frequently Used (LFU)**
- Actively used pages should have a large reference count.
- Replace the page with the smallest count.

**ii. Most Frequently Used (MFU)**
- Based on the argument that a page with the smallest count was probably just brought in and hasn't been used yet.

**Neither MFU nor LFU replacement is common in practice.**
