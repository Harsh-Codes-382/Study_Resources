# 2.3 Hazards, Coordination & Thread-Safe Design

## Overview

This section covers the common problems that occur when multiple threads execute concurrently and the Java tools/design techniques used to solve them.

Core ideas:

- Race conditions
- Deadlock, livelock, starvation
- The 4 conditions for deadlock and lock ordering
- `wait()`, `notify()`, and `notifyAll()`
- Coordination helpers:
  - `CountDownLatch`
  - `Semaphore`
  - `CyclicBarrier`
  - `Phaser`
- Producer-consumer with `BlockingQueue`
- Concurrent collections
- Immutability
- `ThreadLocal`
- Thread-safe singleton patterns

---

# 1. Race Conditions

## Definition

A **race condition** occurs when multiple threads access shared mutable state concurrently and the correctness of the result depends on the timing/order of execution.

Example:

```java
class Counter {
    int count = 0;

    void increment() {
        count++;
    }
}
```

`count++` is not one indivisible operation. Conceptually:

```text
1. read count
2. add 1
3. write count
```

Two threads can interleave:

```text
Initial count = 0

Thread A              Thread B
--------              --------
read 0
                      read 0
add 1
                      add 1
write 1
                      write 1
```

Final value:

```text
1
```

Expected:

```text
2
```

## Fix

Using `synchronized`:

```java
synchronized void increment() {
    count++;
}
```

Or use an atomic class for simple atomic operations:

```java
AtomicInteger count = new AtomicInteger();

count.incrementAndGet();
```

## Interview definition

> A race condition occurs when multiple threads concurrently access shared mutable state and the program's correctness depends on the timing or ordering of those accesses.

---

# 2. Deadlock

## Definition

A **deadlock** occurs when two or more threads are permanently blocked because each is waiting for a resource held by another thread.

Example:

```java
Object lockA = new Object();
Object lockB = new Object();
```

Thread 1:

```java
synchronized (lockA) {
    synchronized (lockB) {
        // work
    }
}
```

Thread 2:

```java
synchronized (lockB) {
    synchronized (lockA) {
        // work
    }
}
```

Possible execution:

```text
Thread 1                   Thread 2

locks A                    locks B

waits for B                waits for A
       ↑                         ↑
       └───────── cycle ─────────┘
```

Neither thread can continue.

---

# 3. Four Conditions Required for Deadlock

A deadlock requires all four conditions:

1. Mutual exclusion
2. Hold and wait
3. No preemption
4. Circular wait

Remember:

> **Mutual exclusion + Hold and wait + No preemption + Circular wait**

## 3.1 Mutual Exclusion

A resource can only be held by one thread at a time.

Example:

```java
synchronized (lockA) {
    // only one thread owns this monitor at a time
}
```

## 3.2 Hold and Wait

A thread holds one resource while waiting for another.

```text
Thread A:
holds Lock A
waits for Lock B
```

It does not release Lock A while waiting for Lock B.

## 3.3 No Preemption

A resource cannot simply be forcibly taken away from the thread holding it.

If Thread A owns Lock A, Thread B cannot forcibly take Lock A away.

Thread A must release it.

## 3.4 Circular Wait

There is a cycle of dependencies.

```text
Thread A holds Lock A
Thread A waits for Lock B

Thread B holds Lock B
Thread B waits for Lock A
```

Graphically:

```text
A → B → A
```

This creates the cycle.

---

# 4. Preventing Deadlock with Lock Ordering

A common prevention strategy is to impose a **global lock ordering**.

Bad:

```java
// Thread 1
synchronized (lockA) {
    synchronized (lockB) {
    }
}
```

```java
// Thread 2
synchronized (lockB) {
    synchronized (lockA) {
    }
}
```

One thread follows:

```text
A → B
```

while the other follows:

```text
B → A
```

This can create a circular wait.

## Correct

Make every thread acquire locks in the same order:

```java
// Thread 1
synchronized (lockA) {
    synchronized (lockB) {
    }
}
```

```java
// Thread 2
synchronized (lockA) {
    synchronized (lockB) {
    }
}
```

Now every thread follows:

```text
A → B
```

There can be no:

```text
A → B
B → A
```

cycle.

## Interview answer

> To prevent deadlock, I can impose a global lock ordering. If every thread acquires multiple locks in the same predefined order, the circular-wait condition cannot occur.

