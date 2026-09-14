# 2.2 Synchronization, Locks & the Memory Model

## Overview

Concurrency creates three major problems when multiple threads access shared state:

1. **Visibility** — will one thread see another thread's changes?
2. **Atomicity** — can an operation be interrupted/interleaved by another thread?
3. **Ordering** — can operations be observed in a different order than expected?

Java provides several tools to solve these problems:

```text
volatile
    ↓
visibility + ordering
    ↓
NOT atomicity

Atomic*
    ↓
atomic operations
    ↓
CAS

synchronized / Lock
    ↓
mutual exclusion
    +
visibility / ordering
```

---

# 1. `synchronized` vs `volatile`

## 1.1 `synchronized`

`synchronized` provides:

- **Mutual exclusion**
- **Visibility**
- Memory-ordering guarantees

Example:

```java
class Counter {
    private int count = 0;

    synchronized void increment() {
        count++;
    }
}
```

Only one thread can execute the synchronized critical section at a time for the same monitor.

Conceptually:

```text
Thread 1:
read → increment → write
        ↓
     complete

Thread 2:
read → increment → write
```

So the read-modify-write operation is protected from concurrent interference.

### Important

`synchronized` is not only about preventing two threads from entering simultaneously.

It also establishes memory-visibility guarantees through the Java Memory Model.

An unlock of a monitor happens-before a subsequent lock of the same monitor.

---

# 2. `volatile`

`volatile` is mainly used when a variable needs:

- **Visibility**
- **Ordering guarantees**

Example:

```java
class Worker {

    private volatile boolean running = true;

    void stop() {
        running = false;
    }

    void run() {
        while (running) {
            // work
        }
    }
}
```

When one thread executes:

```java
running = false;
```

another thread reading `running` will see the updated value according to the JMM's volatile rules.

---

## 2.1 `volatile` does NOT provide atomicity

This is one of the most important interview points.

Even this is unsafe:

```java
volatile int count = 0;

count++;
```

Why?

Because:

```java
count++;
```

is conceptually:

```text
1. read count
2. add 1
3. write count
```

Two threads can interleave:

```text
T1: read 0
T2: read 0

T1: write 1
T2: write 1
```

Final result:

```text
1
```

instead of:

```text
2
```

Therefore:

> **`volatile` guarantees visibility and ordering, not atomicity.**

For a simple atomic counter, use:

```java
AtomicInteger count = new AtomicInteger();

count.incrementAndGet();
```

---

# 3. When should I use `volatile`?

Good use cases are usually variables where:

- one thread writes
- other threads read
- the operation itself does not require a compound read-modify-write

Example:

```java
private volatile boolean shutdown;
```

One thread:

```java
shutdown = true;
```

Other thread:

```java
while (!shutdown) {
    // work
}
```

This is very different from:

```java
volatile int count;
count++;
```

because `count++` is a compound operation.

---

# 4. `synchronized` method vs synchronized block

## 4.1 Synchronized instance method

```java
class Counter {

    synchronized void increment() {
        count++;
    }
}
```

For an instance method, the monitor is the current object:

```java
this
```

Conceptually equivalent to:

```java
void increment() {
    synchronized (this) {
        count++;
    }
}
```

---

## 4.2 Synchronized block

You can explicitly choose the object whose monitor should be used:

```java
private final Object lock = new Object();

void increment() {
    synchronized (lock) {
        count++;
    }
}
```

This gives you more control over what is protected.

---

## 4.3 Why use a synchronized block?

Suppose only a small part of a method accesses shared state:

```java
void doSomething() {

    calculateSomething();

    synchronized (lock) {
        updateSharedState();
    }

    sendNetworkRequest();
}
```

Only the critical section is synchronized.

This can reduce contention compared with synchronizing the entire method.

### Developer rule

> Synchronize the smallest practical critical section that protects the required invariant, without sacrificing correctness.

---

# 5. Object lock vs class lock

This distinction is extremely important.

## 5.1 Instance synchronized method = object lock

