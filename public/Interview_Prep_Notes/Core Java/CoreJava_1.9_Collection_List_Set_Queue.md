# Core Java 1.9 — Collections: List / Set / Queue

## 1. Collections Overview

Java Collections provide common data structures for storing and processing groups of objects.

The three main interfaces covered here are:

```text
                    Collection
                        |
        +---------------+---------------+
        |               |               |
       List             Set            Queue
        |               |               |
  ArrayList         HashSet         ArrayDeque
  LinkedList        LinkedHashSet  PriorityQueue
                    TreeSet         LinkedList
```

### List

A `List` is:

> An ordered collection where duplicates are allowed and elements have indexes.

Example:

```java
List<String> names = new ArrayList<>();

names.add("Alice");
names.add("Bob");
names.add("Alice");

System.out.println(names);
// [Alice, Bob, Alice]
```

Lists support indexed access:

```java
names.get(1); // Bob
```

### Set

A `Set` is:

> A collection that does not allow duplicate elements.

```java
Set<String> names = new HashSet<>();

names.add("Alice");
names.add("Bob");
names.add("Alice");

System.out.println(names);
// [Alice, Bob]   (order is not guaranteed)
```

### Queue

A `Queue` processes elements according to a particular ordering policy.

A normal queue is FIFO:

```text
First In → First Out
```

A `PriorityQueue` is different: elements are processed according to priority.

---

# 2. ArrayList

## 2.1 Mental Model

Think:

> `ArrayList` = resizable array.

Conceptually:

```text
[ A ][ B ][ C ][ D ][ E ][ ][ ][ ]
```

The backing array has:

- `size` — number of elements currently stored.
- `capacity` — number of positions currently available in the backing array.

For example:

```text
size = 3
capacity = maybe 10

[ A ][ B ][ C ][ ][ ][ ][ ][ ][ ][ ]
```

---

## 2.2 Why Is ArrayList Resizable?

A normal Java array has fixed size:

```java
String[] arr = new String[3];
```

Its size cannot grow.

`ArrayList` solves this by using a larger backing array when necessary.

Conceptually:

```text
Before:

[ A ][ B ][ C ][ D ]

capacity = 4
size = 4
```

Adding another element requires growth:

```java
list.add("E");
```

Conceptually:

```text
Old:
[ A ][ B ][ C ][ D ]

        ↓ copy

New:
[ A ][ B ][ C ][ D ][ E ][ ][ ][ ... ]
```

The old backing array is eventually eligible for garbage collection if nothing else references it.

---

## 2.3 ArrayList `add()` and Amortized O(1)

A common interview trap is:

> "ArrayList.add() is O(n) because resizing copies elements."

A more accurate answer is:

> Appending at the end is amortized O(1), although an individual resize can cost O(n).

Most appends are cheap:

```text
add A → O(1)
add B → O(1)
add C → O(1)
...
resize → O(n)
add next → O(1)
...
resize → O(n)
```

The expensive resize happens only occasionally.

Therefore, over many insertions:

```text
ArrayList.add(element)
        ↓
Amortized O(1)
```

### Interview answer

> Appending at the end is amortized O(1), but an individual insertion can be O(n) when resizing occurs.

---

# 3. ArrayList Random Access

One of the biggest advantages of `ArrayList` is indexed access.

Conceptually:

```text
index

  0     1     2     3     4
  ↓     ↓     ↓     ↓     ↓

[ A ][ B ][ C ][ D ][ E ]
```

When:

```java
list.get(3);
```

is called, Java can directly access the array position corresponding to index 3.

It does not have to traverse A → B → C → D.

Therefore:

```text
get(index) → O(1)
```

Similarly:

```text
set(index, value) → O(1)
```

---

# 4. ArrayList and Cache Locality

Array-backed structures have good **cache locality**.

Conceptually:

```text
[ A ][ B ][ C ][ D ][ E ][ F ]
```

Elements are stored together in the backing array.

When the CPU accesses one element, nearby elements are more likely to already be useful to the CPU cache.

This is one reason `ArrayList` often performs very well for:

