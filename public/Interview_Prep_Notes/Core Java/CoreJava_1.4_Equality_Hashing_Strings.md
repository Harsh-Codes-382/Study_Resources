# Core Java 1.4 — Equality, Hashing, Immutability & String

> **How to use this note:** Read the explanation top-to-bottom once. Then cover the
> answers in the **Question Bank** at the bottom and self-quiz cold. Tick 1.4 in
> `PLAN.md` only when you can *say* the `→` points out loud with no notes.

---

## 1 · `==` vs `.equals()`

- **`==`** compares **references** for objects (same object in memory?). For **primitives**
  it compares raw values — the one case where `==` is the correct equality check.
- **`.equals()`** compares **logical** equality ("same value?") — *if the class overrides
  it*. Default `Object.equals()` just does `==`, so a class that doesn't override gets no
  logical equality.

```java
String a = new String("hi");
String b = new String("hi");
a == b;        // false — two different heap objects
a.equals(b);   // true  — same characters (String overrides equals)
```

> Mental model: **`==` asks "same object?", `.equals()` asks "same value?"** — but only if
> the class was taught what "same value" means.

---

## 2 · The hashCode/equals contract

1. **`a.equals(b)` true → `a.hashCode() == b.hashCode()` must be true.** (Equal objects,
   equal hashes.)
2. The **reverse is not required** — unequal objects may share a hashCode. That's a
   **collision**, and it's legal.
