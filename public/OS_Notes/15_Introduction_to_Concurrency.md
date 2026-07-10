# 15 — Introduction to Concurrency

## Concurrency

**Concurrency** is the execution of multiple instruction sequences at the same time. It happens in the OS when several process threads run in parallel.

## Thread — recap

- A single sequence stream within a process.
- An independent path of execution.
- A light-weight process.
- Used to achieve parallelism by dividing a process's tasks into independent execution paths.
- Example: multiple tabs in a browser, or a text editor where typing, spell-checking, formatting, and saving happen concurrently.

## Thread scheduling

Threads are scheduled based on priority. Even though threads execute within the runtime, all threads are assigned processor time slices by the OS.

## Thread context switching

- OS saves the current state of a thread and switches to another thread of the **same process**.
- Does **not** include switching the memory address space (but program counter, registers, and stack are switched).
- Fast, compared to process switching.
- CPU's cache state is preserved.

## How each thread gets access to the CPU

- Each thread has its own **program counter**.
- The OS schedules threads according to the thread-scheduling algorithm.
- The OS fetches instructions corresponding to the PC of that thread and executes them.

## Context switching for threads

- I/O-based or TQ-based context switching happens here too.
- Each thread has a **TCB (Thread Control Block)** — analogous to the PCB — for state storage during context switching.

## Will a single-CPU system gain from multi-threading?

**Never.** With a single CPU, two threads still have to context-switch on that one CPU, so there's no gain in raw throughput.

## Benefits of multi-threading

- **Responsiveness.**
- **Resource sharing** — efficient sharing.
- **Economy** — creating and context-switching threads is cheaper. Allocating memory and resources for creating a process is costly, so splitting work into threads of the same process is better.
- Threads let you exploit multi-processor architectures at greater scale and efficiency.
