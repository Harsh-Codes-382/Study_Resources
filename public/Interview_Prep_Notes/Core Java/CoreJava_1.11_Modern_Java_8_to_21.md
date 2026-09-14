# Core Java — 1.11 Modern Java (8 → 21)

## 1. `var` — Local Variable Type Inference

Introduced in Java 10.

```java
var name = "Harsh";
var age = 25;
var numbers = new ArrayList<Integer>();
```

The compiler infers the type:

```java
var name = "Harsh";   // String
var age = 25;         // int
```

`var` does **not** mean dynamic typing. Java remains statically typed.

```java
var x = 10;
x = "hello"; // ❌ Compile error
```

### Where `var` can be used

Only for local variables with an initializer:

```java
void test() {
    var name = "Harsh"; // ✅
}
```

Not for fields, method parameters, or return types:

```java
class User {
    var name = "Harsh"; // ❌
}

void print(var name) { } // ❌

var getName() { } // ❌
```

This also fails because the compiler cannot infer a type:

```java
var name; // ❌
```

`final` can be combined with `var`:

```java
final var name = "Harsh";
```

### Interview answer

> "`var` provides local-variable type inference. The compiler determines the type from the initializer, but Java remains statically typed. It can only be used for local variables."

---

# 2. Records

Records were introduced as a standard feature in Java 16.

A record is a **compact data carrier**, commonly used for DTOs.

Instead of writing a class with fields, constructor, accessors, `equals`, `hashCode`, and `toString` manually:

```java
public record User(String name, int age) {
}
```

For the record above, Java provides:

- private final components
- canonical constructor
- component accessors
- `equals()`
- `hashCode()`
- `toString()`

Example:

```java
User user = new User("Harsh", 25);

System.out.println(user.name());
System.out.println(user.age());
System.out.println(user);
```

Record accessors are:

```java
name()
age()
```

not:

```java
getName()
getAge()
```

### Canonical constructor

Conceptually:

```java
public User(String name, int age) {
    this.name = name;
    this.age = age;
}
```

### `equals()` / `hashCode()`

Records compare their component values:

```java
User u1 = new User("Harsh", 25);
User u2 = new User("Harsh", 25);

System.out.println(u1.equals(u2)); // true
```

### `toString()`

A useful representation is generated automatically:

```text
User[name=Harsh, age=25]
```

### Records can have methods

```java
public record User(String name, int age) {

    public boolean isAdult() {
        return age >= 18;
    }
}
```

### Records can validate through a compact constructor

```java
public record User(String name, int age) {

    public User {
        if (age < 0) {
            throw new IllegalArgumentException("Age cannot be negative");
        }
    }
}
```

Java handles the component assignments.

### Records and inheritance

A record cannot extend another class:

```java
record User(String name) extends Person { } // ❌
```

It implicitly extends:

```java
java.lang.Record
```

But it can implement interfaces:

```java
interface Identifiable {
    String id();
}

record User(String id, String name) implements Identifiable {
}
```

### Important: shallow immutability

Records provide shallow immutability, not guaranteed deep immutability.

```java
public record User(List<String> roles) {
}
```

The `roles` reference is final, but the list can still be modified:

```java
List<String> roles = new ArrayList<>();
User user = new User(roles);

roles.add("ADMIN");
```

### Interview answer

> "Records are compact immutable data carriers, commonly used for DTOs. They automatically provide the canonical constructor, component accessors, equals, hashCode, and toString."

Important subtlety:

> "Records provide shallow immutability; referenced mutable objects can still be changed."

---

# 3. Sealed Classes / Interfaces

Sealed types are about **controlling inheritance**.

Normally:

```java
class Animal {
}

class Dog extends Animal {
}

class Cat extends Animal {
}

class Tiger extends Animal {
}
```

A sealed class lets us specify exactly which classes may extend it:

```java
public sealed class Animal
        permits Dog, Cat {
}
```

Now:

```java
final class Dog extends Animal {
}

final class Cat extends Animal {
}
```

are allowed.

But:

```java
class Tiger extends Animal {
}
```

