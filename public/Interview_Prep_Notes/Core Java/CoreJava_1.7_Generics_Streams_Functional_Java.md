# Core Java 1.7 — Generics, Streams & Functional Java

> **How to use this note:** Read each section top-to-bottom the first time. On revision, focus on the **Mental Model**, **Say it out loud**, and **Interview Questions** sections.

---

# 1 · Generics

## 1.1 What are Generics?

Generics let us write classes, interfaces, and methods that work with a type specified by the caller.

Without generics:

```java
List list = new ArrayList();
list.add("Hello");
list.add(10);

String s = (String) list.get(0);
```

The compiler cannot protect us from putting the wrong type into the list.

With generics:

```java
List<String> names = new ArrayList<>();

names.add("Harsh");
// names.add(10); // ❌ compile error

String name = names.get(0); // no cast needed
```

### Mental Model

Think of generics as a **compile-time type-safety contract**:

```text
List<String>
    ↓
"This list is intended to contain Strings"
    ↓
Compiler checks that contract
```

> **Say it:** Generics provide compile-time type safety and reduce the need for explicit casts.

---

# 2 · Type Erasure

Java generics are primarily a compile-time feature. Java uses **type erasure** so generic type information is generally not available in the same form at runtime.

For example:

```java
List<String> names = new ArrayList<>();
List<Integer> numbers = new ArrayList<>();
```

At runtime, both are essentially `List`.

Conceptually:

```text
Compile time:

List<String>
List<Integer>

      ↓ type erasure

Runtime:

List
List
```

This is why this is not allowed:

```java
if (obj instanceof List<String>) { } // ❌
```

But this is allowed:

```java
if (obj instanceof List<?>) { } // ✅
```

`List<?>` means "a List of some unknown type."

### Important interview point

You also cannot create:

```java
List<int> numbers; // ❌
```

Generics work with reference types, so use wrapper classes:

```java
List<Integer> numbers; // ✅
```

> **Say it:** Java implements generics mainly through type erasure, so generic type arguments are mostly a compile-time concept.

---

# 3 · Bounded Generics

Sometimes we don't want to accept every possible type.

Example:

```java
public static <T extends Number> double doubleValue(T value) {
    return value.doubleValue();
}
```

Here `T` must be `Number` or a subclass:

```java
doubleValue(10);       // Integer ✅
doubleValue(10.5);     // Double ✅
doubleValue(10L);      // Long ✅
```

But:

```java
doubleValue("hello");  // ❌
```

because `String` does not extend `Number`.

### Mental Model

```text
<T extends Number>

T can be:
    Integer
    Double
    Long
    Float
    ...
```

`extends` here means **"T must be within this upper bound."**

---

# 4 · Why `List<Integer>` is NOT `List<Number>`

This is a very important generics concept.

You might think:

```text
Integer is a Number
therefore
List<Integer> is a List<Number>
```

But Java does NOT work that way.

```java
List<Integer> integers = new ArrayList<>();

List<Number> numbers = integers; // ❌
```

Why?

Imagine Java allowed it:

```java
numbers.add(10.5); // Double
```

Then the original `List<Integer>` would contain a `Double`.

That would break type safety.

### Mental Model

```text
Integer extends Number

BUT

List<Integer> does NOT extend List<Number>
```

Generics are **invariant** by default.

---

# 5 · Wildcards — `? extends`

Suppose we want to accept a list containing any kind of `Number`:

```java
List<? extends Number>
```

This means:

> "A List of some unknown type that is Number or a subclass of Number."

It could be:

```text
List<Integer>
List<Double>
List<Long>
```

Example:

```java
List<Integer> integers = List.of(1, 2, 3);

List<? extends Number> numbers = integers;
```

You can safely read:

```java
Number n = numbers.get(0);
```

But you generally cannot add a Number:

```java
numbers.add(10);   // ❌
numbers.add(2.5);  // ❌
```

Why?

Because Java doesn't know the exact type.

It might actually be:

```java
List<Integer>
```

Adding a `Double` would be unsafe.

### Mental Model

