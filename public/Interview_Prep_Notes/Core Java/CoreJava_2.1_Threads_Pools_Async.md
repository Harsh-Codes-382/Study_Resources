# Core Java — 2.1 Threads, Pools & Async

## 1. Thread vs Runnable vs Callable

Java gives us several ways to represent work that should execute concurrently.

### `Thread`

`Thread` represents the actual thread of execution.

```java
Thread thread = new Thread(() -> {
    System.out.println("Running...");
});

thread.start();
```

Important:

```java
thread.start(); // starts a new thread
thread.run();   // normal method call; does NOT create a new thread
```

### `Runnable`

`Runnable` represents a task that does not return a result.

```java
Runnable task = () -> {
    System.out.println("Processing...");
};
```

It can be executed by a thread:

```java
new Thread(task).start();
```

or, more commonly, by an executor:

```java
executor.execute(task);
```

### `Callable<T>`

`Callable<T>` represents a task that returns a result and can throw checked exceptions.

```java
Callable<Integer> task = () -> {
    return 10 + 20;
};
```

With an executor:

```java
Future<Integer> future = executor.submit(task);

Integer result = future.get();
```

### Comparison

| Type | Represents | Returns result? | Checked exceptions? |
|---|---|---:|---:|
| `Thread` | Thread of execution | No | No |
| `Runnable` | Task | No | No |
| `Callable<T>` | Task | Yes | Yes |

### Why rarely extend `Thread`?

Usually, we want to separate:

> **What should be done?** from **How/where it should run?**

`Runnable` / `Callable` represent the work.

`ExecutorService` / thread pools decide how that work is executed.

For example:

```java
Runnable task = () -> sendEmail();

executor.submit(task);
```

The task does not need to know which thread executes it.

### Interview answer

> "`Runnable` and `Callable` represent tasks, while `Thread` represents the execution mechanism. We usually prefer tasks with executors because they separate the work from thread management and allow thread reuse, bounded concurrency, and lifecycle control."

---

# 2. Thread Lifecycle

Java exposes six `Thread.State` values.

```text
NEW
 ↓
RUNNABLE
 ↓
 ├── BLOCKED
 ├── WAITING
 └── TIMED_WAITING
 ↓
TERMINATED
```

## `NEW`

Thread object has been created but `start()` has not been called.

```java
Thread t = new Thread(task);
```

At this point:

```text
NEW
```

Calling:

```java
t.start();
```

moves it toward `RUNNABLE`.

---

## `RUNNABLE`

The thread is eligible to run.

It may actually be executing on the CPU, or waiting for CPU time.

Java does not expose a separate `RUNNING` state.

So:

```text
RUNNABLE
 ├── ready to run
 └── currently running
```

are represented by the same Java state.

---

## `BLOCKED`

The thread is waiting to acquire a monitor lock.

Example:

```java
synchronized (lock) {
    // critical section
}
```

If another thread already owns `lock`, this thread becomes:

```text
BLOCKED
```

It is specifically waiting to enter a `synchronized` region.

---

## `WAITING`

The thread waits indefinitely until another thread causes it to continue.

Examples:

```java
object.wait();
thread.join();
LockSupport.park();
```

Example:

```java
Thread worker = new Thread(() -> {
    // work
});

worker.start();
worker.join();
```

The calling thread waits until `worker` terminates.

---

## `TIMED_WAITING`

The thread waits for a limited amount of time.

Examples:

```java
Thread.sleep(1000);
```

```java
thread.join(1000);
```

```java
object.wait(1000);
```

The important difference:

```text
WAITING
       → wait indefinitely

TIMED_WAITING
       → wait with a timeout
```

---

## `TERMINATED`

The thread's `run()` method has finished.

```text
run() completed
      ↓
TERMINATED
```

A terminated thread cannot be started again.

```java
thread.start(); // first time: OK
thread.start(); // second time: IllegalThreadStateException
```

### Interview mental model

> `NEW → RUNNABLE → waiting/blocking states → RUNNABLE → TERMINATED`

---

# 3. ExecutorService

Creating a new thread for every task is usually not a good production strategy.