---

# 5. Livelock

## Definition

A **livelock** occurs when threads are actively running and responding to each other, but the system still makes no useful progress.

Deadlock:

```text
Threads are stuck.
```

Livelock:

```text
Threads are active but keep interfering with each other.
```

Analogy:

Two people walking toward each other:

```text
A → ← B
```

A moves left to let B pass.

B also moves left.

Then both move right.

They repeatedly react to each other but never pass.

## Programming scenario

Two threads repeatedly detect a conflict and both back off/retry:

```java
while (conflict()) {
    release();
    retry();
}
```

If both retry in sync, they can continuously interfere.

## Possible fixes

- Randomized backoff
- Bounded retries
- Priority
- Better coordination

---

# 6. Starvation

## Definition

**Starvation** occurs when a thread repeatedly fails to obtain the resource, lock, or scheduling opportunity it needs to make progress.

Example:

```text
Thread A → waiting

Thread B → gets lock
Thread C → gets lock
Thread B → gets lock
Thread C → gets lock
...
Thread A → never gets lock
```

Thread A is starving.

## Difference

| Problem | Threads active? | Progress? |
|---|---:|---:|
| Deadlock | No | No |
| Livelock | Yes | No useful progress |
| Starvation | Other threads may progress | Starved thread does not |

Interview answer:

> Deadlock means threads wait for each other. Livelock means threads are active but repeatedly react without making progress. Starvation means a thread is continually denied the resources or scheduling opportunity it needs.

---

# 7. `wait()`, `notify()`, and `notifyAll()`

These are low-level monitor coordination mechanisms.

They are associated with an object's monitor and must be called while holding that object's monitor, normally inside:

```java
synchronized (lock) {
    ...
}
```

## `wait()`

`wait()` causes the current thread to:

1. Release the monitor.
2. Enter the waiting state.
3. Wait until it is notified/interrupted/etc.
4. Reacquire the monitor before continuing.

Example:

```java
synchronized (lock) {
    while (!resourceAvailable) {
        lock.wait();
    }

    useResource();
}
```

## `notify()`

Wakes one waiting thread.

```java
synchronized (lock) {
    resourceAvailable = true;
    lock.notify();
}
```

Important:

> `notify()` does not guarantee which waiting thread will be selected.

The other waiting threads remain waiting.

## `notifyAll()`

Wakes all threads waiting on that monitor:

```java
synchronized (lock) {
    resourceAvailable = true;
    lock.notifyAll();
}
```

But all awakened threads do **not** get the resource.

They must compete to reacquire the monitor.

Conceptually:

```text
A → WAITING
B → WAITING
C → WAITING

       notifyAll()
           ↓

A ─┐
B ─┼→ compete to reacquire lock
C ─┘
```

One gets the lock first.

The others wait to reacquire it.

---

# 8. Why `while`, not `if`, around `wait()`

Correct:

```java
synchronized (lock) {
    while (!resourceAvailable) {
        lock.wait();
    }

    useResource();
}
```

Not:

```java
synchronized (lock) {
    if (!resourceAvailable) {
        lock.wait();
    }

    useResource();
}
```

## Why?

Waking up does not guarantee that the condition is still true.

Example:

```text
A, B, C are waiting.

notifyAll()

A gets the lock first.
A consumes the only resource.

B gets the lock.
B must check the condition again.

resourceAvailable == false

B goes back to wait().
```

Therefore:

```java
while (!condition) {
    wait();
}
```

is the standard pattern.

It also handles **spurious wakeups** correctly: a thread can return from `wait()` even without the expected notification, so the condition must always be rechecked.

---

# 9. Does `notifyAll()` Guarantee Fairness?

No.

Suppose:

```text
A waiting
B waiting
C waiting
```

After:

```java
notifyAll();
```

there is no guarantee of:

```text
A → B → C
```

The awakened threads compete to reacquire the monitor.

Therefore:

> `notifyAll()` wakes all waiters, but it does not guarantee FIFO ordering or fairness.

---

# 10. How Are Other Threads Handled with `notify()`?

Suppose:

```text
A → WAITING
B → WAITING
C → WAITING
```

Call:

```java
notify();
```

One waiting thread is selected to wake.

For example:

