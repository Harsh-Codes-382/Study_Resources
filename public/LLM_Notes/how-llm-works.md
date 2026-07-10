# How LLM Works

### Part 1 — Tokenization (and the bridge to Embeddings)

> Study notes. Goal of this rung: understand how models work well enough that nothing downstream feels like magic. This part is about **how your text becomes numbers a model can process**.

---

## 0. The big picture in one line

When you send a prompt, this happens before the model "thinks":

```
"I love AI"
   → tokenizer splits it into pieces        →  ["I", "·love", "·AI"]
   → each piece is mapped to an integer ID   →  [271, 1842, 9552]
   → each ID looks up a vector (embedding)   →  3 rows of numbers
   → that sequence of vectors enters the model
```

The model itself **never sees text** — only integers, then vectors. Everything in this doc is about that conversion.

---

## 1. What a token actually is

- A **token** is the unit of text a model reads and writes.
- It is **not a word and not a character** — it's usually a *subword* (a chunk in between).
- Common words are often **one token**; rarer words get **split into pieces**.
- The model works on **integers (token IDs)**, not on the text itself.

**Mental model (for a developer):** tokenization is an *encoding layer*, like UTF-8 maps bytes ↔ characters. Here it maps **text ↔ token IDs** using a fixed lookup table — except the mapping is *learned* and tuned for compression.

Example — `"Understanding tokenization isn't magic."` splits into 8 tokens:

| token | `Under` | `standing` | `·token` | `ization` | `·isn` | `'t` | `·magic` | `.` |
|-------|--------|-----------|---------|----------|-------|-----|---------|-----|
| id (illustrative) | 8060 | 25009 | 4037 | 2065 | 5847 | 956 | 11204 | 13 |

> The `·` marks a **leading space**. Tokenizers glue the space *before* a word onto the token, so `·magic` and `magic` are different tokens. (This is why sloppy formatting quietly costs extra tokens.)

---

## 2. Why tokens — and not just words or characters?

Two naive designs, both bad:

- **Characters only:** tiny vocabulary, but sequences get huge (`internationalization` = 20 steps). Model wastes capacity relearning spelling, and long sequences cost more and run slower.
- **Whole words only:** short sequences, but the vocabulary explodes (millions of forms: plurals, typos, names, code identifiers). And anything unseen (new word, URL, another language) falls into a useless "unknown" bucket.

**Subword tokenization is the compromise** — a fixed vocabulary (~50k–200k entries) where frequent things are cheap and rare things fall back to smaller pieces. **Nothing is ever truly out-of-vocabulary**, because worst case a string drops all the way down to raw bytes.

---

## 3. How the vocabulary is built (BPE) — happens ONCE, during training

The dominant algorithm is **BPE (Byte Pair Encoding)**. Think of it as a **learned compression scheme**:

1. Start with text broken into the smallest units — individual bytes/characters.
2. Scan a huge corpus, find the **most frequent adjacent pair**, and merge it into a new token. (`t`+`h` → `th`)
3. Repeat thousands of times. (`th`+`e` → `the`, `in`+`g` → `ing`, …)
4. Stop at a target vocabulary size (e.g. 100,000).

**Output:** two frozen artifacts — a **vocabulary** and an **ordered list of merge rules**. These are shipped with the model and never change at runtime.

---

## 4. How your prompt is tokenized — happens on EVERY request

This is the runtime flow. **It splits down to bytes, then glues back up** using the frozen rules:

1. **Raw prompt** — just a string.
2. **Pre-tokenize with a regex** → word-ish chunks, split on spaces & punctuation (the space attaches to the next word). *This is a pattern split, not a table lookup.*
3. **Break each chunk into bytes** — the smallest starting units.
4. **Merge loop (BPE):** look at every neighbor pair, look each pair up in the **merge-rules table** to get its rank, glue the **lowest-rank** pair, repeat until nothing else can be glued.
5. **Convert each final piece to a number** via the **vocabulary table** (`piece → ID`).
6. **Result:** the integer array handed to the model.

### The two lookups (this is the key clarification)

There are **two different lookups, in two different tables, at two stages:**

| | Table | Maps | When |
|---|-------|------|------|
| **Lookup 1** | merge rules (`merges.txt`) | `pair → rank` | while **gluing** pieces together |
| **Lookup 2** | vocabulary (`vocab.json`) | `piece → integer ID` | to turn final pieces into **numbers** |

So — "does it look up a table to glue words back after splitting into characters?" **Yes**: it looks up each neighbor **pair** in the merge-rules table (not the whole word). Then, separately, it looks up each final **piece** in the vocab table to get the ID.

