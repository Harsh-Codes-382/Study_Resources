# 05 — Relational Model (LEC-7)

The **Relational Model (RM)** organises data in the form of **relations (tables)**. A relational database consists of a collection of tables, each assigned a unique name. A row in a table represents a relationship among a set of values, and the table is a collection of such relationships.

Common RM-based DBMS systems (RDBMS): **Oracle, IBM DB2, MySQL, MS Access**.

---

## Core Terminology

| Term | Meaning |
| --- | --- |
| **Tuple** | A single row of the table — one unique record / data point. |
| **Column (Attribute)** | Represents an attribute of the relation. |
| **Domain** | The set of permitted values for an attribute. |
| **Relation Schema** | Defines the design and structure of the relation: its name plus all its columns/attributes. |
| **Degree** | Number of attributes/columns in a relation. |
| **Cardinality** | Total number of tuples in a relation. |
| **Relational Key** | Set of attributes that can uniquely identify each tuple. |

---

## Properties of a Table

- The name of a relation must be distinct among all other relations.
- Values must be **atomic** — they cannot be broken down further.
- The name of each attribute/column must be unique.
- Each tuple must be unique within the table.
- The sequence of rows and columns has no significance.
- Tables must follow **integrity constraints** to maintain data consistency.

---

## Relational Model Keys

| Key | Definition |
| --- | --- |
| **Super Key (SK)** | Any permutation & combination of attributes that can uniquely identify each tuple. |
| **Candidate Key (CK)** | Minimum subset of super keys that uniquely identifies each tuple, with no redundant attribute. A CK value should not be NULL. |
| **Primary Key (PK)** | The candidate key selected as the main identifier — the one with the least number of attributes. |
| **Alternate Key (AK)** | All candidate keys except the primary key. |
| **Foreign Key (FK)** | An attribute that creates a relation between two tables (see below). |
| **Composite Key** | A primary key formed using at least 2 attributes. |
| **Compound Key** | A primary key formed using 2 foreign keys. |
| **Surrogate Key** | A synthetic PK generated automatically by the DB (usually an integer); may be used as the PK. |

### Foreign Key in Detail

A relation `r1` may include, among its attributes, the primary key of another relation `r2`. That attribute is called a **foreign key** from `r1` referencing `r2`.

- `r1` is the **Referencing (Child)** relation of the FK dependency.
- `r2` is the **Referenced (Parent)** relation of the FK.
- The FK helps cross-reference between two different relations.

```mermaid
flowchart LR
    subgraph r1[r1 - Referencing / Child]
        FK[Foreign Key]
    end
    subgraph r2[r2 - Referenced / Parent]
        PK[Primary Key]
    end
    FK -->|references| PK
```

The foreign key in the child relation points to the primary key of the parent relation.

---

## Integrity Constraints

CRUD operations must follow an integrity policy so the DB stays consistent, preventing accidental corruption.

### Domain Constraints

- Restrict the values allowed in an attribute by specifying its domain.
- Restrict the data type of every attribute.
- **Example:** enrolment should only happen for a candidate with birth year < 2002.

### Entity Constraints

- Every relation should have a primary key.
- The primary key must not be NULL (`PK != NULL`).

### Referential Constraints

- Specified between two relations to maintain consistency among their tuples.
- A value appearing in the specified attributes of any tuple in the referencing relation must also appear in the specified attributes of at least one tuple in the referenced relation.
- If a FK in the referencing table refers to the PK of the referenced table, every FK value must be either NULL or present in the referenced table.
- Every FK value must have a matching PK in the parent table, or it must be NULL.

---

## Key Constraints

The six key constraints present in a DBMS:

| Constraint | Purpose |
| --- | --- |
| **NOT NULL** | Restricts an element from having a NULL value; ensures every element has a value. |
| **UNIQUE** | Ensures all values in a column are different from each other. |
| **DEFAULT** | Sets a default value for a column, used when no value is specified. |
| **CHECK** | Keeps data integrity checked before and after a CRUD operation completes. |
| **PRIMARY KEY** | An attribute (or set of attributes) that uniquely identifies each entity; must be unique and not null. |
| **FOREIGN KEY** | The primary key of one entity set placed in another as a common attribute; prevents actions that would break the connection between tables. |
