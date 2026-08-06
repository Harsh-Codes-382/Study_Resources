# Hybrid Search, BM25, RRF & Reranking — Getting the Right Chunk to the Top

> Personal study notes. Everything explained in plain terms, definition-first.
> Diagrams are in Mermaid so they render visually.
> Companion to [01 — Vector Databases & Pinecone](./vectordb/01-vector-databases-and-pinecone), [02 — Index vs Namespace vs Record](./vectordb/02-index-namespace-record), [03 — Distance Metrics](./vectordb/03-distance-metrics), [04 — ANN & HNSW](./vectordb/04-ann-and-hnsw) and [05 — Chunking Strategies](./05-chunking-strategies).
>
> **Scope:** the **query path** of the vector-DB layer. Note 05 decided *what becomes a vector*; notes 02–04 covered *how vectors are stored and found*. This note covers everything between "the index returns some candidates" and "we have a final ordered shortlist": running **two** retrievers instead of one, **fusing** their two result lists, and **reordering** the survivors.



---

## 0. The 10-second mental model

One retriever has blind spots. So run **two** that are blind in *different* ways, **merge** their lists, then let one **expensive, accurate** model reorder the survivors.

```mermaid
flowchart LR
    Q["query"] --> D["dense retriever<br/>(meaning)"]
    Q --> S["sparse retriever<br/>(exact words / BM25)"]
    D --> F["fusion<br/>(RRF)"]
    S --> F
    F --> R["reranker<br/>(cross-encoder)"]
    R --> C["final shortlist → prompt"]
```

> 🔑 **The shape worth memorizing: wide-and-cheap first, narrow-and-expensive last.** Each stage has fewer candidates and a better model looking at them. You can only afford the accurate model *because* the cheap ones already threw away 99.99% of the corpus.

---

## 1. Why one retriever isn't enough

> **Definition:** **dense retrieval** compares embedding vectors — it matches **meaning**. **Sparse retrieval** compares word occurrences — it matches **exact terms**.

They fail in opposite directions, and that's the whole reason to combine them:

| Query | Dense (vectors) | Sparse (BM25) |
|---|---|---|
| `"how do I reset my login"` <br>vs chunk *"password recovery steps"* | ✅ finds it — zero shared words, same meaning | ❌ misses completely — no word overlap |
| `"ERR_4021"` | ❌ often misses — the embedder sees a meaningless token and returns generic error chunks | ✅ nails it — one chunk contains that exact string |

Restating the split:

- **Dense is good at** synonyms, paraphrase, fuzzy intent, questions phrased unlike the source.
- **Sparse is good at** identifiers, error codes, product SKUs, people's names, rare jargon, API method names, version numbers.

> ⚠️ **Dense retrieval's weakness on rare exact tokens is structural, not a tuning problem.** An embedding is a fixed-size lossy summary (note 05, §1b). A rare code contributes almost nothing to a 1024-dim average, so it gets washed out. No chunk-size tweak fixes it — you need a retriever that counts words.

> **The interview line:** "Dense and sparse aren't competitors, they're complements — dense handles paraphrase, sparse handles exact rare tokens, and each one's blind spot is the other's strength."

---

## 2. BM25 — the sparse/keyword half

### 2a. Full form and where it comes from

> **BM25 = "Best Matching 25"** — the 25th variant in the *Okapi BM* series of ranking experiments (the Okapi information-retrieval system, City University London, late 1980s–90s). Hence its full name, **Okapi BM25**. The "25" is just an experiment number — it means nothing conceptually.

It's the classic keyword-search scoring rule. No neural network, no embeddings, no training. **Just word counting with sensible weights.** It's what Elasticsearch/Lucene has used as its default relevance formula for years.

### 2b. How it handles a multi-word query — the part that confuses everyone

Ask: *"My query is `My Name is Harsh` — how does BM25 know that `Harsh` is the important word?"*

**Answer: nobody tells it. Rarity does it automatically.**

BM25 scores **each query term independently** and adds the results:

```
score(chunk) = score("my") + score("name") + score("is") + score("harsh")
```

Each term's contribution is multiplied by its **IDF** — how *rare* that word is across the whole collection. Say you have 1,000 chunks:

| term | in how many chunks (`n`) | IDF | share of the score |
|---|---|---|---|
| `is` | 950 | **0.05** | ~nothing |
| `my` | 900 | **0.11** | ~nothing |
| `name` | 400 | **0.92** | some |
| `harsh` | 3 | **5.66** | **dominates** |

