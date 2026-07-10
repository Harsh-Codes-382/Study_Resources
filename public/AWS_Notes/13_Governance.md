# Governance

> **Exam:** AWS Certified Cloud Practitioner (CLF-C02)
> **Topic 13:** **Governance** — how you manage **many AWS accounts as one organization**: centralizing billing, enforcing guardrails, and keeping every account inside the rules. The headline service is **AWS Organizations**, and the exam loves the supporting cast: **Organizational Units (OUs)**, **Service Control Policies (SCPs)**, **consolidated billing**, and the **management (root) account**.

As a company grows it rarely lives in one AWS account — it spreads across **many accounts** (one per team, environment, or project) for isolation and clearer billing. Governance is the discipline of steering that fleet of accounts **centrally**: who can do what, who pays, and what rules everyone must follow. This builds directly on identity from Topic 10 — but where IAM controls *users inside one account*, governance controls *whole accounts inside one organization*.

---

## 1. AWS Organizations & Accounts

![AWS Organizations and Accounts — AWS Organizations creates/manages accounts, Root Account User has full access per account, Organizational Units group accounts into a hierarchy, and Service Control Policies set allowed permissions; right side shows a "Federation" with a Master/Root account branching into OUs (Starfleet, Federation Planets) each holding member accounts](AWS_NOtes_Images/AWS_Org_Accounts.png)

**AWS Organizations** is the service that lets you **create and centrally manage many AWS accounts as a single unit (an "organization").** From one place you handle **billing, access control, compliance, security, and resource sharing** across all of them.

### The four building blocks (from the slide)

| Term | What it is |
|---|---|
| **AWS Organizations** | The service that **creates new AWS accounts** and lets you **centrally manage billing, access, compliance, security, and shared resources** across all of them. |
| **Root Account User** | A **single sign-in identity with complete access** to all AWS services and resources **in an account**. **Every account has one Root Account User** (the account owner). |
| **Organizational Units (OUs)** | A **group of AWS accounts** within the organization. An OU **can contain other OUs**, so you build a **hierarchy** (a tree of accounts). |
| **Service Control Policies (SCPs)** | **Central control over the *allowed permissions*** for all accounts in the organization — guardrails that **keep every account inside your guidelines**. |

### The hierarchy (reading the diagram)

The diagram shows an organization shaped like a tree:

```
            Management / Root Account   ← the org's single owner account (pays the bills)
                     │
        ┌────────────┴────────────┐
     OU: "Starfleet"          OU: "Federation Planets"
     ├─ account (Section 31)   ├─ account (Earth)
     ├─ account (Corps of Eng) ├─ account (Vulcan)
     └─ account (Starfleet Cmd)└─ account (Betazed)
```

- At the top sits the **Management Account** (formerly "Master Account") — the account that **creates the organization and pays for everything**.
- Below it, **member accounts are grouped into OUs**, and OUs can nest into more OUs — letting you **apply one policy to a whole branch** instead of account-by-account.
- **SCPs attach to the root, an OU, or an account** and flow **downward** to everything beneath.

### Key facts the slide calls out

- **Once AWS Organizations is turned on, it cannot be turned off** lightly — treat enabling it as a deliberate step. *(More precisely: you must remove all member accounts before you can delete the organization.)*
- You can create **as many AWS accounts as you like**; **exactly one** is the **Management / Root Account**.
- ⭐ **An *AWS Account* is NOT the same as a *User Account*.** An **AWS account** is a container for all your AWS resources (with its own 12-digit ID and root user); a **user account / IAM user** is an *identity inside* an AWS account. The exam deliberately blurs these — don't fall for it.

### Why use AWS Organizations (exam angles)

- **Consolidated Billing** — **one bill for all accounts**, and **combined usage earns volume discounts** (e.g. tiered S3/EC2 pricing and pooled Reserved Instance / Savings Plans benefits) across the whole org.
- **Central governance** — apply **SCPs** as guardrails so member accounts physically *cannot* use disallowed services/regions, no matter what their own IAM says.
- **Isolation** — separate accounts give a hard security/blast-radius boundary (e.g. `prod` vs `dev`).
- **Automated account creation** and **resource sharing** across accounts.

