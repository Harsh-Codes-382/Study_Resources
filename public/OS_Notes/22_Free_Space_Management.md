# 22 — Free Space Management

## 1. Defragmentation / Compaction

- Dynamic partitioning suffers from **external fragmentation**.
- **Compaction** minimizes the probability of external fragmentation.
- All free partitions are made contiguous, and all loaded partitions are brought together.
- With this technique, bigger processes can be stored. Free partitions get merged and can be allocated to new processes. Also called **defragmentation**.
- **Efficiency cost:** compaction is expensive — all free spaces are moved from several places into a single place.

## 2. How free space is stored/represented in the OS

Free holes in memory are represented by a **free list** (a linked-list data structure).

## 3. Satisfying a request for `n` bytes from the free list

Various algorithms find suitable holes in the free list and allocate them to processes.

### a. First Fit

- Allocate the **first** hole that is big enough.
- 🟢 Simple and easy to implement.
- 🟢 Fast / less time complexity.

### b. Next Fit

- An enhancement of First Fit, but the search **starts from the last allocated hole** rather than the head of the list.
- 🟢 Same advantages as First Fit.

### c. Best Fit

- Allocate the **smallest** hole that is big enough.
- 🟢 Less internal fragmentation.
- 🔴 May create many small holes → major external fragmentation.
- 🔴 Slow — must iterate the entire free list.

### d. Worst Fit

- Allocate the **largest** hole that is big enough.
- 🔴 Slow — must iterate the entire free list.
- 🟢 Leaves larger remaining holes that may accommodate other processes.