```text
? extends Number
        ↓
Producer of Number values
        ↓
READ safely
        ↓
Don't add values
```

---

# 6 · Wildcards — `? super`

Now:

```java
List<? super Integer>
```

means:

> "A List of Integer or one of Integer's supertypes."

Possible actual lists:

```text
List<Integer>
List<Number>
List<Object>
```

You can safely add an Integer:

```java
List<? super Integer> list = new ArrayList<Number>();

list.add(10); // ✅
```

But when reading:

```java
Object value = list.get(0); // safest type is Object
```

### Mental Model

```text
? super Integer
        ↓
Consumer of Integer values
        ↓
WRITE safely
        ↓
Reading gives only Object safely
```

---

# 7 · PECS

The classic rule:

> **PECS = Producer Extends, Consumer Super**

Use:

```text
? extends → when you mainly READ / consume values from the generic source
? super   → when you mainly WRITE / put values into the generic destination
```

Example:

```java
void printNumbers(List<? extends Number> numbers) {
    for (Number n : numbers) {
        System.out.println(n);
    }
}
```

The list **produces** Numbers for us.

And:

```java
void addIntegers(List<? super Integer> numbers) {
    numbers.add(10);
    numbers.add(20);
}
```

The list **consumes** Integers from us.

> **Interview answer:** Use `? extends` when a generic source produces values that you want to read, and `? super` when a generic destination consumes values that you want to write.

---

# 8 · Streams

A Stream is a way to process a sequence of data through a pipeline of operations.

A common pipeline is:

```text
SOURCE
  ↓
INTERMEDIATE OPERATIONS
  ↓
TERMINAL OPERATION
```

Example:

```java
List<Integer> result =
    numbers.stream()
           .filter(n -> n % 2 == 0)
           .map(n -> n * 2)
           .toList();
```

Here:

```text
numbers
   ↓
stream()
   ↓
filter()
   ↓
map()
   ↓
toList()
```

---

# 9 · Source → Intermediate → Terminal

## Source

Creates the Stream:

```java
numbers.stream()
```

Other examples:

```java
Arrays.stream(array);
Stream.of(1, 2, 3);
```

## Intermediate operations

Examples:

```java
filter()
map()
flatMap()
sorted()
distinct()
limit()
```

They return another Stream.

That is why we can keep chaining:

```java
stream()
    .filter(...)
    .map(...)
    .flatMap(...)
```

## Terminal operation

Examples:

```java
toList()
collect(...)
forEach(...)
reduce(...)
count()
findFirst()
```

A terminal operation produces the final result or side effect.

> **Say it:** Intermediate operations build the pipeline; the terminal operation triggers the pipeline and produces the result.

---

# 10 · Stream Laziness

Intermediate operations are **lazy**.

For example:

```java
numbers.stream()
       .filter(n -> {
           System.out.println("filter: " + n);
           return n > 5;
       });
```

Nothing useful is processed yet because there is no terminal operation.

Once we add:

```java
.count();
```

the pipeline actually runs.

### Why does this matter?

Laziness allows Streams to avoid doing work that is not necessary.

For example:

```java
numbers.stream()
       .filter(n -> n > 5)
       .findFirst();
```

The stream can stop once it finds the first matching element.

---

# 11 · `map()`

`map()` transforms each element into another value.

Mental model:

```text
ONE input
   ↓
ONE output
```

Example:

```java
List<String> names = List.of("Harsh", "Rahul");

List<Integer> lengths =
    names.stream()
         .map(name -> name.length())
         .toList();
```

Result:

```text
["Harsh", "Rahul"]
       ↓ map(length)
[5, 5]
```

Method reference:

```java
.map(String::length)
```

### Think:

```text
map:
T → R
```

One element becomes one element.

---

# 12 · `filter()`

`filter()` keeps only elements that satisfy a condition.

Mental model:

```text
Many inputs
   ↓
condition
   ↓
only matching elements survive
```

Example:

```java
List<Integer> even =
    numbers.stream()
           .filter(n -> n % 2 == 0)
           .toList();
```

If:

```text
1 2 3 4 5 6
```

result:

```text
2 4 6
```

