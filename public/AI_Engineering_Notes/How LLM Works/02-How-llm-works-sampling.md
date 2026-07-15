## How LLM Works 

## Part 2 — Sampling (how the model turns probabilities into words) 

Study notes, companion to Part 1 — Tokenization. Recap in one line: tokenization turns text into token IDs, IDs look up embedding vectors, the model turns vectors into a probability distribution over the next token. **Sampling is how we pick one token from that distribution — and then repeat.** 

## 0. The generation loop (the big picture) 

Text generation is a loop. The model runs once per token: it produces a probability distribution, a sampler draws one token ID from it, that ID is appended to the sequence, and the model runs again with the longer context. This repeats until a stop token is drawn or a length limit is hit. 

_The autoregressive generation loop. The random draw happens in the sampler — outside the network._ 

## 1. What sampling exactly is 

At each step you are holding a probability distribution — e.g. mat 61%, sofa 22%, roof 8%, … across ~100k tokens. **Sampling is drawing ONE token ID out of that distribution, using the probabilities as the odds.** 

It is a weighted dice roll: a random number is generated, and the bigger a token's probability, the more likely it is chosen. The output of one sample is a single integer — one token ID. One draw = one token. 

**Key correction** Sampling does NOT simply pick the "best" (highest-probability) candidate. Always picking the top 

token is a specific strategy called **greedy decoding** (temperature → 0). Real sampling deliberately picks lower-ranked but plausible tokens sometimes — that controlled deviation is what keeps text natural instead of flat and looping. 

## 2. Who does the sampling 

**Not the model.** The neural network's whole job is: sequence of vectors in → probability distribution out. That is its finish line. It never picks a token and contains no randomness. 

Three separate components (note the parallel to the tokenizer): 

- **Tokenizer** — separate code before the model. Deterministic. Turns text ↔ token IDs. 

- **The model / network** — a pure function: same IDs in → same distribution out. No randomness, no looping, no choosing inside it. 

- **The sampler + decoding loop** — separate code after the model. Applies temperature/top-p, does the weighted draw, and runs the loop. All randomness and all "choosing" happen here. 

**Token IDs live at both ends:** going in, ID → embedding vector; coming out, the model's final vector is multiplied by an output matrix (the "unembedding" / LM head) to make one logit per token → softmax → distribution → the sampler draws one ID. That ID then loops back in as the next input. 

## 3. Why we need sampling 

**Greedy decoding** (always take the top token) is simple and deterministic but produces flat, repetitive text and falls into loops ("I think that I think that…"). The reason: the most likely token at each step does not add up to the most natural sentence. 

So we add controlled randomness. That introduces a dial with a tradeoff: 

- too greedy → boring, repetitive, robotic 

- too random → incoherent, off-topic, nonsense 

Every strategy below is a knob for sitting somewhere sensible on that spectrum. 

## 4. What the model outputs (logits → softmax) 

The model's final vector is turned into **logits** — one raw score for every token in the vocabulary — via the output matrix. A **softmax** then converts those scores into probabilities that sum to 1. That probability distribution is the input to sampling. 

## 5. Temperature — reshape before you pick 

Temperature is the master dial. Before softmax, every logit is divided by a number T: 

|**Temperature**|**Efect on the distributon**|**Feel**|
|---|---|---|
|T < 1|sharpens — top token dominates|safer, more repettve|
|T = 1|the model's raw distributon|unchanged|
|T > 1|fatens — mass spreads to unlikely tokens|diverse, riskier|
|T → 0|collapses to the single top token|greedy / deterministc|
|T → ∞<br>|approaches picking uniformly at random<br>|chaos<br>|



**Limitation:** temperature rescales everything but never removes the bad long tail — even at high T, garbage tokens keep a nonzero chance. That is why we pair it with a truncation strategy. 

## 6. Truncation — cut the tail (top-k, top-p, min-p) 

- **Top-k:** keep only the k highest-probability tokens, discard the rest, renormalize, sample. Simple, but k is a fixed count — clumsy when the model is very confident vs very unsure. 

