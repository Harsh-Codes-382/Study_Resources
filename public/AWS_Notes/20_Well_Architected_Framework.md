# AWS Well-Architected Framework

> **Exam:** AWS Certified Cloud Practitioner (CLF-C02)
> **Topic 20:** **The AWS Well-Architected Framework (WAF)** — the **whitepaper of best practices** AWS publishes to help you **design, build and run** secure, reliable, efficient, cost-effective and sustainable workloads. The exam loves to make you **match a scenario to the right pillar** and to distinguish the **Framework** (the guidance) from the **Well-Architected Tool** (the console service that reviews you against it).

The Well-Architected Framework isn't a product you turn on — it's **AWS's curated set of architectural best practices**, written down so any customer can design a cloud workload the way AWS's own solutions architects would. It's organised into **pillars** (think of them as **"lenses"** you look at your workload through), plus a set of **general design principles**.

> This topic is the **deep-dive**. The Framework also appears briefly in [Topic 02 — Cloud Architecture §7](02_Cloud_Architecture.md). Don't confuse it with the **Cloud Adoption Framework (CAF)** in [Topic 13 — Governance §6](13_Governance.md): **WAF = design a *workload* (pillars), CAF = plan an *organisation's migration* (perspectives).**

---

## 1. What the Framework Is (the slide)

![AWS Well-Architected Framework — a whitepaper created by AWS to help customers build using best practices, found at aws.amazon.com/architecture/well-architected. It is divided into sections called pillars (the slide shows 5: Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization) that act as lenses applied to a cloud workload, supplying General Definitions, General Design Principles and the Review Process. Each pillar also has its own detailed whitepaper, and if the foundation is not solid, structural problems will arise.](AWS_NOtes_Images/AWS_Well_Architectured.png)

The slide makes a few key points:

- **It is a *whitepaper* created by AWS** — best-practice guidance, **not a service you provision.** Found at **`aws.amazon.com/architecture/well-architected`**.
- It's **divided into sections called *pillars*** which each address a **different aspect** ("**lens**") that can be applied to a cloud workload.
- The Framework gives you three things: **General Definitions**, **General Design Principles**, and **The Review Process**.
- **Each pillar also has its own detailed whitepaper** — so the Framework is really a stack of documents.
- **Foundation analogy:** the pillars hold up "**Your Cloud Workload**." **If the foundation is not solid, structural *problems* will arise** — i.e. skip a pillar and your architecture has a weak spot.

> ⚠️ **Slide-vs-exam gap — read this.** This exampro slide shows **5 pillars**. The current Framework (and the **CLF-C02 exam**) has **6 pillars** — **Sustainability** was added in **2021**. **Answer "6 pillars" on the exam** unless a question is explicitly quoting the original five. See §2.

---

## 2. The Pillars

The slide lists the **original 5**. The exam expects **6** (Sustainability added later).

| # | Pillar | What it's about | Exam keyword / trigger |
|---|---|---|---|
| 1 | **Operational Excellence** | **Run and monitor** systems to deliver business value; continually **improve processes** (automation, IaC, small reversible changes, learn from failure). | "run and monitor," "automate operations," "improve processes" |
| 2 | **Security** | Protect **data, systems and assets** — identity & access (IAM), encryption, traceability, least privilege, defence in depth. | "protect data," "least privilege," "encryption," "IAM" |
| 3 | **Reliability** | Workload **performs its function correctly & consistently**, and **recovers from failure** (auto-recovery, scaling, backups, multi-AZ). | "recover from failure," "resiliency," "auto-healing," "backups" |
| 4 | **Performance Efficiency** | Use computing resources **efficiently** and **keep up as demand changes** (right-size, serverless, pick the right instance/service). | "use resources efficiently," "right-size," "right service for the job" |
| 5 | **Cost Optimization** | **Avoid unnecessary cost** — pay only for what you need, pick the right pricing model, eliminate waste. | "avoid unnecessary costs," "right pricing model," "eliminate waste" |
| 6 | **Sustainability** *(added 2021)* | Minimize the **environmental impact** of running workloads (energy, efficient resource use, managed services). | "environmental impact," "reduce carbon / energy," "sustainable" |