3. `hashCode()` must be **consistent** — same object, same hash across calls (as long as the
   fields `equals` uses don't change).

**The failure mode.** A `HashMap`/`HashSet` finds a key in two steps: hash to a **bucket**,
then `.equals()` within that bucket. Override `equals` but **not** `hashCode` and two
logically-equal objects can hash to **different buckets** → the lookup never reaches the
`.equals()` check → **the key you `put` looks missing.**

```java
Map<Point, String> m = new HashMap<>();
m.put(new Point(1, 2), "here");
m.get(new Point(1, 2));   // null if hashCode not overridden — different bucket
```

**Correct pair** (JDK helpers):

```java
@Override public boolean equals(Object o) {
    if (this == o) return true;                 // fast path
    if (!(o instanceof Point)) return false;    // type + null check
    Point p = (Point) o;
    return x == p.x && y == p.y;                // same fields...
}
@Override public int hashCode() {
    return Objects.hash(x, y);                  // ...as equals uses
}
```

> Golden rule: **`equals` and `hashCode` must use the same fields.** Say it: *equal objects
> must have equal hashCodes; the reverse isn't required.*

---

## 3 · String pool & `intern()`

The JVM keeps a **String pool** — a cache of unique string literals in the heap. Writing a
**literal** `"hi"` checks the pool: reuse the existing reference if present, else add it.

```java
String a = "hi";       // pooled
String b = "hi";       // same pooled object
a == b;                // true — both point at the one pooled "hi"

String c = new String("hi");  // FORCES a new heap object, bypasses the pool
a == c;                // false — different objects
c.intern() == a;       // true — intern() returns the pooled version
```

- **`new String("hi")`** always makes a fresh heap object → **`new String("x") != "x"`
  under `==`** (the trap).
- **`.intern()`** returns the canonical pooled reference (adding it if absent). Rarely used
  by hand; know it to explain the mechanism.

*Why a pool?* Strings are ubiquitous and immutable, so sharing one instance per identical
literal is safe and saves memory. **Immutability is what makes pooling safe.**

---

## 4 · String vs StringBuilder vs StringBuffer

| Type | Mutable? | Thread-safe? | Use when |
|------|----------|--------------|----------|
| `String` | **No** (immutable) | Yes (immutable → inherently safe) | Fixed text, keys, constants |
| `StringBuilder` | Yes | **No** | Building/mutating text in one thread (**default choice**) |
| `StringBuffer` | Yes | Yes (`synchronized` methods) | The builder is **shared across threads** (rare) |

`String` is immutable → every "modification" makes a **new object**. `StringBuilder` /
`StringBuffer` are **mutable** — they edit an internal `char[]` in place, growing as needed.
`StringBuffer` is just `StringBuilder` with `synchronized` methods (slower) — reach for it
only when the *same* builder is genuinely touched by multiple threads.

**The O(n²) trap:**

```java
String s = "";
for (int i = 0; i < n; i++) s += x;     // BAD — new String each pass
```

Each `+=` copies all previous chars + the new ones. Iteration `i` copies ~`i` chars → total
`1+2+…+n ≈ O(n²)`, plus `n` throwaway objects (garbage). Fix:

```java
StringBuilder sb = new StringBuilder();
for (int i = 0; i < n; i++) sb.append(x);   // O(n) amortized
String s = sb.toString();
```

---

## Traps

- **`"a" + "b"` is NOT slow.** The compiler **folds constant `+`** at compile time →
  `"ab"` literal in bytecode, zero runtime cost. Even a single-line `a + b + c` compiles to
  one efficient concat. The problem is **specifically `+=` inside a loop** — don't
  over-correct and avoid all `+`.
- **`new String("x") != "x"` under `==`** — the `new` object lives on the heap; the literal
  is pooled. Use `.equals()` (or `.intern()`) to compare.

---

## 5 · Immutability & building an immutable class

An immutable object's state can't change after construction. Recipe:

1. **`final` class** — no subclass can add mutable state or override behavior.
2. **`private final` fields** — set once, never reassigned.
3. **No setters** (or any mutating method).
4. **Defensive copies** for mutable fields (arrays, collections, `Date`):
   - copy incoming mutable args **in the constructor** (caller can't hold a ref and mutate
     your internals later),
   - return copies / unmodifiable views from getters.

```java
public final class Person {
    private final String name;
    private final List<String> hobbies;

    public Person(String name, List<String> hobbies) {
        this.name = name;
        this.hobbies = new ArrayList<>(hobbies);   // defensive copy IN
    }
    public String getName() { return name; }
    public List<String> getHobbies() {
        return List.copyOf(hobbies);               // defensive copy OUT
    }
}
```

Without the copies, an external reference to that `List` could mutate your "immutable"
object — immutability would be a lie. `String` is the canonical immutable class. *(Java 16+
**records** give final fields + accessors + `equals`/`hashCode` for free, but you still
defensively copy mutable components — see 1.11.)*

---

## Why is String immutable? (all four)

1. **Pooling / interning** — sharing one instance per literal is only safe if it can't
   mutate.
2. **Thread-safety** — immutable = shareable across threads with **no synchronization**.
3. **Safe hash caching** — `String` caches its `hashCode` on first use; valid only because
   contents never change. Makes Strings excellent `HashMap` keys.
4. **Security** — Strings carry sensitive data (paths, URLs, class names, connection
   strings). A mutable String would allow a TOCTOU hole — validate `"admin"`, mutate to
   `"root"` before use.

---

## 6 · `final` — the four faces

- **final variable** — assign once, never reassign.
- **final field** — assign once (at declaration or in the constructor; a **blank final** has
  no initializer and must be set in every constructor — see 1.3).
- **final method** — can't be overridden.
- **final class** — can't be extended (e.g. `String`).

**Crucial gotcha: `final` freezes the *reference*, not the *object*.**

```java
final List<Integer> l = new ArrayList<>();
l.add(1);                 // FINE — mutating the pointed-to object
l = new ArrayList<>();    // COMPILE ERROR — reassigning the reference
```

`final` on a reference means the variable can't be re-pointed; it says **nothing** about the
object's mutability. **`final` ≠ immutable.** True immutability needs `final` fields **and**
an immutable type (or defensive copies).

---

## `effectively final`

A local never reassigned after initialization — even without the `final` keyword. Since
Java 8, **lambdas and anonymous classes can only capture locals that are final or
effectively final.**

```java
int count = 0;
Runnable r = () -> System.out.println(count);  // OK — count effectively final
count = 5;   // now NOT effectively final → the lambda above won't compile
```

**Why?** A lambda/anonymous class captures a **copy** of the local's value (locals live on
the stack, which may be gone when the lambda runs). If the local could keep changing, the
captured copy and the live variable would silently diverge. So Java forbids capturing
anything reassigned. (Only *locals* have this rule — not fields; workaround for mutable
capture is a field or a single-element array / `AtomicInteger`.)