> **SCP nuance (the classic trap):** an **SCP does NOT grant permissions** — it only sets the **maximum allowed permissions (a boundary/filter)**. A user's *effective* permissions = **what their IAM policy allows ∧ what the SCP allows**. If an SCP denies a service, **even the account's root user cannot use it.** SCPs **filter**, IAM **grants**.

> **Cross-links:** the **Root user** and **IAM users vs roles** are detailed in Topic 10 (Identity); **consolidated billing discounts** tie back to the EC2 pricing models in Topic 09; SCP guardrails complement **IAM least-privilege** from Topic 10.

---

## 2. AWS Control Tower

![AWS Control Tower — helps enterprises quickly set up a secure multi-account baseline environment; three pillars: Landing Zone (baseline well-architected environment with AWS SSO and centralized CloudTrail logging), Account Factory (automates and standardizes provisioning of pre-approved new accounts via Service Catalog), and Guardrails (pre-packaged governance rules for security, operations, and compliance); Control Tower is the replacement for the retired AWS Landing Zones](AWS_NOtes_Images/AWS_Control_Tower.png)

If **AWS Organizations** gives you the *raw* multi-account structure, **AWS Control Tower** is the **easy "set it up for me" layer on top.** It helps **enterprises quickly set up a secure, well-governed multi-account environment** — giving you a **baseline environment** to start with a **multi-account architecture** following AWS best practices, without wiring it all by hand.

> **Mental model:** **Organizations = the engine** (accounts, OUs, SCPs). **Control Tower = the automated setup wizard + ongoing governance dashboard** built *on top of* Organizations. Control Tower **uses** Organizations under the hood.

### The three pillars (from the slide)

| Pillar | What it is |
|---|---|
| **Landing Zone** | A **baseline environment** following **Well-Architected best practices**, ready to launch **production workloads**. Comes with **AWS SSO (IAM Identity Center) enabled**, **centralized logging for AWS CloudTrail**, and **cross-account security auditing** pre-configured. |
| **Account Factory** | **Automates and standardizes provisioning of new accounts.** Uses **pre-approved account configurations** (network config, allowed regions) and offers **self-service** account creation for your builders **via AWS Service Catalog**. |
| **Guardrails** | **Pre-packaged governance rules** for **security, operations, and compliance** that you **select and apply** — **enterprise-wide** or to **specific groups (OUs) of accounts**. |

### Guardrails — two behaviours to know

- **Preventive guardrails** → **stop** disallowed actions before they happen. **Implemented with SCPs** (from §1). E.g. "no one may disable CloudTrail."
- **Detective guardrails** → **detect & flag** non-compliant resources after the fact. **Implemented with AWS Config rules.** E.g. "alert if an S3 bucket becomes public."

> **Key exam line (on the slide):** **AWS Control Tower is the *replacement* for the retired AWS Landing Zone (the old manual solution).** If a question mentions "AWS Landing Zone," the modern answer is **Control Tower**.

### When to pick Control Tower (exam angle)

- "I want a **best-practice multi-account setup quickly / out of the box**" → **Control Tower**.
- "I want to **automate creating standardized new accounts**" → **Account Factory** (Control Tower).
- "I need **fine-grained, manual control** over OUs and SCPs and I'll build it myself" → just **AWS Organizations**.

> **Cross-links:** Control Tower stands on **Organizations + OUs + SCPs** (§1); its **Account Factory** is powered by **AWS Service Catalog**; **SSO** = **IAM Identity Center** (Topic 10); **Well-Architected** best practices come from Topic 02.

---

## 3. AWS Config

![AWS Config — a Compliance-as-Code framework to manage change in your AWS accounts on a per-region basis; explains Change Management (monitor/enforce/remediate changes) and Compliance-as-Code; use it to keep resources configured a specific way, track configuration changes, list all resources, and analyze security with historical data; diagram shows AWS Config running Config Rules (via Lambda) that evaluate resources as compliant (green check) or non-compliant (red X) and trigger remediation](AWS_NOtes_Images/AWS_Config.png)