> **Memory hook (6 pillars):** **"O-S-R-P-C-S"** → **O**perational excellence, **S**ecurity, **R**eliability, **P**erformance efficiency, **C**ost optimization, **S**ustainability. *(Mnemonic: "**Old School Reliable Pros Cut Stuff**.")* **Sustainability = the newest pillar** is a favourite exam detail.

---

## 3. The Three Things Each Pillar Gives You

The slide calls these out explicitly — the Framework supplies, per pillar:

| Component | What it means |
|---|---|
| **General Definitions** | The vocabulary and concepts for that pillar (so everyone means the same thing). |
| **General Design Principles** | The recommended ways to architect for that pillar (e.g. *automate*, *scale horizontally*, *stop guessing capacity*, *make small reversible changes*, *design for failure*). |
| **The Review Process** | A structured way to **review a workload** against the pillar's best practices and surface risks. |

> And remember: **each pillar has its own dedicated whitepaper** for the deep detail.

---

## 4. The General Design Principles (the slide)

![AWS Well-Architected — General Design Principles: stop guessing your capacity needs (use as little or as much compute as you need, on demand); test systems at production scale (clone production to test, tear down when not in use to save money); automate to make architectural experimentation easier (CloudFormation ChangeSets, StackUpdate, Drift Detection); allow for evolutionary architectures (CI/CD, rapid or nightly releases, Lambdas deprecating runtimes forcing you to evolve); drive architectures using data (CloudWatch and CloudTrail automatically collecting data); improve through game days (simulate traffic on production or purposely kill EC2 instances to test recovery)](AWS_NOtes_Images/AWS_Well_Arch_General_Principle.png)

Beyond the pillars, the Framework lists **general design principles** that apply *across all pillars* — the cloud-native habits AWS wants you to adopt. The slide gives **6**, each with a concrete example:

| # | Principle | What it means | Slide example |
|---|---|---|---|
| 1 | **Stop guessing your capacity needs** | Don't over- or under-provision up front. Use the cloud's **elasticity** — scale **on demand**. | "Use as little or as much compute as you need, **on demand**." |
| 2 | **Test systems at production scale** | Test on a **full-size copy** of production (the cloud makes this cheap), then **tear it down** when done. | "Clone production env to testing, **tear down** testing when not in use to **save money**." |
| 3 | **Automate to make architectural experimentation easier** | Use **automation / IaC** so you can try changes, repeat them, and roll back easily. | "Using **CloudFormation** with **ChangeSets, StackUpdate and Drift Detection**." |
| 4 | **Allow for evolutionary architectures** | Design so the system can **keep changing** over time — small, frequent, reversible changes. | "**CI/CD**, rapid or nightly releases; **Lambda deprecating runtimes** forces you to evolve." |
| 5 | **Drive architectures using data** | Make decisions from **collected metrics/logs**, not guesswork. | "**CloudWatch, CloudTrail** automatically turned on collecting data." |
| 6 | **Improve through game days** | **Practise failure** on purpose to test (and improve) your recovery. | "Simulate traffic on production or **purposely kill EC2 instances** to see test recovery." |

> **Memory hook:** these are about **using the cloud the way only the cloud lets you** — *stop guessing*, *test big then tear down*, *automate*, *evolve*, *measure*, *break-things-on-purpose*. **"Game days"** and **"stop guessing capacity"** are the two phrases most likely to show up as exam keywords.

> Note the difference from §3's **General Design *Principles* per pillar**: §3 says *every pillar comes with* principles; **this slide is the Framework's *overarching* set of design principles** that apply regardless of pillar. On the exam either is just "design principles" — the keywords above are what matter.

---

## 5. Per-Pillar Design Principles (deep-dive)

On top of the **overarching** principles in §4, **each pillar has its *own* design principles**. This section collects them as the course covers each pillar. (For CLF-C02 you won't be asked to recite a pillar's principle list verbatim — but the **keywords** below are exactly the phrases the exam uses to point you at a pillar.)

### 5.1 Operational Excellence — Design Principles (the slide)

