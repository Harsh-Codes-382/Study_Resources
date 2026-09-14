# Core Java 1.1 — JVM, Memory & Class Loading

> **How to use this note:** Read the explanation top-to-bottom once. Then cover the
> answers in the **Question Bank** at the bottom and self-quiz cold. Tick 1.1 in
> `PLAN.md` only when you can *say* the `→` points out loud with no notes.

---

## 1 · JDK vs JRE vs JVM

Think of three **nested boxes**:

```
┌─────────────────────────── JDK (Java Development Kit) ──────────────────────────┐
│  Tools to BUILD: javac (compiler), jar, javap, jdb (debugger), jlink...          │
│  ┌──────────────────────── JRE (Java Runtime Environment) ───────────────────┐   │
│  │  Core libraries: java.lang, java.util, java.io, collections, etc.          │   │
│  │  ┌──────────────────── JVM (Java Virtual Machine) ─────────────────────┐   │   │
│  │  │  The ENGINE that actually executes bytecode.                         │   │   │
│  │  │  Contains: classloader, interpreter, JIT compiler, GC, memory areas. │   │   │
│  │  └──────────────────────────────────────────────────────────────────────┘   │
│  └────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

- **JVM** — the *engine* that runs your compiled bytecode. It is a **specification**;
  HotSpot is the common implementation shipped by Oracle/OpenJDK.
- **JRE** = JVM **+** the standard class libraries. Everything needed to **run** a Java
  program, but nothing to build one.
- **JDK** = JRE **+** developer tools (`javac`, `jar`, `javap`…). What you install to
  **write** Java.

**Relationship:** `JDK ⊃ JRE ⊃ JVM`.

> One-liner: **"JDK is for developers, JRE is just for running, JVM is what actually
> executes the bytecode."**

**One-layer-deeper (the "why"):**
- Since **Java 11** the standalone JRE download was dropped. Today you ship a full JDK,
  or build a **trimmed custom runtime** with `jlink` (only the modules your app needs).
  Mentioning this signals you're current.

---

## 2 · How your code actually runs (`.java` → native)

```
  Hello.java          Hello.class            loaded into JVM         runs as
 (source, text)  ──▶  (bytecode, portable) ──▶  (classloader)   ──▶  native CPU
      │  javac              │                        │                instructions
      │                     │                        │                    ▲
   you write         platform-INDEPENDENT      lazy: loaded          interpreter
                     instructions for the      on first use          + JIT compiler
                     "virtual" machine
