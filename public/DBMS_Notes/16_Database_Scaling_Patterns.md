# 16 — Database Scaling Patterns (LEC-19)

## What Will You Learn?

- A **step-by-step** approach to deciding *when* to choose *which* scaling option.
- Which scaling option is feasible practically at the moment for a given load.

## A Case Study — Cab Booking App

Imagine a tiny startup:

- A tiny startup with about **10 customers** onboard.
- A single small machine DB stores all customers, trips, locations, booking data, and customer trip history.
- Roughly **1 trip booking every 5 minutes**.

### The Problem Begins

Your app becomes famous, and the load explodes:

- Requests scale up to about **30 bookings per minute**.
- The tiny DB system starts performing poorly.
- API latency has increased a lot.
- Transactions face **deadlock**, **starvation**, and frequent failure.
- Sluggish app experience.
- Customer dissatisfaction.

### Is There a Solution?

- We have to apply some kind of performance optimisation measures.
- We might have to scale our system going forward.

## The Scaling Decision Progression

```mermaid
flowchart TD
    P1[Pattern 1: Query Optimisation and Connection Pool] --> P2[Pattern 2: Vertical Scaling / Scale-up]
    P2 --> P3[Pattern 3: CQRS - split reads and writes]
    P3 --> P4[Pattern 4: Multi-Primary Replication]
    P4 --> P5[Pattern 5: Partitioning by Functionality]
    P5 --> P6[Pattern 6: Horizontal Scaling / Sharding]
    P6 --> P7[Pattern 7: Data Centre-wise Partition]
```

Each pattern is applied only when the previous one can no longer keep up with the growing load.

## The Seven Scaling Patterns

### Pattern 1 — Query Optimisation & Connection Pool Implementation

- Cache frequently used, non-dynamic data such as booking history, payment history, and user profiles.
- Introduce database redundancy (or possibly use NoSQL).
- Use connection-pool libraries to cache DB connections.
- Multiple application threads can then use the same DB connection.

This is a good optimisation for now. The business scales to one more city and reaches about **100 bookings per minute**.

### Pattern 2 — Vertical Scaling (Scale-up)

- Upgrade the initial tiny machine — for example, RAM by 2x and SSD by 3x.
- Scale-up is pocket friendly only up to a point.
- The more you scale up, the more the cost increases **exponentially**.

A good optimisation for now. The business grows to 3 more cities and reaches about **300 bookings per minute**.

### Pattern 3 — Command Query Responsibility Segregation (CQRS)

The scaled-up big machine can no longer handle all read/write requests. The idea is to **separate read and write operations at the physical-machine level**.

- Add 2 more machines as **replicas** to the primary machine.
- Send all **read** queries to the replicas.
- Send all **write** queries to the primary.

```mermaid
flowchart LR
    App[Application] -->|writes| Pr[Primary]
    App -->|reads| Re1[Replica 1]
    App -->|reads| Re2[Replica 2]
    Pr -. replicate .-> Re1
    Pr -. replicate .-> Re2
```

The business grows to 2 more cities. Now the primary cannot handle all write requests, and the **lag** between primary and replicas starts impacting user experience.

### Pattern 4 — Multi-Primary Replication

Why not distribute write requests to the replicas as well?

- All machines can work as both **primary and replica**.
- The multi-primary configuration is a **logical circular ring**.
- Write data to any node.
- Read data from any node that replies to the broadcast first.

```mermaid
flowchart LR
    N1[Node 1] --> N2[Node 2]
    N2 --> N3[Node 3]
    N3 --> N4[Node 4]
    N4 --> N1
```

You scale to 5 more cities, and the system is in pain again (about **50 requests per second**).

### Pattern 5 — Partitioning of Data by Functionality

- What about separating the location tables into a separate DB schema?
- What about putting that DB on separate machines with a primary-replica or multi-primary configuration?
- Different databases can host data categorised by different **functionality**.
- The backend / application layer then takes responsibility for joining the results.

Now you are planning to expand your business to another country.

### Pattern 6 — Horizontal Scaling (Scale-out / Sharding)

- Use **sharding** with multiple shards.
- Allocate, say, **50 machines** — all having the same DB schema — where each machine holds only a slice (shard) of the overall data.
- A **shard key** (via a hash or range function) decides which shard a given record belongs to, and a routing layer forwards each request to the correct shard.
- This spreads both data and load across many machines, so the system scales out almost linearly.

```mermaid
flowchart TD
    R[Routing Layer / Shard Key] --> M1[Machine 1 - Shard 1]
    R --> M2[Machine 2 - Shard 2]
    R --> Mn[Machine N - Shard N]
```

As the business expands across countries, serving every request from one region's shards starts to add heavy network latency for distant users.

### Pattern 7 — Data Centre-wise Partition

- Partition the data **data-centre wise**, placing shards in data centres located close to the users they serve.
- Route each request to the **nearest data centre** based on the user's geographic region.
- This minimises network latency for a globally distributed user base and improves availability if an entire region goes down.
- It also helps satisfy **data-residency / compliance** requirements, since each country's data can be kept within its own borders.

```mermaid
flowchart TD
    G[Global Traffic Router] --> DC1[Data Centre - Region A]
    G --> DC2[Data Centre - Region B]
    G --> DC3[Data Centre - Region C]
    DC1 --> A1[Shards for Region A users]
    DC2 --> B1[Shards for Region B users]
    DC3 --> C1[Shards for Region C users]
```

Requests are served by the geographically nearest data centre, cutting latency and keeping each region's data local.
