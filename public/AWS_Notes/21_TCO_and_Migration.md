# TCO & Migration

> **Exam:** AWS Certified Cloud Practitioner (CLF-C02)
> **Topic 21:** **Total Cost of Ownership (TCO)** and **Migration** — the business/financial side of the exam. This is where AWS stops being a pile of services and becomes a *money argument*: why running on AWS is usually cheaper and more flexible than owning your own data center, and how AWS measures and helps you make that comparison.

A huge slice of CLF-C02 questions are not technical at all — they ask *"what's the business benefit of moving to the cloud?"* The expected answers almost always trace back to two ideas: **(1)** you stop paying for hardware you guess you'll need (CAPEX) and start paying only for what you use (OPEX), and **(2)** the *total* cost of running in the cloud — when you count power, cooling, staff, real estate, and idle capacity — is lower than running it yourself on-premises. This topic ties those together.

---

## 1. What is TCO (Total Cost of Ownership)?

**TCO = the *complete* cost of running a workload — not just the sticker price of the servers, but every cost over its whole life.**

The reason TCO matters: when people compare "on-premises vs AWS," they naively compare *only* the obvious cost (the price of a server vs the price of an EC2 instance). That comparison is misleading, because owning a data center has a mountain of **hidden costs** the cloud absorbs for you.

| Cost bucket | On-premises (you pay) | On AWS |
|---|---|---|
| **Hardware** | Buy servers, storage, network gear upfront | Rented, included in usage price |
| **Facilities** | Building / floor space, racks | AWS's problem |
| **Power & cooling** | Electricity + air conditioning, 24/7 | AWS's problem |
| **Staffing** | Sysadmins to rack/patch/replace hardware | AWS handles the physical layer |
| **Maintenance** | Replace failed disks, refresh aging gear | AWS handles |
| **Idle capacity** | You over-provision "just in case" → waste | Scale up/down on demand, pay for what's used |

> **Exam framing:** TCO is the headline phrase for *"the real, all-in cost comparison."* When a question says a customer wants to **compare the cost of running on-premises vs on AWS**, the tool that does it is the **AWS Pricing Calculator** (see §5), and the conceptual answer is **"AWS lowers TCO."**

---

## 2. On-Premises vs AWS (Cloud)

"On-premises" (often just **on-prem**) means **you own and run your own data center** — you buy the hardware, house it in your building, power it, cool it, secure it, and staff it. AWS (the cloud) flips almost every one of those responsibilities into a pay-as-you-go service.

| Dimension | **On-Premises** | **AWS (Cloud)** |
|---|---|---|
| **Upfront cost** | Huge — buy all hardware before you start (**CAPEX**) | None / minimal — pay as you go (**OPEX**) |
| **Capacity planning** | **Guess** future demand; over- or under-provision | Scale **elastically** on demand, no guessing |
| **Time to provision** | Weeks/months (order, ship, rack, configure) | **Minutes** (launch an instance) |
| **Who maintains hardware** | You (replace disks, refresh servers) | AWS |
| **Power, cooling, real estate** | You pay & manage | AWS |
| **Geographic reach** | Limited to your own sites | **Global** in minutes (Regions/AZs) |
| **Scaling down** | Hard — you already bought the gear | Easy — turn it off, stop paying |
| **Risk of obsolescence** | High — hardware ages, you eat the cost | AWS continuously refreshes |
| **Focus** | Spend time running infrastructure | Focus on your **business / app** ("stop the undifferentiated heavy lifting") |

**The mental model:** On-prem is like **buying a car** — big upfront payment, you maintain it, it depreciates, and it's sized for your *maximum* possible need. AWS is like **using a ride-share** — pay only per trip, never worry about maintenance, and instantly get a bigger or smaller vehicle whenever you need one.

> This directly powers the AWS value proposition you'll see repeated: **"Trade fixed expense for variable expense," "Benefit from massive economies of scale," "Stop guessing capacity," "Increase speed and agility," "Stop spending money running and maintaining data centers," "Go global in minutes."** (These are the **6 Advantages of Cloud Computing** — see Topic 02 / the WAF design principles in Topic 20.)

---

## 3. CAPEX vs OPEX

