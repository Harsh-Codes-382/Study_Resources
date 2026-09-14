# Core Java 1.5 — Exceptions

> **How to use this note:** Read top-to-bottom once. The **⚖️ side-by-side** blocks are the
> fast-scan payload — read those first on a revision pass. Then cover the **Question Bank**
> and self-quiz cold. Tick 1.5 in `PLAN.md` only when you can *say* the `→` points out loud.

---

## 1 · Checked vs unchecked

- **Checked** — compiler **forces** you to handle it (`catch` or declare `throws`). Extends
  `Exception` but **not** `RuntimeException`. E.g. `IOException`, `SQLException`.
- **Unchecked** — compiler does **not** force handling. Extends `RuntimeException`. E.g.
  `NullPointerException`, `IllegalArgumentException`, `IllegalStateException`.

**⚖️ When each — recoverable condition vs programming error:**

```java
// CHECKED — a recoverable, anticipated condition.        | // UNCHECKED — a bug / broken precondition.
// The caller has a real decision (retry, fall back).      | // The caller should have prevented it.
void load() throws IOException {                           | void setAge(int age) {
    Files.readAllBytes(path);   // file may be missing      |     if (age < 0)
}                                                          |         throw new IllegalArgumentException("age < 0");
                                                           | }   // caller passed garbage — don't "handle", fix the call
```

> Say it: **checked = recoverable situation the caller can act on; unchecked = a programming
> error the caller should have avoided.** (Modern frameworks like Spring lean unchecked to
> avoid `throws` clutter — but know the principled split.)

---

## 2 · The Throwable hierarchy

```
Throwable                       ← the only thing you can throw/catch
├── Error            (unchecked) ← JVM-level, DON'T catch
│   ├── OutOfMemoryError
│   └── StackOverflowError
└── Exception
    ├── (checked)                ← IOException, SQLException, ...
    └── RuntimeException (unchecked)
        ├── NullPointerException
        ├── IllegalArgumentException
        └── IndexOutOfBoundsException
```

- **`Error`** = the JVM is in trouble (OOM, stack overflow). Nothing sensible to do → don't
  catch.
- **`Exception`** = application problems. Everything under it is **checked** *except* the
  **`RuntimeException`** subtree, which is **unchecked**.

> Quick test: **under `RuntimeException` or `Error` → unchecked; otherwise under `Exception`
> → checked.**

---

## 3 · try / catch / finally + multi-catch

```java
try {
    risky();
} catch (FileNotFoundException e) {   // most specific FIRST
    ...
} catch (IOException e) {             // broader after
    ...
} finally {
    cleanup();                        // ALWAYS runs
}
```

- **Order matters** — specific before broad. Broad-first is a **compile error** (specific
  branch unreachable).
- **`finally` always runs** — success, throw, or `return`. Only skipped by `System.exit()`
  or a JVM/thread kill.

**⚖️ Repetitive catches → multi-catch (Java 7+):**

```java
// BEFORE — duplicated handler bodies              | // AFTER — one handler, catch (A | B e)
try { ... }                                        | try { ... }
catch (IOException e)  { log.error("fail", e); }   | catch (IOException | SQLException e) {
catch (SQLException e) { log.error("fail", e); }   |     log.error("fail", e);   // e is implicitly final
                                                   | }
```

Rule: the types in a multi-catch **can't be parent/child** of each other (catch the parent
instead), and `e` is **implicitly final**.

---

## 4 · try-with-resources & AutoCloseable

Any resource implementing **`AutoCloseable`** (declares `close()`) declared in the `try(...)`
header is closed **automatically**.

**⚖️ Manual finally-close vs try-with-resources:**

```java
// OLD — verbose, leak-prone, close() can MASK the      | // NEW — auto-closed, reverse order, cause preserved
// real error                                           |
BufferedReader br = null;                                | try (BufferedReader br = new BufferedReader(reader);
try {                                                    |      Connection conn = ds.getConnection()) {
    br = new BufferedReader(reader);                      |     use(br, conn);
    use(br);                                              | }   // conn.close() then br.close() — REVERSE order,
} finally {                                               |     // automatic, even on exception/early return
    if (br != null) br.close();  // if body threw AND     |
}                                // close() throws, the   |
                                 // close() error REPLACES|
                                 // the real one → lost   |
```

Three wins (say-out-loud):
1. **No leak** — `close()` guaranteed even on exception / early return; can't forget it.
2. **Reverse order** — last-opened closes first (respects dependencies: statement before
   connection).
3. **Suppressed exceptions** — if the **body throws AND `close()` throws**, the **body's
   exception wins** (primary) and the `close()` one is **attached** via `e.getSuppressed()`
   — not silently swallowed. The old `finally`-close *lost* the original here.

---

## 5 · Custom exceptions + `throw` vs `throws`

**⚖️ One letter, totally different:**

