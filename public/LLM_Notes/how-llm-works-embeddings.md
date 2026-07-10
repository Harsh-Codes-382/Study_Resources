# How LLM Works

### Part 2 — Embeddings (from token IDs to vectors of meaning)

> Study notes. This rung picks up exactly where tokenization left off. Part 1 ended with *"each token ID looks up a row in the embedding matrix."* This doc is about **what that row is, where the numbers come from, and why they capture meaning** — so that "embeddings" stops feeling like magic and becomes just a big learned lookup table plus some geometry.

---

## 0. The big picture in one line

```
"I love AI"
   → tokenizer → token IDs             →  [271, 1842, 9552]
   → each ID indexes the EMBEDDING MATRIX (pick a row)
   → out comes a VECTOR per token       →  [[0.21, -0.83, ...],
                                            [0.04,  0.55, ...],
                                            [-0.6,  0.12, ...]]
   → those vectors enter the transformer
```

A **token ID** is just a name tag with no meaning of its own — `1842` isn't "more" than `271`. An **embedding** is how we replace that meaningless ID with a **list of numbers (a vector)** positioned so that **similar things sit close together**. That's the whole idea.

> One-liner to say out loud: *"Embeddings map data into a high-dimensional vector space where semantic similarity becomes geometric closeness."*

---

## 1. What an embedding actually is

- An **embedding** is a token (or word, sentence, image…) represented as a **vector** — a fixed-length list of numbers.
- Typical length: **hundreds to thousands** of numbers (768, 1536, 3072, 4096…).
- The numbers aren't hand-written. They are **learned parameters** — tuned during training.
- The point of the numbers: **position in space = meaning.** Close vectors = similar meaning.

Example (illustrative values):

```
"dog"    → [ 0.21, -0.83,  0.04,  ...,  0.11 ]
"puppy"  → [ 0.19, -0.80,  0.07,  ...,  0.09 ]   ← very close to "dog"
"cat"    → [ 0.15, -0.60,  0.10,  ...,  0.05 ]   ← nearby (also a pet)
"car"    → [-0.70,  0.42, -0.55,  ..., -0.30 ]   ← far away (different concept)
```

**Mental model:** picture a giant **map of meaning**. Training scatters every token onto this map so that things used in similar ways end up as neighbours. "dog" and "puppy" are on the same street; "car" is in another city.

---

## 2. Why we need embeddings at all (the "why")

Computers can't do math on the word "dog." But they *can* do math on vectors. Once meaning is a vector, three superpowers unlock:

1. **Measure similarity** — "how close are these two vectors?" → tells you how related two pieces of text are (via **cosine similarity**, §8).
2. **Search by meaning, not keywords** — a query for "canine" finds a doc about "dogs" even with zero shared letters. (This is **semantic search**.)
3. **Feed meaning into the model** — embeddings are literally the **first layer** of an LLM: tokens → embeddings → attention → … So there's no "thinking" until text becomes vectors.

> Without embeddings you'd be stuck comparing raw IDs or matching exact strings — no notion of *meaning*, only *spelling*.

---

## 3. Where the numbers come from (how training generates them)

The surprising truth:

> **The embedding numbers start out completely random, and training slowly nudges them into meaningful positions. Nobody sets them by hand.**

Step by step:

1. **Random start.** Every token in the vocabulary gets a vector of random numbers. "dog" and "puppy" are in unrelated random spots. The model knows nothing.
2. **Give the model a prediction task.** The classic job: *predict a missing / next word from its neighbours.*
   ```
   "The ___ barked loudly at the mailman"
   ```
   It uses the current (random) embeddings to guess. Early guesses are garbage.
3. **Measure the error (loss).** Compare the guess to the real answer ("dog"). The gap is the **loss**.
4. **Adjust everything a tiny bit.** **Backpropagation** figures out how much each number contributed to the error; **gradient descent** nudges each number a small step in the direction that would have made the answer more correct — *including the embedding numbers themselves.*
5. **Repeat billions of times.** A pattern emerges automatically: tokens that appear in **similar contexts** get pushed toward **similar vectors**. "dog," "puppy," "hound" all show up near "barked," "leash," "vet" → their vectors drift together. **No one labelled them as similar — real text co-occurrence did all the work.**