- iteration
- random access
- sequential processing

### Interview phrase

> ArrayList provides O(1) random access and generally has good cache locality because it is backed by an array.

---

# 5. ArrayList Insertion in the Middle

Suppose:

```text
[ A ][ B ][ C ][ D ]
```

Now:

```java
list.add(1, "X");
```

The result should be:

```text
[ A ][ X ][ B ][ C ][ D ]
```

Elements after index 1 need to shift right:

```text
B → right
C → right
D → right
```

Therefore:

```text
add(index, element) → O(n)
```

in the general case.

---

# 6. ArrayList Removal

Suppose:

```text
[ A ][ B ][ C ][ D ][ E ]
```

Remove index 1:

```java
list.remove(1);
```

Result:

```text
[ A ][ C ][ D ][ E ]
```

Elements after the removed element must shift left.

Therefore:

```text
remove(index) → O(n)
```

in the general case.

However, removing the last element does not require shifting other elements:

```java
list.remove(list.size() - 1);
```

This is:

```text
O(1)
```

---

# 7. ArrayList Complexity

| Operation | ArrayList |
|---|---:|
| `get(index)` | O(1) |
| `set(index, value)` | O(1) |
| `add(value)` at end | Amortized O(1) |
| `add(index, value)` | O(n) |
| `remove(index)` | O(n) |
| Remove last | O(1) |
| Search by value | O(n) |

---

# 8. LinkedList

## 8.1 Mental Model

`LinkedList` is based on linked nodes rather than one contiguous backing array.

Conceptually:

```text
Node → Node → Node → Node
```

Java's `LinkedList` is a **doubly linked list**.

Each node conceptually contains:

```text
previous | data | next
```

Example:

```text
null
 ↓
[A] ↔ [B] ↔ [C] ↔ [D]
                         ↓
                        null
```

---

# 9. LinkedList Node

Conceptually, a node looks like:

```java
class Node {
    Node previous;
    String data;
    Node next;
}
```

For:

```text
[A] ↔ [B] ↔ [C]
```

we have:

```text
A.next → B
B.previous → A

B.next → C
C.previous → B
```

The actual JDK implementation is more specific, but this is the right interview mental model.

---

# 10. LinkedList Insertion and Deletion

Suppose:

```text
[A] ↔ [B] ↔ [D]
```

We want to insert C between B and D.

Once the target node is known, links can be changed:

```text
[A] ↔ [B] ↔ [C] ↔ [D]
```

No array shifting is required.

Therefore:

> Insertion/deletion around a known node can be O(1).

This is what people mean when they say linked-list node manipulation is cheap.

---

# 11. The LinkedList Interview Trap

It is incomplete to say:

> "LinkedList insertion is O(1)."

Suppose:

```java
list.add(500000, "X");
```

Before inserting, Java needs to locate the relevant position.

LinkedList cannot directly jump to index 500000 like an array.

Conceptually:

```text
Node → Node → Node → Node → ...
                       ↑
                  find target
```

So:

```text
Find target node → O(n)
Insert after target → O(1)
```

Overall:

```text
add(index, element) → O(n)
```

### Important distinction

```text
Known node
   ↓
insert/delete → O(1)

Need to find node by index
   ↓
traversal → O(n)
```

---

# 12. Why LinkedList `get()` Is O(n)

With:

```java
list.get(500000);
```

LinkedList cannot perform direct array indexing.

It must traverse the linked structure until it reaches the requested position.

Therefore:

```text
get(index) → O(n)
```

This is the major random-access difference from `ArrayList`.

---

# 13. ArrayList vs LinkedList

| | ArrayList | LinkedList |
|---|---|---|
| Internal structure | Dynamic array | Doubly linked nodes |
| `get(index)` | O(1) | O(n) |
| Add at end | Amortized O(1) | O(1) |
| Insert middle | O(n) overall | O(n) overall |
| Delete middle | O(n) overall | O(n) overall |
| Memory overhead | Lower | Higher |
| Cache locality | Good | Poor |
| Random access | Excellent | Poor |