![Capital Expenditure (CAPEX) vs Operational Expenditure (OPEX) — CAPEX = spending money upfront on physical infrastructure (servers, storage, network, datacenter), you have to guess upfront; OPEX = ongoing costs paid to a service provider, no physical assets, billed on usage, no upfront investment](AWS_NOtes_Images/AWS_CAPEX_OPEX.png)

This is the single most exam-critical distinction in this topic. The whole financial benefit of cloud is summed up as **"shift from CAPEX to OPEX."**

### 3.1 CAPEX — Capital Expenditure

> **CAPEX = spending money *upfront* on *physical infrastructure*,** then deducting (depreciating) that expense off your tax bill over time.

Classic CAPEX costs (the data-center shopping list):

- **Server costs** (the computers themselves)
- **Storage costs** (hard drives)
- **Network costs** (routers, cables, switches)
- **Backup and archive costs**
- **Disaster-recovery costs**
- **Data-center costs** (rent, cooling, physical security)
- **Technical personnel** (staff to run it all)

> **Key pain:** with capital expenses **you have to *guess upfront*** what you'll need. Guess too high → wasted money on idle hardware. Guess too low → you run out of capacity and can't serve customers.

### 3.2 OPEX — Operational Expenditure

> **OPEX = the *ongoing* costs of running a service,** where the cost has **shifted to the service provider** (AWS) and the customer **only has to be concerned with *non-physical* costs** (usage, not hardware).

Classic OPEX costs:

- **Leasing** software and customizing features
- **Training** employees on cloud services
- **Paying for cloud support**
- **Billing based on cloud metrics**, e.g.:
  - **compute usage**
  - **storage usage**

> **Key benefit:** with operational expenses you can **try a product or service *without investing in equipment*.** No upfront guess, no stranded hardware — spin it up, pay for what you use, turn it off when done.

### 3.3 The one-line exam takeaway

| | **CAPEX** | **OPEX** |
|---|---|---|
| **What** | Buy assets upfront | Pay for usage over time |
| **Money flow** | Big upfront payment | Smaller, ongoing payments |
| **Tied to** | **Physical** infrastructure | **Non-physical** consumption |
| **Risk** | Must **guess** capacity upfront | **No guessing** — scale on demand |
| **Maps to** | **On-premises** data center | **AWS / cloud** |

> ⭐ **The cloud value sentence the exam wants:** *"Moving to AWS trades CAPEX (large upfront capital purchases) for OPEX (variable, pay-as-you-go operational spend)."* This is the same idea as the cloud advantage **"trade fixed expense for variable expense."**

---

## 4. Migration — moving to AWS

Once the business decides AWS is cheaper, the next question is *how do we get there?* The exam keeps migration light, but knows a few frameworks and the famous strategy list.

### 4.1 AWS Cloud Adoption Framework (CAF)