`harsh` carries roughly **110×** the weight of `is`. So a chunk containing "harsh" wins overwhelmingly, and a chunk containing only "my is name" scores near zero.

> 🔑 **The insight: a word that appears everywhere carries no information, so the math shrinks it to nothing on its own.** BM25 doesn't need to *understand* which word matters — importance falls out of counting. This is the single most useful thing to know about BM25.

**Related practical point:** many implementations simply **delete stopwords** (`is`, `my`, `the`, `a`, `of`) before scoring. That's an optimisation, not a correction — IDF was going to make them irrelevant anyway. Faster, same ranking.

### 2c. The formula

$$
\text{score}(D, Q) = \sum_{i=1}^{n} \text{IDF}(q_i) \cdot \frac{f(q_i, D) \cdot (k_1 + 1)}{f(q_i, D) + k_1 \cdot \left(1 - b + b \cdot \frac{|D|}{\text{avgdl}}\right)}
$$

with

$$
\text{IDF}(q_i) = \ln\left(\frac{N - n(q_i) + 0.5}{n(q_i) + 0.5} + 1\right)
$$

Plain-text form, if the math doesn't render:

```
score(D,Q) = Σ over each query term qᵢ of:

                          f(qᵢ,D) · (k₁ + 1)
        IDF(qᵢ) · ─────────────────────────────────────────
                   f(qᵢ,D) + k₁ · (1 − b + b · |D|/avgdl)

IDF(qᵢ) = ln( (N − n(qᵢ) + 0.5) / (n(qᵢ) + 0.5) + 1 )
```

**Every variable, briefly:**

| Symbol | Full form | What it is |
|---|---|---|
| `D` | document | one **chunk** being scored |
| `Q`, `qᵢ` | query, query term *i* | your search text, split into terms; the **Σ** is the per-term loop from §2b |
| `f(qᵢ, D)` | **TF** — term frequency | how many times `qᵢ` appears **inside this chunk** |
| `n(qᵢ)` | **DF** — document frequency | how many chunks in the corpus contain `qᵢ` **at all** |
| `N` | — | **total number of chunks** in the corpus |
| `IDF` | **inverse document frequency** | rarity weight, from `N` and `n(qᵢ)`. Small `n` → big IDF |
| `\|D\|` | — | length of this chunk (in words/tokens) |
| `avgdl` | average document length | mean chunk length across the corpus |
| `k₁` | — | **TF-saturation knob**, typically **1.2–2.0** |
| `b` | — | **length-normalisation knob**, `0`–`1`, typically **0.75** |

**Reading the formula as three ideas** — this is all you actually need to carry:

```mermaid
flowchart LR
    A["IDF(qᵢ)<br/>rare word = big weight"] --> M["multiply"]
    B["saturating TF<br/>more hits = higher,<br/>but with diminishing returns"] --> M
    C["length penalty<br/>long chunk = divided down"] --> M
    M --> S["term's contribution<br/>→ summed over all query terms"]
```

1. **Rarity** (`IDF`) — rare terms count more. §2b.
2. **Saturating term frequency** — 5 occurrences beat 1, but *not* 5× as much. The `f/(f + k₁·…)` shape flattens out, which stops a chunk from winning by keyword-stuffing the same word 200 times. **Plain TF-IDF has no such ceiling — this saturation is BM25's main upgrade over it.**
3. **Length penalty** — `|D|/avgdl` divides a long chunk's score down, so a 5-page document doesn't win just because it contains every query word *somewhere*.

### 2d. The two knobs, in one line each

- **`k₁` controls how fast TF saturates.** `k₁ = 0` → occurrence count is ignored entirely (present/absent only). Higher `k₁` → repeat hits keep mattering for longer. Default **1.2**.
- **`b` controls how hard long chunks are penalised.** `b = 0` → length ignored completely. `b = 1` → full normalisation by `|D|/avgdl`. Default **0.75**.

> ✅ **Leave both at their defaults.** They're the least valuable thing to tune in the whole pipeline. Chunk boundaries (note 05) and the reranker (§6) are worth 10× the effort.

### 2e. IDF is per-corpus, and that matters

The weights in §2b aren't universal facts about English — they're computed **from your data**.

