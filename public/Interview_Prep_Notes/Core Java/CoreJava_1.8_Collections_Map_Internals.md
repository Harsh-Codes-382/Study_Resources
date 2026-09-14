# Core Java 1.8 — Collections: Map Internals

## 1. Map Basics

A `Map` stores data as **key → value** pairs.

```java
Map<String, Integer> marks = new HashMap<>();

marks.put("Harsh", 90);
marks.put("Amit", 80);
marks.put("Rahul", 95);
```

Conceptually:

```text
"Harsh" → 90
"Amit"  → 80
"Rahul" → 95
```

A `Map` is primarily designed to find a value using its key:

```java
marks.get("Harsh");   // 90
```

---

# 2. HashMap Internals

`HashMap` is built around an **array of buckets**.

Conceptually:

```text
HashMap

Bucket array
────────────────────
[0] → ?
[1] → ?
[2] → ?
[3] → ?
[4] → ?
[5] → ?
[6] → ?
[7] → ?
────────────────────
```

When we do:

```java
map.put("Harsh", 90);
```

HashMap has to determine:

> Which bucket should `"Harsh"` go into?

It uses the key's hash.

---

# 3. `hashCode()`

Every Java object inherits:

```java
public int hashCode()
```

from `Object`.

For example:

```java
String key = "Harsh";

int hash = key.hashCode();
```

Conceptually:

```text
"Harsh"
   ↓
hashCode()
   ↓
integer hash value
```

The exact integer isn't important. What matters is that the hash is used to help determine the bucket.

---

# 4. Hash Spreading

HashMap does not simply use the raw `hashCode()` directly.

Modern Java `HashMap` performs a hash spreading/mixing step. Conceptually, it is based on:

```java
h ^ (h >>> 16)
```

The idea is:

```text
original hash
      ↓
mix high bits into low bits
      ↓
better distribution
      ↓
bucket index
```

### Why spread the hash?

HashMap's bucket selection ultimately relies heavily on the lower bits of the hash when the table capacity is a power of two.

Spreading helps prevent poor distribution when useful information exists in the higher bits.

---

# 5. Bucket Index

Suppose the internal table has:

```text
16 buckets
```

Indexes:

```text
0  1  2  3  4  5  6  7
8  9 10 11 12 13 14 15
```

The bucket index is conceptually calculated as:

```java
index = (n - 1) & hash;
```

where:

```text
n = number of buckets
```

For:

```text
n = 16
```

we get:

```java
index = (16 - 1) & hash;
       = 15 & hash;
```

HashMap maintains capacities as powers of two, which makes this bitwise calculation efficient.

---

# 6. Example of Inserting a Key

```java
Map<String, Integer> map = new HashMap<>();

map.put("Harsh", 90);
```

Conceptually:

```text
"Harsh"
   ↓
hashCode()
   ↓
hash spreading
   ↓
bucket index
   ↓
bucket[5]
```

So we can visualize:

```text
bucket[0] → null
bucket[1] → null
bucket[2] → null
bucket[3] → null
bucket[4] → null
bucket[5] → ("Harsh", 90)
bucket[6] → null
...
```

---

# 7. Hash Collision

Different keys can end up in the same bucket.

For example:

```text
"Harsh" → bucket 5
"Amit"  → bucket 5
```

This is a **collision**.

Important:

Different hash codes can still produce the same bucket index.

Conceptually:

```text
hash A ──┐
         ├──→ bucket 5
hash B ──┘
```

A collision does NOT necessarily mean the keys are equal.

---

# 8. How HashMap Handles Collisions

A bucket can contain multiple entries.

Historically and conceptually, entries in a collision chain form a linked list:

```text
bucket[5]

┌─────────────┐
│ Harsh → 90  │
└──────┬──────┘
       ↓
┌─────────────┐
│ Amit → 80   │
└──────┬──────┘
       ↓
┌─────────────┐
│ Rahul → 95  │
└─────────────┘
```

HashMap nodes are conceptually similar to:

```java
class Node<K,V> {
    int hash;
    K key;
    V value;
    Node<K,V> next;
}
```

So a node contains:

```text
hash
key
value
next
```

---

# 9. How `get()` Works

Suppose:

```java
map.get("Harsh");
```

HashMap does approximately:

```text
"Harsh"
   ↓
hashCode()
   ↓
hash spreading
   ↓
bucket index
   ↓
go directly to that bucket
```

If the bucket is:

```text
bucket[5]

Harsh → 90
   ↓
Amit → 80
   ↓
Rahul → 95
```

HashMap checks entries in that bucket.

It uses the hash and key equality to identify the requested key.

Conceptually:

```java
if (node.hash == hash &&
    (node.key == key || key.equals(node.key))) {
    return node.value;
}
```

Once `"Harsh"` is found:

```text
return 90
```

---

# 10. `hashCode()` and `equals()` Contract

This is one of the most important HashMap interview topics.

If:

```java
a.equals(b) == true
```

then it MUST be true that:

```java
a.hashCode() == b.hashCode()
```

But the reverse is not required.

Two unequal objects can have the same hash code:

```text
a.hashCode() = 100
b.hashCode() = 100

a.equals(b) = false
```

That is simply a collision.

### Three concepts to remember

```text
hashCode()
    ↓
helps locate the bucket

equals()
    ↓
determines whether the keys are actually equal

Comparable / ordering
    ↓
can help organize keys inside a tree bin
```

---

# 11. Collision vs Duplicate Key

A collision is NOT the same as a duplicate key.

### Collision

```text
A.hashCode() = 100
B.hashCode() = 100

A.equals(B) = false
```

Both entries can exist.

```text
bucket[4]

A → value1
  ↓
B → value2
```

### Duplicate key

If:

```java
A.equals(B) == true
```

then they represent the same logical key.

For example:

```java
Map<String, Integer> map = new HashMap<>();

map.put("Harsh", 90);
map.put("Harsh", 100);
```

The result is:

```text
"Harsh" → 100
```

The new value replaces the old value.

---

# 12. Why Collisions Can Hurt Performance

Imagine many entries land in one bucket:

```text
bucket[5]

A
 ↓
B
 ↓
C
 ↓
D
 ↓
E
 ↓
F
 ↓
G
 ↓
H
 ↓
I
 ↓
J
```

Searching may require walking through many entries.

This can degrade toward:

```text
O(n)
```

This is why Java introduced treeification for sufficiently large collision chains.

---

# 13. Treeification

Modern Java `HashMap` can convert a heavily populated bucket from a linked structure into a **red-black tree**.

Important threshold:

```text
TREEIFY_THRESHOLD = 8
```

Conceptually:

```text
many collisions
      ↓
linked list becomes large
      ↓
treeification
      ↓
red-black tree
```

Instead of:

```text
A
 ↓
B
 ↓
C
 ↓
D
 ↓
E
 ↓
F
 ↓
G
 ↓
H
```

we can have a tree-like structure:

```text
          D
        /   \
       B     F
      / \   / \
     A   C E   G
              \
               H
```

The exact tree shape is not important. The important point is:

```text
Linked structure → Red-black tree
```

---

# 14. Why Red-Black Tree?

A linked list can require:

```text
O(n)
```

search in the worst case.

A balanced red-black tree provides approximately:

```text
O(log n)
```

operations.

Therefore:

```text
Linked list:
O(n)

Red-black tree:
O(log n)
```

This helps HashMap avoid very poor performance when a bucket has many collisions.

---

# 15. Treeify Threshold Is Not the Whole Story

It is common to hear:

> "At 8 entries, HashMap becomes a tree."

That is an oversimplification.

HashMap also considers:

```text
MIN_TREEIFY_CAPACITY = 64
```

If the overall table is still small, HashMap generally prefers **resizing the table** rather than immediately treeifying the bucket.

Conceptually:

```text
Bucket becomes crowded
        ↓
Is table large enough?
     /       \
   No         Yes
   ↓           ↓
 resize     treeify
```

Why?

If the table is small, the collisions may simply be caused by having too few buckets.

Increasing the number of buckets can distribute entries more effectively.

---

# 16. Untreeify

The reverse can also happen.

If a tree bin becomes sufficiently small, it can be converted back into a linked structure.

Common threshold:

```text
UNTREEIFY_THRESHOLD = 6
```

Conceptually:

```text
tree bin
   ↓
entries decrease
   ↓
small enough
   ↓
linked structure
```

Trees have additional memory and structural overhead, so a linked structure can be preferable when only a few entries remain.

---

# 17. Load Factor

Example:

```java
new HashMap<>(16, 0.75f);
```

The second argument is the **load factor**.

Default load factor:

```text
0.75
```

Conceptually:

```text
resize threshold ≈ capacity × load factor
```

For:

```text
capacity = 16
load factor = 0.75
```

we get:

```text
16 × 0.75 = 12
```