```

Step by step:

1. **`javac` compiles source → bytecode.** Bytecode is a compact instruction set for the
   *virtual* machine, not for any real CPU. This is the **"write once, run anywhere"**
   part — the same `.class` runs on Windows, Linux, Mac.
2. **Classloader loads the `.class` into the JVM** — but **lazily**, only the first time a
   class is actually used (not all upfront).
3. **The JVM starts by INTERPRETING** the bytecode — reading and executing it one
   instruction at a time. Slow per-instruction, but starts instantly.
4. **The JIT (Just-In-Time) compiler** watches which methods run a lot ("**hot**" methods)
   and compiles *those* to **native machine code** in the background. So a long-running
   app **gets faster the longer it runs**.

> The key idea interviewers want: **bytecode is portable; native code is not.** The JVM
> is the bridge — it turns portable bytecode into machine-specific instructions at runtime.

**Interpret vs compile — Java does BOTH:**
| | Pure interpreter | Pure compiler (AOT, like C) | Java (JVM) |
|---|---|---|---|
| Startup | Fast | Slow (compile first) | Fast (interprets first) |
| Peak speed | Slow | Fast | Fast (JITs hot code) |
| Portability | High | Low (per-platform binary) | High (bytecode) |

Java gets fast startup **and** near-native peak speed by mixing the two.

---

## 3 · Memory areas — Heap vs Stack vs Metaspace

**The single most important subsection. Nail it.**

| Area | What lives there | Shared? | Reclaimed by |
|------|------------------|---------|--------------|
| **Heap** | **Objects** — everything created with `new` | **Shared** across all threads | Garbage Collector |
| **Stack** | Method frames, local variables, **references** | **One stack per thread** | Automatically, when the method returns |
| **Metaspace** | Class metadata (the loaded structure of each class) | Shared | GC (when a classloader is unloaded) |

### The mental model that makes it click

```java
void doWork() {
    int count = 5;                      // primitive local  → STACK
    Person p = new Person("Harsh");     // 'p' (reference)   → STACK
                                        // the Person object → HEAP
}
```

- `new Person(...)` creates an **object** → it lives on the **heap**.
- `p` is a **reference** (basically an address) → it lives on the **stack**, inside this
  method's frame.
- `count` is a **primitive local** → also on the **stack**.
- When `doWork()` **returns**, its stack frame is **popped**. `p` and `count` vanish.
  The `Person` object on the heap is now **unreachable** → the GC will reclaim it later.

### The "frame" idea (Stack)

Every time you **call a method**, the JVM pushes a **frame** onto that thread's stack.
The frame holds that call's locals, parameters, and references. When the method returns,
the frame is popped. This is why:

- **Recursion that's too deep** blows the stack → `StackOverflowError`.
- Locals are **automatically cleaned** — no GC needed for the stack.

### Two facts that impress interviewers

1. **Stack is per-thread, heap is shared.**
   → Locals on the stack are **inherently thread-safe** (no other thread can see them).
   → Objects on the shared heap **can** be seen by multiple threads, so shared mutable
     objects need **synchronization**.

2. **You never call `free()`.** In C you manually free memory; in Java the **GC** reclaims
   objects once they become **unreachable**.

### What does "unreachable" mean? (GC roots)

An object is **alive** if there's a chain of references reaching it starting from a
**GC root**. If no such chain exists, it's **garbage**.

**GC roots** = things that are definitely alive right now:
- **Active local variables / references on any thread's stack** (currently-running methods)
- **`static` fields** (class-level, live as long as the class is loaded)
- **JNI references** (from native code)

```
GC ROOTS ──▶ objectA ──▶ objectB          ← reachable, kept alive
                          objectC          ← nothing points here → GARBAGE → collected
```

> So "unreachable" ≠ "no longer used by you" — it means **the GC can't reach it from any
> root**. That's the precise definition to give.

### Common trap: where do primitives go?

- A **local primitive** (`int x = 5` inside a method) → **stack**.
- A **primitive field inside an object** (`class Foo { int y; }`) → **heap**, together with
  the object.
- It's about **where it's declared**, not the type.

### Metaspace (the class metadata area)

- Stores the **loaded structure of each class**: method bytecode, field info, the
  constant pool, etc. — *not* your objects.
- **Replaced PermGen in Java 8.** Say this: *"PermGen was a fixed-size region in the heap
  and often caused `OutOfMemoryError: PermGen space`, especially in apps that load lots
  of classes. Metaspace lives in **native memory** and grows automatically, so those
  errors mostly went away."*

---

## 4 · Classloader hierarchy

Classes are loaded by a **chain of three loaders**, parent-first:

```
        Bootstrap ClassLoader        ← loads core JDK (java.lang.*, java.util.*)
              ▲                         (written in native code; the "root")
              │  parent
        Platform / Extension          ← loads platform / extension modules
              ▲
              │  parent
        Application / System          ← loads YOUR classes from the classpath
```

### The delegation model (parent-first)

When a class is requested, a loader **does not load it immediately**. It first **asks its
parent**, which asks *its* parent, all the way up to Bootstrap. Only if **no parent** can
find the class does the child loader try to load it itself.

```
"Load com.harsh.Person"
   App loader → asks Platform → asks Bootstrap
   Bootstrap: "not mine"  →  Platform: "not mine"  →  App: "mine, loading it"
