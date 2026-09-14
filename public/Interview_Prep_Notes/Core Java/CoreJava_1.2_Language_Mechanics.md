# Core Java 1.2 — Language Mechanics & Polymorphism

> **How to use this note:** Read the explanation top-to-bottom once. Then cover the
> answers in the **Question Bank** at the bottom and self-quiz cold. Tick 1.2 in
> `PLAN.md` only when you can *say* the `→` points out loud with no notes.

---

## 1 · Overriding vs Overloading

**Overriding** — a subclass redefines a method it inherited, with the **same signature**
(name + params). Which version runs is decided **at runtime** based on the *actual object*,
not the reference type. This is **dynamic / late dispatch** — the whole basis of
polymorphism.

```java
Animal a = new Dog();
a.speak();   // runs Dog's speak() — decided at RUNTIME on the real object
```

**Overloading** — same method **name**, **different parameter list** (count/types/order),
in the same class. Return type alone does **not** count. Which one runs is decided **at
compile time** from the *declared/static type* of the arguments. This is **static / early
dispatch**.

```java
print(int x)      // compiler picks based on argument type,
print(String x)   // ...at COMPILE time
```

> One-liner: **overriding = same signature, resolved at runtime on the actual object;
> overloading = same name / different params, resolved at compile time on the declared type.**

---

## 2 · Rules of a valid override

- **Same signature** — name and parameter list must match exactly (else it's *overloading*,
  not overriding).
- **Covariant return type OK** — you may return a **subtype** of the original return type
  (parent returns `Number`, override returns `Integer`). Never a *wider* type.
- **Can't weaken access** — you may widen it (`protected` → `public`), never narrow it
  (`public` → `protected`). The subclass must stay usable everywhere the parent was.
- **Can't throw broader checked exceptions** — same, narrower, fewer, or none is fine.
  You may not add new/broader **checked** exceptions. (Unchecked/runtime exceptions are
  unrestricted.)
- **Use `@Override`** — not required, but it makes the compiler *verify* you actually
  overrode something. Catches a typo'd signature that would silently become an overload.
- **`static` methods are hidden, not overridden** — a static method with the same signature
  in a subclass **hides** the parent's. Resolution is by *reference type* (compile time),
  not the object → no polymorphism.
- **`private` and `final` can't be overridden** — `private` isn't inherited/visible;
  `final` is explicitly locked. (A private method with the same name in a subclass is just
  a brand-new method, not an override.)

---

## 3 · `Object`'s methods

**You commonly override:**

| Method | Purpose |
|--------|---------|
| `equals(Object)` | Logical equality. Default is reference identity (`==`). |
| `hashCode()` | Integer bucket for hash-based collections (`HashMap`, `HashSet`). |
| `toString()` | Human-readable form for logs / debugging. |
| `compareTo()` | Ordering — via implementing `Comparable`. |
| `clone()` | Copying — via `Cloneable`. Error-prone; generally avoided today. |

**The equals/hashCode contract** (why you override them **together**): if `a.equals(b)` is
true, then `a.hashCode() == b.hashCode()` **must** be true. Override `equals` but not
`hashCode` and two "equal" objects can land in different buckets → your `HashMap`/`HashSet`
**breaks** (lookups miss keys that are logically present). The reverse isn't required —
equal hashCodes don't imply equal objects; that's just a **collision**.

**You don't override** (they're `final` or intentionally left alone):
- **`getClass()`** — `final`; returns the runtime class.
- **`wait()` / `notify()` / `notifyAll()`** — `final`; part of the monitor/threading
  mechanism (always used in a loop while holding the lock — see 4.x concurrency).

> Say `toString` is for **readable logs / debugging**; `equals`+`hashCode` are a **contract**
> you honor as a pair or hash collections misbehave.

---

## 4 · Comparable vs Comparator

- **`Comparable<T>`** — the type's **natural ordering**. One method: `compareTo(T other)`.
  Defined **inside** the class → there's exactly **one** natural order (e.g. `String`
  alphabetical, `Integer` numeric).
- **`Comparator<T>`** — an **external** ordering: `compare(a, b)`. Defined **outside** the
  class → you can have **many** (by name, then by age, reversed…). Lets you sort types you
  don't own.