> The linguistics one-liner behind all of this: **"You shall know a word by the company it keeps."** (J.R. Firth, 1957.)

**Key reframe:** embeddings aren't *designed*, they're *discovered*. They're a side-effect of getting good at predicting text.

---

## 4. Choosing the vector size (the "which / how big")

The vector length is called the **embedding dimension** (`d` or `d_model`). It is a **hyperparameter** — a design choice made **before training**, not something learned.

| Model type | Dimension |
|---|---|
| Classic (Word2Vec, GloVe) | 100–300 |
| BERT base | 768 |
| OpenAI `text-embedding-3-small` | 1536 |
| Large LLMs | 3072, 4096, 8192+ |

**The trade-off to explain in an interview:**

- **More dimensions** → more room to capture subtle nuance and fine distinctions. But: slower, more memory, needs more training data, higher overfitting risk.
- **Fewer dimensions** → faster and cheaper. But: less nuance; different meanings get "squished" together.

There's **no formula** — it's tuned like a knob: try a few sizes, benchmark quality vs. cost, pick the sweet spot. Convention + experimentation.

---

## 5. One big matrix, or many? (the structure)

### The embedding layer = ONE big matrix

It's a single 2D table, the **embedding matrix**:

```
                 dim1   dim2   dim3   ...  dim768
 token 0 "the"  [ 0.1  -0.4    0.9   ...   0.2 ]
 token 1 "dog"  [ 0.8   0.1   -0.3   ...   0.5 ]
 token 2 "cat"  [ 0.7   0.2   -0.2   ...   0.4 ]
 ...
 token N        [ ...                          ]

 Shape = (vocab_size  ×  embedding_dimension)
       = e.g. (50,000  ×  768)
```

- **Rows** = one per token in the vocabulary (50k tokens → 50k rows).
- **Columns** = the dimensions of the vector (768).

**How lookup works** — and this is the neat part: getting an embedding is just **picking the right row**. Token ID `1` → grab row 1. No calculation, pure array indexing. That's why it's fast.

```
"dog" → token ID 1 → row 1 → [0.8, 0.1, -0.3, ..., 0.5]
```

So for the **embedding step specifically: one matrix.**

### The WHOLE model = many matrices

The embedding matrix is just the **front door**. After tokens become vectors, they flow through the rest of the network — attention layers, feed-forward layers — and **each of those has its own matrices** (many per layer). A large LLM has *thousands* of matrices, billions of parameters total.

> Clean phrasing: *"The embedding layer is a single `vocab × dimension` matrix acting as a lookup table. The rest of the transformer is a deep stack of additional weight matrices that transform those embeddings."*

---

## 6. Two flavours: static vs contextual embeddings

A distinction worth saying out loud — it separates old embeddings from modern ones.

1. **Static / token embeddings** — the raw lookup row. "dog" is the **same vector every time**, no matter the sentence. (This is the matrix in §5.)
2. **Contextual embeddings** — the vector **after** it passes through the attention layers, so the same word gets a **different** vector depending on context.

```
Static:      "river bank"  → bank = [0.2, 0.7, ...]   ← SAME
             "bank account"→ bank = [0.2, 0.7, ...]   ← SAME  (can't tell them apart)

Contextual:  "river bank"  → bank = [0.8, -0.1, ...]  ← DIFFERENT ✅
             "bank account"→ bank = [-0.3, 0.6, ...]  ← DIFFERENT ✅
```

The mechanism that makes embeddings contextual is **attention** — the next rung on the roadmap. When people say "embeddings from an LLM," they usually mean the **contextual** ones.

---

## 7. Position embeddings (telling the model WHERE each word sits)

> This rung sits **between** the embedding lookup (§5) and attention. It fixes a blind spot that only becomes visible once you know how attention works — so it's the natural bridge to the next doc.