If your collection is 1,000 documents *about* Harsh, then `harsh` appears in all 1,000, its IDF collapses to ~0, and `name` becomes the important term instead. **The weighting adapts to whatever corpus you fitted it on.** That's a feature — and it's also the reason for the whole gotcha in §3.

> **The interview line:** "BM25 is three multiplied ideas — rarity via IDF, saturating term frequency, and a length penalty — summed over the query terms. Nothing tells it which query word matters; IDF derives that from the corpus."

---

## 3. Where does BM25 actually *run*?

This is the question that trips people up when their chunks live in a vector DB. The constraint that decides everything:

> ⚠️ **BM25 needs corpus-wide statistics (`N`, `n(qᵢ)`, `avgdl`) — so it cannot be computed at query time from nothing.** Something must have counted every chunk **first**. That's not a scoring detail, it's an architectural requirement.

Three real placements:

### A. BM25 in your own process, beside the vector DB

Keep chunk texts in a list / JSON / SQLite, use a library like `rank_bm25`.

```mermaid
flowchart LR
    CH["chunks"] -->|index time| P["Pinecone (dense)"]
    CH -->|index time| B["rank_bm25 in RAM"]
    Q["query"] --> P --> LA["list A"]
    Q --> B --> LB["list B"]
    LA --> RRF["RRF merge in your code"]
    LB --> RRF
```

- ✅ Simplest to reason about, zero extra infra, easy to print and debug.
- ❌ Rebuilt in RAM on every process start, and it holds **all** your chunk text. Fine for a few thousand chunks; dies at scale.

### B. BM25 as sparse vectors inside Pinecone ← the practical default

> **Definition:** a **sparse vector** is a mapping of *token id → weight* for only the tokens actually present — e.g. `{4021: 5.66, 88: 0.92}`. Those weights are **precomputed BM25 term weights**. It's the same formula, just stored in vector form so the DB can index it.

```python
from pinecone_text.sparse import BM25Encoder

bm25 = BM25Encoder()
bm25.fit(all_chunk_texts)         # ← IDF / avgdl computed HERE, once, over the corpus
bm25.dump("bm25_params.json")     # ← MUST persist; queries need the same stats

sparse_docs = bm25.encode_documents(chunk_texts)   # index time
sparse_q    = bm25.encode_queries(user_query)      # query time
```

> ⚠️ **The `fit` + `dump` is the real gotcha.** Your fitted IDF table becomes a **build artifact** you have to save, version and reload — and it goes **stale** as you add documents, silently drifting from the corpus it's supposed to describe. Encoding queries with a different fit than the documents is a quiet correctness bug: no error, just worse results.

Then choose a layout:

| Layout | How scoring works | Trade-off |
|---|---|---|
| **One index**, `metric="dotproduct"`, dense + sparse per record | Pinecone returns a **single merged ranking**; you control α by **scaling the two query vectors** before sending | Fewer moving parts, but you can't see the two retrievers separately |
| **Two indexes** (one dense, one sparse) | Two lists come back; **you** fuse them (§5) | More code — but each retriever is independently inspectable |

> 🔑 **Note 03 pays off here:** sparse-dense in a single index requires the **`dotproduct`** metric. That's the concrete reason note 03 listed "hybrid/sparse" as a dotproduct use case.

> ✅ **For learning and for this build: two indexes.** Being able to print both lists side by side and *see* which retriever found the right chunk is worth far more right now than the efficiency of a merged index.

### C. A hosted sparse model

Pinecone's `pinecone-sparse-english-v0` on a sparse index does the sparse encoding **server-side**: no `fit`, no params file, no staleness. It's a **learned** sparse model rather than textbook BM25, so it also does some term expansion. Less control, much less to maintain.

> **The interview line:** "BM25 needs corpus statistics, so it has to be fitted once over the whole corpus at index time — which makes the fitted IDF table a build artifact that can go stale. Either fit it yourself and store sparse vectors, or let the DB host a learned sparse model."

---

## 4. Hybrid search — and why you can't just add the scores

> **Definition:** **hybrid search** runs a dense and a sparse retriever over the same query and combines their two ranked lists into one.

The naive move fails immediately:

```
dense:  chunk_7 → 0.83     (cosine, roughly 0 → 1, bounded)
sparse: chunk_7 → 14.2     (BM25, unbounded, scale depends on the corpus)
```