Instead, use an executor.

```java
ExecutorService executor =
        Executors.newFixedThreadPool(4);
```

Then submit tasks:

```java
executor.submit(() -> {
    System.out.println("Processing...");
});
```

The executor manages the worker threads.

Conceptually:

```text
Tasks
 ↓
ExecutorService
 ↓
Thread Pool
 ↓
Worker Threads
```

---

# 4. Why Thread Pools?

Suppose 10,000 requests arrive.

Bad approach:

```java
new Thread(task).start();
```

for every request.

You could end up creating thousands of threads.

Problems include:

- memory usage
- OS/thread resource exhaustion
- excessive context switching
- CPU contention
- difficult lifecycle management

A thread pool reuses a limited number of worker threads.

```text
             Tasks
              ↓
        ┌─────────────┐
        │ Thread Pool │
        └─────────────┘
          ↓    ↓    ↓
        T1     T2    T3
```

Benefits:

- thread reuse
- bounded concurrency
- resource control
- task queueing
- lifecycle management
- back-pressure when properly configured

### Interview answer

> "Thread pools avoid creating an unbounded number of threads. They reuse worker threads, control concurrency, and provide queueing and lifecycle management."

---

# 5. Types of Thread Pools

## Fixed Thread Pool

```java
ExecutorService executor =
        Executors.newFixedThreadPool(4);
```

Creates a pool with a fixed number of worker threads.

Conceptually:

```text
Tasks
 ↓
Queue
 ↓
T1  T2  T3  T4
```

Useful when you want controlled concurrency.

---

## Cached Thread Pool

```java
ExecutorService executor =
        Executors.newCachedThreadPool();
```

Designed for many short-lived asynchronous tasks.

It can create additional threads when needed and reuse idle threads.

Important:

> It is not bounded in the same way as a fixed-size pool.

So be careful with workloads that can generate huge numbers of concurrent tasks.

---

## Single Thread Executor

```java
ExecutorService executor =
        Executors.newSingleThreadExecutor();
```

Uses one worker thread.

Tasks execute sequentially:

```text
Task 1
  ↓
Task 2
  ↓
Task 3
  ↓
Task 4
```

Useful when tasks must be processed one at a time.

---

## Scheduled Thread Pool

```java
ScheduledExecutorService executor =
        Executors.newScheduledThreadPool(2);
```

Useful for delayed or periodic tasks.

```java
executor.schedule(
    () -> System.out.println("Hello"),
    5,
    TimeUnit.SECONDS
);
```

Or repeated execution:

```java
executor.scheduleAtFixedRate(
    () -> System.out.println("Running"),
    0,
    10,
    TimeUnit.SECONDS
);
```

---

# 6. `execute()` vs `submit()`

## `execute()`

Used for fire-and-forget `Runnable` tasks.

```java
executor.execute(() -> {
    System.out.println("Hello");
});
```

It does not return a `Future`.

---

## `submit()`

Returns a `Future`.

```java
Future<Integer> future =
        executor.submit(() -> 10 + 20);
```

Then:

```java
Integer result = future.get();
```

A `Future` can be used to:

- obtain the result
- check completion
- cancel the task

### Comparison

| Method | Input | Returns |
|---|---|---|
| `execute()` | `Runnable` | `void` |
| `submit()` | `Runnable` / `Callable` | `Future` |

### Interview answer

> "`execute()` is generally fire-and-forget, while `submit()` returns a `Future` that lets me observe completion, obtain a result, or cancel the task."

---

# 7. Executor Lifecycle

Executors need to be shut down.

```java
executor.shutdown();
```

## `shutdown()`

Meaning:

> Stop accepting new tasks, but allow already submitted tasks to finish.

```text
shutdown()
   ↓
No new tasks
   ↓
Existing tasks finish
   ↓
Pool terminates
```

---

## `shutdownNow()`

Attempts to stop execution more aggressively.

```java
List<Runnable> unfinished =
        executor.shutdownNow();
```

It:

- attempts to interrupt running tasks
- returns tasks that never started

Important:

> `shutdownNow()` does not magically kill threads.

