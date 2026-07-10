# 03 — Multi-Tasking vs Multi-Threading

## Definitions

**Program** — an executable file containing a set of instructions written to complete a specific job. It's compiled code, ready to be executed, and stored on disk.

**Process** — a program under execution. Resides in the computer's primary memory (RAM).

**Thread**

- A single sequence stream within a process.
- An independent path of execution in a process.
- A light-weight process.
- Used to achieve parallelism by dividing a process's tasks into independent paths.
- Example: multiple tabs in a browser, or a text editor where typing, spell-checking, formatting, and saving happen concurrently by multiple threads.

## Multi-Tasking vs Multi-Threading

| Aspect | Multi-Tasking | Multi-Threading |
| --- | --- | --- |
| Concept | Execution of more than one task simultaneously | A process is divided into sub-tasks called threads, each with its own path of execution |
| Unit context-switched | Processes | Threads |
| Number of CPUs | 1 | ≥ 1 (more is better) |
| Isolation & memory protection | **Yes** — OS allocates separate memory to each program | **No** — resources shared among threads of the same process; OS allocates memory to the process, and threads share it |

## Thread scheduling

Threads are scheduled for execution based on priority. Even though threads execute within the runtime, all threads are assigned processor time slices by the OS.

## Thread context switching vs process context switching

| Thread context switch | Process context switch |
| --- | --- |
| OS saves the current thread's state and switches to another thread of the same process | OS saves the current process's state and switches to another process by restoring its state |
| Does **not** include switching the memory address space (but program counter, registers, and stack are switched) | **Includes** switching of the memory address space |
| Fast | Slow |
| CPU's cache state is preserved | CPU's cache state is flushed |
