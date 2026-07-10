# 12 — Intro to Process Scheduling, FCFS and Convoy Effect

## Process scheduling

- The basis of a multi-programming OS.
- By switching the CPU among processes, the OS makes the computer more productive.
- Many processes are kept in memory. When a process must wait (or its time quantum expires), the OS takes the CPU away and gives it to another process. This pattern continues.

## CPU scheduler

- Whenever the CPU becomes idle, the OS must select one process from the ready queue to execute.
- This is done by the **Short-Term Scheduler (STS)**.

## Non-preemptive vs preemptive scheduling

| | Non-preemptive | Preemptive |
| --- | --- | --- |
| CPU release | Only when the process terminates or switches to wait state | CPU is taken away after the time quantum expires, or on termination/wait |
| Starvation | Yes — a long-burst process can starve short-burst ones | Less |
| CPU utilization | Low | High |

## Goals of CPU scheduling

- Maximum CPU utilization
- Minimum turnaround time (TAT)
- Minimum wait time
- Minimum response time
- Maximum throughput

## Key terms

- **Throughput** — number of processes completed per unit time.
- **Arrival Time (AT)** — the time a process arrives at the ready queue.
- **Burst Time (BT)** — time required by the process for its execution.
- **Turnaround Time (TAT)** — time from first entering ready state until termination. `TAT = CT − AT`.
- **Wait Time (WT)** — time the process spends waiting for the CPU. `WT = TAT − BT`.
- **Response Time** — time between entering the ready queue and getting the CPU for the first time.
- **Completion Time (CT)** — time at which the process terminates.

## FCFS — First-Come, First-Served

- Whichever process comes first in the ready queue gets the CPU first.
- If one process has a long BT, it heavily inflates the average WT of the other processes → **convoy effect**.
- **Convoy effect** — a situation where many processes that need a resource for a short time are blocked by one process holding it for a long time.
  - This causes poor resource management.