![AWS Well-Architected Operational Excellence Design Principles: perform operations as code (apply the same engineering discipline you use for application code to your cloud infrastructure; treating operations as code limits human error and enables consistent responses to events — e.g. Infrastructure as Code); make frequent, small, reversible changes (design workloads to allow components to be updated regularly — e.g. rollbacks, incremental changes, Blue/Green, CI/CD); refine operations procedures frequently (look for continuous opportunities to improve operations — e.g. use game days to simulate traffic or event failure on production workloads); anticipate failure (perform post-mortems on system failures to improve, write test code, kill production servers to test recovery); learn from all operational failures (share lessons learned in a knowledge base for operational events and failures across the entire organization)](AWS_NOtes_Images/AWS_Operational_Design.png)

**Operational Excellence** = how you **run, monitor and continuously improve** your workloads. Its design principles:

| # | Principle | What it means | Slide example |
|---|---|---|---|
| 1 | **Perform operations as code** | Apply the **same engineering discipline you use for application code** to your **infrastructure & operations**. Treating ops as code **limits human error** and gives **consistent responses to events**. | **Infrastructure as Code** (CloudFormation/CDK) |
| 2 | **Make frequent, small, reversible changes** | Design workloads so components can be **updated regularly** and changes **rolled back** if they go wrong. | rollbacks, incremental changes, **Blue/Green**, **CI/CD** |
| 3 | **Refine operations procedures frequently** | Continuously look for ways to **improve your operations** — don't set-and-forget. | **game days** to simulate traffic / event failure on production |
| 4 | **Anticipate failure** | Assume things will break and **practise for it** before it happens. | post-mortems, write test code, **kill production servers to test recovery** |
| 5 | **Learn from all operational failures** | Capture and **share lessons learned** so the whole org improves, not just one team. | a shared **knowledge base** across the entire organization |

> **Memory hook:** *"Code it, change it small, refine it, expect it to break, learn from the break."* Notice the **overlap with §4's general principles** — *ops as code* ≈ *automate*, *game days* and *kill servers* ≈ *improve through game days*. That's expected: the pillar principles are the general ones **applied specifically to running operations**.

> 🔎 **Current-AWS note:** these **5** are the classic, widely-cited Operational Excellence principles (and what the course slide shows). AWS has since **refreshed the wording** of this pillar to add ideas like *organize teams around business outcomes*, *implement observability for actionable insights*, *use managed services*, and *safely automate where possible*. **CLF-C02 still tests the classic phrasing** above — just don't be thrown if you see the newer wording elsewhere.

### 5.2 Security — Design Principles

> *No course slide yet — written to **current AWS** (the official Security pillar lists **7** design principles). I'll reconcile if you drop the slide later.*

**Security** = protect **data, systems and assets** and use the cloud to *improve* your security posture. It maps directly onto the [Shared Responsibility Model (Topic 04)](04_Shared_Responsibility_Model.md) — these principles cover **your** half ("security *in* the cloud"). The 7 design principles:

| # | Principle | What it means | Exam keyword / how it shows up |
|---|---|---|---|
| 1 | **Implement a strong identity foundation** | **Least privilege**, separation of duties, **centralize identity**, and **eliminate long-term static credentials**. | "least privilege," **IAM roles over access keys**, central identity ([Topic 10](10_Identity.md)) |
| 2 | **Maintain traceability** | **Monitor, alert and audit** every action & change in real time; wire logs/metrics to automated response. | "audit / log who did what" → **CloudTrail**, CloudWatch, Config ([Topic 18](18_Logging.md), [Topic 13 §3](13_Governance.md)) |
| 3 | **Apply security at all layers** | **Defense in depth** — don't rely on one control. Secure edge, VPC, subnet, load balancer, instance, OS, app & code. | "defense in depth," "security at every layer," SG + NACL + WAF + Shield |
| 4 | **Automate security best practices** | Make security **software-defined and automated** so it scales and is consistent. | "automated security controls," IaC guardrails, Config rules |
| 5 | **Protect data in transit and at rest** | **Encrypt** everywhere, plus tokenization & access control; classify data by sensitivity. | ⭐ **encryption in transit (TLS) + at rest (KMS)** — a top exam phrase |
| 6 | **Keep people away from data** | Reduce or eliminate **direct human access / manual handling** of data to cut risk of mistakes. | "reduce manual access to data," automation instead of humans |
| 7 | **Prepare for security events** | Have an **incident-response** plan; run simulations and use tooling to detect, investigate and recover fast. | "incident response," "run game days/simulations," GuardDuty/Detective |