```text
A → tries to reacquire lock
B → WAITING
C → WAITING
```

If A gets the resource, B and C remain waiting.

When another resource becomes available, another notification can wake another waiter.

The application should not depend on a specific waiter being selected.

---

# 11. Why `notifyAll()` Can Be Safer

Consider several threads waiting for different conditions on the same monitor.

If `notify()` wakes a thread whose condition is still false:

```text
Thread A wakes
condition still false
A waits again
```

Another thread that could have made progress might remain asleep.

With `notifyAll()`:

```text
A ─┐
B ─┤
C ─┤ → all wake and re-check conditions
D ─┘
```

Only the thread(s) whose condition is satisfied can proceed.

### Downside

Waking many threads can create extra contention and unnecessary wakeups, sometimes called a **thundering herd** effect.

---

# 12. Prefer Higher-Level Concurrency Utilities

For producer-consumer problems, manually implementing:

```java
wait();
notify();
notifyAll();
```

is usually more error-prone.

Prefer:

```java
BlockingQueue
```

when the problem is producer-consumer.

Use the low-level APIs when you specifically need custom monitor-based coordination.

---

# 13. CountDownLatch

## Definition

`CountDownLatch` allows one or more threads to wait until a counter reaches zero.

Think:

> **"Wait until N things finish."**

Example:

```java
CountDownLatch latch = new CountDownLatch(3);
```

Three workers:

```java
latch.countDown();
```

Waiting thread:

```java
latch.await();
```

Conceptually:

```text
count = 3

Worker A → countDown() → 2
Worker B → countDown() → 1
Worker C → countDown() → 0

Waiting thread continues
```

## Scenario

An application needs:

```text
Database initialization
Cache initialization
Configuration loading
```

The main startup thread can wait until all three finish.

```java
CountDownLatch latch = new CountDownLatch(3);

Thread t1 = new Thread(() -> {
    loadDatabase();
    latch.countDown();
});

Thread t2 = new Thread(() -> {
    loadCache();
    latch.countDown();
});

Thread t3 = new Thread(() -> {
    loadConfig();
    latch.countDown();
});

t1.start();
t2.start();
t3.start();

latch.await();

System.out.println("Application ready");
```

## Important

`CountDownLatch` is **one-shot**.

Once the count reaches zero, it cannot be reset.

---

# 14. Semaphore

## Definition

A `Semaphore` controls access to a resource using a fixed number of **permits**.

Think:

> **"Only N threads can access this resource at once."**

Example:

```java
Semaphore semaphore = new Semaphore(5);
```

At most five threads can hold permits.

```java
semaphore.acquire();

try {
    useDatabase();
} finally {
    semaphore.release();
}
```

Conceptually:

```text
5 permits

A → acquire → 4
B → acquire → 3
C → acquire → 2
D → acquire → 1
E → acquire → 0

F → waits
```

When one thread releases:

```text
permit available → another thread can proceed
```

## Scenarios

- Limit concurrent database operations
- Limit calls to an external API
- Limit access to an expensive resource
- Control concurrency level

---

# 15. CyclicBarrier

## Definition

`CyclicBarrier` makes a group of threads wait until all participating threads reach a common point.

Think:

> **"Everyone meet here before continuing."**

Example:

```java
CyclicBarrier barrier = new CyclicBarrier(4);
```

Each thread:

```java
doPart();

barrier.await();

continueWork();
```

Conceptually:

```text
A ──┐
B ──┤
C ──┼→ BARRIER → everyone continues
D ──┘
```

## Why "cyclic"?

The barrier can be reused for another round.

```text
Phase 1 → Barrier
             ↓
Phase 2 → Barrier
             ↓
Phase 3 → Barrier
```

---

# 16. `CountDownLatch` vs `CyclicBarrier`

Very common interview question.

### CountDownLatch

One-shot event/countdown:

```text
Workers
  ↓
finish
  ↓
count reaches 0
  ↓
waiting thread continues
```

### CyclicBarrier

A group of threads waits for each other:

```text
A ─┐
B ─┤
C ─┼→ barrier → continue
D ─┘
```

Comparison:

| Feature | CountDownLatch | CyclicBarrier |
|---|---|---|
| Main idea | Wait for N events | Threads meet |
| Reusable | No | Yes |
| Participants | Can be different from waiter | Participating threads wait for each other |
| Typical use | Startup/tasks complete | Multi-phase parallel work |