### Interview-quality answer

> ArrayList is backed by a dynamic array, so it provides O(1) random access and generally has good cache locality. LinkedList is a doubly linked list, so indexed access is O(n), but insertion or deletion around a known node can be O(1). In practice, ArrayList is usually the better default for most list use cases.

---

# 14. Set

A Set means:

> A collection that does not allow duplicate elements.

The three important implementations are:

```text
HashSet
LinkedHashSet
TreeSet
```

Their main difference is ordering.

---

# 15. HashSet

## 15.1 Mental Model

Think:

> HashSet = hash table + uniqueness.

Conceptually:

```text
hash("Alice")   → bucket
hash("Bob")     → bucket
hash("Charlie") → bucket
```

The internal structure is based on a hash table.

Conceptually:

```text
Bucket 0 → ...
Bucket 1 → Bob
Bucket 2 → ...
Bucket 3 → Alice
Bucket 4 → Charlie
```

The exact bucket positions are not something you need to memorize.

---

# 16. Why HashSet Is Fast

Suppose:

```java
set.contains("Bob");
```

HashSet uses the hash to locate the relevant bucket rather than scanning every element.

Typical average complexity:

```text
add()      → O(1)
contains() → O(1)
remove()   → O(1)
```

These are average-case expectations assuming good hash distribution.

Severe collisions can make operations slower.

---

# 17. How HashSet Knows About Duplicates

Hash-based collections rely on:

```text
hashCode()
+
equals()
```

Conceptually:

```text
element
   ↓
hashCode()
   ↓
bucket
   ↓
compare candidate elements
   ↓
equals()
```

So uniqueness depends on correctly implementing the `equals()` / `hashCode()` contract for custom value objects.

### Contract

If:

```java
a.equals(b) == true
```

then:

```java
a.hashCode() == b.hashCode()
```

must also be true.

The reverse is not required.

Two unequal objects may have the same hash code; that is a collision.

---

# 18. Custom Objects in HashSet

Suppose:

```java
class User {
    String name;

    User(String name) {
        this.name = name;
    }
}
```

Then:

```java
Set<User> users = new HashSet<>();

users.add(new User("Harsh"));
users.add(new User("Harsh"));
```

Two distinct objects are not automatically value-equal just because their `name` fields contain the same text.

For value-based uniqueness, override both `equals()` and `hashCode()` consistently.

Example:

```java
class User {
    String name;

    User(String name) {
        this.name = name;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof User)) return false;

        User other = (User) o;
        return Objects.equals(name, other.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name);
    }
}
```

Now users with the same logical name can be considered duplicates.

---

# 19. HashSet Does Not Guarantee Order

Example:

```java
Set<Integer> set = new HashSet<>();

set.add(30);
set.add(10);
set.add(20);
```

Do not rely on:

```text
30
10
20
```

or:

```text
10
20
30
```

HashSet provides **no guaranteed iteration order**.

So:

```text
HashSet
   ↓
fast average lookup
   ↓
no guaranteed iteration order
```

---

# 20. LinkedHashSet

Think:

> LinkedHashSet = HashSet + insertion-order tracking.

Example:

```java
Set<String> set = new LinkedHashSet<>();

set.add("B");
set.add("A");
set.add("C");

System.out.println(set);
```

Iteration follows insertion order:

```text
[B, A, C]
```

Conceptually:

```text
Hash table
    +
linked ordering structure
```

Therefore:

```text
HashSet
    → uniqueness
    → fast average lookup
    → no order guarantee

LinkedHashSet
    → uniqueness
    → fast average lookup
    → insertion order
```

---

# 21. When Does LinkedHashSet Matter?

Suppose the input is:

```text
Java
Python
Java
C++
Python
```

You want:

1. duplicates removed
2. original insertion order preserved

`LinkedHashSet` gives:

```text
Java
Python
C++
```

This is exactly when the `Linked*` collection matters.

### Interview answer

> Use LinkedHashSet when I need Set semantics—uniqueness—but also need predictable insertion-order iteration.

---

# 22. TreeSet

Think:

> TreeSet = sorted Set.

Example:

```java
Set<Integer> numbers = new TreeSet<>();

numbers.add(50);
numbers.add(10);
numbers.add(30);
numbers.add(20);
```

Iteration:

```text
10
20
30
50
```

TreeSet maintains elements according to:

- natural ordering, or
- a supplied `Comparator`.

---

# 23. TreeSet Internals

TreeSet is based on a balanced tree structure. In the JDK, its backing structure is a `TreeMap`, which uses a Red-Black tree.

Conceptually:

```text
          30
         /  \
       10    50
        \
        20
```

Typical operations:

```text
add()      → O(log n)
contains() → O(log n)
remove()   → O(log n)
```

Therefore:

```text
HashSet
   → O(1) average
   → unordered

LinkedHashSet
   → O(1) average
   → insertion order

TreeSet
   → O(log n)
   → sorted order
```

---

# 24. TreeSet with Comparator

You can define custom ordering.

Example:

```java
Set<Integer> numbers =
    new TreeSet<>(Comparator.reverseOrder());

numbers.add(10);
numbers.add(30);
numbers.add(20);
```

Iteration:

```text
30
20
10
```

So TreeSet is useful when you need:

> Uniqueness + sorted order.

---

# 25. HashSet vs LinkedHashSet vs TreeSet

| | HashSet | LinkedHashSet | TreeSet |
|---|---|---|---|
| Duplicates | No | No | No |
| Order | None guaranteed | Insertion | Sorted |
| Internal idea | Hash table | Hash table + links | Balanced tree |
| `add` average | O(1) | O(1) | O(log n) |
| `contains` average | O(1) | O(1) | O(log n) |
| `remove` average | O(1) | O(1) | O(log n) |

### Easy memory trick

```text
Hash     → fast lookup
Linked   → insertion order
Tree     → sorted order
```

---

# 26. Queue

A Queue processes elements according to a particular ordering rule.

A normal queue is FIFO:

```text
First In
   ↓
First Out
```

Example:

```text
A → B → C
```

Processing:

```text
A
B
C
```

---

# 27. ArrayDeque

`ArrayDeque` is a resizable-array implementation of `Deque`.

`Deque` means:

> Double Ended Queue.

It allows operations at both ends:

```text
addFirst()
addLast()

removeFirst()
removeLast()
```

Conceptually:

```text
Front
 ↓
[A][B][C][D]
         ↑
        Rear
```

---

# 28. ArrayDeque as a Queue

Example:

```java
Deque<String> queue = new ArrayDeque<>();

queue.offer("A");
queue.offer("B");
queue.offer("C");
```

Conceptually:

```text
Front
 ↓
[A][B][C]
         ↑
        Rear
```

Then:

```java
queue.poll();
```

returns:

```text
A
```

Now:

```text
[B][C]
```

For normal FIFO usage:

```text
offer() → add at queue end
poll()  → remove from front
peek()  → inspect front
```

---

# 29. ArrayDeque as a Stack

The same `ArrayDeque` can be used as a stack.

Stack means:

```text
LIFO
Last In → First Out
```

Example:

```java
Deque<String> stack = new ArrayDeque<>();

stack.push("A");
stack.push("B");
stack.push("C");
```

Conceptually:

```text
C ← top
B
A
```

Then:

```java
stack.pop();
```

returns:

```text
C
```

So:

```text
ArrayDeque
   |
   +── Queue → FIFO
   |
   +── Stack → LIFO
   |
   +── Deque → both ends
```

For stack behavior, `ArrayDeque` is generally preferred over the legacy `Stack` class.

---

# 30. ArrayDeque and Circular Storage

ArrayDeque uses a resizable array with logical front and back positions.

Conceptually, the array can wrap around:

```text
0 → 1 → 2 → 3 → 4 → 5
↑                   ↓
└───────────────────┘
```

This allows the deque to reuse positions efficiently instead of shifting all elements whenever an end is changed.

Interview-level takeaway:

> ArrayDeque is backed by a resizable array and provides efficient operations at both ends.

---

