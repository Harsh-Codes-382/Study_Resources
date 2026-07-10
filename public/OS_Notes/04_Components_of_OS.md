# 04 — Components of OS

## Two big pieces

1. **Kernel** — the part of the OS that interacts directly with the hardware and performs the most crucial tasks.
   - Heart of the OS / core component.
   - The very first part of the OS to load on start-up.
2. **User space** — where application software runs. Apps don't have privileged access to hardware; they interact with the kernel.
   - GUI
   - CLI

A **shell** (a.k.a. command interpreter) is the part of the OS that receives commands from users and gets them executed.

## Functions of the kernel

1. **Process management**
   - Scheduling processes and threads on CPUs.
   - Creating and deleting user and system processes.
   - Suspending and resuming processes.
   - Providing mechanisms for process synchronization or communication.
2. **Memory management**
   - Allocating and deallocating memory space as needed.
   - Tracking which parts of memory are currently used and by which process.
3. **File management**
   - Creating and deleting files.
   - Creating and deleting directories.
   - Mapping files onto secondary storage.
   - Backup support onto stable storage media.
4. **I/O management** — to manage and control I/O operations and devices.
   - **Spooling** — for jobs of differing speed (e.g., print spooling, mail spooling).
   - **Buffering** — within one job (e.g., YouTube video buffering).
   - **Caching** — memory caching, web caching, etc.

## Types of kernels

### 1. Monolithic kernel

- All functions live in the kernel itself.
- 🔴 Bulky in size.
- 🔴 High memory footprint.
- 🔴 Less reliable — one module crashes → whole kernel is down.
- 🟢 High performance because communication is fast (fewer user/kernel-mode transitions).
- Examples: Linux, Unix, MS-DOS.

### 2. Microkernel

- Only major functions live in the kernel:
  - Memory management
  - Process management
- File management and I/O management run in user space.
- 🟢 Smaller in size.
- 🟢 More reliable.
- 🟢 More stable.
- 🔴 Performance is slow.
- 🔴 Overhead of switching between user mode and kernel mode.
- Examples: L4 Linux, Symbian OS, MINIX.

### 3. Hybrid kernel

- Best of both worlds — file management in user space, the rest in kernel space.
- Combined approach.
- Speed and design of monolithic.
- Modularity and stability of micro.
- IPC also happens, but with less overhead.
- Examples: macOS, Windows NT/7/10.

### 4. Nano / exokernels

Extreme minimality — a research direction beyond the scope of this note.

## How do user mode and kernel mode communicate?

Through **Inter-Process Communication (IPC)**.

- Two processes execute independently and have independent memory space (memory protection), but some may need to communicate to work together.
- Done via **shared memory** and **message passing**.