> **Caching note:** real tokenizers cache `chunk → tokens`. The first time `·love` appears, the full merge loop runs; after that it's a cache hit. So common words *behave* like a one-shot word lookup — but that's a speed optimization on top of the real per-pair algorithm.

---

## 5. What "deterministic" means

**Same input → exact same output, every time. No randomness, no guessing.** Like a *pure function* or a *hash function* in code.

Why it's forced (not a choice): every merge rule has a **unique rank**, so two pairs can never tie. At each step there's exactly one correct pair to merge — like following numbered recipe steps where you always do the lowest number first.

> Contrast for later: tokenization is **deterministic**. Text *generation* (temperature/sampling) is deliberately **random**. Don't blur the two.

**Reframe that makes it click:** the tokenizer never hunts for *where to split*. It only ever **glues pieces together**. Everything starts maximally split (each character separate); merging *reduces* the pieces. The final "split points" are simply wherever gluing stopped because no rule could join two neighbors.

---

## 6. BPE vs its cousins (so you're not misled later)

BPE is dominant (GPT, Claude), but it's not the only scheme, and they can produce **different** tokenizations:

- **BPE** — glues by **rank** (lowest-rank pair first). *"Which pair has the best-ranked rule?"*
- **WordPiece** (BERT) — greedy **longest-match** against the vocab. *"What's the biggest known piece that fits here?"*
- **Unigram** (some SentencePiece) — considers multiple candidate segmentations and picks the **most probable** one.