```java
class Counter {

    synchronized void increment() {
        // ...
    }
}
```

The lock is:

```java
this
```

Suppose:

```java
Counter c1 = new Counter();
Counter c2 = new Counter();
```

There are two different objects:

```text
c1 → its own monitor
c2 → its own monitor
```

Therefore:

```text
Thread 1 → c1.increment()
Thread 2 → c2.increment()
```

can execute concurrently because they use different monitors.

---

## 5.2 Static synchronized method = class lock

```java
class Counter {

    static synchronized void increment() {
        // ...
    }
}
```

The lock is effectively:

```java
Counter.class
```

So there is one class-level monitor associated with that class.

Even if you create:

```java
Counter c1 = new Counter();
Counter c2 = new Counter();
```

a static synchronized method uses the same class lock:

```text
Counter.class
      ↑
      |
static synchronized
```

---

## 5.3 Explicit equivalents

Instance lock:

```java
synchronized (this) {
    // ...
}
```

Class lock:

```java
synchronized (Counter.class) {
    // ...
}
```

### Remember

```text
synchronized instance method
        ↓
      this

static synchronized method
        ↓
    ClassName.class
```

---

# 6. Reentrancy

Java's intrinsic monitors are **reentrant**.

This means:

> A thread that already owns a lock can acquire the same lock again.

Example:

```java
class Example {

    synchronized void methodA() {
        methodB();
    }

    synchronized void methodB() {
        System.out.println("Hello");
    }
}
```

Execution:

```text
methodA()
    ↓
acquire this lock
    ↓
methodB()
    ↓
same thread tries to acquire this lock again
    ↓
allowed because the lock is reentrant
```

Conceptually:

```text
enter methodA → lock count = 1
enter methodB → lock count = 2

exit methodB  → lock count = 1
exit methodA  → lock count = 0
```

If the lock were not reentrant, calling `methodB()` from `methodA()` would deadlock the thread against itself.

---

# 7. Java Memory Model (JMM)

The **Java Memory Model** defines the rules for how threads interact through memory.

It answers questions such as:

### Visibility

If Thread A writes:

```java
x = 10;
```

when is Thread B guaranteed to see `10`?

### Ordering

Can operations be reordered from another thread's perspective?

### Atomicity

Can an operation be observed/interleaved as multiple steps?

The JMM defines the rules that make concurrent Java programs predictable.

---

# 8. Happens-before

A **happens-before** relationship is a key concept in the JMM.

It means that if action A happens-before action B:

- the effects of A are guaranteed to be visible to B
- A is ordered before B according to the Java Memory Model

It does not simply mean "A happened earlier on the wall clock."

---

## 8.1 Synchronized happens-before

An unlock of a monitor happens-before a subsequent lock of the same monitor.

Example:

Thread A:

```java
synchronized (lock) {
    x = 10;
}
```

Thread B:

```java
synchronized (lock) {
    System.out.println(x);
}
```

The synchronization establishes the required visibility/order relationship.

---

## 8.2 Volatile happens-before

A write to a volatile variable happens-before a subsequent read of that same volatile variable.

Example:

```java
volatile boolean ready;
```

Thread A:

```java
ready = true;
```

Thread B:

```java
if (ready) {
    // sees the effects according to volatile happens-before rules
}
```

---

## 8.3 `Thread.start()`

Actions performed by a thread before calling:

```java
thread.start();
```

happen-before actions performed by the started thread.

Example:

```java
int x = 10;

Thread t = new Thread(() -> {
    System.out.println(x);
});

t.start();
```

The initialization before `start()` is ordered before actions in the started thread.

---

## 8.4 `Thread.join()`

Actions performed by a thread happen-before another thread successfully returns from `join()`.

Example:

```java
Thread t = new Thread(() -> {
    x = 10;
});

t.start();
t.join();

System.out.println(x);
```

After `join()` returns, the joining thread has the required visibility of the completed thread's actions.

---

## 8.5 Important happens-before rules to remember

```text
monitor unlock
      ↓
subsequent lock of same monitor
```