> **Memory hook:** *"Strong identity, trace everything, layer your defenses, automate it, encrypt in-transit-&-at-rest, keep people off the data, and rehearse for incidents."* For CLF-C02 the **three most-tested ideas** are **least privilege**, **defense in depth (security at all layers)**, and **encryption at rest + in transit**.

> 🔗 This pillar is the *design-principle* lens; the actual **security services** (IAM, KMS, GuardDuty, WAF, Shield, Macie, Security Hub, Inspector…) live across [Topic 10 — Identity](10_Identity.md) and the networking/edge security in [Topic 08 §10](08_Networks.md). The **Shared Responsibility Model** ([Topic 04](04_Shared_Responsibility_Model.md)) is the backdrop for all of it.

### 5.3 Reliability — Design Principles

> *No course slide yet — written to **current AWS** (the official Reliability pillar lists **5** design principles). I'll reconcile if you drop the slide later.*

**Reliability** = a workload that **performs its intended function correctly and consistently**, and **recovers automatically from failure**. This is the design-principle lens over the resiliency concepts in [Topic 02 — Cloud Architecture](02_Cloud_Architecture.md) (High Availability, Fault Tolerance, Disaster Recovery). The 5 design principles:

| # | Principle | What it means | Exam keyword / how it shows up |
|---|---|---|---|
| 1 | **Automatically recover from failure** | Monitor **KPIs/health**, and **trigger automation** to repair or replace when a threshold is breached — before users notice. | ⭐ "**self-healing**," health checks → **Auto Scaling replaces unhealthy instances** ([Topic 09 §9](09_EC2.md)) |
| 2 | **Test recovery procedures** | Don't just hope recovery works — **simulate failures** in the cloud and rehearse, so you find gaps before a real outage. | "test/simulate failure," game days, DR drills |
| 3 | **Scale horizontally to increase availability** | Replace **one big resource** with **many small ones** so a single failure has a **small blast radius**. | ⭐ "**scale out, not up**," multiple instances across **multiple AZs** |
| 4 | **Stop guessing capacity** | Monitor demand and **automatically add/remove** resources to meet it — no over- or under-provisioning. | "elasticity," **Auto Scaling**, on-demand capacity ([Topic 02](02_Cloud_Architecture.md)) |
| 5 | **Manage change through automation** | Make infrastructure changes via **automation / IaC** so they're tracked, repeatable and reversible. | "change via automation," CloudFormation/IaC |

> **Memory hook:** *"Heal automatically, test the healing, scale out across AZs, stop guessing capacity, and change via automation."* For CLF-C02 the **most-tested ideas** are **automatic recovery / self-healing**, **scale horizontally (out, not up)**, and **multi-AZ for high availability**.

> 🔗 The building blocks live in other topics: **Multi-AZ, Regions & AZs** ([Topic 01](01_AWS_Global_Infrastructure.md)), **HA / Fault Tolerance / DR & RTO-RPO** ([Topic 02](02_Cloud_Architecture.md)), **Auto Scaling Groups + ELB health checks** ([Topic 09 §8–9](09_EC2.md)), **backups & Multi-AZ RDS** ([Topic 07 §6](07_Databases.md)). ⚠️ Don't confuse **Reliability** (*keep working / recover*) with **Performance Efficiency** (*use the right resources efficiently*) — see §8.

### 5.4 Performance Efficiency — Design Principles

> *No course slide yet — written to **current AWS** (the official Performance Efficiency pillar lists **5** design principles). I'll reconcile if you drop the slide later.*

**Performance Efficiency** = use computing resources **efficiently** to meet requirements, and **keep that efficiency as demand changes and technology evolves**. It's about picking and right-sizing the **right resource for the job** — not just "make it fast." The 5 design principles:

| # | Principle | What it means | Exam keyword / how it shows up |
|---|---|---|---|
| 1 | **Democratize advanced technologies** | Consume hard tech (ML, NoSQL, media transcoding, big data) **as a managed service** instead of learning to host & run it yourself — let your team focus on the product. | ⭐ "**use managed services**," "no need to host/run it yourself" |
| 2 | **Go global in minutes** | Deploy across **multiple Regions / edge locations** to give users **lower latency** worldwide, cheaply. | ⭐ "**lower latency for global users**" → multiple Regions, **CloudFront** ([Topic 01](01_AWS_Global_Infrastructure.md), [Topic 08 §10](08_Networks.md)) |
| 3 | **Use serverless architectures** | Remove the operational burden of running/maintaining servers; often **lower cost** and scales automatically. | ⭐ "**serverless**" → Lambda, Fargate, DynamoDB ([Topic 16](16_Serverless.md)) |
| 4 | **Experiment more often** | Because cloud resources are **virtual and disposable**, quickly **test** different instance types, storage and configs to find the best. | "test/compare instance types," easy A/B of configs |
| 5 | **Consider mechanical sympathy** | **Match the technology to the workload's access pattern** — e.g. the right database/storage type for how data is actually used. | "right tool/data store for the job," right instance family |

> **Memory hook:** *"Use managed services, go global, go serverless, experiment, and match the tech to the workload."* For CLF-C02 the **most-tested ideas** are **right-sizing / pick the right resource**, **use managed & serverless services**, and **go global (multi-Region) to cut latency**.

> 🔗 Related material: **EC2 instance families & sizing** ([Topic 09 §2–3](09_EC2.md)), **serverless services** ([Topic 16](16_Serverless.md)), **global infrastructure / Regions / edge** ([Topic 01](01_AWS_Global_Infrastructure.md)), **CloudFront & Global Accelerator** ([Topic 08 §10](08_Networks.md)), and **Compute Optimizer** for right-sizing recommendations ([Topic 05 §5](05_Computing_Services.md)). ⚠️ Don't confuse with **Cost Optimization** (§5.5): Performance Efficiency = *use the right resource efficiently*; Cost Optimization = *don't pay more than you need* — they overlap but the exam picks one based on whether the scenario stresses **speed/efficiency** or **money**.

### 5.5 Cost Optimization — Design Principles

> *No course slide yet — written to **current AWS** (the official Cost Optimization pillar lists **5** design principles). I'll reconcile if you drop the slide later.*

**Cost Optimization** = run systems that deliver business value at the **lowest price point** — eliminate waste, pick the right pricing model, and pay only for what you use. The 5 design principles:

| # | Principle | What it means | Exam keyword / how it shows up |
|---|---|---|---|
| 1 | **Implement Cloud Financial Management** | Invest in the **people, tools & processes** (FinOps) to actually manage cloud cost as a discipline. | "build a cost-management capability / FinOps" |
| 2 | **Adopt a consumption model** | **Pay only for what you use**; scale up/down with real demand (e.g. **turn off dev/test at night**). | ⭐ "**pay-as-you-go**," "shut down idle / non-prod resources" |
| 3 | **Measure overall efficiency** | Track **business output vs the cost** to produce it, so you can see whether changes actually help. | "measure cost per business outcome" |
| 4 | **Stop spending money on undifferentiated heavy lifting** | Let AWS run the **data centers, racking, patching**; spend your effort on your **customers**, not infrastructure. | ⭐ "**no data centers to manage**," focus on the business not infra |
| 5 | **Analyze and attribute expenditure** | Use **tagging / cost allocation** to attribute cost to owners, find ROI and target optimization. | ⭐ "**cost allocation tags**," attribute spend by team/project ([Topic 13 §4](13_Governance.md)) |

> **Memory hook:** *"Manage cost as a discipline, pay only for what you use, measure efficiency, stop the heavy lifting, and attribute every dollar."* For CLF-C02 the **most-tested ideas** are **pay-as-you-go / consumption**, **right pricing model**, and **cost allocation tags** to attribute spend.

> 🔗 Related material: **EC2 pricing models** (On-Demand / Reserved / Spot / Savings Plans — [Topic 09 §11](09_EC2.md)), **tagging & cost allocation tags** ([Topic 13 §4](13_Governance.md)), and the cost-management tooling — **Cost Explorer, AWS Budgets, Cost & Usage Report, Billing, Trusted Advisor cost checks, Compute Optimizer**. ⚠️ Reminder vs §5.4: **Cost Optimization** answers *"don't pay more than needed"*; **Performance Efficiency** answers *"use the right resource well."*

---

## 6. The AWS Well-Architected Framework & Tool

This section ties together **the guidance (the Framework)** and **the service you use to apply it (the Tool)** — the exam routinely tests that you can tell them apart.