The lambda passed to `filter()` is effectively a:

```java
Predicate<Integer>
```

because it answers:

```text
"Should this element stay?"
→ true / false
```

---

# 13 · `reduce()`

`reduce()` combines many values into one value.

Example:

```java
int sum =
    numbers.stream()
           .reduce(0, (a, b) -> a + b);
```

For:

```text
1 2 3 4
```

conceptually:

```text
0 + 1 = 1
1 + 2 = 3
3 + 3 = 6
6 + 4 = 10
```

Result:

```text
10
```

### Mental Model

```text
many values
     ↓
combine
     ↓
one value
```

Typical uses:

```text
sum
maximum
minimum
multiplication
custom aggregation
```

---

# 14 · `collect()` and `Collectors`

This distinction was confusing at first, so remember it this way:

```text
collect()
    ↓
"Collect the stream result."

Collectors
    ↓
"Here are recipes for HOW to collect it."
```

Example:

```java
List<Integer> result =
    numbers.stream()
           .filter(n -> n > 5)
           .collect(Collectors.toList());
```

Here:

```text
collect()                  → terminal operation
Collectors.toList()        → collection recipe
```

`Collectors` is a utility class containing common collector implementations.

Examples:

```java
Collectors.toList()
Collectors.toSet()
Collectors.joining()
Collectors.counting()
Collectors.summingInt(...)
Collectors.groupingBy(...)
```

Modern Java can often use:

```java
.toList()
```

instead of:

```java
.collect(Collectors.toList())
```

But `Collectors` remains very important because it provides many aggregation recipes.

---

# 15 · `groupingBy()`

`groupingBy()` is used when we want to group elements according to some key.

Suppose:

```java
class Employee {
    String name;
    String department;

    String getDepartment() {
        return department;
    }
}
```

And:

```text
John  → IT
Bob   → IT
Alice → HR
David → HR
Mike  → Finance
```

We can do:

```java
Map<String, List<Employee>> result =
    employees.stream()
             .collect(
                 Collectors.groupingBy(Employee::getDepartment)
             );
```

Result conceptually:

```text
IT
 ├── John
 └── Bob

HR
 ├── Alice
 └── David

Finance
 └── Mike
```

### What does `Employee::getDepartment` mean?

It is a method reference equivalent to:

```java
employee -> employee.getDepartment()
```

It answers:

> "What key should this employee be grouped under?"

---

# 16 · `groupingBy()` with `counting()`

We can also specify what should happen to each group.

```java
Map<String, Long> counts =
    employees.stream()
             .collect(
                 Collectors.groupingBy(
                     Employee::getDepartment,
                     Collectors.counting()
                 )
             );
```

Result:

```text
IT       → 2
HR       → 2
Finance  → 1
```

Think:

```text
groupingBy(
    HOW TO GROUP,
    WHAT TO DO WITH EACH GROUP
)
```

This is conceptually similar to:

```sql
SELECT department, COUNT(*)
FROM employees
GROUP BY department;
```

---

# 17 · `groupingBy()` with `summingInt()`

We can group employees and then sum salaries:

```java
Map<String, Integer> salaryByDepartment =
    employees.stream()
             .collect(
                 Collectors.groupingBy(
                     Employee::getDepartment,
                     Collectors.summingInt(Employee::getSalary)
                 )
             );
```

Conceptually:

```text
IT       → total IT salary
HR       → total HR salary
Finance  → total Finance salary
```

So `groupingBy()` is not only for creating:

```text
Map<Key, List<Value>>
```

It can also perform aggregation on each group.

---

# 18 · `flatMap()` — The Important Mental Model

Don't think:

> "`flatMap()` is only for nested arrays/lists."

Think:

> **One input element can produce multiple output elements, and I want one flat Stream containing all of them.**

The most common case is nested collections.

Suppose:

```text
User
 └── List<Order>
```

We have:

```java
users.stream()
     .flatMap(user -> user.getOrders().stream())
```

Before `flatMap`:

```text
Stream<User>
```

Each User contains multiple Orders.

After `flatMap`:

```text
Stream<Order>
```

---