# 31. ArrayDeque vs LinkedList as a Queue

Both can be used as a `Deque`, but `ArrayDeque` is generally the better default.

### ArrayDeque

- resizable array
- good cache locality
- lower per-element overhead
- efficient operations at both ends

### LinkedList

- individual node objects
- more memory overhead
- pointer chasing
- poorer cache locality

### Interview answer

> Both can be used as a queue or deque, but ArrayDeque is generally preferred because it avoids the per-node overhead of LinkedList and usually has better cache locality and performance.

---

# 32. PriorityQueue

A normal queue is usually FIFO.

A `PriorityQueue` instead processes elements according to priority.

Java's default `PriorityQueue` is a **min-heap**.

Example:

```java
PriorityQueue<Integer> pq =
    new PriorityQueue<>();

pq.offer(30);
pq.offer(10);
pq.offer(20);
```

Then:

```java
pq.poll();
```

returns:

```text
10
```

Then:

```text
20
30
```

---

# 33. PriorityQueue Is a Heap

Conceptually, a min-heap can look like:

```text
        10
       /  \
     30    20
```

The smallest element is at the root.

Important interview point:

> PriorityQueue is not a fully sorted collection.

Its important guarantee is that the head is the highest-priority element according to its ordering.

For a min-heap:

```text
peek() → minimum
poll() → removes minimum
```

Do not assume that iterating over or printing the queue gives all elements in sorted order.

---

# 34. PriorityQueue Complexity

For a heap:

```text
offer() → O(log n)
poll()  → O(log n)
peek()  → O(1)
```

Why is `peek()` O(1)?

Because the highest-priority element is stored at the heap root.

For a min-heap:

```text
root = minimum
```

---

# 35. PriorityQueue Max-Heap

By default:

```java
PriorityQueue<Integer> pq =
    new PriorityQueue<>();
```

is a min-heap.

For a max-heap:

```java
PriorityQueue<Integer> pq =
    new PriorityQueue<>(Comparator.reverseOrder());
```

Now:

```java
pq.offer(10);
pq.offer(30);
pq.offer(20);

System.out.println(pq.poll());
```

returns:

```text
30
```

---

# 36. Real-World PriorityQueue

Suppose tasks have priorities:

```java
class Task {
    String name;
    int priority;
}
```

You can order them with:

```java
PriorityQueue<Task> queue =
    new PriorityQueue<>(
        Comparator.comparingInt(t -> t.priority)
    );
```

This is useful for:

- job scheduling
- Dijkstra's algorithm
- event processing
- top-K problems
- repeatedly selecting the smallest/largest item

---

# 37. Fail-Fast Iterators

Now consider:

```java
List<String> names = new ArrayList<>();

names.add("A");
names.add("B");
names.add("C");
```

This is dangerous:

```java
for (String name : names) {
    if (name.equals("B")) {
        names.remove(name);
    }
}
```

It can throw:

```text
ConcurrentModificationException
```

Why?

Because the collection is structurally modified while an iterator is traversing it.

---

# 38. What Is a For-Each Loop Really Doing?

This:

```java
for (String name : names) {
    System.out.println(name);
}
```

is conceptually similar to:

```java
Iterator<String> iterator = names.iterator();

while (iterator.hasNext()) {
    String name = iterator.next();

    System.out.println(name);
}
```

Therefore:

```text
for-each
   ↓
Iterator
```

This is why understanding iterators is necessary to understand `ConcurrentModificationException`.

---

# 39. Why Does ConcurrentModificationException Happen?

Collections such as ArrayList maintain an internal modification state.

A simplified mental model is:

```text
Collection modification count
          ↓
        modCount
```

The iterator remembers an expected value:

```text
expectedModCount
```

During iteration:

```text
collection changes
       ↓
modCount changes
       ↓
iterator detects mismatch
       ↓
ConcurrentModificationException
```

This is the basic idea behind fail-fast behavior.

---

# 40. "Concurrent" Does Not Necessarily Mean Multithreading

You can get:

```text
ConcurrentModificationException
```

in a single-threaded program:

```java
for (String name : names) {
    names.remove(name);
}
```

No second thread is required.

The important point is:

> The iterator detected an unexpected structural modification during iteration.

---

# 41. Correct Removal with Iterator.remove()

If you are explicitly using an iterator:

```java
Iterator<String> iterator = names.iterator();

while (iterator.hasNext()) {
    String name = iterator.next();

    if (name.equals("B")) {
        iterator.remove();
    }
}
```

This is the iterator-supported removal operation.

The iterator updates its internal expected modification state appropriately.

---

# 42. Correct Removal with removeIf()

If your goal is simply to remove elements matching a condition, `removeIf()` is often cleaner:

```java
names.removeIf(name -> name.equals("B"));
```

Another example:

```java
names.removeIf(name -> name.startsWith("A"));
```

This is generally the clearest approach for predicate-based removal.

---

# 43. Structural Modification

Structural modifications are changes that alter the collection's structure, such as:

```text
add
remove
```

A call such as:

```java
list.set(index, value);
```

replaces an existing value without changing the collection's size/structure in the same way.

Therefore, do not say:

> "Any modification always causes ConcurrentModificationException."

A better statement is:

> Fail-fast behavior is primarily concerned with unexpected structural modifications during iteration.

---

# 44. Is Fail-Fast Guaranteed?

No.

Fail-fast behavior is a **best-effort detection mechanism**.

It is not a thread-safety mechanism and should not be used as a correctness guarantee.

Do not write code that depends on:

```java
ConcurrentModificationException
```

being thrown.

---

# 45. Collection Selection Guide

## Scenario 1 — Indexed access

> I need fast indexed access.

Choose:

```java
ArrayList
```

because:

```text
get(index) → O(1)
```

---

## Scenario 2 — Unique values, no ordering requirement

Choose:

```java
HashSet
```

because it provides:

```text
uniqueness
+
O(1) average lookup
```

---

## Scenario 3 — Unique values + insertion order

Choose:

```java
LinkedHashSet
```

---

## Scenario 4 — Unique values + sorted order

Choose:

```java
TreeSet
```

---

## Scenario 5 — Normal FIFO queue

Choose:

```java
ArrayDeque
```

---

## Scenario 6 — Stack

Prefer:

```java
ArrayDeque
```

with:

```java
push()
pop()
peek()
```

---

## Scenario 7 — Repeatedly need smallest/largest/highest-priority element

Choose:

```java
PriorityQueue
```

---

## Scenario 8 — Random access + frequent iteration

Choose:

```java
ArrayList
```

---

# 46. Master Comparison Table

| Collection | Structure | Order | Duplicates | Typical key operation |
|---|---|---|---|---|
| `ArrayList` | Dynamic array | Insertion order | Yes | `get()` O(1) |
| `LinkedList` | Doubly linked nodes | Insertion order | Yes | End operations O(1) |
| `HashSet` | Hash table | None guaranteed | No | Lookup O(1) avg |
| `LinkedHashSet` | Hash table + links | Insertion | No | Lookup O(1) avg |
| `TreeSet` | Red-Black tree | Sorted | No | Lookup O(log n) |
| `ArrayDeque` | Resizable array | Deque order | Yes | Ends O(1) amortized |
| `PriorityQueue` | Heap | Priority | Yes | `peek()` O(1) |

---

# 47. ArrayList vs LinkedList — Say This Out Loud

> ArrayList is backed by a dynamic array, so it provides O(1) random access and generally has good cache locality. LinkedList is a doubly linked list, so accessing by index is O(n), but once a node is known, insertion or deletion around that node can be O(1). In practice, ArrayList is usually the better default for most list use cases.

---

# 48. HashSet vs LinkedHashSet vs TreeSet — Say This Out Loud

> HashSet provides uniqueness with average O(1) lookup but doesn't guarantee iteration order. LinkedHashSet adds predictable insertion-order iteration while retaining average O(1) lookup. TreeSet maintains sorted order using a balanced tree, so operations are O(log n).

---

# 49. ArrayDeque vs LinkedList — Say This Out Loud

