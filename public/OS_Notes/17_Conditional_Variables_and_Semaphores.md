# 17 — Conditional Variables and Semaphores for Thread Synchronization

## 1. Conditional Variable

- A synchronization primitive that lets a thread wait until a certain condition occurs.
- **Works with a lock.**
- A thread can enter the wait state only when it has acquired the lock. On entering wait, it **releases the lock** and waits until another thread notifies that the event has occurred. Once the waiting thread enters running state, it re-acquires the lock immediately and starts executing.
- **Why use it?** To avoid busy waiting.
- Contention is not an issue here.

## 2. Semaphores

- A synchronization method.
- An integer equal to the number of resources.
- Multiple threads can execute the critical section **concurrently** (up to the count).
- Allows multiple program threads to access a **finite instance of resources**, whereas a mutex allows multiple threads to access a **single** shared resource one at a time.

### Binary semaphore

- Value can be **0 or 1**.
- Also known as a **mutex lock**.

### Counting semaphore

- Can range over an unrestricted domain.
- Used to control access to a resource with a finite number of instances.

## Avoiding busy waiting in semaphores

To overcome busy waiting, we modify the definitions of `wait()` and `signal()`:

- When a process executes `wait()` and finds the semaphore value is not positive, instead of busy-waiting, it **blocks itself**.
- The block operation places the process on a waiting queue associated with the semaphore and switches its state to **Waiting**.
- Control is then transferred to the CPU scheduler, which picks another process to execute.

- A blocked process (waiting on semaphore S) is restarted when another process executes `signal()`.
- Restarting happens via a `wakeup()` operation, which changes the process from waiting to ready.
- The process is then placed in the ready queue.