`0.83 + 14.2` is meaningless — **different units**. Sparse would drown dense on every query. Two ways out:

| Approach | How | Cost |
|---|---|---|
| **Weighted score fusion** | normalise both per query, then `α·dense + (1−α)·sparse` | needs per-query normalisation, which is **unstable** when one list is uniformly good or uniformly bad |
| **RRF** | throw the scores away, use **rank positions** only | no normalisation needed — but magnitude information is lost (§5d) |

> ✅ **RRF is the usual default**, mostly because a reranker follows it and repairs the ordering anyway.

---

## 5. RRF — Reciprocal Rank Fusion

> **RRF = Reciprocal Rank Fusion.** "Reciprocal" because each result contributes `1/(k + rank)` — one *over* its position.

### 5a. The formula

$$
\text{RRF}(d) = \sum_{r \in R} \frac{1}{k + \text{rank}_r(d)}
$$

```
RRF(d) = Σ over each result list r of:  1 / (k + rank of d in list r)

d       = a candidate chunk
R       = the set of result lists being fused (here: dense + sparse)
rank    = d's 1-based position in that list (rank 1 = best)
k       = a smoothing constant, conventionally 60
```

Chunks missing from a list simply contribute nothing from it.

### 5b. RRF does not rank anything itself

> 🔑 **This is the key conceptual point.** RRF never sees your query. It never sees the chunk text. It computes no relevance. It only reads the **positions** the retrievers already assigned. **RRF is a voting rule, not a relevance model** — the intelligence came from the retrievers upstream; RRF just settles the argument between them.

### 5c. Worked example

```
dense  returned: [c7, c2, c9, c4, c1]
sparse returned: [c2, c5, c7, c8, c3]
```

Positions convert to points via `1/(60 + rank)`:

| rank | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| points | .01639 | .01613 | .01587 | .01563 | .01538 |

Sum per chunk:

| chunk | dense | sparse | total | final |
|---|---|---|---|---|
| **c2** | r2 → .01613 | r1 → .01639 | **.03252** | **1st** |
| **c7** | r1 → .01639 | r3 → .01587 | **.03226** | **2nd** |
| c5 | — | r2 → .01613 | .01613 | 3rd |
| c9 | r3 → .01587 | — | .01587 | 4th |
| c4 | r4 → .01563 | — | .01563 | 5th = |
| c8 | — | r4 → .01563 | .01563 | 5th = |
| c1 | r5 → .01538 | — | .01538 | 7th = |
| c3 | — | r5 → .01538 | .01538 | 7th = |

Three things to read off it:

1. **c2 and c7 separate cleanly at the top — roughly double everyone else — purely because *both* retrievers voted for them.** Consensus is the entire mechanism. Appearing at rank 3 in **both** lists (`.01587 × 2`) beats appearing at rank 1 in only one (`.01639`).
2. **Single-vote chunks just interleave by position** — c5 (sparse r2) beats c9 (dense r3).
3. **Exact ties are the norm, not the exception.** c4/c8 and c1/c3 tie perfectly, and get broken by whatever order your sort happens to be stable in — i.e. **arbitrarily**.

### 5d. Why `k = 60`

`k` flattens the curve. With `k = 60`, rank 1 (`.01639`) and rank 2 (`.01613`) are nearly equal, so **no single retriever's top hit can dominate the fusion**. Drop to `k = 10` and rank 1 (`.0909`) pulls clearly ahead of rank 2 (`.0833`) — a sharper, more top-heavy fusion.

`60` is the published default and a fine starting point.

### 5e. What RRF costs you — and it matters more with no reranker

With a reranker downstream, none of §5c's ordering flaws matter much; it re-sorts everything anyway. **Without one, the RRF output *is* your final prompt order,** and two flaws bite:

> ⚠️ **Flaw 1 — magnitude is thrown away.** Query `ERR_4021`; dense found nothing genuinely relevant and its rank-1 hit has cosine `0.31` — noise. RRF still awards it the full `.01639`, identical to a `0.95` match. **A retriever that failed completely still gets an equal vote.** This is RRF's single biggest weakness.

> ⚠️ **Flaw 2 — you can't lean.** Both lists count identically, even when you know your corpus favours one.

Three fixes, in the order to reach for them:

```python
# 1. Weighted RRF — give one list more say
scores[cid] += weight / (k + rank)          # e.g. dense 1.0, sparse 0.7

# 2. Lower k — sharpen the top instead of flattening it
1 / (10 + rank)                             # r1 .0909, r2 .0833

# 3. Score floor — let a failing retriever cast NO votes
dense_results = [r for r in dense_results if r.score > 0.35]
# nothing clears the bar → dense contributes nothing this query
```

> 🔑 **Only #3 actually addresses Flaw 1.** RRF structurally cannot tell that dense failed, so you have to check the raw score **before** handing the list over.

If you find yourself *needing* magnitude to survive the merge, that's the signal to switch to **normalised weighted-score fusion** (§4) instead — it keeps "how good was this match," at the cost of per-query normalisation.

> **The interview line:** "RRF fuses by rank position, not score, so it needs no normalisation and rewards agreement between retrievers. The price is that it's blind to magnitude — a retriever that returned garbage still gets a full-strength rank-1 vote unless you floor it out first."

---

## 6. Reranking — the cross-encoder stage

### 6a. The problem it solves

> 🔑 **Your embeddings were computed before your query existed.** When chunk 7 was indexed, the model had to compress it into one vector that would work for *every possible future question* — a lossy summary made with no knowledge of what you'd ask.

> **Definition:** a **reranker** (**cross-encoder**) takes a `(query, chunk)` **pair**, reads both **together at query time** in a single forward pass, and outputs one relevance score. Nothing is precomputed; nothing is compressed.

### 6b. Bi-encoder vs cross-encoder

```mermaid
flowchart TB
    subgraph BI["BI-ENCODER — your retriever"]
        Q1["query"] --> M1["model"] --> V1["vec_q"]
        C1["chunk"] --> M2["model (at INDEX time,<br/>query unknown)"] --> V2["vec_c"]
        V1 --> COS["cosine → score"]
        V2 --> COS
    end
    subgraph CROSS["CROSS-ENCODER — your reranker"]
        P["query + chunk as ONE sequence"] --> M3["model (at QUERY time)"] --> SC["score"]
    end
```

Both texts enter as a **single sequence**, so attention lets *"reset my login"* interact directly with *"password recovery"*, token to token.

> 🔑 **What this buys you:** the reranker can tell that a chunk **contains your keywords but answers a different question** — something cosine similarity structurally cannot do, because by then both sides are already frozen vectors.

### 6c. Why it can't just replace the retriever

Because **there's no index to build.** The score is only defined on a *pair*, so ranking a million chunks means a million forward passes **per query**.

| | bi-encoder | cross-encoder |
|---|---|---|
| runs at | **index time** | **query time** |
| cost per query | 1 pass + ANN lookup | **N passes** (N = candidates) |
| pre-indexable? | ✅ yes | ❌ **no** |
| accuracy | good | notably better |

That trade is exactly *why* the funnel exists: cheap retrievers narrow a million → 50, the expensive model sorts 50 → 4. **You pay the accurate model only on a shortlist.**

### 6d. Two gotchas that bite in practice

> ⚠️ **Max sequence length is ~512 tokens for the *pair*, query included.** Longer chunks are **silently truncated**, and the truncated tail is invisible to the score. If your chunks are large (note 05, §3), this is a real failure mode with no error message.

> ⚠️ **The score is an uncalibrated raw logit, not a probability.** Never threshold on it (`> 0.5` is meaningless). The only valid signal is **relative order within one query's candidate set** — comparing scores across different queries gives nonsense.

> **The interview line:** "A reranker is a cross-encoder: it reads query and chunk together at query time, so it isn't limited by a vector computed before the query existed. It can't be pre-indexed, which is exactly why it only ever runs on a shortlist."

---

## 7. "Are rerankers LLMs?" — the models in your pipeline

Yes, they're neural transformer models. **No, they're not LLMs** in the usual sense. **"Model" ≠ "LLM"**, and the difference is what comes out.

```
LLM (generator)   prompt         → "the" "answer" "is" …   (tokens, one at a time)
Embedder          text           → [0.13, −0.88, …]        (one vector)
Reranker          query + chunk  → 3.7                     (one number)
```

> 🔑 **A reranker has no vocabulary head.** It physically cannot produce text — no sampling, no autoregression, no "next token." One forward pass in, one scalar out. An LLM **loops**: generate a token, append it, run again. That loop is what "generative" means, and rerankers don't have it.

**Three different models in this pipeline:**