Tasks must respond properly to interruption.

For example:

```java
while (!Thread.currentThread().isInterrupted()) {
    // work
}
```

---

## `awaitTermination()`

Waits for the executor to terminate.

```java
executor.shutdown();

if (!executor.awaitTermination(10, TimeUnit.SECONDS)) {
    executor.shutdownNow();
}
```

Typical graceful shutdown:

```text
shutdown()
    ↓
wait
    ↓
awaitTermination()
    ↓
if timeout
    ↓
shutdownNow()
```

---

# 8. RejectedExecutionHandler

A pool may reject a task.

For example, if a bounded executor has:

```text
all workers busy
+
queue full
```

there is nowhere to put another task.

Java provides rejection policies.

---

## `AbortPolicy`

Default behavior.

```java
new ThreadPoolExecutor.AbortPolicy()
```

Throws:

```text
RejectedExecutionException
```

Good when rejection should be explicit.

---

## `CallerRunsPolicy`

The submitting thread executes the task itself.

Conceptually:

```text
Worker pool full
      ↓
CallerRunsPolicy
      ↓
Caller executes task
```

This can create natural back-pressure.

If the producer has to execute work itself, it slows down producing more work.

---

## `DiscardPolicy`

Silently drops the rejected task.

```text
Task rejected
    ↓
discard
```

Use only when dropping work is acceptable.

---

## `DiscardOldestPolicy`

Removes the oldest queued task and tries to submit the new task.

Use carefully because it intentionally drops work.

### Interview mental model

```text
Abort
  → throw exception

CallerRuns
  → caller executes

Discard
  → silently drop

DiscardOldest
  → drop oldest queued task
```

---

# 9. CPU-Bound vs I/O-Bound Work

Thread-pool sizing depends heavily on the workload.

## CPU-bound

Examples:

- calculations
- compression
- image processing
- CPU-heavy algorithms

The CPU is the bottleneck.

A common starting point is approximately:

```text
number of worker threads ≈ number of CPU cores
```

You may tune around this depending on the workload.

Java:

```java
Runtime.getRuntime().availableProcessors();
```

More threads are not automatically better.

Too many CPU-bound threads can cause:

- context switching
- CPU contention
- cache effects
- scheduling overhead

---

## I/O-bound

Examples:

- HTTP calls
- database calls
- file I/O
- network calls

The thread often spends time waiting:

```text
Thread
  ↓
HTTP request
  ↓
WAITING...
  ↓
response
  ↓
CPU work
```

Because the CPU is not continuously busy, you can often support more concurrent tasks than the number of CPU cores.

There is no universal magic number.

Tune based on:

- I/O latency
- throughput
- CPU utilization
- memory
- downstream service capacity
- database connection pool size
- queue size
- request latency

---

# 10. Little's Law Intuition

A useful queueing relationship is:

```text
L = λW
```

Where:

- `L` = average number of items in the system
- `λ` = throughput
- `W` = average time in the system

In practical concurrency discussions:

```text
Concurrency ≈ Throughput × Latency
```

Example:

```text
Throughput = 100 requests/sec
Latency    = 0.5 sec

Concurrency ≈ 100 × 0.5
             = 50
```

This gives intuition for why I/O-heavy systems may need more concurrency.

It is an approximation for reasoning, not a magic thread-pool formula.

---

# 11. Future

`Future<T>` represents the result of an asynchronous computation.

```java
Future<Integer> future =
        executor.submit(() -> 10 + 20);
```

Later:

```java
Integer result = future.get();
```

Problem:

```java
future.get();
```

can block until the result is ready.

`Future` is useful for basic async task management, but it is not designed for rich asynchronous composition.

For example, chaining many dependent operations becomes awkward.

---

# 12. CompletableFuture

`CompletableFuture` is a **class**, not an interface.

Conceptually:

```java
CompletableFuture<T>
        implements Future<T>, CompletionStage<T>
```

So:

```text
Future          → interface
CompletionStage → interface
CompletableFuture → class
```

`CompletableFuture` combines:

- Future-style result handling
- asynchronous composition
- chaining
- combining
- exception handling