---

# 17. Phaser

## Definition

`Phaser` is a flexible synchronization utility for coordinating threads across **multiple phases**.

It is useful when:

- Work occurs in multiple phases
- Participants can register dynamically
- Participants can deregister

Example:

```java
Phaser phaser = new Phaser(3);
```

Workers:

```java
doPhaseOne();

phaser.arriveAndAwaitAdvance();

doPhaseTwo();

phaser.arriveAndAwaitAdvance();

doPhaseThree();

phaser.arriveAndDeregister();
```

Think:

```text
Phase 1
   ↓
Everyone arrives
   ↓
Phase 2
   ↓
Everyone arrives
   ↓
Phase 3
```

Mental model:

```text
CountDownLatch = wait once
CyclicBarrier = reusable group rendezvous
Phaser = flexible multi-phase rendezvous
```

---

# 18. Producer-Consumer Pattern

## Definition

The producer-consumer pattern separates:

```text
Producer → creates work
Consumer → processes work
Queue    → stores work between them
```

Architecture:

```text
Producer
   ↓
BlockingQueue
   ↓
Consumer
```

This decouples the production rate from the consumption rate.

---

# 19. Why `BlockingQueue`?

A `BlockingQueue` provides thread-safe queue operations and automatic waiting.

If the queue is empty:

```java
queue.take();
```

waits until an item becomes available.

If the queue is full:

```java
queue.put(item);
```

waits until space becomes available.

This provides **back-pressure**.

Example:

```text
Producer is faster
       ↓
Queue fills
       ↓
Queue becomes full
       ↓
Producer blocks
       ↓
Consumer catches up
```

This prevents producers from endlessly creating work and consuming unlimited memory.

---

# 20. `ArrayBlockingQueue`

```java
BlockingQueue<String> queue =
    new ArrayBlockingQueue<>(10);
```

It is a **bounded, array-backed blocking queue**.

Capacity:

```text
10
```

Producer:

```java
queue.put("job");
```

Consumer:

```java
String job = queue.take();
```

If full:

```text
Producer waits
```

If empty:

```text
Consumer waits
```

## Scenario

Use it when you want a clear upper bound on queued work:

```text
100 producers
10 queue slots
5 consumers
```

The bounded queue provides natural back-pressure.

---

# 21. `LinkedBlockingQueue`

```java
BlockingQueue<String> queue =
    new LinkedBlockingQueue<>(100);
```

It is a linked-node-based blocking queue.

It can be bounded by specifying a capacity.

For production systems, explicitly bounding the queue is often safer than allowing an uncontrolled backlog.

---

# 22. Producer-Consumer Example

```java
BlockingQueue<Integer> queue =
        new ArrayBlockingQueue<>(10);
```

Producer:

```java
Runnable producer = () -> {
    try {
        for (int i = 0; i < 100; i++) {
            queue.put(i);
        }
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
    }
};
```

Consumer:

```java
Runnable consumer = () -> {
    try {
        while (true) {
            Integer value = queue.take();
            process(value);
        }
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
    }
};
```

Important idea:

```text
Producer
   ↓
BlockingQueue
   ↓
Consumer
```

The queue absorbs temporary differences in speed and applies back-pressure when necessary.

---

# 23. Concurrent Collections

Regular collections such as:

```text
HashMap
ArrayList
LinkedList
```

are not generally safe for concurrent mutation by multiple threads.

Java provides specialized concurrent collections:

```text
ConcurrentHashMap
CopyOnWriteArrayList
ConcurrentLinkedQueue
BlockingQueue
```

They are designed for concurrent workloads.

---

# 24. `ConcurrentHashMap`

Example:

```java
Map<String, Integer> map =
    new ConcurrentHashMap<>();
```

Multiple threads can safely access/update the map concurrently.

```java
map.put("A", 10);
map.put("B", 20);
map.get("A");
```

`ConcurrentHashMap` does not use one global lock for all operations.

Modern implementations use techniques including:

- CAS (compare-and-set)
- Fine-grained synchronization
- Per-bin coordination where needed

This allows greater concurrency than a single-lock design.

---

# 25. `ConcurrentHashMap` vs `synchronizedMap`

Synchronized wrapper:

```java
Map<String, Integer> map =
    Collections.synchronizedMap(new HashMap<>());
```

Conceptually, access is protected by a common synchronization mechanism:

```text
Thread A → map lock → operation
Thread B → waits
Thread C → waits
```

This can create contention.

`ConcurrentHashMap` is designed for concurrent access:

```text
Thread A → one area
Thread B → another area
Thread C → read
Thread D → another update
```

Many operations can proceed concurrently.

## Interview answer

> `Collections.synchronizedMap` protects the map through a common synchronization mechanism, which can become a contention bottleneck. `ConcurrentHashMap` uses finer-grained synchronization and CAS-based techniques, allowing substantially more concurrent access.

### Important interview correction

Avoid saying:

> "`ConcurrentHashMap` always uses lock striping."

That is an oversimplification based on older implementation details.

A better modern answer is:

> "It avoids a single global lock and uses fine-grained coordination and CAS-based techniques."

---

# 26. `ConcurrentHashMap` and `null`

`ConcurrentHashMap` does not permit null keys or null values.

```java
map.put(null, "value");   // not allowed
map.put("A", null);      // not allowed
```

One reason is that:

```java
map.get(key) == null
```

can then consistently indicate that no mapping exists, instead of having to distinguish between "no mapping" and "mapped to null."

---

# 27. `CopyOnWriteArrayList`

Example:

```java
CopyOnWriteArrayList<String> list =
    new CopyOnWriteArrayList<>();
```

When a write occurs, a new underlying array is created.

Conceptually:

```text
Before:
[A, B, C]

add(D)

After:
[A, B, C, D]
```

This makes it particularly useful when:

```text
READS >>> WRITES
```

## Good scenarios

- Event listener lists
- Subscription lists
- Configuration snapshots
- Data that is read frequently but rarely changed

## Bad scenario

If you constantly:

```text
add
remove
add
remove
```

copying the array on each write can be expensive.

---

# 28. Concurrent Queues

Example:

```java
ConcurrentLinkedQueue<String> queue =
    new ConcurrentLinkedQueue<>();
```

Thread-safe and generally non-blocking.

```java
queue.offer("job");
queue.poll();
```

If empty:

```java
queue.poll();
```

returns `null` rather than waiting.

Compare:

```text
ConcurrentLinkedQueue
    ↓
Thread-safe + non-blocking

BlockingQueue
    ↓
Thread-safe + blocking operations
```

---

# 29. Concurrent Collections vs Synchronized Collections

Synchronized wrappers:

```java
Collections.synchronizedList(...)
Collections.synchronizedMap(...)
```

provide thread-safe access by synchronizing operations.

But a common lock can become a contention bottleneck.

Concurrent collections are designed specifically for concurrent workloads and may use:

- Fine-grained synchronization
- CAS
- Non-blocking algorithms
- Specialized data structures

Therefore they can scale better under contention.

---

# 30. Immutability as a Concurrency Strategy

## Definition

An immutable object is an object whose state cannot change after construction.

Example:

```java
public final class User {

    private final String name;

    public User(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}
```

After:

```java
User user = new User("Alice");
```

the object's state cannot be modified.

Multiple threads can safely share it:

```text
Thread A ─┐
Thread B ─┼→ same immutable User
Thread C ─┘
```

No thread can change its state.

## Why is immutability thread-safe?

Because:

```text
No shared mutable state
        ↓
No race around mutation
        ↓
Less synchronization
        ↓
Simpler concurrent code
```

## Interview answer

> Immutable objects are naturally thread-safe because their state cannot change after construction. Multiple threads can safely share the same object without synchronization for state mutation.

---

# 31. `ThreadLocal`

## Definition

`ThreadLocal` provides each thread with its own independent value.

Example:

```java
ThreadLocal<Integer> local =
    ThreadLocal.withInitial(() -> 0);
```

Conceptually:

```text
Thread A → ThreadLocal → 10
Thread B → ThreadLocal → 50
Thread C → ThreadLocal → 90
```

Each thread sees its own value.

It is useful for per-thread state such as:

- Request context
- Correlation information
- Per-thread temporary state
- Certain legacy APIs that require thread-confined state

---

# 32. `ThreadLocal` + Thread Pools = Leak/Stale-State Risk

This is extremely important.

A thread pool reuses worker threads.

Example:

```java
ExecutorService pool =
    Executors.newFixedThreadPool(10);
```

Suppose:

```java
threadLocal.set(requestData);
```

Request finishes.

But the worker thread remains alive and goes back into the pool.

Later:

```text
Request A
   ↓
Thread 1
   ↓
ThreadLocal = A's data
   ↓
request ends

Thread 1 reused

Request B
   ↓
Thread 1
   ↓
old ThreadLocal value may still exist
```

This can cause stale state, unexpected behavior, and memory retention.

## Correct cleanup

```java
try {
    threadLocal.set(value);

    // work

} finally {
    threadLocal.remove();
}
```

Remember:

> **ThreadLocal state belongs to the thread, not to the task running on that thread.**

Therefore cleanup is especially important with pooled threads.

---

# 33. Thread-Safe Singleton

A singleton is intended to have one instance within the relevant JVM/class-loader context.

Three common thread-safe approaches:

1. Enum singleton
2. Eager initialization
3. Double-checked locking

---

# 34. Singleton: Enum

```java
public enum Singleton {

    INSTANCE;

    public void doSomething() {
        System.out.println("Working");
    }
}
```

Usage:

```java
Singleton.INSTANCE.doSomething();
```

Advantages:

- Thread-safe initialization
- Simple
- Serialization handled safely by enum semantics
- Resistant to many traditional singleton serialization/reflection issues

Interview answer:

> An enum singleton is a simple, JVM-supported way to implement a thread-safe singleton and has strong serialization semantics.

---

# 35. Singleton: Eager Initialization

```java
public class Singleton {

    private static final Singleton INSTANCE =
            new Singleton();

    private Singleton() {
    }

    public static Singleton getInstance() {
        return INSTANCE;
    }
}
```

The JVM safely initializes static fields during class initialization.

Therefore multiple threads calling:

```java
getInstance();
```

receive the same instance.

## Advantage

Very simple.

## Disadvantage

The instance is created even if it is never used.

This is called **eager initialization**.

---

# 36. Singleton: Double-Checked Locking

Used when lazy initialization is required.

```java
public class Singleton {

    private static volatile Singleton instance;

    private Singleton() {
    }

    public static Singleton getInstance() {

        if (instance == null) {

            synchronized (Singleton.class) {

                if (instance == null) {
                    instance = new Singleton();
                }
            }
        }

        return instance;
    }
}
```

There are two checks:

```java
if (instance == null) {
    synchronized (...) {
        if (instance == null) {
            instance = new Singleton();
        }
    }
}
```

## Why two checks?

Suppose two threads both see:

```text
instance == null
```

Both enter the outer check.

Only one enters the synchronized block first.

That thread creates the instance.

When the second thread gets the lock, the second check:

```java
if (instance == null)
```

is now false.

Therefore it does not create another instance.

## Why `volatile`?

This is critical.

```java
private static volatile Singleton instance;
```

`volatile` provides the required visibility and ordering guarantees for this double-checked locking pattern.

Without `volatile`, the pattern is not safe.

---

# 37. Compare Singleton Approaches

| Approach | Lazy? | Thread-safe? | Complexity |
|---|---:|---:|---:|
| Enum | No | Yes | Very low |
| Eager `static final` | No | Yes | Very low |
| Double-checked locking | Yes | Yes | Higher |

Interview answer:

> If lazy initialization isn't needed, I prefer an enum or eager static final instance because they are simpler. If lazy initialization is required, double-checked locking with a volatile field is a valid approach.

---

# 38. Big Picture: How to Design Thread-Safe Code

A common mistake is:

```text
Multiple threads
      ↓
Add synchronized everywhere
      ↓
"Problem solved"
```

This can create:

- Lock contention
- Deadlocks
- Reduced throughput
- Difficult-to-maintain code

A better approach:

```text
Reduce shared mutable state
        ↓
Use immutable objects
        ↓
Use concurrent collections
        ↓
Use BlockingQueue for producer-consumer
        ↓
Use coordination utilities where appropriate
        ↓
Keep critical sections small
        ↓
Use consistent lock ordering
```

The goal isn't:

> "Use more locks."

The goal is:

> **"Design the system so that less shared mutable state needs locking."**

---

# 39. Quick Comparison of Coordination Tools