Both are used by `Collections.sort` / `Arrays.sort`, `TreeMap`/`TreeSet` (key ordering),
and `PriorityQueue` (heap order). All return **negative / 0 / positive** for
less / equal / greater.

```java
list.sort(null);                            // natural order (Comparable)
list.sort(Comparator.comparing(P::age));    // external order (Comparator)
list.sort(Comparator.comparing(P::name)
                    .thenComparing(P::age)); // multi-key
```

> One-liner: **Comparable = one built-in natural order; Comparator = many external orders,
> including for classes you can't edit.**

---

## 5 · Interface vs Abstract class

- **Interface** = a **contract** (a set of method signatures). A class can implement
  **many** → **multiple inheritance of type**. Fields are implicitly
  `public static final` (constants only — **no instance state**). Since **Java 8**:
  - `default` methods — a body implementers inherit, so you can **evolve an API** without
    breaking existing implementers.
  - `static` methods — utility methods on the interface itself.
- **Abstract class** = shared **state + partial implementation**. Can have instance fields,
  constructors, any access modifiers, and both concrete + abstract methods. A class can
  extend only **one** → **single inheritance**.

> Rule of thumb: **interface for a capability across unrelated types ("can do X");
> abstract class for shared code/state within a related "is-a" family.**

---

## 6 · Pass-by-value

**Java is *always* pass-by-value.** For objects, the **reference itself is copied** and
passed by value — the method gets its own copy of the pointer.

- **Reassigning** the parameter (`param = new Thing()`) changes only the local copy →
  caller's variable is **unchanged**.
- **Mutating** the pointed-to object (`param.setX(5)`) hits the **same object** → caller
  **sees** the change.

```java
void f(List<Integer> l) {
    l.add(1);              // caller SEES this   (same object mutated)
    l = new ArrayList<>(); // caller does NOT    (local copy reassigned)
}
```

> One-liner: **reassigning a param doesn't touch the caller's variable; mutating the object
> it points to does.**

---

## 7 · `static`

- **`static` fields** — **one copy shared by all instances** (class-level), not per-object.
- **`static` methods** — belong to the class; called without an instance.
- **`static` blocks** — run **once when the class is loaded**, to initialize static state.
- **Why a static method can't see `this`** — `this` means *the current instance*, but a
  static method isn't tied to any instance. No object is in scope → no `this`, and no
  direct access to instance fields.

---

## 8 · `this` vs `super`

- **`this`** — the current object. Disambiguate a field from a param (`this.x = x`), or call
  another constructor in the same class (`this(...)`).
- **`super`** — the parent portion. Call a parent method (`super.method()`, common inside an
  override to *extend* rather than replace) or a parent constructor (`super(...)`, must be
  the **first** statement).

---

## 9 · Access modifiers (least → most visible)

| Modifier | Visible from |
|----------|--------------|
| `private` | Same class only |
| *(default)* package-private | Same package (no keyword) |
| `protected` | Same package **+ subclasses** (even in other packages) |
| `public` | Everywhere |

---

## 10 · Autoboxing / unboxing + the Integer cache

- **Autoboxing** — automatic `int` → `Integer`. **Unboxing** — `Integer` → `int`.
- **The cache gotcha**: the JVM caches `Integer` objects for **−128 to 127**. Autoboxing a
  value in that range returns a **shared cached object**; outside it, a **new object** each
  time. So `==` (reference identity) behaves differently:

```java
Integer a = 127, b = 127;
a == b;   // true  — same cached object
Integer c = 128, d = 128;
c == d;   // false — two different objects
```

- **Lesson:** always compare wrapper values with **`.equals()`** (or unbox to `int`), never
  `==`. Also watch for **`NullPointerException`** when unboxing a `null` wrapper.

> Say it: **127==127 is `true` because both come from the cache; 128==128 is `false` because
> each is a fresh object.**

---

## 11 · Nested classes (name-drop only)

- **Static nested** — no link to an outer instance; just namespaced inside the outer class.
- **Inner (non-static)** — tied to an outer **instance**; can access its fields.
- **Local** — declared inside a method.
- **Anonymous** — an unnamed one-shot subclass/implementation created inline
  (`new Runnable() { ... }`).

