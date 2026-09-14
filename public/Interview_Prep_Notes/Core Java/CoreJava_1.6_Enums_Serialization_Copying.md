# Core Java 1.6 — Enums, Serialization, Copying & Other Keywords

> **How to use this note:** Read top-to-bottom once. On revision, focus first on the **Say it out loud** sections and then the **Question Bank**.

---

## 1 · Enums

An `enum` represents a **fixed set of possible values**.

```java
enum Status {
    PENDING,
    PROCESSING,
    SHIPPED,
    DELIVERED,
    CANCELLED
}
```

Usage:

```java
Status status = Status.PENDING;
```

### Why enum instead of String/int constants?

With a String:

```java
String status = "PENDNG"; // typo is possible
```

With an int:

```java
int status = 999; // compiler cannot prevent this
```

With an enum:

```java
Status status = Status.PENDING;
```

The compiler gives you **type safety**.

> **Say it:** An enum is best when the set of valid values is fixed and known at compile time.

---

## 2 · Enum fields, constructors & methods

Enums can have fields, constructors and methods.

```java
enum Status {

    PENDING(1),
    PROCESSING(2),
    SHIPPED(3),
    DELIVERED(4);

    private final int code;

    Status(int code) {
        this.code = code;
    }

    public int getCode() {
        return code;
    }
}
```

Usage:

```java
System.out.println(Status.SHIPPED.getCode()); // 3
```

Enum constructors are effectively private. You cannot do:

```java
new Status(3); // ❌
```

The enum constants are created by the JVM.

---

## 3 · `values()`

`values()` returns all enum constants.

```java
for (Status status : Status.values()) {
    System.out.println(status);
}
```

> **Remember:** `values()` → all constants.

---

## 4 · `valueOf()`

`valueOf()` converts an exact String name into an enum constant.

```java
Status status = Status.valueOf("SHIPPED");

System.out.println(status); // SHIPPED
```

It is case-sensitive:

```java
Status.valueOf("shipped"); // ❌ IllegalArgumentException
Status.valueOf("UNKNOWN"); // ❌ IllegalArgumentException
```

> **Remember:** `valueOf("NAME")` → enum constant with exactly that name.

---

## 5 · `ordinal()`

`ordinal()` gives the zero-based position of an enum constant.

```java
enum Status {
    PENDING,
    PROCESSING,
    SHIPPED
}
```

```java
Status.PENDING.ordinal();     // 0
Status.PROCESSING.ordinal();  // 1
Status.SHIPPED.ordinal();     // 2
```

### ⚠️ Don't use `ordinal()` as a persistent/database ID

If the enum changes:

```java
enum Status {
    PENDING,
    CANCELLED,
    PROCESSING,
    SHIPPED
}
```

`SHIPPED.ordinal()` changes from `2` to `3`.

Prefer an explicit ID:

```java
enum Status {
    PENDING(1),
    PROCESSING(2),
    SHIPPED(3);

    private final int id;

    Status(int id) {
        this.id = id;
    }
}
```

> **Say it:** `ordinal()` is the declaration position, not a stable business ID.

---

## 6 · Enum in `switch`

Enums work naturally with `switch`.

```java
Status status = Status.SHIPPED;

switch (status) {
    case PENDING:
        System.out.println("Waiting");
        break;

    case PROCESSING:
        System.out.println("Being processed");
        break;

    case SHIPPED:
        System.out.println("On the way");
        break;

    case DELIVERED:
        System.out.println("Delivered");
        break;
}
```

Inside the switch, use:

```java
case SHIPPED:
```

rather than:

```java
case Status.SHIPPED:
```

---

## 7 · `EnumSet`

`EnumSet` is a specialized `Set` implementation for enum values.

```java
enum Permission {
    READ,
    WRITE,
    DELETE
}
```

```java
EnumSet<Permission> permissions =
        EnumSet.of(Permission.READ, Permission.WRITE);

permissions.contains(Permission.READ);   // true
permissions.contains(Permission.DELETE); // false
```