---

## 7 · `final` vs `finally` vs `finalize`

Three unrelated things that only *sound* alike:

- **`final`** — a **keyword**: non-reassignable variable / non-overridable method /
  non-extendable class.
- **`finally`** — a **block** in try/catch that **always runs** (exception or not) — cleanup
  (see 1.5).
- **`finalize()`** — a **method** the GC *used to* call before reclaiming an object.
  **Deprecated** (Java 9+): unreliable (no guarantee it runs, or when), slow, error-prone.
  Modern cleanup = try-with-resources / `AutoCloseable` (1.5) or `Cleaner`. Know what it was;
  don't use it.

---

## ✅ Must-be-able-to-say checklist (from PLAN.md `→` lines)

- [ ] Equal objects **must** have equal hashCodes (reverse not required).
- [ ] Override `equals` but not `hashCode` → `HashMap` lookups miss (wrong bucket).
- [ ] Why String is immutable — pooling, thread-safety, safe hash caching, security.
- [ ] Concatenation in a loop is O(n²) + garbage → use `StringBuilder`; `StringBuffer` only
      when the builder is shared across threads.
- [ ] `final` freezes the reference, not the object — `final List l` can't be reassigned but
      `l.add(...)` still works.
- [ ] "Effectively final" — why a lambda / anonymous class can't capture a reassigned local.

---

## 🎯 Question Bank (self-quiz — cover the answers)

1. **`==` vs `.equals()` — precise difference?**
   → `==` compares references (or primitive values); `.equals()` compares logical equality
   *if overridden* (default `Object.equals` is just `==`).

2. **Why must `equals` and `hashCode` agree? What breaks if they don't?**
   → Equal objects must have equal hashCodes. Override `equals` but not `hashCode` and equal
   objects can hash to different buckets → `HashMap`/`HashSet` lookups miss keys that are
   logically present. Reverse (equal hash ⇒ equal object) is not required — that's a
   collision.

3. **Is the reverse of the contract required — equal hashCodes ⇒ equal objects?**
   → No. Collisions are legal; the map falls back to `.equals()` within the bucket.

4. **Why is String immutable?**
   → Pooling (safe sharing of literals), thread-safety (no sync needed), safe hashCode
   caching (contents never change), and security (no TOCTOU on validated strings).

5. **String vs StringBuilder vs StringBuffer — when each?**
   → `String` immutable (fixed text/keys). `StringBuilder` mutable, unsynchronized — the
   default for building text in one thread. `StringBuffer` mutable, synchronized — only when
   the same builder is shared across threads.

6. **Where's the O(n²) trap, and where is it *not*?**
   → `+=` inside a loop is O(n²) + garbage (new String each pass) → use `StringBuilder`.
   `"a" + "b"` and constant/one-line concatenation are folded by the compiler — not slow.

7. **Does `final` make an object immutable?**
   → No — it freezes the **reference**. `final List l` can't be reassigned, but `l.add(...)`
   still mutates the object. Immutability needs `final` fields + an immutable type (or
   defensive copies).

8. **What is "effectively final" and why does the capture rule exist?**
   → A local never reassigned after init. Lambdas/anonymous classes capture a *copy* of the
   local's value; allowing reassignment would let the copy and the live variable diverge, so
   Java forbids capturing reassigned locals.

9. **`new String("x") == "x"` — true or false, and why?**
   → False. `new String` makes a fresh heap object; `"x"` is pooled — different references.
   Use `.equals()` or `.intern()`.

10. **What does `.intern()` do?**
    → Returns the canonical pooled reference for a string's value (adding it to the pool if
    absent), so `s.intern() == "literal"` when contents match.

11. **How do you build an immutable class?**
    → `final` class, `private final` fields, no setters, defensive copies of mutable fields
    in and out.

12. **`final` vs `finally` vs `finalize`?**
    → `final` = keyword (non-reassignable/overridable/extendable). `finally` = try-block that
    always runs (cleanup). `finalize()` = deprecated GC callback — unreliable, don't use;
    prefer try-with-resources / `Cleaner`.