is a compile error.

### Say this out loud

> "Sealed means I control exactly who can extend or implement the type."

### Permitted subclasses

A direct subclass of a sealed class must be one of:

#### `final`

```java
final class Dog extends Animal {
}
```

No further inheritance.

#### `sealed`

```java
sealed class Dog extends Animal
        permits GermanShepherd {
}
```

Inheritance remains controlled.

#### `non-sealed`

```java
non-sealed class Dog extends Animal {
}
```

The sealing restriction is opened again for that branch.

Think:

```text
sealed
   ↓
controls inheritance

final
   ↓
stops inheritance

non-sealed
   ↓
opens inheritance again
```

### Sealed interfaces

Interfaces can also be sealed:

```java
public sealed interface Shape
        permits Circle, Rectangle {
}
```

Then:

```java
final class Circle implements Shape {
}

final class Rectangle implements Shape {
}
```

### Why sealed types are useful

They are especially useful when the set of valid implementations is known.

For example:

```java
sealed interface Payment
        permits CreditCardPayment,
                UpiPayment,
                CashPayment {
}
```

This becomes very useful with pattern matching because the compiler knows the possible implementations.

---

# 4. Switch Expressions

Older Java commonly used `switch` as a statement:

```java
int day = 2;

String result;

switch (day) {
    case 1:
        result = "Monday";
        break;

    case 2:
        result = "Tuesday";
        break;

    default:
        result = "Unknown";
}
```

Modern Java allows `switch` to be an **expression that produces a value**:

```java
String result = switch (day) {
    case 1 -> "Monday";
    case 2 -> "Tuesday";
    default -> "Unknown";
};
```

### Arrow syntax

```java
case 1 -> "Monday";
case 2 -> "Tuesday";
```

Arrow-style cases do not fall through.

### `yield`

If a case needs multiple statements:

```java
String result = switch (day) {

    case 1 -> {
        System.out.println("First day");
        yield "Monday";
    }

    case 2 -> {
        System.out.println("Second day");
        yield "Tuesday";
    }

    default -> "Unknown";
};
```

`yield` provides the value of the switch expression.

Remember:

- `return` returns from the method.
- `yield` provides the value from the switch expression.

### Interview answer

> "A switch expression produces a value, supports arrow syntax without fall-through, and uses `yield` when a case block needs to return a value."

---

# 5. Pattern Matching

Pattern matching makes type checking and casting more concise.

### Older Java

```java
Object obj = "Hello";

if (obj instanceof String) {
    String str = (String) obj;

    System.out.println(str.length());
}
```

### Modern Java

```java
if (obj instanceof String str) {
    System.out.println(str.length());
}
```

The type check and variable binding happen together.

This is **pattern matching for `instanceof`**.

---

## Pattern matching with `switch`

Modern Java can also match on types:

```java
static String describe(Object obj) {

    return switch (obj) {

        case Integer i -> "Integer: " + i;

        case String s -> "String: " + s;

        case Double d -> "Double: " + d;

        default -> "Something else";
    };
}
```

---

## Sealed types + pattern matching

These features work particularly well together.

```java
sealed interface Shape
        permits Circle, Rectangle {
}

record Circle(double radius) implements Shape {
}

record Rectangle(double width, double height) implements Shape {
}
```

Then:

```java
static double area(Shape shape) {

    return switch (shape) {

        case Circle c ->
            Math.PI * c.radius() * c.radius();

        case Rectangle r ->
            r.width() * r.height();
    };
}
```

There is no `default`.

Because `Shape` is sealed, Java knows:

```text
Shape
 ├── Circle
 └── Rectangle
```

So the compiler knows all possible cases have been handled.

This is an important modern-Java combination:

> **Sealed types + records + pattern matching + switch expressions**

---

# 6. Text Blocks

Text blocks provide a cleaner syntax for multiline strings.

Without text blocks:

```java
String json =
        "{\n" +
        "  \"name\": \"Harsh\",\n" +
        "  \"age\": 25\n" +
        "}";
```

With text blocks:

```java
String json = """
        {
          "name": "Harsh",
          "age": 25
        }
        """;
```

Syntax:

```java
"""
multiple lines
"""
```

### Common uses

SQL:

```java
String sql = """
        SELECT *
        FROM users
        WHERE age > 18
        """;
```

JSON:

```java
String json = """
        {
            "name": "Harsh",
            "age": 25
        }
        """;
```

HTML:

```java
String html = """
        <html>
            <body>
                <h1>Hello</h1>
            </body>
        </html>
        """;
```

Main benefit:

> Better readability for multiline strings.

---

# 7. Default and Static Interface Methods

These were introduced in Java 8.

Before Java 8, interfaces primarily defined contracts:

```java
interface Payment {
    void pay();
}
```

Java 8 introduced **default methods**, allowing interfaces to contain implementations:

```java
interface Payment {

    void pay();

    default void printReceipt() {
        System.out.println("Receipt generated");
    }
}
```

A class implementing the interface automatically gets the default method:

```java
class CreditCardPayment implements Payment {

    @Override
    public void pay() {
        System.out.println("Paid by card");
    }
}
```

The class does not need to implement `printReceipt()`.

### Why default methods?

They allow interfaces to evolve without immediately breaking every existing implementation.

```java
interface Vehicle {

    void start();

    default void stop() {
        System.out.println("Vehicle stopped");
    }
}
```

Existing implementations can continue working.

---

## Static interface methods

Interfaces can also contain static methods:

```java
interface MathUtil {

    static int square(int x) {
        return x * x;
    }
}
```

Call it through the interface:

```java
int result = MathUtil.square(5);
```

Not through an object:

```java
MathUtil obj = ...;

obj.square(5); // ❌
```

### Default vs static

| Feature | Default | Static |
|---|---|---|
| Has implementation | Yes | Yes |
| Available through implementing class | Yes | No |
| Called through object | Yes | No |
| Called through interface | Not normally | Yes |

---

# 8. Lambdas / Streams / Optional

These are major Java 8 features and form the foundation of Java's functional/declarative programming style.

## Lambda

Instead of:

```java
Runnable r = new Runnable() {
    @Override
    public void run() {
        System.out.println("Hello");
    }
};
```

we can write:

```java
Runnable r = () -> System.out.println("Hello");
```

A lambda provides behavior where a functional interface is expected.

---

## Streams

Streams provide a pipeline for processing data:

```java
List<Integer> numbers = List.of(1, 2, 3, 4, 5);

List<Integer> result = numbers.stream()
        .filter(n -> n % 2 == 0)
        .map(n -> n * 2)
        .toList();
```

Conceptually:

```text
List
 ↓
stream()
 ↓
filter
 ↓
map
 ↓
toList
```

Streams do not replace collections.

They provide a **processing pipeline over data**.

---

## Optional

`Optional<T>` represents a value that may or may not be present.

Instead of:

```java
User findUser() {
    return null;
}
```

we can use:

```java
Optional<User> findUser() {
    // ...
}
```

Then:

```java
Optional<User> user = findUser();

user.ifPresent(u ->
    System.out.println(u.name())
);
```

Or:

```java
User user = findUser()
        .orElse(defaultUser);
```

Core idea:

> `Optional<T>` explicitly represents possible absence.

---

# 9. Virtual Threads — Java 21

Virtual threads were introduced in **Java 21** as part of **Project Loom**.

Traditional Java applications commonly use platform threads, which are relatively expensive compared with virtual threads.

Virtual threads are designed to be **very lightweight**, allowing applications to handle a large number of concurrent tasks.

Example:

```java
Thread.startVirtualThread(() -> {
    System.out.println("Running in virtual thread");
});
```

Another common API:

```java
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {

    executor.submit(() -> {
        // task
    });
}
```

---

## Where are virtual threads useful?

They are particularly useful for **I/O-heavy workloads**:

```text
HTTP request
     ↓
Database call
     ↓
waiting...
     ↓
response
```

A virtual thread can be suspended while waiting for blocking I/O, allowing resources to be used efficiently for other work.