So around this threshold, HashMap may resize.

---

# 18. Why Load Factor Is 0.75

The load factor is a trade-off between:

```text
memory usage
       vs
collision probability / lookup performance
```

If you wait until the table is extremely full:

```text
more entries per bucket
       ↓
more collisions
       ↓
potentially slower operations
```

If you resize too aggressively:

```text
more buckets
       ↓
more memory
```

`0.75` is a practical default balance.

---

# 19. What Does the `f` Mean in `0.75f`?

In:

```java
0.75f
```

the `f` means the number is a Java `float` literal.

Without `f`:

```java
0.75
```

is a `double` literal.

So:

```java
0.75f
```

means:

```text
float value = 0.75
```

---

# 20. HashMap Resize

When the map crosses its resize threshold, HashMap increases its capacity.

The capacity generally doubles:

```text
16
 ↓
32
 ↓
64
 ↓
128
```

Example:

```text
old capacity = 16
new capacity = 32
```

Existing entries must be redistributed into the new bucket array.

A useful interview-level answer is:

> When HashMap resizes, its capacity generally doubles and existing entries are redistributed into the new bucket array.

Modern Java implementations optimize this redistribution; it is not best described as simply recalculating everything from scratch.

---

# 21. Complete `put()` Mental Model

When you write:

```java
map.put(key, value);
```

think:

```text
                  put(key,value)
                        ↓
                  hashCode()
                        ↓
                  hash spreading
                        ↓
                  bucket index
                        ↓
             ┌──────────┴──────────┐
             │                     │
          empty                 occupied
             │                     │
             ↓                     ↓
          insert              compare key
                                   ↓
                         ┌─────────┴─────────┐
                         │                   │
                      same key           different
                         │                   │
                         ↓                   ↓
                   replace value        collision
                                             ↓
                                  linked structure / tree
                                             ↓
                                      many collisions?
                                             ↓
                                        treeification
                                             ↓
                                    resize threshold?
                                             ↓
                                           resize
```

---

# 22. HashMap Complexity

With good hash distribution:

```text
get()    → O(1) average
put()    → O(1) average
remove() → O(1) average
```

In a bad collision chain:

```text
O(n)
```

With a treeified bucket:

```text
O(log n)
```

The key phrase for interviews is:

> HashMap provides O(1) average-time lookup, insertion, and removal assuming good hash distribution. Severe collisions can degrade performance, while treeified bins provide approximately O(log n) behavior.

---

# 23. Why Treeification Can Use `Comparable`

A tree needs some way to determine ordering.

For example:

```text
A < B < C < D
```

If keys implement:

```java
Comparable
```

HashMap can use their natural ordering when appropriate.

Example:

```java
class Employee implements Comparable<Employee> {
    // ...
}
```

However:

> HashMap does NOT require every key to implement Comparable for treeification.

There are fallback mechanisms involving hash values and tie-breaking when keys aren't naturally comparable.

The important distinction is:

```text
hashCode()
    ↓
Which bucket?

Comparable / ordering
    ↓
How can keys be ordered within a tree?

equals()
    ↓
Are these actually the same key?
```

---

# 24. Why `hashCode()` Is Still Needed in a Tree Bin

A tree exists **inside one bucket**.

HashMap still needs to know which bucket to enter first.

Therefore:

```text
key
 ↓
hashCode()
 ↓
hash spreading
 ↓
bucket
 ↓
tree inside that bucket
 ↓
find key
```

`Comparable` does not replace hashing.

---

# 25. Mutable Keys — Important HashMap Trap

Suppose:

```java
class Employee {
    int id;

    @Override
    public int hashCode() {
        return id;
    }

    @Override
    public boolean equals(Object obj) {
        // based on id
    }
}
```

Then:

```java
Employee e = new Employee(10);

Map<Employee, String> map = new HashMap<>();
map.put(e, "Harsh");
```

At insertion:

```text
e
 ↓
hash = 10
 ↓
bucket X
```

Now suppose:

```java
e.id = 20;
```

The key's hash has changed.

Now:

```text
e
 ↓
hash = 20
 ↓
bucket Y
```

But the actual entry is still physically stored where the original hash directed it.

So:

```java
map.get(e);
```

may fail to find the entry.

### Rule

Keys used in a HashMap should generally be **immutable with respect to the fields used by `equals()` and `hashCode()`**.

`String` is an excellent HashMap key because it is immutable.

---

# 26. HashMap vs Hashtable vs ConcurrentHashMap