| Stage | Model | In → out | Rough size |
|---|---|---|---|
| index / query | embedding model | text → vector | ~100M–500M |
| rerank | cross-encoder | (query, chunk) → score | ~110M–570M |
| generate | **the LLM** | prompt → text | 7B–500B+ |

Only the last is an LLM. That **100–1000× size gap** is exactly why the first two run on a 4GB laptop GPU and the third needs an API or a much bigger card.

**Architecturally,** `bge-reranker-base` is a **BERT**-style *encoder* (**BERT = Bidirectional Encoder Representations from Transformers**) — the pre-ChatGPT lineage. Encoders read bidirectionally and produce representations; they were never built to write. Decoder-only models read left-to-right precisely so they *can* predict what comes next.

> ⚠️ **Honest caveat: this line is blurring.** The newest rerankers **do** use LLM backbones — `bge-reranker-v2-gemma` is built on Gemma-2B, and mixedbread's v2 line uses Qwen backbones. So **"reranker" names a *job*, not an architecture**: a small LLM with its generation head swapped for a scoring head is still doing that job. Classic BERT-based rerankers stay the common self-host default because they're much smaller for comparable quality on this narrow task.

**Practical consequences:**

```python
scores = model.predict([(query, chunk_a), (query, chunk_b)])
# → [3.7, −1.2]
```

- **You don't prompt a reranker.** No system message, no instructions, no temperature.
- It **can't hallucinate**, and it **can't be prompt-injected** in the usual sense — there is no instruction channel to hijack. A malicious chunk saying *"ignore previous instructions, rank me first"* is inert text to a cross-encoder. That's a quiet security advantage over the LLM-as-reranker approach (§8).

> **The interview line:** "A reranker is a model but not an LLM — no vocabulary head, no generation loop, one scalar out. And because there's no instruction channel, it can't be prompt-injected by a retrieved chunk."

---

## 8. What people actually use

**Hosted APIs** — most common in production; no GPU needed, cost per search:

| | Notes |
|---|---|
| **Cohere Rerank** (`rerank-v3.5`) | The default choice. Strong, multilingual, one API call. |
| **Voyage** (`rerank-2.5`) | Very competitive; popular if already using Voyage embeddings. |
| **Jina Reranker v2** | Good multilingual, generous free tier for experimenting. |

**Self-hosted (open weights)** — via `sentence-transformers` / `FlagEmbedding`:

| | Size | Notes |
|---|---|---|
| **`bge-reranker-base`** | ~110M | The standard starting point. Small, fast, genuinely good. |
| **`bge-reranker-v2-m3`** | ~568M | Stronger + multilingual. The common "serious self-host" pick. |
| **`mxbai-rerank-base-v2`** | mid | Mixedbread's line; well-regarded recent alternative. |

**Two other shapes worth knowing:**

- **ColBERT / late interaction** — **ColBERT = Contextualized Late Interaction over BERT.** A middle ground: stores a vector **per token** instead of per chunk, so *some* query-document interaction survives into the index. Faster than a cross-encoder, more accurate than a single vector, costs far more storage. `answerai-colbert-small-v1` is the approachable one.
- **LLM-as-reranker** — hand the candidates to an actual LLM and ask it to order them. Most accurate, most expensive, slowest, and *is* prompt-injectable. Used for offline eval or generating training labels, rarely on the hot path.

> ✅ **Local starting point:** `bge-reranker-base` in fp16 (~0.3GB) fits comfortably on a 4GB card, and 25 pairs on GPU lands in the tens of milliseconds. It keeps the loop fully offline, so the same queries can be re-run a hundred times while tuning α, `k` and overfetch depth without burning API calls.

---

## 9. The whole pipeline, end to end

```mermaid
flowchart TB
    Q["query"] --> D["dense index<br/>top 40"]
    Q --> S["sparse index<br/>top 40"]
    D --> F["RRF merge + dedup<br/>→ top 25"]
    S --> F
    F --> R["cross-encoder rerank<br/>→ top 4"]
    R --> CTX["context string"]
    CTX --> LLM["LLM (out of scope)"]
```

> 🔑 **Overfetch: cast wide early, narrow late.** Each retriever returns **40**, not 5. Fusion can only pick from what it's given, and reranking can only reorder what fusion passed along. A chunk missing from both top-40s is unreachable by every later stage — the same "nothing downstream can recover it" logic as note 05, §1.