> **Interview:** `EnumSet` is a high-performance Set implementation specifically designed for enum types.

---

## 8 · `EnumMap`

`EnumMap` is a specialized `Map` implementation where the keys are enums.

```java
EnumMap<Status, String> messages =
        new EnumMap<>(Status.class);

messages.put(Status.PENDING, "Waiting for payment");
messages.put(Status.SHIPPED, "Order is on the way");

System.out.println(messages.get(Status.SHIPPED));
```

> **Interview:** `EnumMap` is a Map implementation optimized for enum keys.

---

# 9 · Enum as Singleton ⭐⭐⭐

A singleton means that a class should have exactly **one instance**.

A traditional singleton requires careful handling of construction, threading, serialization and reflection.

An enum provides a very robust implementation:

```java
enum Database {
    INSTANCE;

    public void connect() {
        System.out.println("Connected");
    }
}
```

Usage:

```java
Database.INSTANCE.connect();
```

### Why is enum singleton so strong?

#### 1. Thread-safe

The JVM safely initializes enum constants.

You don't need to write:

```java
synchronized
```

or double-checked locking just to create the singleton.

#### 2. Serialization-safe

Java treats enum serialization specially. Deserialization preserves the enum constant identity instead of creating a separate singleton instance.

#### 3. Reflection-resistant

Normal private constructors can potentially be targeted through reflection. Enum constants cannot be instantiated through reflection in the normal way.

> **Say it out loud:**  
> **An enum is a robust singleton implementation because the JVM handles enum constant creation, making it thread-safe, serialization-safe, and resistant to reflective instantiation.**

---

# 10 · Serialization

**Serialization** means converting an object into a representation such as a byte stream so that its state can be stored or transferred.

Conceptually:

```text
Java Object
    ↓ serialization
byte stream
    ↓
file / network / cache
```

Then:

```text
byte stream
    ↓ deserialization
Java Object
```

### Why serialize?

Historically/common uses include:

- storing object state
- transferring data over a network
- caching
- persistence

Modern applications often use formats such as:

```text
JSON
XML
Protobuf
Avro
```

instead of Java's native serialization.

---

# 11 · `Serializable`

Java's built-in serialization uses the `Serializable` marker interface.

```java
import java.io.Serializable;

class User implements Serializable {

    String name;
    int age;
}
```

`Serializable` is a **marker interface** — it doesn't require you to implement methods.

If you use Java's built-in `ObjectOutputStream` serialization, the object must be serializable.

Example:

```java
ObjectOutputStream out =
        new ObjectOutputStream(
            new FileOutputStream("user.ser")
        );

out.writeObject(user);
```

If the object is not serializable, Java's built-in mechanism can throw:

```text
NotSerializableException
```

---

# 12 · Important: network ≠ Java serialization ⭐⭐⭐

A common interview trap:

> "If I send a Java object over the network, it must implement `Serializable`."

**Not necessarily.**

`Serializable` is required for **Java's built-in serialization mechanism**, not for network communication in general.

For example, a REST API commonly does:

```text
Java Object
    ↓
JSON serialization
    ↓
HTTP
    ↓
JSON
    ↓
HTTP
    ↓
JSON deserialization
    ↓
Java Object
```

This class does not need `Serializable`:

```java
class User {
    String name;
    int age;
}
```

A JSON library such as Jackson can convert it to:

```json
{
  "name": "Harsh",
  "age": 25
}
```

The other service could even be written in Python, Go, JavaScript, etc.

> **Say it:**  
> **`Serializable` is required by Java's native serialization, not by network communication itself. A network protocol can use JSON, Protobuf, Avro, or another format.**

---

# 13 · `transient` ⭐⭐⭐

`transient` tells Java's **default serialization mechanism** to skip a field.

```java
class User implements Serializable {

    String username;

    transient String password;
}
```

During Java native serialization:

```text
username → serialized
password → skipped
```

After deserialization, the transient field gets its default value.

For example:

```text
String → null
int → 0
boolean → false
```

### Why use `transient`?

Typical reasons:

- sensitive data that should not be serialized
- derived/calculated fields
- non-serializable objects
- cached values

> **Say it:**  
> **`transient` means the field is skipped by Java's default serialization mechanism.**

### Important nuance

`transient` specifically affects Java's serialization mechanism. Other serialization frameworks, such as JSON libraries, can have their own rules.

---

# 14 · `serialVersionUID` ⭐⭐⭐

`serialVersionUID` is an explicit version identifier for a `Serializable` class.

```java
class User implements Serializable {

    private static final long serialVersionUID = 1L;

    String name;
}
```

During deserialization, Java checks the serialized class's UID against the current class's UID.

Conceptually:

```text
Serialized object
serialVersionUID = 1

Current class
serialVersionUID = 1

        ↓

Compatible
```

But:

```text
Serialized object
serialVersionUID = 1

Current class
serialVersionUID = 2

        ↓

InvalidClassException
```

### Why explicitly define it?

If you don't declare it, Java can calculate one based on the class structure. Changes to the class can then produce a different generated UID.

Explicitly declaring it makes the versioning decision intentional.

> **Say it:**  
> **`serialVersionUID` identifies the version of a Serializable class. During deserialization, an incompatible mismatch can cause `InvalidClassException`.**

---

# 15 · `Externalizable`

`Serializable` gives you mostly **default serialization**.

`Externalizable` gives you more explicit control.

```java
class User implements Externalizable {

    String name;
    int age;

    public User() {
    }

    @Override
    public void writeExternal(ObjectOutput out)
            throws IOException {
        out.writeUTF(name);
        out.writeInt(age);
    }

    @Override
    public void readExternal(ObjectInput in)
            throws IOException {
        name = in.readUTF();
        age = in.readInt();
    }
}
```

You explicitly decide what gets written and read.

### Interview difference

| `Serializable` | `Externalizable` |
|---|---|
| Default serialization | You control serialization |
| Easier | More work |
| JVM handles fields | You implement read/write |
| Less control | More control |
| Common | More specialized |

`Externalizable` requires a public no-argument constructor.

---

# 16 · Cloning / Copying

Suppose we have:

```java
class Person {
    String name;
    int age;
}
```

and want another object with the same state.

Conceptually:

```text
Person A
   ↓ copy
Person B
```

There are two important concepts:

- shallow copy
- deep copy

---

# 17 · Shallow copy ⭐⭐⭐

Consider:

```java
class Address {
    String city;

    Address(String city) {
        this.city = city;
    }
}

class Person {
    String name;
    Address address;

    Person(String name, Address address) {
        this.name = name;
        this.address = address;
    }
}
```

Suppose:

```java
Address address = new Address("Delhi");
Person p1 = new Person("Harsh", address);
```

A shallow copy could be:

```java
Person p2 = new Person(p1.name, p1.address);
```

Memory conceptually looks like:

```text
p1 ──→ Person A
          │
          └──→ Address A
                 ↑
          ┌──────┘
          │
p2 ──→ Person B
```

`p1` and `p2` are different `Person` objects.

But both point to the **same Address object**.

Therefore:

```java
p2.address.city = "Mumbai";
```

also changes what `p1.address.city` sees.

> **Say it:**  
> **Shallow copy creates a new outer object, but referenced objects can still be shared.**

---

# 18 · Deep copy ⭐⭐⭐

For a deep copy, we create a new `Person` **and** a new `Address`.

First give `Address` a copy constructor:

```java
class Address {
    String city;

    Address(String city) {
        this.city = city;
    }

    Address(Address other) {
        this.city = other.city;
    }
}
```

Then give `Person` a copy constructor:

```java
class Person {
    String name;
    Address address;

    Person(String name, Address address) {
        this.name = name;
        this.address = address;
    }

    Person(Person other) {
        this.name = other.name;
        this.address = new Address(other.address);
    }
}
```

Now:

```java
Person p2 = new Person(p1);
```