```text
volatile write
      ↓
subsequent volatile read of same variable
```

```text
actions before Thread.start()
      ↓
actions in started thread
```

```text
actions in a thread
      ↓
successful Thread.join()
```

---

# 9. `wait()` / `notify()` / `notifyAll()`

These methods belong to:

```java
java.lang.Object
```

not `Thread`.

They work with an object's monitor.

---

## 9.1 `wait()`

Example:

```java
synchronized (lock) {

    while (!condition) {
        lock.wait();
    }

    // continue
}
```

When a thread calls:

```java
lock.wait();
```

it:

1. releases the monitor associated with `lock`
2. enters the waiting state
3. waits to be notified, interrupted, or otherwise awakened
4. must reacquire the monitor before continuing

### Very important

`wait()` **releases the lock while waiting**.

This is what allows another thread to acquire the lock and change the condition.

---

## 9.2 `notify()`

Another thread can do:

```java
synchronized (lock) {
    condition = true;
    lock.notify();
}
```

`notify()` wakes one waiting thread, if one exists.

But:

> Waking up does not mean the thread immediately executes.

The awakened thread still needs to reacquire the monitor.

---

## 9.3 `notifyAll()`

```java
synchronized (lock) {
    condition = true;
    lock.notifyAll();
}
```

This wakes all threads waiting on that monitor.

They then compete to reacquire the lock.

---

# 10. Why `wait()` must always be used in a loop

Incorrect:

```java
synchronized (lock) {

    if (!condition) {
        lock.wait();
    }

    // continue
}
```

Correct:

```java
synchronized (lock) {

    while (!condition) {
        lock.wait();
    }

    // continue
}
```

Why?

Because after a thread wakes up:

- another thread may have consumed/changed the condition
- multiple threads may have been awakened
- Java permits **spurious wakeups**

Therefore, the thread must re-check the condition.

### Interview rule

> **Always call `wait()` while holding the corresponding monitor, and always re-check the condition in a `while` loop.**

---

# 11. `notify()` vs `notifyAll()`

## `notify()`

Wakes one waiting thread.

Useful when one waiting thread is enough to make progress.

## `notifyAll()`

Wakes all waiting threads.

This can cause a "stampede" or **thundering herd**:

```text
100 waiting threads
       ↓
notifyAll()
       ↓
100 threads wake
       ↓
compete for lock
       ↓
only some can proceed
       ↓
others check condition
       ↓
go back to waiting
```

This creates unnecessary scheduling and computation.

However, `notifyAll()` is often the safer choice when multiple different conditions/roles may be waiting on the same monitor, because `notify()` might wake a thread that cannot currently make progress.

The correct condition-loop design is more important than blindly choosing one method.

For new code, higher-level concurrency utilities such as `BlockingQueue`, `CountDownLatch`, `Semaphore`, etc. are often preferable to manually coordinating with `wait/notify`.

---

# 12. `Atomic*` classes

Java provides atomic classes in:

```java
java.util.concurrent.atomic
```

Common examples:

```java
AtomicInteger
AtomicLong
AtomicBoolean
AtomicReference<T>
```

Example:

```java
AtomicInteger count = new AtomicInteger(0);

count.incrementAndGet();
```

This provides an atomic increment operation without manually writing a synchronized block.

---

# 13. CAS — Compare-And-Swap

CAS means:

> **Compare-And-Swap**

Conceptually:

```text
Current value = 10

"Change 10 → 11,
but only if the value is still 10."
```

If another thread has changed the value:

```text
Current value = 15
```

the CAS fails.

Conceptually:

```text
read current
     ↓
expected = current
     ↓
calculate new value
     ↓
CAS(expected, newValue)
     ↓
success? ───── yes → done
     |
     no
     ↓
retry
```

CAS is an important building block for lock-free algorithms and atomic classes.

---

# 14. How CAS-based counters work

Suppose:

```java
AtomicInteger counter = new AtomicInteger(0);
```

Conceptually:

```text
counter = 10

Thread A:
expected = 10
new value = 11

CAS(10, 11)
    ↓
success
```