- **Top-p (nucleus):** keep the smallest set of tokens whose probabilities add up to p (e.g. 0.9), then sample. The count adapts to the shape of the distribution — few when confident, many when unsure. The most common default. 

- **min-p:** keep any token with at least some fraction (e.g. 10%) of the top token's probability. A confidence-relative floor; often more robust at higher temperatures. 

## **Same distribution, different cutoffs** 

Given probs 42 / 20 / 13 / 9 / 6 / 4 / 3 / 3 (%): **top-k = 3** keeps exactly 3 tokens; **top-p = 0.9** keeps 5 (because 42+20+13+9+6 = 90%). On a peakier distribution, top-p would keep fewer — that adaptivity is the point. 

## 7. Penalties — fighting repetition directly 

Separate from truncation, these edit the logits based on what has already been generated: 

- **Presence penalty** — flat reduction for any token that has appeared at all (nudges toward new topics). 

- **Frequency penalty** — reduction that grows with how often a token has appeared (brake on overused words). 

- **Repetition penalty** — a multiplicative version of the same idea. 

They let you reduce looping without cranking temperature (which would add unwanted randomness elsewhere). 

## 8. Beam search — why chat models mostly skip it 

Beam search keeps the N most probable whole sequences alive and expands them in parallel, choosing the best full path at the end. Great for "one correct answer" tasks like translation, but it makes open- 

ended chat sound bland and repetitive, and it is expensive. Modern chat LLMs use temperature + topp/top-k sampling instead. 

## 9. How they stack (order per step) 

**penalties adjust logits** → **temperature rescales** → **top-k / top-p / min-p truncates** →  renormalize  → **sample one token** .  Then the chosen token is appended and the whole loop repeats for the next position. 

## 10. Practical settings (a starting map) 

|**Goal**|**temperature**|**top-p**|**Why**|
|---|---|---|---|
|Facts, extracton, classifcaton|0 – 0.3|1.0|want the safe, consistent token|
|Code|0 – 0.2|1.0|correctness over variety|
|General chat / balanced|~0.7|~0.9|natural but controlled|
|Creatve writng, brainstorming<br>|0.9 – 1.2<br>|0.9 – 0.95<br>|reward variety and surprise<br>|



**Rule of thumb:** temperature = how bold; top-p = how wide a net. Tune one at a time. Most APIs expose temperature, top_p, top_k, and the penalty parameters directly. 

## 11. Determinism caveat 

- Generation is random only because we choose to sample — greedy / temperature=0 is (near-)deterministic by design. 

- Even temperature=0 is not always bit-for-bit reproducible in production: floating-point rounding, GPU batching, and mixture-of-experts routing can break exact ties differently between runs. "Greedy = perfectly reproducible" is the intent, not a guarantee. 

## 12. FAQ — questions from this session 

## **Q:  What do we say exactly when we do sampling?** 

We draw one token ID from the model's probability distribution, weighted by the probabilities (a weighted dice roll). The output is a single integer — one token per step. 

## **Q:  Who does the sampling?** 

The decoding code wrapped around the model — not the neural network. The model only produces the distribution; the sampler rolls the dice. 

## **Q:  Do we sample to choose the best candidate?** 

Not necessarily. Sampling picks one candidate weighted by likelihood — usually the top one, but intentionally not always. "Always the best" is greedy decoding, the flat/looping behavior we want to avoid. 

## **Q:  After sampling, what happens?** 

The chosen token ID is appended to the input sequence, embedded, and fed back into the model so it can predict the next token with the longer context. This is the autoregressive loop. 

## 13. One-line summary 

## **The whole picture** 

model emits a distribution  →  penalties + temperature reshape it  →  top-k/top-p/min-p trim the tail →  the sampler draws ONE token ID  →  append it and loop. The network is a deterministic pure function; all the randomness and choosing live in the sampler around it. 

_Notes generated from a first-principles walkthrough. Probabilities and IDs are illustrative. Next lever: context windows._ 