# 19 · Why does `flatMap()` need a Stream returned from the lambda?

This was a key question.

`flatMap()` expects the lambda to return a **Stream**.

Conceptually:

```text
flatMap:
    T → Stream<R>
```

So this is correct:

```java
users.stream()
     .flatMap(user -> user.getOrders().stream());
```

because:

```text
user
 ↓
user.getOrders()
 ↓
List<Order>
 ↓
.stream()
 ↓
Stream<Order>
```

But this is wrong:

```java
users.stream()
     .flatMap(user -> user.getOrders()); // ❌
```

because the lambda returns:

```text
List<Order>
```

not:

```text
Stream<Order>
```

And this is also wrong:

```java
.flatMap(user -> user.getOrders().get(0)); // ❌
```

because it returns one `Order`, not a Stream.

If you want one Order, `map()` is the appropriate operation:

```java
.map(user -> user.getOrders().get(0))
```

### The key difference

```text
map:
    lambda returns ONE value

flatMap:
    lambda returns a STREAM of values
```

---

# 20 · `map()` vs `flatMap()`

Suppose:

```java
List<List<Integer>> numbers = List.of(
    List.of(1, 2),
    List.of(3, 4),
    List.of(5, 6)
);
```

The original stream is:

```text
Stream<List<Integer>>
```

Using `map()`:

```java
numbers.stream()
       .map(list -> list.stream())
```

produces:

```text
Stream<Stream<Integer>>
```

You now have nested streams.

Using `flatMap()`:

```java
numbers.stream()
       .flatMap(list -> list.stream())
```

produces:

```text
Stream<Integer>
```

Conceptually:

```text
Stream(1, 2)
Stream(3, 4)
Stream(5, 6)

       ↓ flatMap

1 2 3 4 5 6
```

### User/order example

```java
users.stream()
     .flatMap(user -> user.getOrders().stream())
     .filter(order -> order.getAmount() > 1000)
     .map(Order::getId)
     .toList();
```

Pipeline:

```text
Stream<User>
    ↓ flatMap
Stream<Order>
    ↓ filter
Stream<Order>
    ↓ map
Stream<OrderId>
    ↓ toList
List<OrderId>
```

And because `flatMap()` returns a Stream, we can continue using normal Stream operations afterward.

> **Say it:** `flatMap()` turns each input element into a Stream and then flattens all those resulting Streams into one Stream.

---

# 21 · Functional Interfaces

A **functional interface** is an interface with exactly one abstract method.

Example:

```java
@FunctionalInterface
interface Calculator {
    int calculate(int a, int b);
}
```

Because it has one abstract method, it can be implemented with a lambda:

```java
Calculator add = (a, b) -> a + b;
```

`@FunctionalInterface` is optional but useful because the compiler can verify the interface remains functional.

---

# 22 · `Function<T, R>`

`Function` takes a value and returns another value.

Mental model:

```text
T → R
```

Example:

```java
Function<String, Integer> length =
    s -> s.length();

System.out.println(length.apply("Hello")); // 5
```

Think:

```text
Input → transform → Output
```

Common Stream example:

```java
names.stream()
     .map(String::length);
```

`map()` commonly uses a `Function`.

---

# 23 · `Predicate<T>`

A `Predicate` takes a value and returns `boolean`.

Mental model:

```text
T → boolean
```

Example:

```java
Predicate<Integer> isEven =
    n -> n % 2 == 0;

System.out.println(isEven.test(10)); // true
```

Think:

```text
Input → question → true/false
```

`filter()` commonly uses a Predicate:

```java
numbers.stream()
       .filter(n -> n % 2 == 0);
```

---

# 24 · `Consumer<T>`

A `Consumer` accepts a value and does something with it but does not return a result.

Mental model:

```text
T → void
```

Example:

```java
Consumer<String> printer =
    s -> System.out.println(s);

printer.accept("Hello");
```

Common Stream example:

```java
names.forEach(System.out::println);
```

---

# 25 · `Supplier<T>`

A `Supplier` takes no input and produces a value.

Mental model:

```text
() → T
```

Example:

```java
Supplier<Double> random =
    () -> Math.random();

System.out.println(random.get());
```

A Supplier is useful when a value should be **produced lazily**.

For example:

```java
String result =
    value.orElseGet(() -> createDefaultValue());
```

The default-producing code is called only when the Optional is empty.

---

# 26 · Quick Functional Interface Map

```text
Function<T,R>  → T → R
               → transform

Predicate<T>   → T → boolean
               → test

Consumer<T>    → T → void
               → use/consume

Supplier<T>    → () → T
               → produce
```

Memory hook:

```text
Function  → "Give me a value, I'll transform it."
Predicate → "Give me a value, I'll answer yes/no."
Consumer  → "Give me a value, I'll use it."
Supplier  → "Ask me, I'll give you a value."
```

---

# 27 · Lambdas

A lambda is a concise way to provide the implementation of a functional interface.

Instead of:

```java
Function<String, Integer> f =
    new Function<String, Integer>() {
        @Override
        public Integer apply(String s) {
            return s.length();
        }
    };
```

we write:

```java
Function<String, Integer> f =
    s -> s.length();
```

The lambda's target type comes from the functional interface.

---

# 28 · Method References

Method references are shorthand for certain lambdas.

Examples:

```java
String::length
```

is conceptually:

```java
s -> s.length()
```

```java
Integer::parseInt
```

is conceptually:

```java
s -> Integer.parseInt(s)
```

```java
System.out::println
```

is conceptually:

```java
x -> System.out.println(x)
```

```java
ArrayList::new
```

can represent:

```java
() -> new ArrayList<>()
```

### Mental Model

When a lambda simply calls an existing method, check whether a method reference makes it cleaner.

---

# 29 · Optional

`Optional<T>` represents a value that may or may not be present.

Instead of:

```java
User user = findUser(id);

if (user == null) {
    ...
}
```

an API can communicate absence explicitly:

```java
Optional<User> user = findUser(id);
```

Mental model:

```text
Optional<User>

      ┌─────────────┐
      │ User exists │
      └─────────────┘

or

      ┌─────────────┐
      │   empty     │
      └─────────────┘
```

---

# 30 · Creating Optional

## `Optional.of()`

Use when the value is definitely non-null:

```java
Optional<String> name =
    Optional.of("Harsh");
```

If the value is null:

```java
Optional.of(null); // ❌ NullPointerException
```

## `Optional.ofNullable()`

Use when the value may be null:

```java
String name = getName();

Optional<String> optional =
    Optional.ofNullable(name);
```

If `name` is null:

```text
Optional.empty()
```

---

# 31 · `Optional.get()` — Be Careful

This:

```java
optional.get();
```

works only if a value is present.

If it is empty:

```java
optional.get();
```

throws:

```text
NoSuchElementException
```

So don't blindly do:

```java
optional.get();
```

Prefer operations that explicitly handle absence.

---

# 32 · Useful Optional Operations

## `orElse()`

```java
String name =
    optional.orElse("Unknown");
```

If empty:

```text
"Unknown"
```

Important:

`orElse()` evaluates its argument eagerly.

---

## `orElseGet()`

```java
String name =
    optional.orElseGet(() -> createDefaultName());
```

The Supplier is used only if the Optional is empty.

Mental model:

```text
orElse:
    calculate default first

orElseGet:
    calculate default only if needed
```

---

## `orElseThrow()`

```java
User user =
    optional.orElseThrow(
        () -> new RuntimeException("User not found")
    );
```

---

## `ifPresent()`

```java
optional.ifPresent(
    user -> System.out.println(user.getName())
);
```

Runs the action only when the value exists.

---

## `map()`

Optional also supports transformations:

```java
Optional<String> name =
    optionalUser.map(User::getName);
```

If there is no User, the result remains empty.

---

# 33 · Where Should Optional Be Used?

A particularly useful use is as a **return type** when absence is a legitimate result:

```java
Optional<User> findById(long id)
```

This communicates:

> "The user may not exist."

Don't mechanically make every field and parameter an Optional.

> **Say it:** Optional makes the possibility of absence explicit in an API instead of returning null and making the caller guess whether a value might be missing.