creates:

```text
p1 ──→ Person A
          │
          └──→ Address A
                 └── "Delhi"


p2 ──→ Person B
          │
          └──→ Address B
                 └── "Delhi"
```

Now the `Address` objects are independent.

```java
p2.address.city = "Mumbai";
```

does **not** change:

```java
p1.address.city
```

It remains:

```text
Delhi
```

> **Say it:**  
> **Deep copy creates a new outer object and new copies of the referenced mutable objects that should be independent.**

### Important nuance

Deep copy does not necessarily mean blindly copying absolutely everything recursively. Immutable objects such as `String` can safely be shared.

---

# 19 · How do you actually create a deep copy?

There is no single magical Java keyword for deep copying.

You choose a copying strategy.

### Option 1 — Copy constructor ⭐ Recommended

```java
Person(Person other) {
    this.name = other.name;
    this.address = new Address(other.address);
}
```

Usage:

```java
Person p2 = new Person(p1);
```

### Option 2 — Static factory

```java
class Person {

    static Person copyOf(Person original) {
        Person copy = new Person();

        copy.name = original.name;
        copy.address = new Address(original.address);

        return copy;
    }
}
```

Usage:

```java
Person p2 = Person.copyOf(p1);
```

These approaches make the copying behavior explicit.

---

# 20 · `Cloneable` / `clone()`

Java provides:

```java
Cloneable
```

and:

```java
clone()
```

Example:

```java
class Person implements Cloneable {

    String name;

    @Override
    public Person clone() {
        try {
            return (Person) super.clone();
        } catch (CloneNotSupportedException e) {
            throw new AssertionError(e);
        }
    }
}
```

Then:

```java
Person p2 = p1.clone();
```

---

# 21 · Why is `clone()` discouraged? ⭐⭐⭐

### Problem 1 — `Cloneable` doesn't define `clone()`

This is surprising:

```java
Cloneable
```

is only a marker interface.

The actual `clone()` method comes from:

```java
Object.clone()
```

### Problem 2 — `Object.clone()` is protected

You usually need to expose it yourself.

### Problem 3 — default cloning is shallow

`super.clone()` generally performs field-by-field copying.

Nested mutable objects can remain shared.

### Problem 4 — awkward exception

The API can involve:

```java
CloneNotSupportedException
```

### Preferred alternatives

Use:

```java
new Person(existingPerson);
```

or:

```java
Person.copyOf(existingPerson);
```

> **Say it:**  
> **`Cloneable`/`clone()` is generally discouraged because the API is awkward, `Cloneable` is only a marker interface, `Object.clone()` is protected, and the default behavior is shallow copying. Copy constructors or static factories make copying explicit.**

---

# 22 · `instanceof`

`instanceof` checks whether an object is an instance of a particular type.

```java
Object obj = "hello";

if (obj instanceof String) {
    System.out.println("It's a String");
}
```

Before pattern matching, you commonly wrote:

```java
if (obj instanceof String) {
    String str = (String) obj;

    System.out.println(str.length());
}
```

This involves:

1. checking the type
2. casting the object
3. using the casted variable

---

# 23 · Pattern matching for `instanceof` ⭐

Modern Java can combine the check and cast:

```java
if (obj instanceof String str) {
    System.out.println(str.length());
}
```

Java:

1. checks whether `obj` is a `String`
2. casts it
3. creates `str`

Pattern matching for `instanceof` became standard in Java 16.

You can also use the pattern variable in a condition:

```java
if (obj instanceof String str && str.length() > 5) {
    System.out.println(str);
}
```

> **Say it:** Pattern matching for `instanceof` combines type checking and casting, reducing boilerplate.

---

# 24 · Annotations

Annotations provide **metadata about code**.

Common examples:

```java
@Override
@Deprecated
@FunctionalInterface
```

### `@Override`

```java
@Override
public String toString() {
    return "User";
}
```

It tells the compiler that you intend to override a method.

If you make a mistake:

```java
@Override
public String tostring() { // ❌
    return "User";
}
```

the compiler catches it.

### `@Deprecated`

```java
@Deprecated
public void oldMethod() {
}
```

It tells developers that the API should generally no longer be used.

### `@FunctionalInterface`

```java
@FunctionalInterface
interface Calculator {
    int calculate(int a, int b);
}
```

It indicates that the interface is intended to have exactly one abstract method, making it suitable for lambdas.

---

# 25 · Custom annotations

You can define your own annotation:

```java
@interface MyAnnotation {
    String value();
}
```

Use it:

```java
@MyAnnotation("important")
class User {
}
```

Frameworks make extensive use of annotations.

For example, in Spring you may see:

```java
@Component
@Service
@Autowired
@Transactional
```

Annotations are metadata. Their actual effect comes from the compiler, JVM, framework, or code that processes them.

---

# 26 · Reflection

Reflection allows Java code to inspect and interact with classes **at runtime**.

Example:

```java
Class<?> clazz = User.class;
```

You can inspect:

```java
clazz.getName();
clazz.getMethods();
clazz.getFields();
clazz.getConstructors();
```

You can also dynamically invoke methods:

```java
Method method = clazz.getMethod("hello");
method.invoke(object);
```

### Why does this matter to developers?

You may not write reflection every day, but many frameworks use it internally.

A framework can inspect:

```java
@Service
class UserService {
}
```

and discover:

> "This class has the `@Service` annotation."

It can then use that information to create/manage the object.

Dependency injection and ORM frameworks make heavy use of reflection.

> **Say it:** Reflection lets Java inspect classes, fields, methods, constructors and annotations at runtime, and can also dynamically access/invoke them.

---

# 27 · Quick comparison

| Topic | Core idea |
|---|---|
| `enum` | Fixed set of type-safe values |
| `values()` | All enum constants |
| `valueOf()` | String → enum constant |
| `ordinal()` | Zero-based declaration position |
| `EnumSet` | Set optimized for enums |
| `EnumMap` | Map optimized for enum keys |
| Enum singleton | JVM-managed robust singleton |
| `Serializable` | Enables Java native serialization |
| `transient` | Skip field in default Java serialization |
| `serialVersionUID` | Serializable class version identifier |
| `Externalizable` | Manual serialization control |
| Shallow copy | Nested references may be shared |
| Deep copy | Independent copies of referenced mutable objects |
| `Cloneable` | Marker interface for cloning |
| `clone()` | Legacy cloning mechanism |
| `instanceof` | Runtime type check |
| Pattern matching | Type check + cast together |
| Annotation | Metadata attached to code |
| Reflection | Runtime inspection/manipulation |

---

# 28 · 🔥 Must-be-able-to-say checklist

- [ ] Why use an enum instead of Strings/ints?
- [ ] What do `values()`, `valueOf()`, and `ordinal()` do?
- [ ] Why should `ordinal()` generally not be used as a database ID?
- [ ] What are `EnumSet` and `EnumMap`?
- [ ] Why is an enum a good singleton implementation?
- [ ] What does Java serialization mean?
- [ ] What does `Serializable` do?
- [ ] Does sending an object over a network always require `Serializable`?
- [ ] What does `transient` do?
- [ ] Why does `serialVersionUID` matter?
- [ ] What causes `InvalidClassException`?
- [ ] What is `Externalizable`?
- [ ] Shallow vs deep copy — what is shared?
- [ ] How can you implement a deep copy?
- [ ] Why is `clone()` discouraged?
- [ ] What does `instanceof` do?
- [ ] What is pattern matching for `instanceof`?
- [ ] What are annotations?
- [ ] What is reflection and why do frameworks use it?

---

# 29 · 🎯 Interview Question Bank

### 1. Why use an enum instead of String constants?

→ An enum provides type safety and restricts values to a fixed set of constants. Strings can contain typos or invalid values.

### 2. What do `values()`, `valueOf()`, and `ordinal()` do?