| Tool | Mental Model | Reusable? | Main Scenario |
|---|---|---:|---|
| `CountDownLatch` | Wait for N events | No | Wait for tasks/startup |
| `Semaphore` | N permits | Yes | Limit concurrency |
| `CyclicBarrier` | Everyone meet here | Yes | Group rendezvous |
| `Phaser` | Multi-phase rendezvous | Yes | Dynamic multi-phase work |
| `BlockingQueue` | Producer → queue → consumer | Yes | Producer-consumer |
| `wait/notify` | Low-level condition coordination | Depends | Custom monitor coordination |

---

# 40. Quick Comparison of Collection Choices

| Collection | Thread-safe? | Key characteristic |
|---|---:|---|
| `HashMap` | No | General-purpose map |
| `synchronizedMap` | Yes | Common synchronization mechanism |
| `ConcurrentHashMap` | Yes | High concurrent access |
| `ArrayList` | No | Fast general-purpose list |
| `synchronizedList` | Yes | Synchronized wrapper |
| `CopyOnWriteArrayList` | Yes | Many reads, few writes |
| `ConcurrentLinkedQueue` | Yes | Non-blocking concurrent queue |
| `ArrayBlockingQueue` | Yes | Bounded blocking queue |
| `LinkedBlockingQueue` | Yes | Linked blocking queue |

---

# 41. Interview "Say Out Loud" Answers

## Four deadlock conditions

> "Deadlock requires mutual exclusion, hold and wait, no preemption, and circular wait. A common prevention technique is consistent lock ordering. If every thread acquires multiple locks in the same predefined order, circular wait cannot occur."

## Why `ConcurrentHashMap` over `synchronizedMap`?

> "`synchronizedMap` uses a common synchronization mechanism that can become a contention bottleneck. `ConcurrentHashMap` is designed for concurrent access and uses finer-grained synchronization and CAS-based techniques, allowing multiple threads to operate concurrently."

## Why immutable objects are thread-safe?

> "An immutable object's state cannot change after construction. Therefore multiple threads can safely share it because there is no shared mutable state to race over."

## Thread-safe singleton approaches

> "The common approaches are an enum singleton, eager initialization with a static final instance, and lazy double-checked locking. Double-checked locking must use a volatile instance field."

## `notify()` vs `notifyAll()`

> "`notify()` wakes one waiting thread, while `notifyAll()` wakes all threads waiting on that monitor. The awakened threads still need to reacquire the monitor and re-check their condition. `notifyAll()` does not guarantee FIFO fairness."

## Why `while` around `wait()`?

> "A thread must re-check its condition after waking because another thread may have consumed the resource first, and spurious wakeups are possible. Therefore the condition is checked in a while loop, not an if statement."

## Why `BlockingQueue` over manual wait/notify?

> "`BlockingQueue` provides a higher-level producer-consumer abstraction. `put()` and `take()` handle waiting and coordination for us, reducing the risk of incorrect wait/notify logic and providing natural back-pressure when the queue is bounded."

---

# 42. Final Mental Model

```text
                    CONCURRENCY HAZARDS
                           |
        +------------------+------------------+
        |                  |                  |
      Race             Deadlock          Starvation
        |                  |
   shared mutable      4 conditions
      state                 |
        |             lock ordering
        |
   synchronization


                 COORDINATION
                      |
      +---------------+---------------+
      |               |               |
 CountDownLatch   Semaphore     CyclicBarrier
      |               |               |
  wait for N       N permits      meet together
      |
   Phaser
      |
 multiple phases


              PRODUCER-CONSUMER
                      |
                BlockingQueue
                      |
             +--------+--------+
             |                 |
    ArrayBlockingQueue   LinkedBlockingQueue


             CONCURRENT COLLECTIONS
                      |
       +--------------+--------------+
       |              |              |
ConcurrentHashMap  CopyOnWrite   ConcurrentQueue
                      |
              reads >> writes


              THREAD-SAFE DESIGN
                      |
       +--------------+--------------+
       |              |              |
  Immutability    ThreadLocal     Singleton
       |              |              |
 no shared         per-thread    enum/eager/
 mutable state       state       DCL + volatile
                      |
               remove() in finally
```

## The most important principle

> **Good concurrent design minimizes shared mutable state, uses the appropriate concurrency abstraction, and avoids unnecessary locking.**