---

# 34 · Big Picture: How These Concepts Connect

These topics are easier when you see how they fit together.

```text
GENERICS
   ↓
Give collections / APIs compile-time type safety

FUNCTIONAL INTERFACES
   ↓
Define shapes such as:
T → R
T → boolean
T → void
() → T

LAMBDAS / METHOD REFERENCES
   ↓
Provide implementations of those functional interfaces

STREAMS
   ↓
Use those functions to process sequences

map       → transform
filter    → select
flatMap   → expand + flatten
reduce    → combine into one
collect   → gather / aggregate
groupingBy→ group + optionally aggregate

OPTIONAL
   ↓
Represent "value may be absent"
```

---

# 35 · Quick Comparison

| Topic | Core idea |
|---|---|
| Generics | Compile-time type safety |
| Type erasure | Generic type arguments mostly disappear from runtime representation |
| `<T extends X>` | Upper bound on T |
| `? extends X` | Producer / mainly read |
| `? super X` | Consumer / mainly write |
| PECS | Producer Extends, Consumer Super |
| Stream | Pipeline for processing data |
| Intermediate op | Returns another Stream; lazy |
| Terminal op | Produces result/side effect and triggers processing |
| `map` | One value → one transformed value |
| `filter` | Keep matching values |
| `flatMap` | One value → Stream of values, then flatten |
| `reduce` | Many values → one value |
| `collect` | Gather/aggregate stream output |
| `Collectors` | Collection/aggregation recipes |
| `groupingBy` | Group elements by key, optionally aggregate |
| `Function` | T → R |
| `Predicate` | T → boolean |
| `Consumer` | T → void |
| `Supplier` | () → T |
| Lambda | Concise functional-interface implementation |
| Method reference | Shorthand for suitable lambdas |
| Optional | Explicitly represent possible absence |

---

# 36 · 🔥 Must-Be-Able-to-Say Checklist

- [ ] What problem do generics solve?
- [ ] What is type erasure?
- [ ] Why can't you use `List<String>` with `instanceof`?
- [ ] Why can't generics use primitive types?
- [ ] What is a bounded type?
- [ ] Why is `List<Integer>` not a `List<Number>`?
- [ ] What does `? extends` mean?
- [ ] What does `? super` mean?
- [ ] What does PECS mean?
- [ ] What are Stream source, intermediate, and terminal operations?
- [ ] Why are intermediate Stream operations lazy?
- [ ] What does `map()` do?
- [ ] What does `filter()` do?
- [ ] What does `reduce()` do?
- [ ] What does `collect()` do?
- [ ] What is the `Collectors` class?
- [ ] What does `groupingBy()` do?
- [ ] What does the second argument to `groupingBy()` do?
- [ ] What does `flatMap()` do?
- [ ] Why must the lambda passed to `flatMap()` return a Stream?
- [ ] Difference between `map()` and `flatMap()`?
- [ ] What is a functional interface?
- [ ] Difference between Function, Predicate, Consumer, Supplier?
- [ ] What is a lambda?
- [ ] What is a method reference?
- [ ] Why use Optional?
- [ ] Difference between `orElse()` and `orElseGet()`?

---

# 37 · 🎯 Interview Question Bank

### 1. What are generics?

→ Generics allow types to be specified for classes, methods, and collections, providing compile-time type safety and reducing casts.

### 2. What is type erasure?

→ Java implements generics mainly through compile-time checking and erasure, so generic type arguments are not retained in the same form at runtime.

### 3. Why is `List<Integer>` not a `List<Number>`?

→ Generic types are invariant. Allowing that assignment would let code insert a Double into a List<Integer>, breaking type safety.

### 4. What is `? extends`?

→ It represents an unknown type with an upper bound. It is useful when a generic source produces values that we mainly want to read.

### 5. What is `? super`?

→ It represents an unknown type with a lower bound. It is useful when a generic destination consumes values that we want to write.

### 6. What is PECS?

→ Producer Extends, Consumer Super.

### 7. What is a Stream?