At the same time:

```text
Thread B:
expected = 10
```

If Thread A updates first:

```text
actual = 11
```

Thread B's:

```text
CAS(10, 11)
```

fails because:

```text
expected = 10
actual   = 11
```

Thread B retries using the latest value.

This is why atomic operations can provide lock-free progress for suitable operations.

---

# 15. ABA Problem

The ABA problem is a common CAS-related issue.

Suppose a thread reads:

```text
A
```

and later checks the value again and sees:

```text
A
```

It might assume:

```text
"Nothing changed."
```

But another thread could have changed:

```text
A → B → A
```

The value is back to A, but it did change in between.

This is the **ABA problem**.

### Interview name-drop

> **ABA occurs when a value changes A→B→A, causing a CAS that only compares the current value to miss an intermediate modification.**

Versioned/stamped references can be used in appropriate designs to detect such changes.

---

# 16. `ReentrantLock` vs `synchronized`

`ReentrantLock` is an explicit locking mechanism:

```java
Lock lock = new ReentrantLock();

lock.lock();

try {
    // critical section
} finally {
    lock.unlock();
}
```

Both `synchronized` and `ReentrantLock` provide mutual exclusion.

But `ReentrantLock` provides additional control.

---

## 16.1 `tryLock()`

Instead of waiting indefinitely:

```java
if (lock.tryLock()) {
    try {
        // acquired
    } finally {
        lock.unlock();
    }
} else {
    // couldn't acquire
}
```

This is useful when you want to do something else if the lock is unavailable.

---

## 16.2 Timed lock

```java
if (lock.tryLock(2, TimeUnit.SECONDS)) {
    try {
        // acquired
    } finally {
        lock.unlock();
    }
}
```

The thread waits only for the specified period.

---

## 16.3 Interruptible lock acquisition

```java
lock.lockInterruptibly();
```

A thread waiting to acquire the lock can respond to interruption.

This is useful when cancellation needs to be respected while waiting.

---

## 16.4 Fairness

You can request a fair lock:

```java
ReentrantLock lock = new ReentrantLock(true);
```

Fairness generally favors waiting threads in an order closer to first-come-first-served.

Trade-off:

```text
fairness
   ↓
less starvation
   +
potentially lower throughput / more overhead
```

Fairness should be enabled only when the application's behavior actually requires it.

---

## 16.5 Multiple `Condition`s

`ReentrantLock` can create multiple condition queues:

```java
ReentrantLock lock = new ReentrantLock();

Condition notEmpty = lock.newCondition();
Condition notFull = lock.newCondition();
```

This is especially useful for producer-consumer designs.

---

# 17. `Condition`

A `Condition` is associated with a `Lock`.

Conceptually, it provides functionality similar to:

```text
Object.wait()       → Condition.await()
Object.notify()     → Condition.signal()
Object.notifyAll()  → Condition.signalAll()
```

Example:

```java
lock.lock();

try {
    while (!condition) {
        conditionVariable.await();
    }

    // work

} finally {
    lock.unlock();
}
```

Another thread:

```java
lock.lock();

try {
    conditionVariable.signal();
} finally {
    lock.unlock();
}
```

A major advantage is that one lock can have multiple conditions.

For example:

```text
ReentrantLock
     │
     ├── notEmpty
     └── notFull
```

This can provide more precise coordination than a single monitor wait-set.

---

# 18. `ReadWriteLock`

Use a `ReadWriteLock` when many threads mostly read shared data and writes are relatively uncommon.

Example workload:

```text
99% reads
1% writes
```

A normal exclusive lock allows only one thread into the protected section.

A `ReadWriteLock` provides:

```text
read lock
write lock
```

Multiple readers can hold the read lock concurrently.

A writer requires exclusive access.

---

## Example

```java
ReadWriteLock rwLock = new ReentrantReadWriteLock();
```

Reader:

```java
rwLock.readLock().lock();

try {
    // read shared state
} finally {
    rwLock.readLock().unlock();
}
```