### 7.1 The problem — attention is "order-blind"

Peek ahead at what attention does: every word looks at every other word, scores how relevant each is, and blends them in. Look closely and you'll notice something surprising — **nowhere in that process does order matter.** Attention sees a *bag* of words, not a *sequence*. Shuffle the words and each one still sends the same query and offers the same key, so the scores come out the same.

But order is the whole game in language:

```
"The dog bit the man."   ← someone needs a bandage
"The man bit the dog."   ← someone needs therapy
```

Same words, same bag → **to raw attention these two sentences look identical.** Clearly broken.

> The problem: the embedding row tells the model *what* each word is, but **nothing tells it *where* the word sits.** (Old RNN models read left-to-right, so order came for free. The price of attention's "look at everything at once" superpower is that it throws order away — we have to add it back by hand.)

### 7.2 The fix — add a second vector for position

The idea is simple: alongside the **word embedding** (what the word means), build a **position embedding** (where the word sits: 1st, 2nd, 3rd…) of the **exact same length**, and **add them together element-by-element**. The sum is the single vector that flows into attention.

```
                                  dim1   dim2   dim3   dim4
word embedding of "dog"        [  0.9,   0.1,  -0.5,   0.3 ]
position embedding of slot #2  [  0.2,  -0.4,   0.7,   0.1 ]
                                  --------------------------   (add straight down)
final vector for this token    [  1.1,  -0.3,   0.2,   0.4 ]
```

Now "dog" in slot 2 and "dog" in slot 4 enter the model as **different vectors** — order is stamped right into the numbers, and "dog bit man" ≠ "man bit dog" again.

> Cinema analogy: the word embedding says *who the person is*; the position embedding says *which seat they're in*. Same person in a different seat is a different situation.

### 7.3 Where does the position embedding "live"?

Not in an extra slot or a separate box — it gets **mixed into the same numbers** by the addition. Before that moment, it comes from its **own lookup table**, sitting right next to the word table:

- **Word-embedding table** — one row per vocabulary token (§5). "dog" → its vector.
- **Position-embedding table** — one row per **slot**. position 1 → a vector, position 2 → a vector, …

For each token the model grabs the matching **word row** *and* the matching **position row**, adds them, and passes the result on. So position embeddings *exist* as their own table; they only **merge** with the word vector at the instant of addition. After that there's just one vector carrying both "I am dog" and "I am in position 2."

### 7.4 The three flavours (how the position vector is built)

1. **Sinusoidal (the original, 2017).** Each position gets a fingerprint made of **sine & cosine waves at different frequencies**. Intuition: like **binary counting but smooth** — some dimensions wiggle fast, some slow, and the pattern across all of them uniquely identifies each slot. Bonus: the model can read off *relative* distances, and it extends to sentences longer than any seen in training.
2. **Learned.** Skip the formula — just let the model **learn** a vector for "position 1," "position 2," … the same way it learns word vectors. Simple, effective (BERT, GPT-2). Downside: only knows positions up to the max length it trained on.
3. **RoPE — Rotary Position Embedding (the modern favourite).** Used by most current LLMs (LLaMA, etc.). Instead of *adding* a position vector, it **rotates** each word's query and key by an angle based on its position — so when two words interact in attention, the math automatically depends on **how far apart they are**. No position table at all, and it scales gracefully to huge context windows.

> Keep the intuition, skip the trig: *"one vector says what, another says where; classic models add them, modern ones (RoPE) bake position in as a rotation."*

### 7.5 Does this happen for every prompt? (yes — freshly, every time)

Separate two things:

- **The tables are built once during training, then frozen.** The word-embedding table and position-embedding table are learned over months and never change at chat time. They're just fixed reference books.
- **The lookups, additions, and attention run fresh on every prompt.** Each time you hit enter: your text → tokens → each token looks up its word vector + position vector → add → attention over *your* words → predict. Same prompt twice = the whole computation redone from scratch both times.

> One-liner: **the "knowledge" (tables + weights) is baked once and reused; the "thinking" (look up → add positions → attention → predict) happens live, per prompt, every time.**

And position is assigned **relative to the current prompt** — the first token of *this* prompt is always "position 1," regardless of earlier messages. That's also *why models have a **context window** limit*: the position table only has so many rows (e.g. up to 128k), so there's a hard cap on how many positions it can label.

### The corrected pipeline

```
tokens → word embeddings → + position embeddings → attention → …
```

Position embeddings are the quiet step that makes attention actually usable on real, ordered language — and the direct on-ramp to the next doc.

---

## 8. Comparing embeddings: cosine similarity (the "how do we measure closeness")

To compare two finished vectors we measure the **angle between them**, not the straight-line distance.

```
cosine_similarity(A, B) = (A · B) / (|A| × |B|)

  same direction      → score ≈  1   (very similar meaning)
  perpendicular       → score ≈  0   (unrelated)
  opposite direction  → score ≈ -1   (opposite meaning)
```

**Why angle, not distance?** Angle ignores vector *length* (magnitude) and focuses purely on *direction*, which is where meaning lives. Two docs about dogs point the same way even if one is longer/"stronger."

Worked mini-example — semantic search:

```
Query:  "affordable laptop"        → [0.4, -0.1, 0.9, ...]

Docs:
  "cheap notebook computer"        → [0.39, -0.08, 0.88, ...]  → cos ≈ 0.99  ✅ top hit
  "budget-friendly PC"             → [0.41, -0.12, 0.85, ...]  → cos ≈ 0.97  ✅
  "luxury sports car"              → [-0.7, 0.6, 0.1, ...]     → cos ≈ 0.05  ❌
```

You embed the query, embed every doc, compute cosine similarity, sort, return the top matches. **That's semantic search in ~5 lines of real code.**

---

## 9. Types of embeddings (the landscape — Word2Vec, BERT, "semantic")

Important clarification first: these names are **not the same kind of label**. It's a mix of *specific algorithms*, *specific models*, and *category words*. Untangled:

| Name | What it actually is |
|---|---|
| **Word2Vec, GloVe, FastText** | Specific *older algorithms* that make embeddings |
| **BERT, GPT** | Specific *modern models* (transformers) that make embeddings |
| **"Semantic" / "sentence" embeddings** | A *category by purpose*, not one specific model |

The clearest way to hold it is as an **evolution timeline**:

### Generation 1 — Static word embeddings (2013–2014)
One word = one fixed vector, forever. **No context awareness.**
- **Word2Vec** (Google, 2013) — trained by the predict-the-context task. Two flavours: **CBOW** (predict a word from neighbours) and **Skip-gram** (predict neighbours from a word). Famous for `king − man + woman ≈ queen`.
- **GloVe** (Stanford) — same goal, but crunches **global co-occurrence counts** across the whole corpus instead of a sliding window.
- **FastText** (Facebook) — embeds **character chunks**, so it survives typos and unseen words.
- *Limitation:* can't tell "river bank" from "bank account" (see §6).

### Generation 2 — Contextual embeddings (2018–now)
The vector is **computed fresh per sentence**, so context changes it.
- **BERT** (Google, 2018) — reads the sentence in **both directions** at once ("B" = Bidirectional). Great for *understanding*: search, classification, Q&A. BERT-style models dominate search embeddings.
- **GPT** — reads left-to-right (built to *generate*), but its internal representations are also contextual.
- The mechanism behind both: **attention**.

### The category word — "Semantic" / "Sentence" embeddings
- **"Semantic"** isn't a rival algorithm — *all* the above capture meaning (semantics). Saying "semantic embeddings" usually just means "embeddings used for meaning-based similarity/search" (vs. old keyword matching).
- **Sentence embeddings** are more specific: **one vector for a whole sentence/paragraph**, not per word. This is what **search and RAG** need (compare whole chunks).
  - **Sentence-BERT (SBERT)** — BERT fine-tuned to output one good sentence vector.
  - **OpenAI `text-embedding-3`, Cohere Embed, `nomic-embed`** — modern production models; **these are what you actually call in a RAG pipeline.**

### The one table that ties it together

| Type | Examples | Context-aware? | Unit | Use it for |
|---|---|---|---|---|
| **Static word** | Word2Vec, GloVe, FastText | ❌ No | one word | learning the concept; light tasks |
| **Contextual** | BERT, GPT, ELMo | ✅ Yes | word-in-sentence | understanding, classification |
| **Sentence / semantic** | SBERT, OpenAI `text-embedding-3`, Cohere | ✅ Yes | whole sentence/doc | **semantic search, RAG** |

**Evolution in one breath:** *static → contextual → sentence-level*, each answering a bigger question: "capture meaning" → "capture meaning **in context**" → "capture meaning of a **whole passage**."

---

## 10. How embeddings are used in industry (the "which use-cases")

1. **Semantic search** — search by meaning, not keywords. "How do I reset my password?" matches a doc titled "Account recovery steps" with no shared words.
2. **RAG (Retrieval-Augmented Generation)** — *the big one.* Embed your private documents, store the vectors in a **vector database**, and at query time retrieve the most relevant chunks to feed the LLM as context. This is how you make an LLM "know" your data **without retraining it.**
3. **Recommendations / clustering / classification** — group similar support tickets, "users who liked this also liked…", detect near-duplicates.
4. **The input layer of every LLM** — before any reasoning, tokens become embeddings. Step one, always.

**Vector databases** (where embeddings live for fast similarity search): Pinecone, Weaviate, pgvector (Postgres), Chroma, Milvus.

---

## 11. How you actually generate embeddings in code

You don't build the map — you call an **embedding model**:

```python
from openai import OpenAI
client = OpenAI()

resp = client.embeddings.create(
    model="text-embedding-3-small",
    input="affordable laptop",
)
vector = resp.data[0].embedding   # e.g. a list of 1536 floats
```

Popular embedding models: OpenAI `text-embedding-3`, Cohere Embed, and open-source `sentence-transformers` (BERT-based), `nomic-embed`.

---

## 12. Limitations & gotchas

- **Dimension mismatch** — vectors from different models aren't comparable. You must embed your **query and documents with the same model.**
- **Static blindness** — old (Word2Vec/GloVe) embeddings can't disambiguate polysemy ("bank"). Use contextual/sentence models for real work.
- **Chunking matters for RAG** — too-big chunks blur meaning into one vague vector; too-small chunks lose context. Chunk size/overlap is a real tuning knob.
- **Cost & storage** — bigger dimensions = more storage and slower search across millions of vectors. Some models support **shortening dimensions** (e.g. Matryoshka embeddings) to trade a little accuracy for speed.
- **Not human-readable** — you can't eyeball a 1536-number vector and know what it means; you only ever compare it to other vectors.
- **Meaning ≠ truth** — embeddings capture *similarity of meaning*, not factual correctness. Two sentences can be close and both wrong.

---

## 13. Quick glossary

| Term | Plain meaning |
|------|---------------|
| **Embedding** | A vector of numbers representing a token/word/sentence's meaning |
| **Vector** | A fixed-length list of numbers (the embedding itself) |
| **Embedding dimension (`d_model`)** | How many numbers are in each vector (e.g. 768) |
| **Embedding matrix** | The `vocab_size × dimension` lookup table of all token vectors |
| **Vocabulary** | The fixed set of all tokens the model knows (defines the matrix's rows) |
| **Hyperparameter** | A setting chosen before training (like the vector size), not learned |
| **Backpropagation** | Working backwards to find how much each number caused the error |
| **Gradient descent** | Nudging each number a small step to reduce the error; repeat |
| **Position embedding** | A vector encoding *where* a token sits (slot 1, 2, 3…), added to its word embedding so attention can tell order |
| **Sinusoidal encoding** | Original position scheme using sine/cosine waves of different frequencies as a per-slot fingerprint |
| **RoPE (Rotary Position Embedding)** | Modern scheme that encodes position by *rotating* query/key vectors; scales well to long contexts |
| **Context window** | Max number of tokens (positions) a model can handle at once, e.g. 128k |
| **Static embedding** | Fixed vector per word, ignores context (Word2Vec/GloVe) |
| **Contextual embedding** | Vector computed per sentence, context-aware (BERT/GPT) |
| **Sentence embedding** | One vector for a whole sentence/passage (SBERT, text-embedding-3) |
| **Cosine similarity** | Closeness of two vectors measured by angle; ranges −1…1 |
| **Semantic search** | Search by meaning (vector closeness) instead of keywords |
| **RAG** | Retrieval-Augmented Generation — retrieve relevant chunks, feed them to the LLM |
| **Vector database** | Store built to hold embeddings and do fast similarity search |

---

## 14. FAQ — the exact questions from this session

**Q: What exactly is an embedding and why do we need it?**
It's a token turned into a vector of numbers, positioned so similar meanings are close together. We need it because computers can only do math on numbers, not words — and this particular arrangement lets us measure similarity, search by meaning, and feed meaning into the model.

**Q: How do the numbers get generated during training?**
They start **random**, then a prediction task (guess the missing/next word) produces an error, and backpropagation + gradient descent nudge every number — embeddings included — to reduce that error. Over billions of examples, words used in similar contexts drift to similar vectors. The numbers are *learned*, never hand-set.

**Q: When do we decide the size of the vector?**
Before training. The embedding dimension is a **hyperparameter** you choose (commonly 768–3072). More dimensions = more nuance but more cost; fewer = cheaper but coarser. It's tuned by experiment + convention, no formula.

**Q: Is it one very big matrix, or multiple matrices?**
The **embedding layer is one matrix** of shape `vocab_size × dimension`, used as a lookup table (token ID → row). But the **whole model** is thousands of matrices — the embedding matrix is just the front door before the attention/feed-forward layers.

**Q: What exactly is "vocab"?**
The vocabulary — the fixed, numbered list of every token the model knows (built once by the tokenizer, then frozen). Vocab size = number of entries = number of **rows** in the embedding matrix, because every token maps to exactly one vector. Modern models use subword vocabularies (~50–100k) so any word can be built from pieces.

**Q: What are the embedding types — Word2Vec, BERT, "semantic"?**
They're different kinds of label. Word2Vec/GloVe/FastText are older **static** algorithms (one fixed vector per word). BERT/GPT are modern **contextual** models (vector depends on the sentence). "Semantic"/"sentence" embeddings describe the **purpose** — one vector per whole passage for meaning-based search — produced by models like SBERT and OpenAI `text-embedding-3`. Evolution: static → contextual → sentence-level.

**Q: Why do we need position embeddings?**
Because attention is **order-blind** — it treats the sentence as a bag of words, so "dog bit man" and "man bit dog" look identical to it. A position embedding stamps *where* each token sits, restoring order.

**Q: If one vector holds the word embedding, where does the position embedding exist?**
In its **own lookup table** next to the word table. For each token the model grabs the word row *and* the position row and **adds them element-by-element** (same length). Position info doesn't sit in an extra slot — it gets mixed into the same numbers, leaving one vector that carries both "what" and "where." (Modern RoPE has no position table — it applies position as a rotation instead.)

**Q: Does this happen for every prompt?**
Yes, freshly every time. The **tables/weights are frozen after training** (reused, never changed at chat time), but the **lookups → add positions → attention → predict** all run live on each prompt. Position also restarts at 1 per prompt, which is why the **context window** has a hard limit — the position table has a finite number of rows.

---

## 15. What's next (the following rungs)

- **Attention** — the mechanism that turns context-*free* embeddings into context-*aware* ones (how the same word learns which sentence it's in). The heart of the transformer, and the direct sequel to §6.
- Then, on the applied side: **building a RAG pipeline** (chunking → embed → vector DB → retrieve → prompt), and **choosing an embedding model** for a real project (dimensions vs. cost vs. speed).

---

*Notes generated from a first-principles walkthrough. Vector values and token IDs above are illustrative, not real model outputs. Continues from Part 1 — Tokenization.*