| Feature | HashMap | Hashtable | ConcurrentHashMap |
|---|---|---|---|
| Thread-safe | No | Yes | Yes |
| Null key | Yes | No | No |
| Null values | Yes | No | No |
| Modern choice | Yes | Usually no | Yes, for concurrent access |
| Concurrency design | Not thread-safe | Coarse synchronization | CAS + fine-grained synchronization |
| Whole-map locking for normal operations | No synchronization | Broad synchronization | Avoids locking the whole map for every operation |

---

# 27. Hashtable

`Hashtable` is an older, legacy collection.

Example:

```java
Hashtable<String, Integer> table =
        new Hashtable<>();

table.put("Harsh", 90);
```

Its methods are synchronized.

It is thread-safe, but its synchronization approach is relatively coarse compared with modern concurrent collections.

For new concurrent code, `ConcurrentHashMap` is generally preferred.

---

# 28. ConcurrentHashMap

For multiple threads accessing and modifying a map concurrently:

```java
ConcurrentHashMap<String, Integer> map =
        new ConcurrentHashMap<>();

map.put("Harsh", 90);
map.put("Amit", 80);
```

The important idea is:

> ConcurrentHashMap is thread-safe without simply putting one giant lock around the entire map.

Modern implementations use mechanisms including:

```text
CAS
+
fine-grained synchronization
+
per-bin/node-level coordination
```

This allows more concurrency than a single global lock.

A better interview answer than "one lock per bucket" is:

> ConcurrentHashMap uses CAS and fine-grained synchronization at the bin/node level rather than synchronizing the entire map for every operation.

---

# 29. Why Whole-Map Locking Is a Problem

Imagine:

```text
Map
──────────────────────
bucket 0
bucket 1
bucket 2
bucket 3
bucket 4
bucket 5
bucket 6
bucket 7
──────────────────────
```

With one global lock:

```text
Thread A → LOCK MAP → bucket 1
Thread B → waits
Thread C → waits
```

Even if Thread B wants a completely different bucket, it may have to wait.

ConcurrentHashMap allows much more concurrent activity by coordinating operations at a finer level.

Conceptually:

```text
Thread A → bucket/bin 1
Thread B → bucket/bin 7
```

can often proceed concurrently.

---

# 30. Why ConcurrentHashMap Does Not Allow `null`

This is valid with HashMap:

```java
HashMap<String, Integer> map = new HashMap<>();

map.put(null, 100);
map.put("Harsh", null);
```

But ConcurrentHashMap does not allow null keys or values:

```java
ConcurrentHashMap<String, Integer> map =
        new ConcurrentHashMap<>();

map.put(null, 100);       // not allowed
map.put("Harsh", null);   // not allowed
```

One important reason is to avoid ambiguity in concurrent operations.

For example:

```java
map.get("Harsh")
```

returning `null` can clearly mean:

```text
key is absent
```

rather than potentially meaning:

```text
key exists and its value is null
```

ConcurrentHashMap avoids this ambiguity by disallowing null keys and values.

---

# 31. LinkedHashMap

`LinkedHashMap` builds on HashMap's hashing behavior and additionally maintains a linked ordering of entries.

Example:

```java
LinkedHashMap<String, Integer> map =
        new LinkedHashMap<>();

map.put("A", 1);
map.put("B", 2);
map.put("C", 3);
```

Iteration gives:

```text
A → B → C
```

This is insertion order.

So:

```text
HashMap
    ↓
hashing

LinkedHashMap
    ↓
hashing
+
linked ordering
```

---

# 32. Insertion Order

```java
LinkedHashMap<String, Integer> map =
        new LinkedHashMap<>();

map.put("A", 1);
map.put("B", 2);
map.put("C", 3);
```

Iteration:

```text
A → B → C
```

The map maintains extra linked structure so iteration can follow the desired order.

---

# 33. Access Order

You can construct a LinkedHashMap with:

```java
LinkedHashMap<String, Integer> map =
    new LinkedHashMap<>(16, 0.75f, true);
```

The third constructor argument:

```text
true
```

means:

```text
accessOrder = true
```

Now entries are maintained according to access order.

Example:

```java
map.put("A", 1);
map.put("B", 2);
map.put("C", 3);
```

Initial order:

```text
A → B → C
```

Now:

```java
map.get("A");
```

Order becomes:

```text
B → C → A
```

A moved toward the end because it was recently accessed.

Then:

```java
map.get("B");
```