**Proof BPE ≠ longest-match** — rulebook has only `#0: b+c→bc` and `#1: a+b→ab`, tokenizing `"abc"`:
- **BPE:** merges `b+c` first (rank 0) → `[a, bc]`
- **Longest-match:** grabs `ab` first (it's longer) → `[ab, c]`

Same string, same vocab, different result. All three schemes *do* use lookups — just of different things.

---

## 7. Where do these tables live? (They are NOT inside the LLM)

Correct intuition: **tokenization happens before the model, and the tables live outside the neural network.**

- The tokenizer is a **separate component** — small data files + a small library, running on **CPU**, before the model.
  - `merges.txt` — the merge rules. Each line is one rule; **line order = rank**. Looks like:
    ```
    #version: 0.2
    t h
    th e
    in g
    ```
  - `vocab.json` — the `piece → ID` map: `{ "the": 262, "·love": 1842, ... }`
  - Together only a **few MB** (tiny next to the model's many GB of weights).
- **Where it runs:**
  - *Via an API:* on the provider's servers as a preprocessing step (you never see it).
  - *Local model:* files download beside the weights, loaded by `tiktoken` / `tokenizers` / `sentencepiece`.
  - *Standalone:* you can tokenize on a laptop with **no model at all** — that's how token-counter websites work. (Cleanest proof the tokenizer is separable from the LLM.)
- **But they're a matched pair:** the model was trained on IDs from *this exact* tokenizer, so vocab size defines the model's embedding/output dimensions. Swap the tokenizer and the same integers mean different things → garbage output. Separate components, always shipped together.

**Developer analogy:** the tokenizer is a **codec / preprocessing middleware** (config + data) that runs before the "real" service (the trained model behind it).

---

## 8. Token IDs → Embeddings (the bridge into the model)

After IDs are produced, each ID is used as a **row index into the embedding matrix**, and the row it pulls out is that token's **vector**.

```
embedding = embedding_matrix[token_id]     // just array indexing: int → float[]
```

- The **embedding matrix** has shape `[vocab_size × d_model]` (e.g. `d_model ≈ 4096`).
- A prompt of `N` tokens → `N` IDs → `N` vectors → a matrix of shape `[N × d_model]`.
- So "the IDs map to an array of embedded vectors" — **yes, exactly.**

**Three things to keep straight:**

1. **This is a different table from the tokenizer's, in a different place.**
   - `vocab.json` (tokenizer): `string → ID`. Fixed data, CPU, *outside* the model.
   - embedding matrix (model): `ID → vector`. **Learned weights, GPU, inside the model.**
2. **The first vector is context-free.** `·love` starts as the *same* vector every time, regardless of sentence. It's raw material, not "the meaning." The **attention layers** later mix in context.
3. **Position is added right after.** Attention has no built-in order sense, so a **positional encoding** is added: layer-1 input ≈ `token embedding + positional embedding`. This is how the model tells "dog bites man" from "man bites dog."

---

## 9. How tokens are used in the industry today

Tokens are the **unit of account** for the whole stack:

- **Pricing** — per token, with separate rates for **input** and **output** (output usually costs more).
- **Context window** — the model's working memory, measured in tokens (e.g. 200k). Input + output must fit inside it. It's a hard ceiling; RAG, chunking, and summarization exist to work around it.
- **Rate limits** — often **tokens-per-minute**, not requests.
- **Latency** — splits in two:
  - *Prefill* (reading your input): parallel, fast.
  - *Decode* (generating output): **one token at a time**, so long responses are literally slower.
  - This is why "time to first token" and "total time" are tracked separately.

**Rule of thumb (English):** ~**4 characters ≈ 1 token**, or ~**0.75 words per token** → 1,000 tokens ≈ 750 words.

---

## 10. Limitations & gotchas

- **Character-level blindness** — the model sees `strawberry` as a couple of tokens, not letters, so "how many r's?" and string-reversal are genuinely hard.
- **Language inequity** — English compresses well; other scripts (e.g. Devanagari/Hindi) can take **2–3× more tokens** for the same meaning → costs more, fills context faster.
- **Whitespace & formatting cost tokens** — JSON, indentation, and markdown tables all eat budget.
- **Numbers tokenize oddly** — `12345` might split into `123` + `45`, part of why raw arithmetic is shaky.
- **Code fragments** — identifiers like `getUserById` split into several tokens; matters when pasting large files.

---

## 11. Quick glossary

| Term | Plain meaning |
|------|---------------|
| **Token** | A subword chunk of text; the unit the model reads/writes |
| **Token ID** | The integer a token maps to (a row index) |
| **Vocabulary** | The fixed table of all possible tokens (`piece → ID`) |
| **BPE** | Byte Pair Encoding — build vocab by merging frequent pairs; encode by replaying merges by rank |
| **Merge rules** | Ordered list of "glue this pair" rules; line order = priority (rank) |
| **Pre-tokenization** | Regex split of raw text into word-ish chunks before merging |
| **Deterministic** | Same input → same output, always; no randomness |
| **Embedding** | The vector a token ID maps to; the model's starting representation |
| **d_model** | Length of each embedding vector (e.g. 4096) |
| **Context window** | Max tokens (input + output) the model can hold at once |
| **Prefill / Decode** | Reading input (parallel) / generating output (one token at a time) |

---

## 12. FAQ — the exact questions from this session

**Q: How does the tokenizer decide how to split a word, or whether to split at all?**
It doesn't decide split points — it glues. Start from characters, repeatedly merge the lowest-rank pair that has a rule, stop when none apply. Whatever pieces remain are the tokens. Whether a word stays whole is just an emergent outcome of which merges exist.

**Q: Does the model do the splitting? Does it look up each word in a dictionary?**
No. The tokenizer is a separate, deterministic step *before* the model. And it doesn't look up whole words — it looks up **pairs** (BPE). WordPiece is the scheme that does whole-piece longest-match.

**Q: What does "deterministic" mean, and how does it decide where to merge?**
Same input → same output, no randomness. It decides by **rank**: every rule has a unique priority number; the lowest-rank applicable pair always wins, so there's never a tie or a guess.

**Q: There must be *something* to look up when gluing two characters — right?**
Yes, correct. Gluing does a lookup of each **pair** against the merge-rules table (`pair → rank`). The only wrong idea was calling it a *whole-word* lookup or a search over all splits.

**Q: Isn't "greedy longest-match against the dictionary" how it works at runtime?**
That's **WordPiece**, not BPE. BPE (GPT/Claude) replays merges by rank. They agree on common words but differ on rarer strings (see the `abc` example).

**Q: Where does the merge table exist? It's not inside the LLM, right?**
Right. It's small data files (`merges.txt`, `vocab.json`) on **CPU**, *outside* the neural network — shipped alongside the model but separate from it. The LLM only ever receives integers.

**Q: After the tokenizer produces IDs, do they map to an array of embedded vectors?**
Yes. Each ID indexes a row of the learned **embedding matrix**; `N` tokens become an `[N × d_model]` matrix of vectors, which (plus positional info) enters the transformer.

---

## 13. What's next (the following rungs)

- **Attention** — how context-free vectors become context-*aware* (how `·love` learns which sentence it's in). This is the heart of the transformer.
- Then: **context windows** in depth, **temperature & sampling** (the random part), **streaming**, and the cost/latency/limit levers.

---

*Notes generated from a first-principles walkthrough. IDs and vector values above are illustrative, not real tokenizer outputs.*