### 6.1 Recap — the Well-Architected *Framework*

> The **AWS Well-Architected Framework** is the **whitepaper / best-practice guidance** (see §1): **6 pillars** (§2), each with **General Definitions + General Design Principles + a Review Process** (§3), plus the **overarching design principles** (§4) and **per-pillar design principles** (§5). It is **not a service** — you don't deploy it, you **design by it**.

### 6.2 The Well-Architected *Tool* (WA Tool)

> **AWS Well-Architected Tool** is a **free service in the AWS Management Console** that lets you **review a workload against the pillars**, **flags risks**, and gives **improvement recommendations**. It's how you actually *run* the Framework's "Review Process."

**How it works (CLF-C02 level):**

| Concept | What it is |
|---|---|
| **Workload** | The thing you're reviewing (an app/system). You define it, then answer the question set. |
| **Review** | You answer pillar questions; the Tool evaluates your answers against best practices. |
| **High-Risk Issues (HRIs)** & Medium-Risk (MRIs) | The Tool's output — issues ranked by risk, each with **recommended improvements**. |
| **Improvement Plan** | The prioritized list of fixes the Tool generates from those risks. |
| **Milestones** | **Save a snapshot** of the review at a point in time, so you can **re-review later and measure progress** as you remediate. |
| **Lenses** | Add-on question sets for **specific workload types** beyond the core pillars — e.g. **Serverless, SaaS, Data Analytics, Machine Learning, Financial Services**, plus **custom lenses** you build yourself. |

**Key facts for the exam:** the Tool is **free**, lives **in the console**, reviews against the **6 pillars (+ optional lenses)**, produces **risk-ranked issues + recommendations**, and uses **milestones** to track improvement over time.

### 6.3 Framework vs Tool (the trap)

| | **Well-Architected *Framework*** | **Well-Architected *Tool*** |
|---|---|---|
| What | The **best-practice guidance** (whitepaper + pillars) | A **free console service** |
| You use it to… | **Learn** how to design well | **Review** an actual workload against the pillars |
| Output | Definitions, principles, review process | **Risk-ranked issues (HRIs) + recommendations + milestones** |
| Is it a service? | **No** — it's a document/methodology | **Yes** — and it's **free** |

> ⭐ **Exam trap:** "Which **tool/service** reviews a workload against best practices?" → **Well-Architected *Tool***. "What is the **set of best practices / pillars**?" → **Well-Architected *Framework***. "**Track improvement** of a workload review over time?" → **Milestones** in the WA Tool. "Best practices for a **specific workload type** (serverless, ML…)?" → a **Lens**.

---

## 7. Exam Triggers

- "**Set of best practices** for designing on AWS" / "**pillars**" / "**lenses**" → **Well-Architected Framework**.
- "It's a **whitepaper**, not a service" → **Well-Architected Framework**.
- "**How many pillars?**" → **6** (Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, **Sustainability**).
- "**Newest / most recently added** pillar" → **Sustainability** (2021).
- "Scenario about **environmental / carbon / energy impact**" → **Sustainability** pillar.
- "**Recover from failure / resiliency / auto-healing / backups**" → **Reliability** pillar.
- "**Protect data / encryption / least privilege / IAM**" → **Security** pillar.
- "**Avoid unnecessary cost / right pricing model / eliminate waste**" → **Cost Optimization** pillar.
- "**Right-size / use resources efficiently / pick the right service**" → **Performance Efficiency** pillar.
- "**Run, monitor and improve operations / automate / IaC**" → **Operational Excellence** pillar.
- "**Free tool to review a workload** against best practices" → **AWS Well-Architected Tool**.
- "**Identifies high-risk issues (HRIs) + recommendations**" → **Well-Architected Tool**.
- "**Track / measure improvement of a review over time**" → **Milestones** (in the WA Tool).
- "**Best practices for a specific workload type** (serverless, SaaS, ML, analytics)" → a **Lens** (in the WA Tool).
- "**Stop guessing capacity** / provision on demand" / "**test at production scale then tear down**" / "**game days / purposely kill instances** to test recovery" / "**drive architectures using data**" → **General Design Principles**.
- "**Perform operations as code / IaC**" / "**make frequent small reversible changes / Blue-Green / CI-CD**" / "**anticipate failure / post-mortems**" / "**learn from operational failures / knowledge base**" → **Operational Excellence** pillar design principles.
- "**Least privilege / strong identity**" / "**defense in depth / security at all layers**" / "**encryption in transit & at rest**" / "**maintain traceability / audit**" / "**keep people away from data**" / "**prepare for security events / incident response**" → **Security** pillar design principles.
- "**Automatically recover from failure / self-healing**" / "**test recovery procedures**" / "**scale horizontally / out not up**" / "**stop guessing capacity**" / "**manage change through automation**" → **Reliability** pillar design principles.
- "**Democratize advanced tech / use managed services**" / "**go global in minutes / lower latency worldwide**" / "**use serverless**" / "**experiment more often**" / "**mechanical sympathy / right tool for the workload**" → **Performance Efficiency** pillar design principles.
- "**Cloud financial management / FinOps**" / "**adopt a consumption model / pay-as-you-go**" / "**measure overall efficiency**" / "**stop undifferentiated heavy lifting / no data centers**" / "**analyze & attribute expenditure / cost allocation tags**" → **Cost Optimization** pillar design principles.

