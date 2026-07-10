# 16 — Critical Section Problem and How to Address It

## Setup

Process-synchronization techniques play a key role in maintaining the **consistency of shared data**.

## Critical Section (C.S.)

The critical section is the segment of code where processes/threads access shared resources (common variables, files) and perform write operations on them. Since processes/threads execute concurrently, any process can be interrupted mid-execution.

## Major thread-scheduling issue — race condition

A **race condition** occurs when two or more threads can access shared data and try to change it at the same time. Because the thread scheduling algorithm can swap between threads at any moment, you don't know the order in which threads will attempt to access shared data. The result of the change depends on the scheduling order — the threads are literally *racing*.

## Solutions to race conditions

- **Atomic operations** — make the critical section an atomic operation, executing in one CPU cycle.
- **Mutual exclusion using locks.**
- **Semaphores.**

## Can we use a simple flag variable to solve race conditions?

**No.**

**Peterson's solution** can avoid race conditions, but it only works for **2 processes/threads**.

## Mutex / Locks

- Locks implement mutual exclusion and avoid race conditions by letting only one thread/process access the critical section at a time.

### Disadvantages of locks

- **Contention** — one thread holds the lock; others busy-wait. If the lock-holder dies, others may wait forever.
- **Deadlocks.**
- **Debugging** is harder.
- **Starvation** of high-priority threads.