---

# 13. Creating CompletableFutures

## `supplyAsync()`

Used when the task returns a result.

```java
CompletableFuture<Integer> future =
        CompletableFuture.supplyAsync(() -> 10 + 20);
```

Returns:

```text
CompletableFuture<Integer>
```

---

## `runAsync()`

Used when the task does not return a result.

```java
CompletableFuture<Void> future =
        CompletableFuture.runAsync(() -> {
            System.out.println("Running...");
        });
```

Returns:

```text
CompletableFuture<Void>
```

---

# 14. Static vs Instance Methods in CompletableFuture

This is important for understanding the API.

## Static methods

These create the initial asynchronous computation.

```java
CompletableFuture.supplyAsync(...)
CompletableFuture.runAsync(...)
```

They are called through the class:

```java
CompletableFuture.supplyAsync(...);
```

---

## Instance methods

These continue an existing computation.

```java
future.thenApply(...)
future.thenCompose(...)
future.thenCombine(...)
future.exceptionally(...)
future.handle(...)
```

They are called on a `CompletableFuture` object.

Most importantly:

> These methods return a **new `CompletableFuture` representing the next stage**.

Example:

```java
CompletableFuture<Integer> future =
        CompletableFuture.supplyAsync(() -> 10);

CompletableFuture<Integer> next =
        future.thenApply(x -> x * 2);
```

Conceptually:

```text
supplyAsync()
     ↓
CompletableFuture object
     ↓
thenApply()
     ↓
NEW CompletableFuture
     ↓
next stage
```

This is why chaining works:

```java
CompletableFuture
    .supplyAsync(...)
    .thenApply(...)
    .thenCompose(...)
    .handle(...);
```

---

# 15. `thenApply()`

Use `thenApply()` when the next step is a normal synchronous transformation.

```java
CompletableFuture<Integer> future =
        CompletableFuture.supplyAsync(() -> 10);

CompletableFuture<Integer> result =
        future.thenApply(x -> x * 2);
```

Flow:

```text
10
 ↓
x * 2
 ↓
20
```

Think:

```text
T → U
```

It transforms the result.

---

# 16. `thenCompose()`

Use `thenCompose()` when the next operation is itself asynchronous and depends on the previous result.

Example:

```java
CompletableFuture<User> userFuture =
        getUser();

CompletableFuture<List<Order>> ordersFuture =
        userFuture.thenCompose(
            user -> getOrders(user.getId())
        );
```

The second call needs the result of the first call.

Mental model:

```text
A → B
```

where:

```text
B depends on A
```

Without `thenCompose`, conceptually you could end up with:

```text
CompletableFuture<
    CompletableFuture<List<Order>>
>
```

`thenCompose()` flattens this into:

```text
CompletableFuture<List<Order>>
```

### Interview answer

> "`thenCompose` is for dependent asynchronous operations. It takes the result of one stage and starts another async stage, flattening the nested future."

---

# 17. `thenCombine()`

Use `thenCombine()` when two asynchronous operations are independent and their results need to be combined.

Example:

```java
CompletableFuture<User> user =
        getUser();

CompletableFuture<List<Order>> orders =
        getOrders();

CompletableFuture<Dashboard> dashboard =
        user.thenCombine(
            orders,
            (u, o) -> new Dashboard(u, o)
        );
```

Flow:

```text
User call ──────┐
                ├── combine → Dashboard
Orders call ────┘
```

Mental model:

```text
A + B → C
```

The calls are independent.

---

# 18. `thenCompose()` vs `thenCombine()`

This is one of the most important interview distinctions.

```text
thenCompose
     ↓
A → B
B depends on A
```

Example:

```java
getUser()
    .thenCompose(user ->
        getOrders(user.getId())
    );
```

Versus:

```text
thenCombine
     ↓
A + B → C
A and B are independent
```

Example:

```java
getUser()
    .thenCombine(
        getOrders(),
        (user, orders) ->
            new Dashboard(user, orders)
    );
```

### Easy memory trick

> `compose` = dependent chain  
> `combine` = independent results

---