Writer:

```java
rwLock.writeLock().lock();

try {
    // modify shared state
} finally {
    rwLock.writeLock().unlock();
}
```

Conceptually:

```text
Reader 1 ─┐
Reader 2 ─┼── can execute concurrently
Reader 3 ─┘

Writer ───────── exclusive
```

Use this when the workload and access pattern actually benefit from concurrent reads.

---

# 19. `StampedLock`

`StampedLock` supports:

- read locking
- write locking
- optimistic reads

The interesting feature is:

```java
long stamp = lock.tryOptimisticRead();
```

Conceptually:

```text
start optimistic read
        ↓
read data
        ↓
validate
        ↓
was there a conflicting write?
     /       \
   no         yes
   ↓           ↓
use result    retry with read lock
```

Optimistic reads can be useful for certain read-heavy workloads where writes are rare.

However, `StampedLock` is more complex than `synchronized` or `ReentrantReadWriteLock`.

### Developer rule

> Don't choose `StampedLock` simply because reads dominate. Use it when its optimistic-read behavior fits the workload and testing/benchmarking justifies the complexity.

---

# 20. Double-Checked Locking

Double-checked locking is commonly discussed for lazy initialization.

Incorrect:

```java
class Singleton {

    private static Singleton instance;

    static Singleton getInstance() {

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

The field must be:

```java
private static volatile Singleton instance;
```

Correct:

```java
class Singleton {

    private static volatile Singleton instance;