→ `values()` returns all constants. `valueOf()` converts an exact String name into an enum constant. `ordinal()` returns the zero-based declaration position.

### 3. Why shouldn't you use `ordinal()` as a database ID?

→ Because changing the declaration order changes the ordinal. Use an explicit stable ID instead.

### 4. Why is enum singleton considered robust?

→ The JVM manages enum constant creation, giving safe initialization/thread-safety, special serialization handling that preserves identity, and protection against normal reflective construction.

### 5. What does `transient` do?

→ It tells Java's default serialization mechanism to skip that field. After deserialization, it has its default value unless custom logic restores it.

### 6. Why does `serialVersionUID` matter?

→ It identifies the version of a Serializable class. An incompatible UID mismatch during deserialization can cause `InvalidClassException`.

### 7. Does an object need `Serializable` to be sent over a network?

→ No. It needs to be converted into some transferable representation. Java native serialization requires `Serializable`, but JSON, Protobuf, Avro, etc. do not require the Java `Serializable` interface.

### 8. Shallow vs deep copy?

→ A shallow copy creates a new outer object while referenced objects may be shared. A deep copy creates independent copies of the referenced mutable objects that should not be shared.

### 9. How would you implement a deep copy?

→ Usually with a copy constructor or static factory, explicitly creating copies of nested mutable objects.

### 10. Why is `clone()` discouraged?

→ `Cloneable` is only a marker interface, `Object.clone()` is protected, the API is awkward, and default cloning is shallow. Copy constructors/factories make the behavior explicit.

### 11. What is pattern matching for `instanceof`?

→ It combines the type check and cast:

```java
if (obj instanceof String str) {
    System.out.println(str.length());
}
```

### 12. What is reflection?

→ Reflection allows Java to inspect and interact with classes, fields, methods, constructors and annotations at runtime. Frameworks use it heavily for tasks such as dependency injection and ORM.

---

# 30 · ⭐ 5 answers to memorize

### Enum singleton

> An enum is a robust singleton implementation because the JVM manages enum constant creation, making it thread-safe, serialization-safe, and resistant to reflective instantiation.

### `transient`

> `transient` tells Java's default serialization mechanism to skip a field.

### `serialVersionUID`

> `serialVersionUID` identifies the version of a Serializable class. An incompatible mismatch during deserialization can cause `InvalidClassException`.

### Shallow vs deep copy

> A shallow copy creates a new outer object but can share nested references. A deep copy creates independent copies of the nested mutable objects.

### `Serializable` vs network

> `Serializable` is required for Java's native serialization mechanism, not for network communication in general. Network data can use JSON, Protobuf, Avro, or other formats.

---

# 31 · Final mental map

```text
ENUM
 ├── constants
 ├── fields / constructors / methods
 ├── values()
 ├── valueOf()
 ├── ordinal()
 ├── switch
 ├── EnumSet
 ├── EnumMap
 └── singleton ⭐


SERIALIZATION
 ├── Serializable
 ├── serialVersionUID ⭐
 ├── transient ⭐
 └── Externalizable


COPYING
 ├── shallow copy ⭐
 ├── deep copy ⭐
 ├── Cloneable
 ├── clone()
 └── copy constructor / factory ⭐


RUNTIME
 ├── instanceof
 ├── pattern matching
 ├── annotations
 └── reflection
```

---

## One-line memory hooks

```text
enum          → fixed, type-safe set of values
values()      → give me all constants
valueOf()     → String → enum
ordinal()     → declaration position (don't use as stable ID)

EnumSet       → Set for enums
EnumMap       → Map with enum keys
enum singleton→ JVM-managed singleton

Serializable  → Java native serialization
transient     → skip this field
serialVersionUID → class serialization version
Externalizable → I control serialization

shallow copy  → nested objects can be shared
deep copy     → nested mutable objects are independently copied
clone()       → legacy/awkward; prefer copy constructor/factory

instanceof    → type check
pattern match → type check + cast
annotation    → metadata
reflection    → inspect/use types at runtime
```