The **AWS CAF** is the **whitepaper that helps you *plan* an organization's migration** to the cloud, organizing guidance into **6 Perspectives** (Business, People, Governance, Platform, Security, Operations). It's covered in depth in **Topic 13 §6** — just remember **CAF = plan the *journey*** (and don't confuse it with the Well-Architected Framework, which designs a single *workload* — Topic 20).

### 4.2 The 7 R's — migration strategies

When moving each application, you pick a strategy. The exam loves the **"R" words**:

| Strategy | Meaning |
|---|---|
| **Rehost** ("lift and shift") | Move as-is to EC2, no changes — fastest |
| **Replatform** ("lift, tinker and shift") | Small optimizations (e.g. move DB to RDS) without re-architecting |
| **Repurchase** ("drop and shop") | Move to a different product, usually **SaaS** (e.g. ditch self-hosted CRM → Salesforce) |
| **Refactor / Re-architect** | Rewrite the app to be cloud-native (e.g. go serverless) — most effort, most benefit |
| **Retain** | Keep it on-premises for now (not ready/worth moving) |
| **Retire** | Decommission it — you don't need it anymore |
| **Relocate** | Move infra (e.g. VMware) without buying new hardware or changing operations |

> The first four (**Rehost, Replatform, Repurchase, Refactor**) are the most-tested; **Retain** and **Retire** are the "do nothing / throw away" options.

### 4.3 Migration Evaluator — build the *business case*

> **Migration Evaluator** (formerly **TSO Logic**) is a **free AWS service that builds a *data-driven business case* for migrating to AWS.** It answers the boardroom question *"what will it actually cost us to move, and how much will we save?"* — i.e. it's the tool that **quantifies the TCO argument before** you commit to a migration.

How it works:

- You install a lightweight **agentless collector** in your on-premises environment (or import existing inventory). It runs for a couple of weeks gathering data on your servers, utilization, and software licenses.
- AWS analyzes that data and delivers a **Quick Insights** report → a full business case showing your **projected AWS cost** vs your **current on-premises cost**, including **"what-if" scenarios** (e.g. Reserved Instances, right-sizing to actual utilization, **BYOL vs license-included** for Windows/SQL Server).
- Output = a clear **TCO / cost-savings projection** you can take to leadership to justify the move.

| Fact | Detail |
|---|---|
| **What** | Free service to **build a business case** for migrating to AWS |
| **Old name** | **TSO Logic** |
| **Input** | Agentless collector / inventory import from on-premises |
| **Output** | TCO comparison (on-prem vs AWS) + right-sizing & licensing **what-if** scenarios |
| **When** | **Before** migrating — at the *"should we even do this?"* decision stage |

> ⭐ **Exam distinction:** **Migration Evaluator = *decide whether to migrate* (the business case / TCO projection).** **Pricing Calculator (§5.1) = *estimate a specific architecture's* AWS cost** (more granular, build-it-yourself). **Migration Hub (§4.4) = *track* a migration already in progress.** All three are free; the difference is **decide → estimate → track.**

### 4.4 AWS tools that *do* the migration

| Tool | What it does |
|---|---|
| **AWS Migration Hub** | Central place to **track** migration progress across tools |
| **AWS Application Migration Service (MGN)** | Lift-and-shift servers (rehost) to EC2 |
| **AWS Database Migration Service (DMS)** | Migrate databases with minimal downtime; + **SCT** for different engines — see §4.6 (also Topic 07 §7) |
| **AWS DataSync** | Move large amounts of file/object data to AWS |
| **VM Import/Export** | **Import existing VM images** (VMware/Hyper-V/etc.) into EC2 as **AMIs**, and **export** EC2 instances back out — see §4.5 |
| **AWS Snow Family** | Physically ship petabytes when the network is too slow (Topic 06 §7) |
| **Migration Acceleration Program (MAP)** | Methodology + AWS Partners + funding for large enterprise migrations (Topic 17 §9) |

### 4.5 EC2 VM Import/Export

> **VM Import/Export** lets you **import virtual machine images from your existing on-premises virtualization environment into Amazon EC2** (where they become **AMIs** you can launch as instances), and **export** previously imported instances back to your on-premises environment. It's a classic **rehost ("lift and shift")** mechanism.

Key facts:

- **Preserves your existing VMs** — your configured OS, software, and settings come over intact, so you don't rebuild servers from scratch.
- **Supported source formats** include **VMware ESX/VMDK, Microsoft Hyper-V/VHD(X), and Citrix Xen** images (and OVA).
- **No additional charge** for the feature itself — you only pay for the **S3 storage** of the uploaded image and the **EC2** resources you then run.
- Workflow: upload the VM image to **S3** → run the import → it becomes an **AMI / EBS snapshot** → launch EC2 instances from it.
- **Bring Your Own License (BYOL):** import lets you carry existing OS licenses (cross-links Topic 09 §4 / Topic 17 §10 License Manager).

> **Exam angle:** *"move an existing on-premises **virtual machine** into AWS as-is"* → **VM Import/Export** (the DIY, image-based path). For large fleets with automated, continuous replication and cutover, AWS now steers you to **Application Migration Service (MGN)** — VM Import/Export is the simpler, manual, per-image tool.

### 4.6 AWS Database Migration Service (DMS)

![AWS Database Migration Service (DMS) — migrate one database to another; architecture shows Source Database → Source Endpoint → a Replication Instance running a Replication Task → Target Endpoint → Target Database, all inside AWS DMS; long lists of possible sources and targets; AWS Schema Conversion Tool converts the source schema to the target schema](AWS_NOtes_Images/AWS_DMS.png)

> **AWS Database Migration Service (DMS)** lets you **quickly and securely migrate one database to another.** A very common use is migrating an **on-premises database to AWS** — but it works database-to-database in general (including AWS-to-AWS and even cloud-to-on-prem).

**Key point: the source database stays fully operational *during* the migration**, so DMS minimizes downtime for the apps that rely on it (it can do a one-time load and then keep changes flowing via ongoing replication / CDC — change data capture).

#### How it works (the slide's architecture)

The flow inside **AWS DMS** is a simple pipeline:

```
Source Database → Source Endpoint → [ Replication Instance
                                        running a Replication Task ] → Target Endpoint → Target Database
```

| Component | Role |
|---|---|
| **Source Endpoint** | Connection details for where the data comes *from* |
| **Replication Instance** | The EC2-based engine that **runs the migration** (does the actual work) |
| **Replication Task** | The job definition — what to move, full-load vs ongoing-replication |
| **Target Endpoint** | Connection details for where the data goes *to* |

#### Possible Sources (from the slide)

Oracle, Microsoft SQL, MySQL, MariaDB, PostgreSQL, MongoDB, SAP ASE, IBM Db2, **Azure SQL Database**, **Amazon RDS**, **Amazon S3** (database dumps), **Amazon Aurora**, **Amazon DocumentDB**.

#### Possible Targets (from the slide)

Oracle, Microsoft SQL, MySQL, PostgreSQL, **Redis**, **Amazon Redshift**, **Amazon RDS**, **Amazon DynamoDB**, **Amazon Aurora**, **Amazon OpenSearch Service**, **Amazon ElastiCache for Redis**, **Amazon DocumentDB**, **Amazon Neptune**, **Apache Kafka**.

> ⚠️ **The slide's warning:** *"each migration path requires a bit of research, since not all combinations of sources and targets are possible."* Don't assume any source can go to any target — check the supported pairings.

#### Homogeneous vs Heterogeneous — and the SCT

- **Homogeneous** migration = **same engine** (e.g. **Oracle → Oracle**, MySQL → Amazon RDS for MySQL). DMS alone handles it — schema is compatible.
- **Heterogeneous** migration = **different engines** (e.g. **Oracle → Aurora PostgreSQL**, SQL Server → MySQL). The schemas don't match, so you first use the…

> ⭐ **AWS Schema Conversion Tool (SCT)** — **automatically converts a source database schema (and code/stored procedures) to the target's format** when the engines differ. **SCT converts the schema; DMS moves the data.** This is the #1 DMS exam pairing.

> **Exam angle:** *"migrate a database to AWS with minimal downtime"* → **DMS.** *"migrate to a **different** database engine"* → **DMS + SCT.** *"convert the schema"* → **SCT.**

---

## 5. The Cost / TCO Tools

| Tool | Use it to… | Exam keyword |
|---|---|---|
| **AWS Pricing Calculator** | **Estimate the cost** of an AWS architecture *before* you build it, and **compare on-prem TCO vs AWS** | "estimate cost upfront," "compare TCO" (replaced the old *TCO Calculator* and *Simple Monthly Calculator*) |
| **AWS Cost Explorer** | **Visualize & analyze your *actual* past/current** AWS spend and forecast it | "view/analyze historical cost" |
| **AWS Budgets** | Set a spending threshold and get **alerted** before you overspend | "alert when cost exceeds…" |
| **Cost & Usage Report (CUR)** | Most **detailed** line-item billing data | "most granular billing data" |
| **Cost Allocation Tags** | Break the bill down **by tag** (project/team) | "track cost by department" (Topic 13 §4) |

> ⭐ **The #1 trap:** **Pricing Calculator = *estimate the future / plan*** (before you spend). **Cost Explorer = *analyze the past / present*** (what you already spent). Pricing Calculator is the tool for **TCO / on-prem-vs-AWS comparisons.**

### 5.1 AWS Pricing Calculator — deep-dive (`calculator.aws`)

> **AWS Pricing Calculator** is a **free, public web tool at `calculator.aws`** (the new home — it used to live at `calculator.aws/#/`, replacing the old *Simple Monthly Calculator* and *AWS TCO Calculator*). **No AWS account or login required** — you can model a whole architecture's monthly cost before you ever sign up or build anything.

How it works / what you can do:

- **Add services and configure them** (e.g. "5 × `t3.medium` EC2 on-demand in Mumbai, 730 hrs/mo, 100 GB gp3 EBS") → it returns an **upfront + monthly estimate**.
- **Group estimates** into a single saved estimate, organize by **group/team/project**, and see a combined total.
- **Compare pricing options** side by side — e.g. **On-Demand vs Reserved Instances vs Savings Plans** (cross-links Topic 09 §11), or different Regions (price varies by Region).
- **Export / share** the estimate as a **CSV or PDF**, or save a **shareable link** (great for sending a cost proposal to management).
- Because you can model your *entire* planned footprint, it's the tool AWS points to for **TCO comparisons** — estimate the AWS cost, then weigh it against your current on-premises spend.

| Fact | Detail |
|---|---|
| **URL** | **`calculator.aws`** |
| **Cost / access** | **Free, no login / no AWS account needed** |
| **Direction in time** | **Forward-looking** — estimates *future* cost (vs Cost Explorer = past) |
| **Replaces** | Simple Monthly Calculator **and** the standalone TCO Calculator |
| **Output** | Per-service + total monthly/upfront estimate; export **CSV/PDF**, shareable link |
| **Best for** | Planning a new architecture, pricing before migrating, **on-prem-vs-AWS TCO** comparisons, comparing pricing models/Regions |

> **Exam tip:** if a question says *"a customer wants to **estimate** their AWS bill **before** deploying"* or *"compare the cost of running on-premises vs on AWS,"* the answer is **AWS Pricing Calculator (`calculator.aws`)** — **not** Cost Explorer (that's for spend you've *already* incurred).

---

## 6. Exam Triggers

- **"Compare the cost of on-premises vs AWS" / "estimate cost before migrating"** → **AWS Pricing Calculator** (and the concept = **TCO**).
- **"Shift from large upfront purchases to pay-as-you-go"** → **CAPEX → OPEX.**
- **"Capital expense / buy hardware upfront / guess capacity"** → **CAPEX** = on-premises.
- **"Variable expense / pay only for what you use / no upfront investment"** → **OPEX** = cloud.
- **"Trade fixed expense for variable expense"** → cloud advantage (same idea as CAPEX→OPEX).
- **"Stop spending money running and maintaining data centers"** → cloud advantage / lower TCO.
- **"Try a product without investing in equipment"** → **OPEX** benefit.
- **"Lift and shift"** → **Rehost.** **"Drop and shop / move to SaaS"** → **Repurchase.** **"Re-architect to serverless"** → **Refactor.**
- **"Plan the organization's migration / 6 Perspectives"** → **AWS CAF** (Topic 13 §6).
- **"Build a *business case* / justify a migration / projected savings before deciding"** → **Migration Evaluator** (formerly TSO Logic).
- **"Import an existing on-premises *virtual machine* / VMware image into EC2 as-is"** → **VM Import/Export** (image becomes an **AMI**).
- **"Migrate a database with minimal downtime / source stays online"** → **DMS.** **"Migrate to a *different* database engine / convert the schema"** → **DMS + SCT.**
- **"Track migration progress"** → **Migration Hub.**

---

## 7. Common Confusions to Nail

- **CAPEX vs OPEX** — CAPEX = *buy assets upfront* (physical, must guess); OPEX = *pay for usage over time* (non-physical, no guessing). On-prem ≈ CAPEX, cloud ≈ OPEX.
- **TCO vs sticker price** — TCO counts the *hidden* costs too (power, cooling, staff, real estate, idle capacity), which is why cloud usually wins even when the per-hour rate looks comparable.
- **AWS Pricing Calculator vs AWS Cost Explorer** — Pricing Calculator = **estimate future / plan / compare TCO** (before spending); Cost Explorer = **analyze actual past spend.** ⭐ Most-confused pair in this topic.
- **AWS Budgets vs Cost Explorer** — Budgets = **alert** when you cross a threshold (proactive); Cost Explorer = **visualize/analyze** what happened (retrospective).
- **CAF vs Well-Architected Framework** — CAF = **plan the migration *journey*** (6 *Perspectives*, Topic 13); WAF = **design a single *workload*** (6 *Pillars*, Topic 20).
- **Rehost vs Replatform vs Refactor** — Rehost = move as-is; Replatform = minor tweaks; Refactor = full cloud-native rewrite.
- **Pricing Calculator vs TCO Calculator** — the standalone *TCO Calculator* and *Simple Monthly Calculator* are **retired**; the **AWS Pricing Calculator** now does both jobs.
- **Migration Evaluator vs Pricing Calculator vs Migration Hub** — three free, distinct stages: **Migration Evaluator** = *decide/justify* (business case + TCO projection from your on-prem inventory) → **Pricing Calculator** = *estimate* a specific architecture you design → **Migration Hub** = *track* a migration in progress. **Decide → Estimate → Track.**
- **VM Import/Export vs MGN** — both rehost servers, but **VM Import/Export** = *manual, per-image* (upload a VM → AMI), while **Application Migration Service (MGN)** = *automated continuous replication* for large fleets. VM Import/Export is the simpler DIY path.
- **DMS vs SCT** — **DMS moves the *data*** (source stays online, minimal downtime); **SCT converts the *schema*** when the engines differ. Same-engine (**homogeneous**) = DMS alone; different-engine (**heterogeneous**, e.g. Oracle→Aurora PostgreSQL) = **SCT then DMS.**
- **DMS vs DataSync vs Snow** — **DMS = databases**, **DataSync = files/objects over the network**, **Snow Family = bulk data shipped physically** when the network is too slow.

---

## Quick Revision Cheat Sheet

| Concept | One-liner |
|---|---|
| **TCO** | All-in cost of a workload over its life (incl. hidden power/cooling/staff/idle costs) |
| **On-prem** | You own the data center → CAPEX, guess capacity, weeks to provision |
| **AWS/cloud** | Pay-as-you-go → OPEX, elastic, minutes to provision, global |
| **CAPEX** | Upfront spend on **physical** infrastructure; must **guess** capacity |
| **OPEX** | Ongoing **non-physical** usage spend; **no upfront** investment, try without equipment |
| **The shift** | Moving to AWS = **CAPEX → OPEX** = "trade fixed for variable expense" |
| **AWS Pricing Calculator** | Estimate AWS cost / compare on-prem-vs-AWS TCO (**before** you build) — free, no login, at **`calculator.aws`** |
| **Cost Explorer** | Analyze **actual** past/current spend |
| **AWS Budgets** | Alert when spend crosses a threshold |
| **Migration Evaluator** | Free service → **business case / TCO projection** for migrating (formerly **TSO Logic**) |
| **CAF** | Whitepaper to **plan** migration (6 Perspectives) |
| **7 R's** | Rehost, Replatform, Repurchase, Refactor, Retain, Retire, Relocate |
| **Migration tools** | Migration Hub (track), MGN (servers), DMS (databases), DataSync, **VM Import/Export** (VM image→AMI), Snow Family, MAP |
| **DMS** | Migrate a DB→DB with **minimal downtime** (source stays online); Source Endpoint→Replication Instance→Target Endpoint |
| **DMS + SCT** | **Heterogeneous** migration (different engines, e.g. Oracle→Aurora PostgreSQL): **SCT converts schema, DMS moves data** |

**Top exam points to remember:**
1. **CAPEX = upfront physical purchase (guess capacity); OPEX = pay-as-you-go usage (no guess).** Moving to AWS = **CAPEX → OPEX.**
2. **TCO** includes the **hidden** data-center costs (power, cooling, staff, real estate, idle capacity) — that's why cloud lowers cost even when raw rates look similar.
3. **AWS Pricing Calculator** = estimate cost / compare TCO **before** building; **Cost Explorer** = analyze **actual** spend; **Budgets** = alert on overspend.
4. **OPEX lets you "try a product without investing in equipment."**
5. **"Lift and shift" = Rehost**; **"drop and shop / move to SaaS" = Repurchase**; **re-architect = Refactor.**
6. **CAF plans the migration journey (6 Perspectives)** — don't confuse with the **WAF** (6 Pillars, designs a workload).