```

### Why parent-first? (the real interview answer)

1. **Security** — you **cannot** override core classes. If you write your own
   `java.lang.String`, the Bootstrap loader loads the **real** one first, so yours is
   never used. This stops malicious code from replacing trusted classes.
2. **No duplicates / consistency** — a core class is loaded **once** by one loader, so
   there's a single definitive version across the app.

---

## 5 · Garbage Collection (high level)

The GC automatically reclaims heap objects that are no longer reachable. The heap is split
by **object age**, based on the **"generational hypothesis": most objects die young.**

```
┌──────────────────────── HEAP ────────────────────────┐
│  YOUNG GEN                          OLD (TENURED) GEN  │
│  ┌────────┬──────────┬──────────┐  ┌────────────────┐ │
│  │  Eden  │ Survivor │ Survivor │  │  long-lived     │ │
│  │        │    S0    │    S1    │  │  objects        │ │
│  └────────┴──────────┴──────────┘  └────────────────┘ │
│   new objects born here            survivors promoted  │
│   → MINOR GC (fast, frequent)      → MAJOR GC (slower) │
└───────────────────────────────────────────────────────┘
```

- **Young gen** (Eden + two Survivor spaces) — brand-new objects go into **Eden**. When
  Eden fills, a **Minor GC** runs: it's **fast and frequent**, keeps survivors, discards
  the rest.
- **Old / Tenured gen** — objects that survive several minor GCs get **promoted** here
  ("they've proven they live long"). Cleaning this region is a **Major GC** — **slower and
  less frequent**.
- **Stop-the-world (STW)** — during (parts of) a GC, **all application threads pause** so
  the collector can work safely. Modern collectors are engineered to keep these pauses
  **very short**.

### Good-to-know one-liners (say these, don't go deeper)

- **G1 GC ("Garbage First")** — the **default since Java 9**. Splits the heap into many
  **regions** and collects the ones with the **most garbage first**, aiming for a
  **predictable pause-time target**.
- **ZGC** — an **ultra-low-pause** collector; pauses stay **sub-millisecond** even on
  **huge heaps** (hundreds of GB). Pause time doesn't grow with heap size.
- **`System.gc()`** — only a **request**, not a command. The JVM may ignore it.
  **Never rely on it.**

> **Skip (as per syllabus):** GC flag tuning and deep generational internals — not worth
> your time at this stage.

---

## 6 · JIT tiered compilation (good-to-know)

The JIT doesn't jump straight to fully-optimized native code. It works in **tiers**:

- **C1 (client) compiler** — compiles quickly with **light** optimizations → good for
  **fast startup**.
- **C2 (server) compiler** — compiles the **hottest** methods with **heavy**
  optimizations → good for **peak throughput**.

**Tiered compilation** uses both: start interpreting → C1 for warm methods → C2 for the
truly hot ones. Result: **quick startup AND high peak performance.**

---

## 7 · OutOfMemoryError vs StackOverflowError

Both are **`Error`s** (not `Exception`s) — you're **not** meant to catch and recover from
them; they signal the JVM itself is in trouble.

| | `OutOfMemoryError` | `StackOverflowError` |
|--|--------------------|----------------------|
| **Where** | The **heap** is full | A thread's **stack** is full |
| **Typical cause** | Too many live objects, a **memory leak**, or genuinely too much data | **Too-deep or infinite recursion** |
| **Scope** | Whole JVM (shared heap) | Per-thread (each thread has its own stack) |
| **Fix direction** | Find the leak / reduce retained data / raise `-Xmx` | Fix the recursion (add a base case / make it iterative) |

> One-liner: **"OOM = heap exhausted (leak or too much data); SOE = stack exhausted
> (runaway recursion)."**

---

## ✅ Must-be-able-to-say checklist (from PLAN.md `→` lines)

- [ ] Objects live on the **heap**; frames/locals/references live on the **stack**.
- [ ] **Stack is per-thread; heap is shared.**
- [ ] You never `free()` — the **GC** reclaims **unreachable** objects.
- [ ] "Unreachable" = **not reachable from any GC root** (stack refs, statics, JNI).
- [ ] G1 vs ZGC in one line each; JIT tiered compilation in one line.
- [ ] `OutOfMemoryError` (heap) vs `StackOverflowError` (stack).

---

## 🎯 Question Bank (self-quiz — cover the answers)

1. **Difference between JDK, JRE, JVM?**
   → JDK builds, JRE runs, JVM executes bytecode. Nested: `JDK ⊃ JRE ⊃ JVM`.

2. **Is the JVM platform-independent?**
   → **No.** The JVM itself is platform-*specific* (a different binary per OS).
   **Bytecode** is what's platform-independent. The JVM bridges portable bytecode to the
   local machine.

3. **What happens from `.java` to running code?**
   → `javac` compiles source → bytecode (`.class`); classloader loads it lazily; JVM
   interprets it first, then JIT-compiles hot methods to native code.

4. **Does Java interpret or compile?**
   → **Both.** Interprets at first for fast startup, then JIT-compiles frequently-run
   ("hot") methods to native for speed.

5. **Heap vs stack — what goes where?**
   → Objects on the heap (shared across threads); method frames, locals, and references
   on the stack (one per thread).

6. **Where do primitives live?**
   → A local primitive → stack. A primitive **field of an object** → heap, with the
   object. Depends on where it's declared, not the type.

7. **Is the stack or heap thread-safe?**
   → The stack is per-thread, so locals are inherently thread-safe. The heap is shared, so
   shared mutable objects need synchronization.

8. **How does the GC decide what to collect?**
   → It collects **unreachable** objects — those with no reference chain from a GC root.

9. **What are GC roots?**
   → Active references on thread stacks, `static` fields, and JNI references.

10. **Can you force garbage collection?**
    → `System.gc()` is only a **request**; the JVM may ignore it. Don't rely on it.

11. **Minor vs Major GC / young vs old gen?**
    → New objects go in the young gen → cleaned by frequent, fast **Minor GC**. Survivors
    are promoted to the old gen → cleaned by slower **Major GC**. Based on "most objects
    die young."

12. **What is "stop-the-world"?**
    → A pause where all app threads stop so the GC can work safely. Modern collectors keep
    it very short.

13. **G1 vs ZGC?**
    → G1: region-based, default since Java 9, collects most-garbage regions first for
    predictable pauses. ZGC: ultra-low (sub-ms) pauses that stay flat even on huge heaps.

14. **What is the classloader delegation model, and why parent-first?**
    → A loader asks its parent before loading a class itself. Parent-first gives
    **security** (can't override core classes like `java.lang.String`) and **no duplicate**
    core classes.

15. **Name the three classloaders.**
    → Bootstrap (core JDK), Platform/Extension, Application/System (your classpath).

16. **What replaced PermGen and why?**
    → **Metaspace** (Java 8). PermGen was fixed-size and caused `OutOfMemoryError: PermGen`;
    Metaspace lives in native memory and grows automatically.

17. **What lives in Metaspace?**
    → Class **metadata** (loaded class structure, method info, constant pool) — not your
    objects.

18. **`OutOfMemoryError` vs `StackOverflowError`?**
    → OOM = heap full (leak / too much data). SOE = stack full (too-deep or infinite
    recursion). Both are `Error`s you shouldn't try to recover from.

19. **What is JIT tiered compilation?**
    → C1 compiles fast with light optimization (startup); C2 heavily optimizes the hottest
    methods (throughput). Using both gives fast startup **and** peak performance.

20. **Why can't you replace `java.lang.String` with your own?**
    → Parent-first delegation: the Bootstrap loader loads the real `String` first, so your
    version is never used. This is a security guarantee.
