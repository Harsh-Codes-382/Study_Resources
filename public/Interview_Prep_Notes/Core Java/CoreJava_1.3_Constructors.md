# Core Java 1.3 — Constructors & Object Initialization

> **How to use this note:** Read the explanation top-to-bottom once. Then cover the
> answers in the **Question Bank** at the bottom and self-quiz cold. Tick 1.3 in
> `PLAN.md` only when you can *say* the `→` points out loud with no notes.

---

## 1 · Constructor basics

A constructor is the block that runs when you `new` an object; its job is to leave the
object in a **valid state**.

- **Same name as the class.**
- **No return type** — not even `void`. If you write `void Foo()`, that's a *regular
  method* that happens to share the class name, **not** a constructor. It compiles silently
  and never runs on `new` — a classic trap.

---

## 2 · The default (no-arg) constructor

The compiler synthesizes a no-arg constructor **only if you declare no constructor at all**.

```java
class Foo {}          // compiler adds: Foo() { super(); }
new Foo();            // works

class Bar {
    Bar(int x) {}     // you declared one → compiler stops helping
}
new Bar();            // COMPILE ERROR — no Bar() exists anymore
```

> Say it: **add one parameterized constructor and the free default disappears** — every
> existing `new Bar()` stops compiling. Fix: add the no-arg constructor back explicitly.

---

## 3 · Overloading & the copy constructor

**Constructor overloading** — several constructors distinguished by their parameter list.

```java
class Point {
    int x, y;
    Point()             { this(0, 0); }         // delegates via this(...)
    Point(int x, int y) { this.x = x; this.y = y; }
    Point(Point p)      { this(p.x, p.y); }      // copy constructor
}
```

**Copy constructor** — just a convention: a constructor taking one instance of the same
type. Java has **no built-in** copy constructor (unlike C++). Note it does a **shallow
copy** unless you deep-copy the fields yourself.

---

## 4 · Constructor chaining — `this(...)` and `super(...)`

Two directions:

- **`this(...)`** → call another constructor **in the same class** (reuse init logic).
- **`super(...)`** → call a **parent** constructor.

Two hard rules:

1. **`this(...)` or `super(...)` must be the very first statement.** You can't have both,
   and neither can come after any other code.
2. Write neither and the compiler inserts **`super()`** (the parent's *no-arg* constructor)
   as the implicit first call. Sharp edge: if the parent has **no** no-arg constructor
   (because it declared a parameterized one), the child **must** call `super(args)`
   explicitly or it won't compile.

> **Why must it be first?** The parent must be fully built before the child touches
> anything — you can't run child logic on top of a half-initialized parent. Forcing the
> base call first guarantees you never observe an uninitialized parent.

---

## 5 · Private constructor

Blocks outside code from calling `new`. Three uses:

```java
// 1. Singleton
class Config {
    private static final Config INSTANCE = new Config();
    private Config() {}
    static Config get() { return INSTANCE; }
}

// 2. Utility class (all static members) — prevent instantiation
class MathUtils {
    private MathUtils() {}
    static int square(int n) { return n * n; }
}

// 3. Static factory — force creation through a named method
class User {
    private User() {}
    static User create() { return new User(); }
}
```

*(Enum is the safer singleton — see 1.6. Builder handles many-arg construction — see LLD 7.2.)*

---

## 6 · Initialization order (the big one)

**At class load** (once, ever): static fields and static blocks run, top-to-bottom,
interleaved in source order.

**At each `new`**: instance fields and instance init blocks run (top-to-bottom,
interleaved), **then** the constructor body.

Full order when you `new` a **child**:

```
1. Parent static fields + static blocks   ┐ once, at class load
2. Child  static fields + static blocks   ┘ (parent loads before child)

3. Parent instance init (fields + blocks) ┐
4. Parent constructor body                │ every `new`
5. Child  instance init (fields + blocks) │
6. Child  constructor body                ┘
```

**The insight:** all static stuff finishes first (once), then per-object it goes
**parent-down**; within each class, instance-init runs **before** the constructor body.
Why parent-instance-init before the child's? Because `super(...)` is the first thing the
child constructor does → control jumps up, the parent fully builds (its inits + body),
then control returns to the child's inits and body.

```java
class A {
    static { System.out.println("A static"); }
    { System.out.println("A instance"); }
    A() { System.out.println("A ctor"); }
}
class B extends A {
    static { System.out.println("B static"); }
    { System.out.println("B instance"); }
    B() { System.out.println("B ctor"); }
}
// new B() prints:
// A static, B static, A instance, A ctor, B instance, B ctor
```

---

## 7 · Blank final field

A `final` field with no initializer ("blank final") **must be assigned exactly once by the
end of every constructor** — the compiler checks each path.

```java
class Account {
    final String id;                        // blank final
    Account(String id) { this.id = id; }    // OK — assigned
    Account()          { }                  // COMPILE ERROR — id never set
}
```

With multiple constructors, **every one** must assign it (or delegate via `this(...)` to
one that does).

---

## ✅ Must-be-able-to-say checklist (from PLAN.md `→` lines)

- [ ] The exact order on `new`-ing a child: parent static → child static (at class load),
      then parent instance-init → parent ctor → child instance-init → child ctor.
- [ ] Why `this(...)` / `super(...)` must be the first statement (parent fully built before
      child logic runs).
- [ ] Add one parameterized constructor and the free default disappears — existing
      `new Foo()` won't compile.

---

## 🎯 Question Bank (self-quiz — cover the answers)

1. **What's the order of initialization when you create an object?**
   → Static fields/blocks run once at class load (parent then child). Then per `new`:
   parent instance-init → parent ctor → child instance-init → child ctor. Static all first
   (once); then parent-down; instance-init before ctor body within each class.

2. **If I declare one parameterized constructor, can I still call `new Foo()`? Why not?**
   → No. The compiler only supplies a default no-arg constructor when you declare **zero**
   constructors. Declaring any one turns that off, so `new Foo()` no longer compiles unless
   you add the no-arg constructor back explicitly.

3. **Why must `this(...)` / `super(...)` be the first statement in a constructor?**
   → The parent (or the delegated-to constructor) must fully initialize before any other
   code runs, so you never operate on a half-built object. Hence only one of them, and it
   must be first.

4. **What happens if you write neither `this()` nor `super()`?**
   → The compiler inserts an implicit `super()` (parent's no-arg constructor). If the parent
   has no no-arg constructor, you get a compile error unless you call `super(args)` yourself.

5. **What's a copy constructor? Does Java give you one?**
   → A constructor taking another instance of the same type and copying its fields. Java has
   none built in — it's a convention. By default it's a **shallow** copy.

6. **Name three uses of a private constructor.**
   → Singleton (one controlled instance), utility class (all-static, prevent instantiation),
   and static factory (force creation through a named method).

7. **What's a blank final field and what does the compiler require?**
   → A `final` field with no inline initializer. It must be assigned exactly once by the end
   of **every** constructor (or via a `this(...)` that assigns it), on all code paths.

8. **Does `void Foo()` inside class `Foo` act as a constructor?**
   → No. A return type (even `void`) makes it an ordinary method; it won't run on `new`.
   Constructors have no return type at all.

9. **`new B()` where `B extends A` — trace the print order given static + instance blocks
   and constructors in both.**
   → `A static`, `B static`, `A instance`, `A ctor`, `B instance`, `B ctor`.
   (Statics once at load, parent before child; then parent instance→ctor, then child.)

10. **Can you call both `this(...)` and `super(...)` in one constructor?**
    → No — each must be the first statement, so you can have at most one. Chain with
    `this(...)` to a constructor that itself calls `super(...)`.