### Important interview point

Virtual threads are not simply "faster threads."

They primarily improve:

> **Scalability and concurrency**

especially for workloads involving lots of blocking I/O.

They do not magically make CPU-bound calculations faster.

Think:

> **Virtual threads = cheap concurrency, not faster CPU execution.**

---

# Putting Modern Java Features Together

These features become especially powerful when combined.

Example payment system:

## Step 1 — Sealed interface

```java
sealed interface Payment
        permits CardPayment, UpiPayment {
}
```

## Step 2 — Records for data

```java
record CardPayment(String cardNumber) implements Payment {
}

record UpiPayment(String upiId) implements Payment {
}
```

## Step 3 — Pattern matching + switch expression

```java
static String process(Payment payment) {

    return switch (payment) {

        case CardPayment c ->
                "Processing card: " + c.cardNumber();

        case UpiPayment u ->
                "Processing UPI: " + u.upiId();
    };
}
```

The features complement each other:

```text
                 Payment
                    │
             sealed interface
                    │
          ┌─────────┴─────────┐
          ↓                   ↓
   CardPayment            UpiPayment
      record                 record
          │                   │
          └─────────┬─────────┘
                    ↓
             pattern matching
                    ↓
              switch expression
```

---

# Java Version Timeline

| Feature | Java Version |
|---|---:|
| Lambdas | Java 8 |
| Streams | Java 8 |
| Optional | Java 8 |
| Default interface methods | Java 8 |
| Static interface methods | Java 8 |
| `var` | Java 10 |
| Switch expressions | Java 14 |
| Text blocks | Java 15 |
| Records | Java 16 |
| Pattern matching for `instanceof` | Java 16 |
| Sealed classes/interfaces | Java 17 |
| Pattern matching for `switch` | Java 21 |
| Virtual threads | Java 21 |

---

# Interview Mental Model

```text
Java 8
 ├── Lambda
 ├── Streams
 ├── Optional
 └── Default/Static interface methods

Java 10
 └── var

Java 14–16
 ├── Switch expressions
 ├── Text blocks
 ├── Records
 └── Pattern matching instanceof

Java 17
 └── Sealed classes/interfaces

Java 21
 ├── Pattern matching switch
 └── Virtual threads
```

---

# What You Should Be Able to Say Out Loud

### `var`

> "`var` provides local-variable type inference. The compiler determines the type from the initializer, but Java remains statically typed. It can only be used for local variables."

### Records

> "Records are compact immutable data carriers, commonly used for DTOs. They automatically provide the canonical constructor, component accessors, equals, hashCode, and toString."

Important subtlety:

> "Records provide shallow immutability; referenced mutable objects can still be changed."

### Sealed classes/interfaces

> "A sealed class or interface restricts exactly which classes can extend or implement it using the `permits` clause."

### Switch expressions

> "A switch expression produces a value, supports arrow syntax without fall-through, and uses `yield` when a case block needs to return a value."

### Pattern matching

> "Pattern matching combines type checking with variable binding, reducing explicit casts."

### Text blocks

> "Text blocks provide a clean syntax for multiline strings such as SQL, JSON, and HTML."

### Virtual threads

> "Virtual threads are lightweight threads introduced in Java 21 that allow high concurrency, particularly for blocking I/O workloads. They improve scalability rather than making CPU-bound work faster."

---

# Final Mental Model

```text
var
 ↓
less boilerplate for local variables

record
 ↓
compact immutable data carrier

sealed
 ↓
controlled inheritance

switch expression
 ↓
switch produces a value

pattern matching
 ↓
type check + variable binding

text block
 ↓
clean multiline strings

default interface method
 ↓
interface can evolve with implementations

lambda + streams + Optional
 ↓
functional/declarative data processing

virtual threads
 ↓
massive lightweight concurrency
```

The most important combination to deeply understand is:

```text
Records
   +
Sealed types
   +
Pattern matching
   +
Switch expressions
```

These features work together to make modern Java code concise, type-safe, and easier for the compiler to reason about.