    static Singleton getInstance() {

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

---

# 21. Why must the field be `volatile`?

Object construction and publishing its reference involve multiple memory actions.

Conceptually:

```text
1. allocate memory
2. initialize object
3. publish reference
```

Without the required memory-ordering guarantees, another thread could observe the published reference without safely observing the object's completed initialization.

`volatile` provides the required visibility and ordering guarantees for safe publication in this pattern.

### Interview answer

> **The `volatile` field in double-checked locking provides safe publication and prevents problematic reordering around object construction and publication of the reference.**

---

# 22. Atomic vs Lock — when should I use which?

This is an important developer decision.

## Use an atomic class

When you have a simple independent atomic state update.

Examples:

```java
AtomicInteger count;
AtomicLong total;
AtomicReference<State> state;
```

Operations:

```java
count.incrementAndGet();

count.compareAndSet(oldValue, newValue);
```

Mental model:

```text
single atomic state update
        ↓
Atomic*
```

---

## Use a lock

When multiple operations must happen together to maintain an invariant.

Example:

```java
if (account.balance >= amount) {
    account.balance -= amount;
}
```

This consists of:

```text
check balance
      +
modify balance
```

The check and modification must be coordinated.

A lock can protect the entire critical section:

```java
synchronized void withdraw(int amount) {
    if (balance >= amount) {
        balance -= amount;
    }
}
```

### Mental rule

```text
Simple independent atomic update
        ↓
Atomic*

Multiple related operations
must behave as one unit
        ↓
synchronized / Lock
```

---

# 23. The Big Picture

Think about concurrency tools in layers:

```text
                    SHARED STATE
                         │
                         ▼
                Multiple threads?
                         │
                        YES
                         │
          ┌──────────────┴──────────────┐
          │                             │
   Need visibility?              Need atomic update?
          │                             │
       volatile                       Atomic*
          │                             │
          │                           CAS
          │
          └──────────────┬──────────────┘
                         │
                Multiple operations
                must be protected?
                         │
                        YES
                         │
                ┌────────┴────────┐
                │                 │
          synchronized      ReentrantLock
                │                 │
          simple/default      more control
                                  │
                    tryLock / timeout /
                    interruptible /
                    fairness / Condition
```

And the JMM sits underneath:

```text
Java Memory Model
        │
        └── happens-before
              │
              ├── synchronized
              ├── volatile
              ├── Thread.start()
              └── Thread.join()
```

---

# 24. Interview "Say Out Loud" Answers

## `volatile`

> "`volatile` guarantees visibility and ordering between threads, but it doesn't provide atomicity for compound operations. So `volatile count++` is still unsafe. For a simple atomic counter, I'd use `AtomicInteger`."

---

## Atomic vs lock

> "I'd use an atomic class when I have a simple independent state update, such as incrementing a counter or atomically replacing a reference. I'd use a lock when multiple operations need to execute together to maintain an invariant or protect a larger critical section."

---

## `ReentrantLock`

> "`ReentrantLock` provides the same basic mutual-exclusion capability as `synchronized`, but gives additional control such as `tryLock`, timed acquisition, interruptible lock acquisition, fairness, and multiple `Condition` objects. `synchronized` is usually preferable when I don't need those features because it's simpler and automatically releases the monitor."

---

## CAS

> "CAS, or compare-and-swap, atomically changes a value only if it still equals an expected value. Atomic classes use CAS-based techniques for operations such as incrementing without requiring a traditional mutual-exclusion lock. If another thread changed the value first, the CAS fails and the operation can retry."

---

# 25. Quick Interview Cheat Sheet

| Concept | Main purpose | Atomic? | Mutual exclusion? |
|---|---|---:|---:|
| `volatile` | Visibility + ordering | No | No |
| `AtomicInteger` | Atomic variable operations | Yes, for supported operations | No traditional lock |
| `synchronized` | Mutual exclusion + visibility | Yes, for protected critical section | Yes |
| `ReentrantLock` | Mutual exclusion + advanced lock control | Yes, for protected critical section | Yes |
| `ReadWriteLock` | Concurrent reads + exclusive writes | For protected operations | Yes |
| `StampedLock` | Read/write + optimistic reads | For protected operations | Yes |
| CAS | Atomic conditional update | Yes | No traditional lock |

---

# 26. Most Important Things to Remember

### 1. `volatile`

```text
visibility + ordering
NOT atomicity
```

Therefore:

```java
volatile int count;
count++;       // ❌ unsafe
```

Use:

```java
AtomicInteger count;
count.incrementAndGet();  // ✅
```

---

### 2. `synchronized`

```text
mutual exclusion
+
visibility/order
```

Instance method:

```text
lock = this
```

Static method:

```text
lock = ClassName.class
```

It is **reentrant**.

---

### 3. `wait/notify`

Always:

```java
synchronized (lock) {
    while (!condition) {
        lock.wait();
    }
}
```

And notification:

```java
synchronized (lock) {
    condition = true;
    lock.notify();       // one
    // or
    lock.notifyAll();   // all
}
```

---

### 4. Atomic vs lock

```text
one simple atomic state update
        ↓
Atomic*

multiple operations / invariant
        ↓
synchronized / Lock
```

---

### 5. CAS

```text
"Change this value only
if it is still what I expect."
```

If CAS fails:

```text
retry
```

---

### 6. ReentrantLock

Choose it when you actually need features such as:

```text
tryLock
timed lock
interruptible acquisition
fairness
multiple Conditions
```

Otherwise:

```text
synchronized
```

is usually simpler.

---

### 7. Double-checked locking

The field must be:

```java
private static volatile Singleton instance;
```

because `volatile` provides the required safe-publication and ordering guarantees.

---

# Final Mental Model

```text
                 JAVA CONCURRENCY
                        │
        ┌───────────────┼────────────────┐
        │               │                │
    Visibility       Atomicity        Ordering
        │               │                │
    volatile        Atomic*         JMM rules
        │               │                │
        └───────────────┼────────────────┘
                        │
                Need mutual exclusion?
                        │
                       YES
                        │
             ┌──────────┴──────────┐
             │                     │
        synchronized         ReentrantLock
             │                     │
        simple/default        advanced control
                                   │
                     tryLock / timeout /
                     interrupt / fairness /
                     Condition
```

## One-line interview summary

> **`volatile` solves visibility and ordering, `Atomic*` solves simple atomic state updates using mechanisms such as CAS, and `synchronized`/`Lock` provide mutual exclusion when multiple operations need to be protected as one critical section.**