# 19. `allOf()`

When you have many independent futures, `CompletableFuture.allOf()` is convenient.

Example:

```java
List<CompletableFuture<Result>> futures = ...;

CompletableFuture<Void> all =
        CompletableFuture.allOf(
            futures.toArray(new CompletableFuture[0])
        );
```

`allOf()` completes when all supplied futures complete.

Important:

> `allOf()` returns `CompletableFuture<Void>`.

It does not automatically give you a `List<Result>`.

You can collect the individual results afterward:

```java
CompletableFuture<List<Result>> results =
    all.thenApply(v ->
        futures.stream()
               .map(CompletableFuture::join)
               .toList()
    );
```

### When to use what?

For a small fixed number:

```java
thenCombine()
```

can be very clear.

For dynamic N futures:

```java
allOf()
```

is often more convenient.

---

# 20. Fan-Out / Fan-In

A common async design pattern is fan-out/fan-in.

Suppose a dashboard needs:

```text
User
Orders
Recommendations
```

## Fan-out

Start independent calls concurrently.

```text
                 Request
             /      |       \
            ↓       ↓        ↓
          User    Orders   Recommendations
```

That is:

> One request fans out into multiple independent tasks.

## Fan-in

Combine the results.

```text
User ──────────┐
Orders ────────┼──→ Dashboard
Recommendations┘
```

That is:

> Multiple results are brought back together into one final result.

### Why it matters

Sequential:

```text
User:            1 sec
Orders:          1 sec
Recommendations: 1 sec

Total ≈ 3 sec
```

Concurrent fan-out:

```text
User:            1 sec ──┐
Orders:          1 sec ──┼──→ combine
Recommendations: 1 sec ──┘

Total ≈ 1 sec
```

Real systems have overhead and capacity limits, so this is an intuition rather than a guarantee.

### Important clarification

Three service calls do not mean three phases.

There are two conceptual phases:

```text
1. Fan-out
   ↓
   start multiple independent calls

2. Fan-in
   ↓
   wait for/combine their results
```

---

# 21. CompletableFuture Exception Handling

Async pipelines need explicit error handling.

## `exceptionally()`

Use it to recover from an exception with a fallback value.

```java
CompletableFuture<String> future =
    CompletableFuture.supplyAsync(() -> {
        throw new RuntimeException("Failed");
    }).exceptionally(ex -> {
        return "Fallback";
    });
```

Mental model:

```text
success
   ↓
normal result

failure
   ↓
exceptionally()
   ↓
fallback
```

---

# 22. `handle()`

`handle()` receives both:

- the result
- the exception

Example:

```java
CompletableFuture<String> future =
    CompletableFuture.supplyAsync(() -> "Hello")
        .handle((result, exception) -> {

            if (exception != null) {
                return "Fallback";
            }

            return result;
        });
```

Mental model:

```text
result + exception
       ↓
    handle()
       ↓
   new result
```

It runs for both success and failure.

---

# 23. `exceptionally()` vs `handle()`

| Method | Success | Failure | Purpose |
|---|---|---|---|
| `exceptionally()` | normally passes result | handles exception | recovery |
| `handle()` | receives result | receives exception | transform both outcomes |

Easy memory:

```text
exceptionally
    ↓
"Only care about failure"

handle
    ↓
"I want to inspect success OR failure"
```

---

# 24. `thenApplyAsync()` and Executors

There are synchronous-style and async continuation variants.

```java
future.thenApply(...)
```

and:

```java
future.thenApplyAsync(...)
```

You can also provide an executor:

```java
future.thenApplyAsync(
    value -> transform(value),
    executor
);
```

The explicit executor lets the application control where that asynchronous continuation runs.

---

# 25. CompletableFuture and the Common Pool

Consider:

```java
CompletableFuture.supplyAsync(
    () -> userService.getUser()
);
```

No executor was supplied.

The async task uses the default asynchronous execution facility, commonly the:

```text
ForkJoinPool.commonPool()
```

Conceptually:

```text
supplyAsync(task)
       ↓
no executor supplied
       ↓
common pool
```

If you provide an executor:

```java
ExecutorService executor =
        Executors.newFixedThreadPool(20);

CompletableFuture<User> user =
    CompletableFuture.supplyAsync(
        () -> userService.getUser(),
        executor
    );
```

Now that workload uses your supplied executor.

### Why explicit executors matter

Using a dedicated executor can give the application control over:

- pool size
- concurrency
- lifecycle
- workload isolation
- resource usage

For blocking I/O, this can prevent unrelated workloads from competing for the same shared pool.

### Interview wording

Avoid saying:

> "The threads are completely outside our control."

Better:

> "If I don't provide an executor, CompletableFuture uses the common pool/default asynchronous execution facility. If I need workload-specific concurrency and lifecycle control, I can provide an explicit executor."

---

# 26. Daemon Threads

A daemon thread is a background thread that does not keep the JVM alive.

Example:

```java
Thread thread = new Thread(() -> {
    while (true) {
        // background work
    }
});

thread.setDaemon(true);
thread.start();
```

If only daemon threads remain, the JVM may exit.

Conceptually:

```text
User threads
     ↓
keep JVM alive

Daemon threads
     ↓
do NOT keep JVM alive
```

Typical use cases:

- background housekeeping
- monitoring
- non-critical background work

Do not rely on daemon threads for critical work such as:

- saving important data
- completing transactions
- guaranteed cleanup

### Interview answer

> "Daemon threads are background threads that do not prevent JVM shutdown. They are appropriate for non-critical background work."

---

# 27. Virtual Threads — Java 21

Virtual threads were introduced in Java 21 as part of Project Loom.

They are lightweight threads managed by the JVM.

Example:

```java
Thread.startVirtualThread(() -> {
    System.out.println("Running in virtual thread");
});
```

Or:

```java
try (var executor =
        Executors.newVirtualThreadPerTaskExecutor()) {

    executor.submit(() -> {
        // task
    });
}
```

## Why virtual threads?

They are especially useful for high-concurrency, I/O-heavy workloads.

Example:

```text
HTTP request
    ↓
database call
    ↓
waiting...
    ↓
response
```

A virtual thread can be suspended while waiting for blocking I/O, allowing the system to support large numbers of concurrent tasks more efficiently than creating the same number of platform threads.

### Important interview point

Virtual threads do not make CPU-bound calculations magically faster.

Think:

```text
Virtual threads
      ↓
cheap concurrency
      ↓
excellent for many blocking/I/O tasks
```

Not:

```text
Virtual threads
      ↓
faster CPU
```

Also, virtual threads do not remove downstream limits.

For example, if a database allows only 100 connections, creating 100,000 virtual threads does not mean 100,000 database operations can execute simultaneously.

You still need to control:

- DB connection pools
- rate limits
- external service capacity
- memory
- application resources

### Interview answer

> "Virtual threads are lightweight JVM-managed threads introduced in Java 21. They improve scalability for high-concurrency workloads, especially blocking I/O, but they do not make CPU-bound work faster."

---

# 28. Concurrency vs Parallelism

These concepts are related but different.

## Concurrency

Multiple tasks are in progress during the same period.

```text
Task A ─────────────
       Task B ────────
            Task C ─────
```

They may be interleaved.

## Parallelism

Multiple tasks execute literally at the same time on different CPU cores.

```text
Core 1: Task A ─────
Core 2: Task B ─────
Core 3: Task C ─────
```

Simple mental model:

> Concurrency = dealing with many things at once.

> Parallelism = executing many things at the same time.

---

# 29. Why Bounded Pools Beat Raw `new Thread()`

Suppose an application receives a huge number of requests.

Raw threads:

```java
new Thread(task).start();
```

for every task can create too many threads.

A bounded executor:

```text
                    Tasks
                      ↓
               bounded queue
                      ↓
              ┌─────────────┐
              │ fixed pool  │
              └─────────────┘
               ↓    ↓    ↓
              T1    T2    T3
```

gives:

- resource control
- thread reuse
- bounded concurrency
- queueing
- predictable behavior
- rejection/back-pressure policies
- lifecycle management