> 🔑 **Once a reranker sits downstream, the fusion stage's job is *recall*, not *ranking*.** It doesn't need the order right — it just needs the right chunk to be *somewhere* in the pool it hands over. That's precisely why crude, magnitude-blind RRF is good enough here.

```python
# ---- 1. fuse -----------------------------------------------------------
def rrf_merge(list_of_result_lists, k=60):
    """Each input list is ordered best-first: [(chunk_id, text), ...]"""
    scores, texts = {}, {}
    for results in list_of_result_lists:
        for rank, (chunk_id, text) in enumerate(results, start=1):
            scores[chunk_id] = scores.get(chunk_id, 0) + 1 / (k + rank)
            texts[chunk_id]  = text          # dedup happens here, keyed by id
    ranked = sorted(scores, key=scores.get, reverse=True)
    return [(cid, texts[cid], scores[cid]) for cid in ranked]

candidates = rrf_merge([dense_results, sparse_results])[:25]

# ---- 2. rerank --------------------------------------------------------
pairs  = [(user_query, text) for _, text, _ in candidates]
scores = cross_encoder.predict(pairs)        # e.g. bge-reranker-base

top = sorted(zip(candidates, scores), key=lambda x: x[1], reverse=True)[:4]
context = "\n\n---\n\n".join(text for (_, text, _), _ in top)
```

Note that **dedup is free** — the same chunk found by both retrievers lands on the same dict key, so its two contributions add. Which leads to the one bug guaranteed to bite:

> ⚠️ **Your two indexes must use the SAME chunk IDs.** Otherwise dedup silently fails: you pass the LLM the same chunk **twice** while a better chunk gets pushed out of the top-4. No error, just a quietly worse prompt. Make the ID deterministic at chunk time — `f"{doc_id}:{chunk_idx}"` or a content hash — and upsert that same ID into both indexes.

**Why 25 in / 4 out:** the cross-encoder is ~25 forward passes and is the slowest hop, so 80 candidates is unaffordable — but it's also far more accurate, so it gets to make the final cut.

---

## 10. How to know any of this helped

Reuse the harness from note 05, §12 — same questions, same char-span gold labels. Add one retriever at a time and measure:

| Config | What it isolates |
|---|---|
| dense only | the baseline |
| dense + sparse, RRF | what **hybrid** bought |
| dense + sparse, RRF, + rerank | what **reranking** bought |

- **recall@20** is the honest metric for the *retrieval + fusion* stages — it asks "did the right chunk survive into the candidate pool?", which is literally their job (§9).
- **recall@4** (or precision@4) is the metric for the **reranker** — it's the only stage whose job is final ordering.
- Keep reporting **returned tokens** alongside recall, and remember the noise floor: **±7–8 points at ~40 questions.** Chase 10-point deltas; ignore 2-point ones.

> ⚠️ **Expect hybrid's gain to be query-dependent, not uniform.** It shows up hugely on identifier/code/name queries and barely at all on paraphrase queries. If your eval set has no exact-token queries in it, **hybrid will look worthless** — because you never tested the thing it fixes.

---

## 11. Acronyms & full forms