→ A Stream is a pipeline-based API for processing sequences of data using operations such as filter, map, flatMap, reduce, and collect.

### 8. Why are Stream intermediate operations lazy?

→ They build the pipeline without processing immediately. The terminal operation triggers execution, allowing optimizations and short-circuiting.

### 9. Difference between `map()` and `flatMap()`?

→ `map()` transforms each element into one result. `flatMap()` transforms each element into a Stream and then flattens the resulting Streams into one Stream.

### 10. Why does `flatMap()` need the lambda to return a Stream?

→ Because flatMap is specifically designed to combine multiple per-element Streams into one flattened Stream. If the lambda returns a normal value, use map instead.

### 11. What does `collect()` do?

→ `collect()` is a terminal operation that gathers or aggregates Stream elements using a Collector.

### 12. What is `Collectors`?

→ `Collectors` is a utility class providing predefined Collector recipes such as `toList()`, `counting()`, `summingInt()`, and `groupingBy()`.

### 13. What does `groupingBy()` do?

→ It groups stream elements into a Map based on a key function and can optionally apply a downstream collector to each group.

### 14. What is a functional interface?

→ An interface with exactly one abstract method, which can therefore be implemented with a lambda.

### 15. Difference between Function, Predicate, Consumer, Supplier?

→ Function transforms (`T → R`), Predicate tests (`T → boolean`), Consumer consumes (`T → void`), and Supplier produces (`() → T`).

### 16. What is Optional?

→ Optional represents a value that may be present or absent, making possible absence explicit in an API instead of relying on null.

### 17. Difference between `orElse()` and `orElseGet()`?

→ `orElse()` evaluates its fallback eagerly, while `orElseGet()` receives a Supplier and evaluates the fallback only when the Optional is empty.

---

# 38 · ⭐ Answers to Memorize

### Generics

> Generics provide compile-time type safety by allowing types to be specified and checked by the compiler.

### PECS

> PECS means Producer Extends, Consumer Super. Use `? extends` when reading from a producer and `? super` when writing to a consumer.

### Streams

> A Stream is a pipeline for processing data. Intermediate operations are lazy and return Streams, while a terminal operation triggers the pipeline and produces the result.

### `flatMap`

> `flatMap` is used when one input can produce multiple values. The mapper returns a Stream, and flatMap combines those Streams into one flat Stream.

### Functional interfaces

> A functional interface has exactly one abstract method, which makes it usable as the target type for a lambda.

### Optional

> Optional makes the possibility of absence explicit in an API instead of returning null and making callers guess whether a value might be missing.

---

# 39 · Final Mental Map

```text
GENERICS
 ├── compile-time type safety
 ├── type erasure
 ├── bounded types
 ├── ? extends
 ├── ? super
 └── PECS ⭐

STREAMS
 ├── source
 ├── intermediate → lazy
 │    ├── map
 │    ├── filter
 │    └── flatMap ⭐
 └── terminal
      ├── reduce
      └── collect
           └── Collectors
                └── groupingBy ⭐

FUNCTIONAL JAVA
 ├── functional interface
 ├── Function
 ├── Predicate
 ├── Consumer
 ├── Supplier
 ├── lambda
 └── method reference

OPTIONAL
 ├── of
 ├── ofNullable
 ├── orElse
 ├── orElseGet
 ├── orElseThrow
 ├── ifPresent
 └── map
```

---

# 40 · One-Line Memory Hooks

```text
Generics       → type safety at compile time
Type erasure   → generic arguments mostly disappear at runtime
extends        → upper bound / producer
super          → lower bound / consumer
PECS           → Producer Extends, Consumer Super

Stream         → data-processing pipeline
map            → one → one transformed value
filter         → keep what matches
flatMap        → one → many, then flatten
reduce         → many → one
collect        → gather / aggregate
Collectors     → recipes for collecting
groupingBy     → group by key

Function       → T → R
Predicate      → T → boolean
Consumer       → T → void
Supplier       → () → T
Lambda         → concise functional implementation
Method ref     → existing method as lambda shorthand

Optional       → value may be absent
orElse         → eager fallback
orElseGet      → lazy fallback
```