**AWS Config** is a **Compliance-as-Code framework** that lets you **track, evaluate, and manage *changes* to your AWS resource configurations** — on a **per-region basis.** In short: it continuously answers *"what does my setup look like, how has it changed, and is it still compliant with my rules?"*

### Two concepts the slide defines first

| Concept | Meaning |
|---|---|
| **Change Management** | Having a **formal process** to **monitor → enforce → remediate** changes to your cloud infrastructure. |
| **Compliance-as-Code (CaC)** | Using **programming/automation** to **monitor, enforce, and remediate** changes so resources **stay compliant** with a compliance program or expected configuration. |

> **AWS Config is AWS's implementation of Compliance-as-Code** — it automates that monitor/enforce/remediate loop for you.

### When should you use AWS Config? (straight from the slide)

- "I want this **resource to stay configured a specific way** for **compliance**." (enforce a desired state)
- "I want to **keep track of configuration changes** to resources." (change history)
- "I want **a list of all resources** within a region." (inventory)
- "I want to **analyze potential security weaknesses** — I need **detailed historical information**." (security/audit forensics)

### How it works (the diagram)

1. **AWS Config records the configuration** of your resources and **every change** to them over time (a configuration timeline/history).
2. You attach **Config Rules** — checks that define the **desired/compliant state**. A rule runs (often backed by **Lambda**) and marks each resource **compliant (✅) or non-compliant (❌)**.
3. Non-compliant resources can trigger **remediation** (automatic fix, e.g. via **SSM Automation**) or an alert.

| Building block | What it does |
|---|---|
| **Configuration recorder / history** | Captures current config + full change timeline of resources |
| **Config Rules** | Evaluate resources against a desired state → compliant / non-compliant (**managed** rules provided by AWS, or **custom** via Lambda) |
| **Remediation** | Auto-fix or flag non-compliant resources |
| **Conformance packs** | A bundle of Config rules + remediations deployed as one unit |

### Key facts for the exam

- **Per-region service** — Config evaluates resources **region by region** (the slide stresses this).
- **Config = configuration state + change history + compliance**, *not* a record of API calls.
- Config Rules are exactly what power **Control Tower's *detective* guardrails** (§2).

> ⭐ **The #1 governance trap — AWS Config vs AWS CloudTrail:**
> - **AWS Config** = **WHAT** your resources are configured like and **HOW that configuration changed** (state + compliance over time).
> - **AWS CloudTrail** = **WHO** did **WHAT** API call, **WHEN**, and from **WHERE** (an audit log of actions).
> Need "is this resource compliant / what changed?" → **Config.** Need "who deleted the bucket / made this API call?" → **CloudTrail.**

> **Cross-links:** detective **Guardrails** in **Control Tower** (§2) are implemented with **Config rules**; remediation uses **Systems Manager** (Topic 03); pairs with **CloudTrail** for a full audit story.

### ⭐ AWS Config vs AWS AppConfig (the name trap)