---

## 8. Common Confusions to Nail

1. **6 pillars, not 5.** The original Framework had 5; **Sustainability** was added in 2021. The exam uses **6** — this slide's "5" is the old version.
2. **Framework ≠ Tool.** The **Framework** is the best-practice *guidance*; the **Well-Architected Tool** is the free *console service* that reviews your workload against it.
3. **WAF ≠ CAF.** **Well-Architected Framework = design a *workload* (6 *pillars*).** **Cloud Adoption Framework = plan an *organisation's* cloud migration (6 *perspectives*).** Different "6", different purpose. ([Topic 13 §6](13_Governance.md))
4. **It's a whitepaper, not a billable service.** You don't "turn on" the Framework. (The *Tool* is a service — and it's **free**.)
5. **Reliability vs Performance Efficiency.** Reliability = *keep working / recover from failure*; Performance Efficiency = *use the right resources efficiently and scale with demand*. "Survives an AZ outage" = **Reliability**; "right-sized instance / serverless to handle load efficiently" = **Performance Efficiency**.
6. **Operational Excellence vs Reliability.** Operational Excellence = *how you run and improve operations* (monitoring, automation, processes). Reliability = *the workload itself recovers and stays available*.

---

## Quick Revision Cheat Sheet

| Concept | One-liner | Exam keyword |
|---|---|---|
| **Well-Architected Framework** | AWS **whitepaper** of best-practice design guidance, organised into pillars | "best practices," "pillars," "lenses" |
| **# of pillars** | **6** (slide shows the old 5) | "6 pillars" |
| **The 6 pillars** | Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, **Sustainability** | "O-S-R-P-C-S" |
| **Sustainability** | **Newest** pillar (2021); minimise environmental impact | "carbon / energy / environmental" |
| **Per pillar you get** | General Definitions + General Design Principles + Review Process (+ own whitepaper) | "definitions, principles, review" |
| **General Design Principles** | Cloud-native habits across all pillars: stop guessing capacity, test at prod scale, automate, evolve, drive with data, game days | "stop guessing capacity," "game days" |
| **Well-Architected Tool** | **Free console service** that reviews a workload vs the pillars & flags high-risk issues | "review workload against best practices" |
| **Milestones** (WA Tool) | Saved snapshots of a review to **track improvement over time** | "measure progress of a review" |
| **Lenses** (WA Tool) | Add-on best-practice question sets for **specific workload types** (Serverless, SaaS, ML…) + custom | "best practices for serverless/ML workload" |
| **WAF vs CAF** | WAF = design a *workload* (pillars); CAF = plan a *migration* (perspectives) | "pillars vs perspectives" |

**Top exam points to remember**
1. The Framework is a **whitepaper / set of best practices** — **not** a service. Found at `aws.amazon.com/architecture/well-architected`.
2. **6 pillars** on the exam (**Sustainability** is the newest, added 2021) — the **"O-S-R-P-C-S"** mnemonic.
3. **Match the scenario to the pillar** — that's the #1 question style.
4. **Framework (guidance) ≠ Well-Architected Tool (free console service that reviews you).**
5. **WAF ≠ CAF** — *pillars* (design a workload) vs *perspectives* (plan a migration).