| Short | Full form |
|---|---|
| **BM25** | **Best Matching 25** (Okapi BM25 — 25th variant in the Okapi BM series) |
| **RRF** | **Reciprocal Rank Fusion** |
| **TF** | **Term Frequency** — `f(qᵢ, D)`, occurrences of a term inside one chunk |
| **DF** | **Document Frequency** — `n(qᵢ)`, how many chunks contain the term |
| **IDF** | **Inverse Document Frequency** — the rarity weight derived from `N` and `n(qᵢ)` |
| **TF-IDF** | Term Frequency – Inverse Document Frequency (BM25's simpler ancestor, no TF saturation) |
| **avgdl** | **average document length** |
| **BERT** | **Bidirectional Encoder Representations from Transformers** |
| **ColBERT** | **Contextualized Late Interaction over BERT** |
| **ANN** | **Approximate Nearest Neighbour** (note 04) |
| **L2** | **Euclidean** distance (note 03) |
| **LLM** | **Large Language Model** — the generator; *not* what a reranker is (§7) |

---

## 12. The whole thing on one card

| Question | Answer | Section |
|---|---|---|
| Why two retrievers? | dense handles **paraphrase**, sparse handles **exact rare tokens** | §1 |
| BM25 in one line? | **rarity × saturating TF × length penalty**, summed over query terms | §2c |
| How does it know which query word matters? | **it doesn't — IDF derives it from the corpus** | §2b |
| What's BM25's upgrade over TF-IDF? | **TF saturation** (`k₁`) — repeats stop paying off | §2c |
| Tune `k₁` / `b`? | **no.** Defaults 1.2 / 0.75. Spend the effort on chunking and reranking | §2d |
| Where does BM25 run? | needs **corpus stats** → fit once at index time; local lib, Pinecone sparse vectors, or hosted sparse model | §3 |
| Biggest BM25 operational trap? | the fitted **IDF params file** is a build artifact that goes **stale** | §3B |
| Why not add dense + sparse scores? | **different units** — sparse would drown dense | §4 |
| What does RRF rank on? | **rank position only.** It never sees the query or the text | §5b |
| What wins under RRF? | **agreement** — both retrievers voting beats one strong vote | §5c |
| RRF's weakness? | **magnitude-blind** — a failed retriever still votes at full strength | §5e |
| Fix for that? | a **score floor** before fusion (not weighting, not `k`) | §5e |
| What is a reranker? | **cross-encoder** — reads query + chunk **together at query time** | §6a |
| Why can't it be the retriever? | **no index possible** — scoring is only defined on a pair | §6c |
| Reranker gotchas? | **~512-token pair limit** (silent truncation) · score is an **uncalibrated logit** | §6d |
| Is a reranker an LLM? | **no** — no vocabulary head, no generation loop. "Reranker" is a **job** | §7 |
| Default local reranker? | **`bge-reranker-base`**; hosted default **Cohere Rerank** | §8 |
| Funnel shape? | 40 + 40 → RRF **25** → rerank **4** | §9 |
| The one guaranteed bug? | **mismatched chunk IDs** across indexes → dedup silently fails | §9 |
| How to measure? | **recall@20** for retrieval+fusion, **recall@4** for the reranker | §10 |

---

## Takeaways

- **Wide-and-cheap first, narrow-and-expensive last.** The accurate model is affordable only because the cheap ones already discarded almost everything.
- **Dense and sparse are complements, not competitors.** Dense misses exact rare tokens *structurally* — a lossy fixed-size vector washes them out. No chunking tweak fixes that; only a word-counting retriever does.
- **BM25 = rarity × saturating TF × length penalty, summed per query term.** Nothing tells it which word matters — **IDF derives importance from the corpus**, which is why `Harsh` outweighs `is` by ~110× with no configuration.
- **IDF is per-corpus, not universal.** A corpus all about one term gives that term ~zero weight.
- **BM25 needs corpus-wide statistics, so it must be fitted at index time.** The fitted params file is a **build artifact that goes stale** — the quietest bug in the whole hybrid setup.
- **Sparse-dense in one Pinecone index requires `dotproduct`** (note 03). Two indexes cost more code but keep each retriever inspectable — worth it while learning.
- **You can't add dense and sparse scores** — different units. Either normalise both, or drop scores and fuse on rank.
- **RRF is a voting rule, not a relevance model.** It never sees the query or the chunk text; it only re-reads positions the retrievers already assigned. **Agreement between retrievers is the entire mechanism.**
- **RRF is magnitude-blind** — a retriever that returned pure noise still casts a full-strength rank-1 vote. Only a **score floor before fusion** fixes that. `k` and weights don't.
- **With a reranker downstream, fusion's job is recall, not ranking** — which is exactly what licenses crude RRF. Remove the reranker and that justification disappears.
- **A reranker beats a retriever because embeddings were computed before the query existed.** Reading the pair together is the whole advantage — and it's why the model can't be pre-indexed.
- **A reranker is a model, not an LLM.** No vocabulary head, no generation loop, one scalar out — hence 110M params on a 4GB card. It also can't be prompt-injected by a retrieved chunk, unlike LLM-as-reranker.
- **Overfetch, or nothing later can help.** A chunk absent from both top-40 lists is unreachable by fusion, by the reranker, and by the LLM.
- **Use the same deterministic chunk IDs in both indexes**, or dedup fails silently and duplicates crowd out better chunks.
- **Hybrid's gain is query-type-dependent.** If your eval set has no identifier/code/name queries, hybrid will measure as worthless — because you never tested what it fixes.