### Say this out loud

> "Bounded thread pools are preferable to creating a new thread per task because they reuse threads, limit concurrency, control resource consumption, and provide queueing and back-pressure."

---

# 30. End-to-End Fan-Out Example

Imagine an API needs:

```text
User
Orders
Recommendations
```

We can use an executor:

```java
ExecutorService executor =
        Executors.newFixedThreadPool(20);
```

Start independent calls:

```java
CompletableFuture<User> user =
    CompletableFuture.supplyAsync(
        () -> userService.getUser(),
        executor
    );

CompletableFuture<List<Order>> orders =
    CompletableFuture.supplyAsync(
        () -> orderService.getOrders(),
        executor
    );

CompletableFuture<List<Product>> recommendations =
    CompletableFuture.supplyAsync(
        () -> recommendationService.getRecommendations(),
        executor
    );
```

Then combine:

```java
CompletableFuture<Dashboard> dashboard =
    user.thenCombine(
        orders,
        (u, o) -> new PartialDashboard(u, o)
    ).thenCombine(
        recommendations,
        (partial, r) ->
            new Dashboard(
                partial.user(),
                partial.orders(),
                r
            )
    );
```

Conceptually:

```text
                 Request
                    |
             ┌──────┼──────┐
             ↓      ↓      ↓
           User   Orders   Recs
             |      |       |
             └──────┼───────┘
                    ↓
                  Fan-in
                    ↓
                Dashboard
```

The calls are independent, so they can be started concurrently.

---

# 31. `thenCompose` Example — Dependent Calls

Suppose we first need the user ID and then use that ID to retrieve orders.

```java
CompletableFuture<List<Order>> orders =
    getUser()
        .thenCompose(user ->
            getOrders(user.getId())
        );
```

Flow:

```text
getUser()
   ↓
User
   ↓
getOrders(user.id)
   ↓
Orders
```

This is a dependency chain.

Therefore:

```text
thenCompose = dependent async work
```

---

# 32. `thenCombine` Example — Independent Calls

Suppose user and orders can be fetched independently.

```java
CompletableFuture<User> user =
    getUser();

CompletableFuture<List<Order>> orders =
    getOrders();

CompletableFuture<Dashboard> dashboard =
    user.thenCombine(
        orders,
        (u, o) -> new Dashboard(u, o)
    );
```

Flow:

```text
getUser() ──────┐
                ├──→ Dashboard
getOrders() ────┘
```

Therefore:

```text
thenCombine = independent async work
```

---

# 33. Important CompletableFuture API Mental Model

Think of a CompletableFuture pipeline like this:

```text
CompletableFuture
      ↓
thenApply()
      ↓
NEW CompletableFuture
      ↓
thenCompose()
      ↓
NEW CompletableFuture
      ↓
thenCombine()
      ↓
NEW CompletableFuture
      ↓
handle()
      ↓
NEW CompletableFuture
```

The methods are not simply mutating the same future object.

They create stages representing the next computation.

This is the foundation of chaining.

---

# 34. Common Interview Traps

## Trap 1 — `run()` vs `start()`

```java
thread.run();
```

does not create a new thread.

```java
thread.start();
```

starts a new thread.

---

## Trap 2 — Java has a `RUNNING` state

Java's `Thread.State` has:

```text
NEW
RUNNABLE
BLOCKED
WAITING
TIMED_WAITING
TERMINATED
```

There is no separate `RUNNING` enum state.

---

## Trap 3 — `shutdownNow()` kills threads immediately

It does not guarantee that.

It attempts interruption.

Tasks must cooperate with interruption.

---

## Trap 4 — More threads always means more performance

False.

CPU-bound work can become slower with too many threads because of contention and context switching.

---

## Trap 5 — `thenCompose` and `thenCombine` are the same

They are not.

```text
thenCompose
    A → B
    dependent

thenCombine
    A + B → C
    independent
```

---

## Trap 6 — `allOf()` returns all results

It returns:

```java
CompletableFuture<Void>
```

You collect results from the original futures.

---

## Trap 7 — Virtual threads make CPU faster

No.