![AWS Config vs AWS AppConfig comparison slide — left: AWS Config is a governance tool for Compliance as Code (CoC); you create rules that check whether resources are configured the way you expect; if a resource drifts from the expected configuration you are notified, or AWS Config can auto-remediate (correct) the configuration back to the expected state. Right: AWS AppConfig is used to automate the process of deploying application configuration variable changes to your web application(s); you can write a validator to ensure the changed variable won't break your web-app; you can monitor deployments and automate integrations to catch errors or roll back](AWS_NOtes_Images/AWS_Config_vs_AWSAppConfig.png)

These two sound almost identical but are **completely different services** — a favourite exam trick. The split is **infrastructure vs application**:

- **AWS Config → governs your *AWS resources*** ("is my **infrastructure** configured & compliant?").
- **AWS AppConfig → deploys your *application's* config settings** ("safely push **app feature/config changes** to my running code"). AppConfig is a **feature of AWS Systems Manager** (Topic 03).

| | **AWS Config** | **AWS AppConfig** |
|---|---|---|
| **What it's for** | **Governance / Compliance as Code (CoC)** for AWS resources | **Deploying application configuration changes** to your running app(s) |
| **What it watches/changes** | The **configuration of AWS resources** (e.g. "is this S3 bucket encrypted?") | **Application config variables / feature flags** inside *your* software |
| **Core action** | **Rules** check resources against expected config; alert or **auto-remediate** on **drift** | **Validate & roll out** a config change safely; **monitor & roll back** on errors |
| **Safety mechanism** | Detect non-compliance → notify / auto-correct back to expected state | **Validators** ensure a changed variable **won't break the web-app** |
| **Part of** | Standalone governance service | **AWS Systems Manager** |
| **Audience** | Security / governance / compliance | **Developers** shipping app config & feature flags |

> 🎯 **Exam reflex:**
> - "**compliance**, **rules**, resource **drift**, **auto-remediate** infrastructure" → **AWS Config**.
> - "**deploy application config / feature flags**, **validate** a change so it won't break the app, **roll back**" → **AWS AppConfig**.
>
> Memory hook: **Config = configure my *cloud* (resources & compliance)**; **AppConfig = configure my *app* (feature flags & settings)**. Also keep §3's other trap in mind — **Config ≠ CloudTrail** (state/compliance vs who-did-what).

---

## 4. Tagging

![AWS Tagging — a tag is a key and value pair you assign to AWS resources (e.g. Project = Enterprise); tag examples Dept=Finance, Status=Approved, Team=Compliance, Environment=Production, Project=Enterprise, Location=Canada; tags help organize resources for resource management, cost management/optimization, operations management, security, governance/compliance, automation, and workload optimization](AWS_NOtes_Images/AWS_Tagging.png)

A **tag** is a **key–value pair** that you **assign to AWS resources** as metadata — e.g. `Project = Enterprise`, `Environment = Production`. Tags don't change what a resource *does*; they **label** it so you can **organize, find, bill, secure, and automate** across thousands of resources.

### Tag examples (from the slide)

`Dept = Finance` · `Status = Approved` · `Team = Compliance` · `Environment = Production` · `Project = Enterprise` · `Location = Canada`

> Each tag = one **Key** (e.g. `Environment`) + one **Value** (e.g. `Production`). Tagging is **optional** but strongly recommended.

### What tags let you organize (the 7 uses on the slide)

| Use | Example |
|---|---|
| **Resource management** | Group specific workloads/environments, e.g. all *Developer* resources |
| **Cost management & optimization** | **Cost tracking, Budgets, Alerts** — see spend per team/project |
| **Operations management** | Track business commitments & SLAs, e.g. *Mission-Critical* services |
| **Security** | Classify data sensitivity and security impact |
| **Governance & regulatory compliance** | Prove/enforce which resources meet which rules |
| **Automation** | Let scripts/tools act on resources by tag (e.g. "stop all `Env=Dev` at night") |
| **Workload optimization** | Identify and right-size workloads |

### Exam-relevant tools & terms

| Term | What it is |
|---|---|
| **Cost Allocation Tags** | Tags you activate in **Billing** so AWS **breaks down your bill by tag** (e.g. cost per `Project` or `Team`). The #1 exam reason to tag. |
| **Tag Editor** | Find and **bulk-edit tags** across many resources/regions at once. |
| **Resource Groups** | Group resources **by tag** to view/manage them together. |
| **Tag Policies** | An **AWS Organizations** feature that **standardizes tags** (enforces required keys/casing) across all accounts → ties back to §1. |

### Key facts for the exam

- Tags are **key–value pairs / metadata** — the definition the exam wants.
- The most-tested purpose is **cost allocation / cost tracking** (filter and report spend by tag).
- A consistent **tagging strategy** underpins cost, security, automation, and governance — so it's a **best practice**, not just bookkeeping.

> **Cross-links:** cost-allocation tags feed **Consolidated Billing / Budgets** (§1 and Cost-management tooling); **Tag Policies** are enforced via **AWS Organizations** (§1); tag-based rules can be checked by **AWS Config** (§3).

---

## 5. Resource Groups

![AWS Resource Groups — a collection of resources that share one or more tags; helps organize and consolidate information by project and the resources you use; can display a group's Metrics, Alarms, and Configuration Settings, and you can modify which resources appear at any time; Resource Groups appears in the Global Console Header and under AWS Systems Manager (Application Management → Resource Groups, AppConfig, Parameter Store), and the dropdown includes Saved groups, Create a group, and Tag Editor](AWS_NOtes_Images/AWS_Resource_Groups.png)

**Resource Groups** are a **collection of AWS resources that share one or more tags.** They build directly on **Tagging (§4)** — you tag resources, then a Resource Group **gathers everything with matching tags** so you can **view and manage them together** instead of one resource at a time.

> **One-line link:** **Tags label individual resources → Resource Groups bundle the tagged resources into a manageable set.** (Tags = the labels; Resource Groups = the folders built from those labels.)

### What they do (from the slide)

- **Organize and consolidate** information by **project** and the resources you use.
- Display details about a **group of resources** based on:
  - **Metrics**
  - **Alarms**
  - **Configuration Settings**
- You can **modify the group's settings at any time** to change **which resources appear** (groups are dynamic — based on tag/query, not a frozen list).

### Where you find it (the slide calls this out)

| Location | Detail |
|---|---|
| **Global Console Header** | A **Resource Groups** dropdown at the top of the AWS Console → **Saved groups**, **Create a group**, **Tag Editor**. |
| **Under AWS Systems Manager** | Listed in **Systems Manager → Application Management** alongside **AppConfig** and **Parameter Store**. |

> **Exam takeaway:** Resource Groups live in **two places** — the **global console header** *and* **inside Systems Manager**. The **Tag Editor** is reached from the same Resource Groups menu.

### Key facts for the exam

- A Resource Group = **resources grouped by shared tag(s)** → reinforces *why* a tagging strategy matters (§4).
- Useful for **per-project dashboards, bulk operations, and automation** (e.g. run a Systems Manager command against a whole group).
- **Dynamic:** membership follows the tag/query, so newly-tagged resources appear automatically.

> **Cross-links:** depends on **Tagging (§4)**; surfaced through **AWS Systems Manager** (Topic 03); the **Tag Editor** referenced in §4 is opened from the Resource Groups menu.

---

## 6. AWS Cloud Adoption Framework (CAF)

![AWS Cloud Adoption Framework (CAF) — a whitepaper to help plan migration from on-premise to AWS; at the highest level it organizes guidance into six focus areas (perspectives): Business, People, Governance (business capabilities) and Platform, Security, Operations (technical capabilities), each describing how to update staff skills and organizational processes and the stakeholders involved](AWS_NOtes_Images/AWS_CAF.png)

The **AWS Cloud Adoption Framework (CAF)** is a **whitepaper** that helps an organization **plan and structure its migration from on-premise to AWS.** It's not a service you turn on — it's **guidance/best-practice advice** for getting your *people and processes* (not just tech) ready for the cloud.

> At the highest level, the CAF organizes its guidance into **six focus areas called "Perspectives."** Each perspective is about **how to update staff skills and organizational processes** for a group of stakeholders.

### The six Perspectives (from the slide)

| # | Perspective | Who (stakeholders) | Focus |
|---|---|---|---|
| 1 | **Business** | Business/Finance Managers, Budget Owners, Strategy | Optimize **business value** as ops move to the cloud |
| 2 | **People** | HR, Staffing, People Managers | Update the **workforce** — skills, roles, competencies in place at the right time |
| 3 | **Governance** | CIO, Program/Project Managers, Enterprise Architects, Business Analysts | Ensure **business governance**; **manage & measure cloud investments** vs business outcomes |
| 4 | **Platform** | CTO, IT Managers, Solution Architects | **Deliver and optimize** cloud solutions and services |
| 5 | **Security** | CISO, IT Security Managers/Analysts | Ensure the cloud architecture meets **security controls, resiliency, and compliance** |
| 6 | **Operations** | IT Operations/Support Managers | Ensure **system health & reliability**; run with agile, ongoing cloud best practices |

### The key grouping (the exam's favourite framing)

The six perspectives split into **two capability groups**:

| Group | Perspectives | About |
|---|---|---|
| **Business capabilities** | **Business · People · Governance** | The *people/organization* side |
| **Technical capabilities** | **Platform · Security · Operations** | The *technology* side |

> **Memory hook:** **"Business People Govern; Platforms Secure Operations."** First three = **business** capabilities, last three = **technical** capabilities.

### Key facts for the exam

- **CAF = a whitepaper / framework**, not a deployable service — it's **advice for planning cloud adoption & migration**.
- It has **six Perspectives** (focus areas); each is about **people + processes**, not just technology.
- **3 business + 3 technical** is the split most likely to be tested.

> **Cross-links:** don't confuse CAF with the **Well-Architected Framework** (Topic 02) — see §8 Common Confusions. The **Governance perspective** here is the strategic mindset behind everything else in this topic (Organizations, Control Tower, Config, Tagging).

---

## 7. Exam Triggers

- "**Centrally manage / create multiple AWS accounts**" → **AWS Organizations**.
- "**One consolidated bill / volume discounts across accounts**" → **Consolidated Billing** (a feature of AWS Organizations).
- "**Group accounts into a hierarchy / apply a policy to a group of accounts**" → **Organizational Units (OUs)**.
- "**Restrict / set maximum permissions for an entire account or OU / guardrails**" → **Service Control Policies (SCPs)**.
- "**Single identity with complete access to one account**" → **Root Account User**.
- "**The account that creates the org and pays the bills**" → **Management (Root) Account**.
- "**Deny a service across all accounts even for the root user**" → **SCP** (IAM alone can't restrict root).
- "**Difference between an AWS account and a user**" → AWS account = resource container; user = identity *inside* it.
- "**Quickly set up a secure, best-practice multi-account environment / baseline**" → **AWS Control Tower**.
- "**Landing zone / well-architected baseline environment**" → **AWS Control Tower** (Landing Zone).
- "**Automate & standardize provisioning of new accounts**" → **Account Factory** (Control Tower) + **Service Catalog**.
- "**Pre-packaged security/compliance rules applied across accounts**" → **Guardrails** (Control Tower).
- "**Replacement for AWS Landing Zone**" → **AWS Control Tower**.
- "**Track configuration changes / keep a resource configured a specific way / compliance-as-code**" → **AWS Config**.
- "**Inventory / list of all resources in a region**" → **AWS Config**.
- "**Is this resource compliant? / what changed in its config?**" → **AWS Config**.
- "**Who made this API call / who deleted it / when & from where**" → **AWS CloudTrail** (NOT Config).
- "**Deploy application config / feature flags safely, validate the change, roll back**" → **AWS AppConfig** (part of Systems Manager), NOT AWS Config.
- "**Detailed historical config information for security analysis**" → **AWS Config**.
- "**Key–value pair / label / metadata assigned to a resource**" → **Tag**.
- "**Break down / track the bill by team, project, or environment**" → **Cost Allocation Tags**.
- "**Bulk add or edit tags across many resources**" → **Tag Editor**.
- "**Enforce a consistent / required tagging standard across all accounts**" → **Tag Policies** (via Organizations).
- "**Group resources together to manage them**" → **Resource Groups** (by tag).
- "**Collection of resources that share one or more tags**" → **Resource Groups**.
- "**View metrics / alarms / config for a group of resources / per-project view**" → **Resource Groups**.
- "**Where do I find Resource Groups?**" → **Global Console Header** *and* under **AWS Systems Manager**.
- "**Whitepaper / framework to plan migration from on-premise to the cloud**" → **AWS Cloud Adoption Framework (CAF)**.
- "**Six perspectives / focus areas (Business, People, Governance, Platform, Security, Operations)**" → **CAF**.
- "**Update staff skills & organizational processes for cloud adoption**" → **CAF** (people + process focus).
- "**Best-practice pillars for designing a *workload/architecture*** (Operational Excellence, Security, Reliability…)" → **Well-Architected Framework** (Topic 02), NOT CAF.

---

## 8. Common Confusions to Nail

1. **AWS Account ≠ User Account.** An AWS account is a *container* (one root user, one 12-digit ID); a user/IAM user is an *identity inside* that account.
2. **SCPs don't grant — they limit.** They set the *ceiling*; you still need IAM policies to actually *allow* actions. Effective access = **IAM allow ∩ SCP allow**.
3. **SCPs apply even to the root user** of a member account — the one thing IAM cannot restrict, an SCP can.
4. **Management Account vs Member Account.** Only the **management account** controls the org, applies SCPs, and pays the bill; member accounts are governed *by* it. ("Master Account" is the old name for the management/root account.)
5. **OU ≠ IAM Group.** An **OU groups whole *accounts*** for policy; an **IAM group groups *users*** inside one account.
6. **Consolidated billing ≠ losing cost visibility** — you still see per-account usage, you just get **one payer and pooled discounts**.
7. **Organizations vs Control Tower.** **Organizations** = the underlying multi-account engine (you build OUs/SCPs yourself). **Control Tower** = an automated, opinionated layer *on top* that sets up a best-practice landing zone for you. Control Tower **needs** Organizations; Organizations does **not** need Control Tower.
8. **Control Tower Guardrails come in two flavours:** **preventive = SCPs** (block actions), **detective = AWS Config rules** (flag violations). Don't assume all guardrails just "block."
9. **AWS Config ≠ AWS CloudTrail.** **Config = resource *configuration* state + change history + compliance** ("what is it / what changed / is it compliant"). **CloudTrail = audit log of *API calls*** ("who did what, when, from where"). Easiest mix-up in this topic.
10. **AWS Config is per-region.** It evaluates and records resources **region by region** — not global. (Contrast with global services like IAM/Organizations.)
10b. **⭐ AWS Config ≠ AWS AppConfig.** Near-identical names, opposite jobs. **Config = govern *AWS resources*** (compliance, rules, drift, auto-remediate — *configure my cloud*). **AppConfig = deploy *application* config / feature flags** safely with validators & rollback, and it's a **feature of Systems Manager** (*configure my app*). "Compliance/drift" → Config; "feature flags / app config deploy" → AppConfig.
11. **A tag is just metadata (a key–value label)** — it doesn't grant permissions or change behaviour by itself. Its power comes from **what you do with it** (billing breakdown, automation, ABAC, grouping).
12. **Cost Allocation Tags vs ordinary tags.** Any tag exists immediately, but to see it on your **bill** you must **activate it as a cost allocation tag** in the Billing console first. "Track spend by tag" → cost allocation tags.
13. **Tags vs Resource Groups.** **Tags** are the *labels on individual resources*; a **Resource Group** is the *collection* built from resources sharing those tags. You need tags first; the group is the view on top.
14. **Resource Group ≠ AWS Organizations / OU.** A Resource Group bundles **resources by tag** within an account for management; an **OU** bundles **whole accounts** for policy (§1). Different scope entirely.
15. **CAF ≠ Well-Architected Framework.** ⭐ **CAF** = how to **plan your *organization's* migration/adoption** (people + process, **6 Perspectives**). **Well-Architected** (Topic 02) = how to **design a good *workload/architecture*** (the **6 Pillars**). CAF = the *journey to* the cloud; Well-Architected = building *well once you're there*.
16. **CAF is a whitepaper, not a service.** You don't deploy or configure it — it's planning guidance.
17. **CAF Perspectives split 3 + 3:** **Business / People / Governance = business** capabilities; **Platform / Security / Operations = technical** capabilities.

---

## Quick Revision Cheat Sheet

| Concept | What it is | Keyword |
|---|---|---|
| **AWS Organizations** | Create & centrally manage many AWS accounts as one org | "multiple accounts," "central management" |
| **Management (Root) Account** | The single owner account; creates the org, pays the bill | "master account," "payer" |
| **Member Account** | Any other account governed by the organization | "child account" |
| **Organizational Unit (OU)** | A group of accounts (can nest) for applying policy | "account hierarchy," "group of accounts" |
| **Service Control Policy (SCP)** | Guardrail setting the *max* allowed permissions | "restrict," "boundary," "even root" |
| **Root Account User** | Full-access identity, one per AWS account | "complete access," "account owner" |
| **Consolidated Billing** | One bill + pooled volume discounts | "single bill," "volume discount" |
| **AWS Account vs User** | Resource container vs identity inside it | the exam's favorite blur |
| **AWS Control Tower** | Automated best-practice multi-account setup on top of Organizations | "baseline," "quick secure multi-account" |
| **Landing Zone** | The ready-made baseline environment Control Tower builds | "well-architected baseline," "SSO + central logging" |
| **Account Factory** | Automated, standardized new-account provisioning (via Service Catalog) | "self-service accounts" |
| **Guardrails** | Pre-packaged governance rules (preventive=SCP, detective=Config) | "security/compliance rules" |
| **AWS Config** | Compliance-as-Code: track config + changes + compliance (per-region) | "configuration history," "is it compliant" |
| **Config Rules** | Checks marking resources compliant/non-compliant (managed or custom) | "desired state," "remediate" |
| **Config vs CloudTrail** | Config = resource state/changes; CloudTrail = who-did-what API log | "what changed" vs "who did it" |
| **AWS AppConfig** | Deploy **application config / feature flags** safely (validate + roll back); part of Systems Manager | "feature flags," "app config deploy" |
| **Config vs AppConfig** | Config = govern **AWS resources** (compliance) · AppConfig = deploy **app config** (feature flags) | "configure my cloud" vs "configure my app" |
| **Tag** | Key–value metadata label on a resource | "key-value pair," "metadata" |
| **Cost Allocation Tags** | Activated tags that break the bill down by tag | "track cost by team/project" |
| **Tag Editor** | Bulk find/edit tags across resources | "manage many resources" |
| **Resource Groups** | Collection of resources sharing tag(s); view metrics/alarms/config | "group by tag," "per-project view" |
| **Tag Policies** | Org-wide enforced tagging standard | "consistent tags across accounts" |
| **Cloud Adoption Framework (CAF)** | Whitepaper to plan on-premise→cloud migration | "plan migration," "6 perspectives" |
| **CAF — 6 Perspectives** | Business, People, Governance / Platform, Security, Operations | "3 business + 3 technical" |
| **CAF vs Well-Architected** | CAF = plan the migration (org); WAF = design the workload | "journey" vs "build well" |

### Top exam points to remember
1. **AWS Organizations = manage many accounts centrally** — billing, access, compliance, security, resource sharing.
2. **SCPs set the *maximum* permissions (guardrails); they don't grant.** Effective access = **IAM ∩ SCP**, and SCPs **apply even to a member account's root user.**
3. **OUs group accounts into a hierarchy** so one policy covers a whole branch.
4. **Consolidated billing** gives **one bill** and **pooled volume discounts** across the org.
5. **An AWS account is a resource container, not a user** — exactly one **management/root account** runs the org.
6. **AWS Control Tower = automated best-practice multi-account setup *on top of* Organizations** — its **Landing Zone** (baseline env), **Account Factory** (standardized new accounts via Service Catalog), and **Guardrails** (preventive=SCP / detective=Config). It is the **replacement for the retired AWS Landing Zone**.
7. **AWS Config = Compliance-as-Code** — tracks resource **configuration, change history, and compliance** (via **Config Rules** + remediation), **per region**. Remember **Config = "what is it / what changed"** vs **CloudTrail = "who did it."** And ⭐ **Config ≠ AppConfig**: Config governs **AWS resources** (compliance/drift), while **AppConfig** (a Systems Manager feature) deploys **application config / feature flags** safely with validators & rollback — *configure my cloud* vs *configure my app*.
8. **A tag = a key–value label** for organizing resources; its top exam purpose is **cost allocation** (track spend by team/project/environment), plus security, automation, and governance. **Tag Policies** (via Organizations) enforce a consistent standard org-wide.
9. **Resource Groups = a collection of resources that share tag(s)** — view their **metrics/alarms/config** together for per-project management. Found in the **global console header** and under **Systems Manager**. (Tags label; Resource Groups bundle.)
10. **AWS CAF = a whitepaper to plan on-premise→cloud migration**, organized into **6 Perspectives** = **Business, People, Governance** (business capabilities) + **Platform, Security, Operations** (technical capabilities). Don't confuse it with the **Well-Architected Framework** (Topic 02), which is about designing a good *workload*, not planning the *organization's* adoption.
</content>