```java
// throw  → a STATEMENT that raises one    | // throws → a SIGNATURE clause: "may throw, caller beware"
throw new IllegalArgumentException("bad"); | void read() throws IOException { ... }
```

**Custom exception** — extend `RuntimeException` (unchecked, default for domain errors) or
`Exception` (checked). Always give it a **`(String, Throwable)`** constructor so callers can
chain a cause:

```java
public class OrderNotFoundException extends RuntimeException {
    public OrderNotFoundException(String msg)               { super(msg); }
    public OrderNotFoundException(String msg, Throwable cause){ super(msg, cause); }  // ← chainable
}
```

---

## 6 · Exception chaining / wrapping

**⚖️ Lose the cause vs preserve it:**

```java
// BAD — original stack trace GONE, debug blind      | // GOOD — cause preserved → "Caused by: ..." in trace
catch (SQLException e) {                              | catch (SQLException e) {
    throw new DataAccessException("load failed");     |     throw new DataAccessException("load failed", e);
}                                                     | }                                              // ↑ cause
```

- **Never swallow the cause** — pass `e` as the second arg so the full chain (symptom →
  root SQL error) survives.
- **Wrap checked as unchecked** — catch a low-level checked `SQLException` and rethrow an
  unchecked domain exception, so `throws SQLException` doesn't leak up through every layer.
  You translate an implementation detail into a domain concept **while keeping the trace**.

---

## 7 · The `finally` gotcha (high-value)

**⚖️ `return`/`throw` in `finally` silently OVERRIDES the `try`:**

```java
int f() {                          | int g() {
    try {                          |     try {
        return 1;   // computed... |         throw new RuntimeException("real");  // thrown...
    } finally {                    |     } finally {
        return 2;   // ...WINS → 2 |         return 0;   // ...SWALLOWED → g() returns 0, no exception
    }                              |     }
}                                  | }
```

A `return` in `finally` overrides the try's return **and swallows any exception** the try was
throwing. **Rule: never `return` or `throw` from `finally` — use it for cleanup only.**

---

## ✅ Must-be-able-to-say checklist (from PLAN.md `→` lines)

- [ ] Checked vs unchecked, and when each — recoverable condition vs programming error.
- [ ] Why try-with-resources beats manual finally-close — auto-close in reverse order, no
      leak, keeps suppressed exceptions.
- [ ] The finally gotcha — a `return` / `throw` in `finally` overrides the try's; never
      return from `finally`.

---

## 🎯 Question Bank (self-quiz — cover the answers)

1. **Checked vs unchecked — difference and when you create each?**
   → Checked: compiler-enforced, extends `Exception` (not `RuntimeException`), for
   **recoverable** conditions (I/O, DB) the caller can act on. Unchecked: not enforced,
   extends `RuntimeException`, for **programming errors** (null, bad arg, illegal state) the
   caller should have prevented.

2. **Sketch the Throwable hierarchy.**
   → `Throwable` → `Error` (unchecked, JVM-level, don't catch) + `Exception`. Under
   `Exception`: everything checked **except** the `RuntimeException` subtree (unchecked).

3. **Why not catch `Error`?**
   → It signals the JVM itself is failing (OOM, stack overflow) — no meaningful recovery.

4. **Why must specific catches come before broad ones?**
   → A broader catch first makes the specific branch **unreachable** → compile error.

5. **What is multi-catch and its two rules?**
   → `catch (A | B e)` — one handler for several types. Types can't be parent/child; `e` is
   implicitly final.

6. **try-with-resources vs manual finally-close — what does it give you?**
   → Guaranteed close (no leak), **reverse-order** close, and **suppressed exceptions** — if
   both body and `close()` throw, the body's exception is primary and `close()`'s is attached
   (`getSuppressed()`), not lost. Requires `AutoCloseable`.

7. **What are suppressed exceptions?**
   → When the try body throws and a resource's `close()` also throws, the close exception is
   *suppressed* (attached to the primary via `getSuppressed()`) instead of replacing it.

8. **`throw` vs `throws`?**
   → `throw` = statement that raises an exception now. `throws` = method-signature clause
   declaring checked exceptions the method may propagate.

9. **How do you write a custom exception, and checked or unchecked?**
   → Extend `RuntimeException` (unchecked — default for domain errors) or `Exception`
   (checked). Give it a `(String, Throwable)` constructor for cause chaining.

10. **What is exception chaining and why wrap checked as unchecked?**
    → Rethrow a higher-level exception passing the original as the `cause` (2nd ctor arg) so
    the stack trace shows "Caused by: ...". Wrapping a checked `SQLException` as an unchecked
    domain exception stops `throws` from leaking through every layer while keeping the trace.

11. **What happens if you `return` from both `try` and `finally`?**
    → The `finally` return wins and silently overrides the try — and it **swallows** any
    exception the try was throwing. Never return from `finally`.

12. **When does `finally` NOT run?**
    → Only on `System.exit()` or a JVM/thread kill. Otherwise it always runs.