Order becomes:

```text
C → A → B
```

---

# 34. Understanding `String, String` vs `16, 0.75f, true`

This is a very important syntax clarification.

Consider:

```java
LinkedHashMap<String, String> cache =
    new LinkedHashMap<>(16, 0.75f, true);
```

There are two completely different concepts here.

## `LinkedHashMap<String, String>`

This is the **type**.

```text
LinkedHashMap<KeyType, ValueType>
              ↓        ↓
           String    String
```

It means:

```text
String key → String value
```

Example:

```java
cache.put("user1", "Harsh");
cache.put("user2", "Amit");
```

Conceptually:

```text
"user1" → "Harsh"
"user2" → "Amit"
```

## `16, 0.75f, true`

These are **constructor arguments**.

```text
16
 ↓
initial capacity

0.75f
 ↓
load factor

true
 ↓
accessOrder
```

So they have nothing to do with `String, String`.

---

# 35. What Does `16` Mean in LinkedHashMap?

```java
new LinkedHashMap<>(16, ...)
```

The `16` is the **initial capacity**.

Think:

```text
initial capacity = 16 buckets
```

It does NOT mean:

```text
maximum 16 entries
```

The map can contain more than 16 entries because it can resize.

---

# 36. What Does `0.75f` Mean?

```java
0.75f
```

is the load factor.

Conceptually:

```text
capacity × load factor
      ↓
resize threshold
```

For capacity 16:

```text
16 × 0.75 = 12
```

Around that threshold, the underlying table can resize.

The `f` means it is a `float` literal.

---

# 37. What Does `true` Mean?

In:

```java
new LinkedHashMap<>(16, 0.75f, true)
```

the `true` is the `accessOrder` argument.

```text
true
 ↓
maintain access order
```

So:

```java
cache.get("A");
```

can move A toward the most-recently-accessed end.

This behavior is useful for implementing LRU caches.

---

# 38. Why `<>` Instead of `<String, String>`?

This:

```java
LinkedHashMap<String, String> cache =
    new LinkedHashMap<>(16, 0.75f, true);
```

uses the **diamond operator**:

```java
<>
```

Java can infer the generic types from the left side.

You could write:

```java
LinkedHashMap<String, String> cache =
    new LinkedHashMap<String, String>(16, 0.75f, true);
```

but this repeats the same type information.

Therefore:

```java
new LinkedHashMap<>(...)
```

is preferred.

---

# 39. LRU Cache

LRU means:

> Least Recently Used.

A cache with capacity 3 might conceptually look like:

```text
A → B → C
```

If A is accessed:

```text
B → C → A
```

A is now the most recently used.

If D is inserted:

```text
C → A → D
```

B can be removed because it is the least recently used.

LinkedHashMap makes this pattern convenient.

---

# 40. `removeEldestEntry()`

Example:

```java
LinkedHashMap<String, String> cache =
    new LinkedHashMap<>(16, 0.75f, true) {

        @Override
        protected boolean removeEldestEntry(
                Map.Entry<String, String> eldest) {
            return size() > 3;
        }
    };
```

This creates a customized `LinkedHashMap`.

The overridden method says:

```java
return size() > 3;
```

Meaning:

```text
If map has more than 3 entries
        ↓
remove the eldest entry
```

Because `accessOrder` is `true`, the eldest entry represents the least recently accessed entry in this LRU-style setup.

---

# 41. Understanding the Entire LRU Declaration

```java
LinkedHashMap<String, String> cache =
    new LinkedHashMap<>(16, 0.75f, true);
```

means:

```text
LinkedHashMap<String, String>
        ↓
String key
String value

16
 ↓
initial capacity

0.75f
 ↓
load factor

true
 ↓
access order
```

Then:

```java
removeEldestEntry()
```

adds:

```text
If size > 3
    ↓
remove oldest/least-recently-used entry
```

So the entire object behaves like a small LRU cache.

---

# 42. TreeMap

`TreeMap` is fundamentally different from HashMap.

HashMap:

```text
key
 ↓
hash
 ↓
bucket
```

TreeMap:

```text
key
 ↓
sorted position in red-black tree
```

Example:

```java
TreeMap<Integer, String> map =
        new TreeMap<>();

map.put(50, "A");
map.put(10, "B");
map.put(30, "C");
map.put(20, "D");
```

Iteration is sorted by key:

```text
10 → B
20 → D
30 → C
50 → A
```

---

# 43. HashMap vs TreeMap

