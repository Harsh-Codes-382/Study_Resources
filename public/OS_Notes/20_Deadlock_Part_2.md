# 20 — Deadlock — Part 2

## 1. Deadlock Avoidance

**Idea:** the kernel is given, in advance, information concerning which resources a process will use in its lifetime. Using this, the system decides for each request whether the process should wait.

To decide whether the current request can be satisfied or delayed, the system considers:

- Resources currently available.
- Resources currently allocated to each process in the system.
- Future requests and releases of each process.

**Goals**

- Schedule processes and resource allocation so that DL never occurs.
- **Safe state** — a state is safe if the system can allocate resources to each process (up to its maximum) in some order and still avoid DL. A system is in a safe state only if a **safe sequence** exists.
- **Unsafe state** — the OS cannot prevent processes from requesting resources in such a way that a deadlock could occur. Not every unsafe state is a deadlock — an unsafe state may *lead* to one.
- The key: a request is approved **only if the resulting state is safe**.
- If the system cannot fulfill all processes' requests, the state is unsafe.
- The scheduling algorithm used to find safe states is the **Banker's Algorithm**.

## 2. Banker's Algorithm

When a process requests a set of resources, the system must determine whether allocating them will leave the system in a safe state. If yes, allocate. If not, the process must wait until other processes release enough resources.

## 3. Deadlock Detection

If systems don't implement DL prevention or avoidance, they may employ **detection then recovery**.

- **Single instance of each resource type — wait-for graph method.**
  A deadlock exists **iff** there is a **cycle** in the wait-for graph. The system periodically invokes an algorithm to search for cycles.
- **Multiple instances of each resource type** — use the **Banker's Algorithm**.

## 4. Recovery from Deadlock

**a. Process termination**
- Abort all deadlocked processes.
- Abort one process at a time until the DL cycle is eliminated.

**b. Resource preemption**
- To eliminate DL, successively preempt resources from processes and give them to other processes until the DL cycle is broken.