> *Skip deep nested-class rules (per syllabus).*

---

## ✅ Must-be-able-to-say checklist (from PLAN.md `→` lines)

- [ ] Overriding = same signature, runtime, actual object. Overloading = same name /
      different params, compile time, declared type.
- [ ] Why `equals` + `hashCode` go together (the contract); `toString` for readable logs.
- [ ] Interface (contract, multiple inheritance of type) vs abstract class (shared
      state/impl, single inheritance) — when you reach for each.
- [ ] "Java is pass-by-value" — reassigning a param doesn't change the caller; mutating the
      object does.
- [ ] Why `Integer 127==127` is true but `128==128` is false (cache vs new objects).

---

## 🎯 Question Bank (self-quiz — cover the answers)

1. **Overriding vs overloading — precise difference, and which is resolved when?**
   → Overriding: same signature, resolved at **runtime** on the **actual object** (dynamic
   dispatch). Overloading: same name / different params, resolved at **compile time** from
   the **declared type** (static dispatch). Return type alone can't distinguish overloads.

2. **What are the rules for a valid override?**
   → Same signature; covariant (sub-)return type OK; can't weaken access; can't add broader
   checked exceptions; `static` methods are *hidden* not overridden; `private`/`final` can't
   be overridden. Use `@Override` so the compiler checks you.

3. **Why can't you narrow the access modifier when overriding?**
   → The subtype must be usable everywhere the supertype is (Liskov). Narrowing access would
   break code that legitimately calls the method through the parent reference.

4. **Are `static` methods overridden?**
   → No — they're **hidden**. Resolution is by the reference type at compile time, not the
   runtime object, so there's no polymorphism.

5. **Which `Object` methods do you commonly override, and why each?**
   → `equals` (logical equality), `hashCode` (hash-bucket, contract-linked to `equals`),
   `toString` (readable logs/debug), `compareTo` (ordering via `Comparable`), `clone`
   (copying, mostly avoided). You don't override `getClass`, `wait`/`notify`/`notifyAll`
   (all `final`).

6. **What's the equals/hashCode contract, and what breaks if you ignore it?**
   → Equal objects must have equal hashCodes. Override `equals` but not `hashCode` and equal
   objects can hash to different buckets → `HashMap`/`HashSet` lookups miss them.

7. **Comparable vs Comparator — when do you use each?**
   → `Comparable` for the type's single natural order (`compareTo`, defined in the class).
   `Comparator` for external/multiple orderings (`compare`), including for classes you can't
   modify. Used by `sort`, `TreeMap`/`TreeSet`, `PriorityQueue`.

8. **Interface vs abstract class — when reach for each?**
   → Interface = contract, multiple inheritance of type, no instance state (default/static
   methods since Java 8). Abstract class = shared state + partial impl, single inheritance.
   Interface for a capability across unrelated types; abstract class for a related family
   sharing code/data.

9. **Is Java pass-by-value or pass-by-reference?**
   → Always **pass-by-value**. For objects the *reference* is copied by value. Reassigning
   the param doesn't affect the caller; mutating the pointed-to object does.

10. **Why can't a static method use `this`?**
    → It isn't tied to an instance, so there's no current object in scope — hence no `this`
    and no direct access to instance fields.

11. **Difference between `this` and `super`?**
    → `this` = current object (field/param disambiguation, `this(...)` constructor chaining).
    `super` = parent portion (`super.method()`, `super(...)` as the first statement).

12. **List the access modifiers by visibility.**
    → `private` (class) < default/package-private (package) < `protected` (package +
    subclasses) < `public` (everywhere).

13. **Why is `Integer a=127,b=127; a==b` true but `128==128` false?**
    → Autoboxing caches `Integer` for −128…127, so 127 reuses one cached object (`==` true);
    128 is outside the cache, so each is a new object (`==` false). Compare wrappers with
    `.equals()`.

14. **What can go wrong with unboxing?**
    → Unboxing a `null` wrapper throws `NullPointerException`.

15. **Name the kinds of nested classes.**
    → Static nested, inner (non-static, tied to an outer instance), local (inside a method),
    anonymous (unnamed inline one-shot).