## HashMap

```text
hash
 ↓
bucket
 ↓
entry
```

Average:

```text
O(1)
```

Ordering:

```text
No sorted-key guarantee
```

## TreeMap

```text
key
 ↓
red-black tree
 ↓
sorted position
```

Operations:

```text
O(log n)
```

Ordering:

```text
Keys are sorted
```

Therefore:

```text
Need fast average lookup?
        ↓
     HashMap

Need sorted keys?
        ↓
     TreeMap
```

---

# 44. TreeMap Ordering

TreeMap needs to know how keys should be ordered.

It can use:

## Natural ordering

The key implements:

```java
Comparable
```

For example, `Integer` has natural ordering.

## Comparator

You can provide a comparator:

```java
TreeMap<String, Integer> map =
    new TreeMap<>(Comparator.reverseOrder());
```

Now keys are sorted in reverse order.

---

# 45. Big Picture

```text
                         Map
                          │
          ┌───────────────┼────────────────┐
          │               │                │
      HashMap        LinkedHashMap       TreeMap
          │               │                │
       hashing        hashing +        red-black
                      linked order       tree
          │
       O(1) avg
          │
   collision handling
          │
    ┌─────┴─────┐
    │           │
 linked       tree
 structure    structure
    │           │
  O(n)       O(log n)
```

For concurrency:

```text
HashMap
   │
   └── not thread-safe

ConcurrentHashMap
   │
   └── thread-safe
       CAS + fine-grained synchronization
```

---

# 46. Interview Answers — Say These Out Loud

## How does HashMap work?

> HashMap uses an array of buckets. It computes a hash from the key's `hashCode()`, spreads the hash, calculates a bucket index, and stores the key-value entry there. Collisions are handled within the bucket, and sufficiently large collision chains can be treeified into red-black trees.

## Why is HashMap O(1)?

> Hashing allows HashMap to locate the appropriate bucket directly instead of scanning all entries. Therefore lookup, insertion, and removal are O(1) on average assuming good hash distribution.

## What happens during heavy collisions?

> Entries in the same bucket form a collision chain. In modern Java, sufficiently large bins can be converted into red-black trees, giving approximately O(log n) behavior within that bin.

## When does treeification happen?

> The treeification threshold is 8, but the table also needs to be sufficiently large. The minimum treeify capacity is 64; otherwise HashMap generally prefers resizing.

## When does a tree become a linked structure again?

> The commonly cited untreeify threshold is 6.

## What is the default load factor?

> 0.75.

## What happens during resize?

> HashMap generally doubles its capacity and redistributes existing entries into the new bucket array.

## Why does HashMap need equals() and hashCode()?

> hashCode() helps locate the bucket, while equals() determines whether two keys are actually the same key. Equal keys must have equal hash codes.

## HashMap vs TreeMap?

> HashMap provides O(1) average lookup with no sorted-key guarantee, while TreeMap uses a red-black tree and provides O(log n) operations with keys maintained in sorted order.

## HashMap vs ConcurrentHashMap?

> HashMap isn't thread-safe. ConcurrentHashMap supports concurrent access using mechanisms such as CAS and fine-grained synchronization rather than locking the entire map for every operation.

---

# 47. Final Mental Model

If you remember one flow for HashMap, remember:

```text
                    HashMap
                       │
                       ↓
                  key.hashCode()
                       │
                       ↓
                  hash spreading
                       │
                       ↓
                  bucket index
                       │
             ┌─────────┴─────────┐
             │                   │
          empty              occupied
             │                   │
             ↓                   ↓
          insert          compare hash/key
                                 │
                        ┌────────┴────────┐
                        │                 │
                     same key         collision
                        │                 │
                        ↓                 ↓
                  replace value      linked structure
                                           │
                                  many collisions
                                           │
                                           ↓
                                    red-black tree
```

Complexity story:

```text
Good hash distribution
       ↓
   O(1) average

Bad collision chain
       ↓
      O(n)

Treeified bucket
       ↓
    O(log n)
```

And the three major map choices:

```text
HashMap
→ fast average lookup, no sorted order

LinkedHashMap
→ HashMap-like lookup + predictable order
→ insertion order OR access order
→ useful for LRU caches

TreeMap
→ sorted keys
→ red-black tree
→ O(log n)
```

Concurrent option:

```text
ConcurrentHashMap
→ thread-safe
→ designed for concurrent access
→ CAS + fine-grained synchronization
→ no null keys/values
```