> Both can be used as a deque, but ArrayDeque is generally preferred because it uses a resizable array and avoids the per-node overhead and pointer chasing of LinkedList. It also tends to have better cache locality.

---

# 50. PriorityQueue — Say This Out Loud

> PriorityQueue is heap-based. By default it is a min-heap, so the smallest element is available at the head. `peek()` is O(1), while insertion and removal of the head are O(log n).

---

# 51. Fail-Fast / ConcurrentModificationException — Say This Out Loud

> A for-each loop uses an iterator. If I structurally modify the collection directly while that iterator is traversing it, the iterator can detect that the collection changed unexpectedly and fail fast with ConcurrentModificationException. I should use Iterator.remove() or removeIf() when appropriate.

---

# 52. The Most Important Mental Model

## List

```text
LIST
│
├── ArrayList
│      ↓
│   dynamic array
│   fast index access
│   cache friendly
│
└── LinkedList
       ↓
    doubly linked nodes
    no fast index access
    cheap node manipulation once node is known
```

## Set

```text
SET
│
├── HashSet
│      ↓
│   uniqueness
│   fast average lookup
│   no order guarantee
│
├── LinkedHashSet
│      ↓
│   uniqueness
│   insertion order
│
└── TreeSet
       ↓
    uniqueness
    sorted order
    O(log n)
```

## Queue

```text
QUEUE
│
├── ArrayDeque
│      ↓
│   FIFO / LIFO
│   both ends
│
└── PriorityQueue
       ↓
    heap
    priority-based removal
```

## Fail-Fast

```text
for-each
   ↓
Iterator
   ↓
unexpected structural modification
   ↓
ConcurrentModificationException
```

---

# 53. One-Line Memory Tricks

```text
ArrayList  → Array → index access
LinkedList → Links → nodes
HashSet    → Hash → fast lookup, no order
LinkedHashSet → Hash + Links → insertion order
TreeSet    → Tree → sorted
ArrayDeque → Deque → both ends
PriorityQueue → Heap → priority
Iterator → traversal
CME → unexpected structural modification during iteration
```

---

# 54. Final Interview Cheat Sheet

### ArrayList

```text
Dynamic array
get(index) → O(1)
append → amortized O(1)
middle insertion/removal → O(n)
good cache locality
```

### LinkedList

```text
Doubly linked nodes
get(index) → O(n)
known-node insertion/removal → O(1)
more memory overhead
poor cache locality
```

### HashSet

```text
Unique
Hash-based
O(1) average add/contains/remove
No guaranteed order
```

### LinkedHashSet

```text
Unique
Hash-based
Insertion order
O(1) average add/contains/remove
```

### TreeSet

```text
Unique
Sorted
Red-Black tree
O(log n)
```

### ArrayDeque

```text
Double-ended queue
Resizable array
Efficient at both ends
Can act as FIFO queue or LIFO stack
```

### PriorityQueue

```text
Heap
Default = min-heap
peek() → O(1)
offer()/poll() → O(log n)
Not fully sorted
```

### Fail-Fast

```text
for-each → Iterator
Direct structural modification during iteration
→ may cause ConcurrentModificationException

Use:
Iterator.remove()
or
removeIf()
```

---

# 55. Final Decision Tree

When choosing a collection, ask what behavior you need:

```text
Need duplicates?
│
├── YES → List / Queue
│         │
│         ├── Need index access?
│         │      ↓
│         │   ArrayList
│         │
│         └── Need deque behavior?
│                ↓
│             ArrayDeque
│
└── NO → Set
          │
          ├── Need no particular order?
          │      ↓
          │   HashSet
          │
          ├── Need insertion order?
          │      ↓
          │   LinkedHashSet
          │
          └── Need sorted order?
                 ↓
              TreeSet
```

If the requirement is:

```text
"Repeatedly give me the smallest/largest/highest-priority item"
```

then think:

```text
PriorityQueue
```

The core interview principle is:

> **Choose the data structure based on the operation and ordering guarantees you need—not simply based on which collection you know.**