They mainly improve concurrency/scalability for workloads with lots of waiting, especially blocking I/O.

---

## Trap 8 — CompletableFuture is an interface

No.

```text
CompletableFuture = class

Future = interface
CompletionStage = interface
```

---

# 35. Interview "Say This Out Loud"

## Thread vs Runnable vs Callable

> "`Thread` represents the execution mechanism, while `Runnable` and `Callable` represent tasks. Runnable doesn't return a result, Callable does and can throw checked exceptions. In production I generally prefer tasks with executors rather than extending Thread."

## Thread pools

> "Thread pools reuse worker threads and bound concurrency, which avoids the resource cost and unpredictability of creating a new thread for every task."

## `execute()` vs `submit()`

> "`execute()` is fire-and-forget for Runnable tasks. `submit()` returns a Future, so I can obtain a result, check completion, or cancel the task."

## Pool shutdown

> "`shutdown()` stops accepting new tasks but allows submitted tasks to finish. `shutdownNow()` attempts interruption and returns tasks that haven't started. `awaitTermination()` lets me wait for termination."

## CPU vs I/O pools

> "For CPU-bound work, a pool around the number of available processors is a common starting point. I/O-bound workloads can use more concurrency because threads spend time waiting, but the actual size should be tuned against latency, throughput, memory, and downstream capacity."

## CompletableFuture

> "`CompletableFuture` is a class implementing Future and CompletionStage. It supports asynchronous computation, chaining, combining, and exception handling."

## `thenCompose` vs `thenCombine`

> "`thenCompose` is for dependent asynchronous operations, while `thenCombine` is for independent asynchronous operations whose results need to be combined."

## Fan-out/fan-in

> "Fan-out means starting multiple independent operations concurrently, and fan-in means waiting for and combining those results into a final result."

## Common pool

> "If I don't provide an executor to supplyAsync, CompletableFuture uses the common pool/default asynchronous execution facility. For workload-specific control, I can pass an explicit executor."

## Daemon threads

> "Daemon threads are background threads that don't keep the JVM alive, so I shouldn't use them for critical work that must complete."

## Virtual threads

> "Virtual threads are lightweight JVM-managed threads introduced in Java 21. They are especially useful for high-concurrency blocking I/O workloads and improve scalability rather than CPU performance."

---

# 36. Final Mental Model

```text
                    CONCURRENCY
                         |
        ┌────────────────┼────────────────┐
        ↓                ↓                ↓
     Thread           Executor       CompletableFuture
        |                |                |
    execution        thread pool       async pipeline
                         |                |
              ┌──────────┼──────────┐     |
              ↓          ↓          ↓     |
            fixed      cached     single  |
              |                           |
              └──── resource control ─────┘
                                           |
                       ┌───────────────────┼──────────────────┐
                       ↓                   ↓                  ↓
                  thenApply          thenCompose        thenCombine
                    T → U             A → B              A+B → C
                                      dependent          independent
                                           |
                                      exceptionally
                                           |
                                         handle
```

The most important concepts to deeply understand are:

```text
1. Thread vs Task
2. ExecutorService and thread pools
3. Pool lifecycle and rejection
4. CPU-bound vs I/O-bound sizing
5. Future vs CompletableFuture
6. thenApply vs thenCompose vs thenCombine
7. Fan-out / Fan-in
8. Common pool vs explicit executor
9. Daemon threads
10. Virtual threads
```

## One-line mental models

```text
Runnable
→ task with no result

Callable<T>
→ task with a result

Thread
→ execution mechanism

ExecutorService
→ manages worker threads

Thread pool
→ reuse + bounded concurrency

Future
→ handle one async result

CompletableFuture
→ async result + composition

thenApply
→ transform result

thenCompose
→ dependent async operation

thenCombine
→ combine independent async operations

allOf
→ wait for many futures

exceptionally
→ recover from failure

handle
→ handle success or failure

fan-out
→ one request → many parallel tasks

fan-in
→ many results → one final result

daemon
→ background thread that doesn't keep JVM alive

virtual thread
→ lightweight concurrency, especially for blocking I/O
```
