# Computing Services

> **Exam:** AWS Certified Cloud Practitioner (CLF-C02)
> **Topic 5:** **Compute** is the muscle of AWS — the services that actually *run* your code and applications. The exam expects you to recognise each compute service, know **what kind of workload it fits**, and place it on the **management spectrum** (you-manage-most → AWS-manages-most). This topic starts with **EC2**, the service everything else is built on.

Compute is where your application *executes*. AWS offers several flavours — virtual machines, containers, and serverless functions — and the trick on the exam is matching the **right compute model to the scenario**. Get comfortable with EC2 first, because, as you'll see, it is literally the foundation the other services stand on.

---

## 1. Amazon EC2 — Elastic Compute Cloud

![Amazon EC2 (Elastic Compute Cloud) overview — launch Virtual Machines (VMs) called "instances"; a highly configurable server where you choose an AMI affecting CPU, memory, network, OS and storage; an AMI is a predefined VM configuration; EC2 is the backbone of AWS underpinning S3, RDS, DynamoDB and Lambda](AWS_NOtes_Images/EC2_Intro.png)

**Amazon EC2 (Elastic Compute Cloud)** lets you **launch Virtual Machines (VMs)** in the AWS cloud. It is the **core compute service** — rent a server by the second/hour instead of buying physical hardware.

### What is a Virtual Machine (VM)?
A **Virtual Machine is an emulation of a physical computer using software.** **Server virtualization** lets you easily **create, copy, resize, or migrate** a server. **Multiple VMs can run on the same physical server**, so the cost of that hardware is **shared across customers**.

> **Mental model:** imagine your whole server or computer was just an **executable file** sitting on a host machine — that's essentially what a VM is. AWS runs many such "files" on one physical box.

### The key term: "instance"
> **When you launch a Virtual Machine on EC2, it is called an "instance."** (Exam loves this word — "instance" = a running EC2 VM.)

### EC2 is a *highly configurable* server
When you launch an instance you choose an **AMI (Amazon Machine Image)**, which determines configuration options such as:

| Option | Examples |
|---|---|
| **Number of CPUs** | vCPUs allocated to the instance |
| **Amount of Memory (RAM)** | e.g. 1 GB → hundreds of GB |
| **Network Bandwidth** | how much network throughput the instance gets |
| **Operating System (OS)** | **Windows**, **Ubuntu**, **Amazon Linux 2**, etc. |
| **Storage** | attach **multiple virtual hard drives**, e.g. **Elastic Block Store (EBS)** |

### What is an AMI?
> **An Amazon Machine Image (AMI) is a predefined configuration (a template) for a Virtual Machine** — it bundles the OS and settings used to launch an instance.

### Why EC2 matters most
> **EC2 is considered the *backbone of AWS*** because the **majority of AWS services use EC2 as their underlying servers** — for example **S3, RDS, DynamoDB, and Lambda** all run on EC2 behind the scenes.

---

## 2. The Compute Landscape — Virtual Machines, Containers & Serverless

![Computing Services landscape — three families: Virtual Machines (Amazon Lightsail, the friendly EC2); Containers (ECS = Docker orchestration, ECR = image repository, ECS Fargate = serverless containers, EKS = managed Kubernetes); and Serverless (AWS Lambda = run code without managing servers)](AWS_NOtes_Images/Computing_Services.png)

AWS compute splits into **three families**. The exam wants you to match a scenario to the right family first, then the right service:

> **VMs** = you get a whole server → **Containers** = package an app to run many per server → **Serverless** = just run code, no servers to think about. **The more you move right, the less infrastructure you manage** (echoes the IaaS → FaaS slide in [[shared-responsibility]], Topic 4).

### 🟦 Virtual Machines — *an emulation of a physical computer using software*

| Service | What it is | When to use |
|---|---|---|
| **Amazon EC2** | The full, highly-configurable VM (Section 1) — the heavyweight. | You need full control over the server. |
| **Amazon Lightsail** | A **managed virtual server service** — the **"friendly" / simplified version of EC2**. Bundles compute, storage, and networking at a **predictable low price**. | You need to **launch a Linux/Windows server but don't have much AWS knowledge** — e.g. **launch a WordPress site** quickly. |

### 🟩 Containers — *virtualizing the OS so multiple workloads share one OS instance*
Containers **virtualize the operating system** to run **multiple workloads on a single OS instance**. They're generally used in **micro-service architecture** — where you split an application into smaller applications that talk to each other.

| Service | What it is | Keyword / when to use |
|---|---|---|
| **ECS** (Elastic Container Service) | A **container orchestration service** that supports **Docker**. Launches a **cluster of EC2 instances** with Docker installed. | **"Docker as a Service"** — you need to run containers. |
| **ECR** (Elastic Container Registry) | A **repository for container images**. To launch a container you need an **image** (a saved copy); a **repository** is storage with retention control. | **"store container images"** / registry. |
| **ECS Fargate** | A **serverless** container orchestration service — **same as ECS except you pay on-demand per running container.** AWS manages the underlying server, so **you don't scale or upgrade EC2**. (Plain ECS makes you keep an EC2 server running even with **no** containers.) | **"run containers without managing servers"** / no idle EC2. |
| **EKS** (Elastic Kubernetes Service) | A **fully managed Kubernetes** service. **Kubernetes (K8s)** is open-source orchestration software **created by Google**, the standard for managing microservices. | **"Kubernetes as a Service."** |

> **ECS vs Fargate — the exam trap:** **ECS** runs containers on **EC2 servers *you* keep running** (you pay even when idle). **Fargate** is **serverless** — you **pay per running container** and AWS manages the servers. "Don't want to manage/scale the EC2 behind my containers" → **Fargate**.
> **ECS vs EKS:** both orchestrate containers — **ECS = AWS's own (Docker-focused)**, **EKS = managed Kubernetes (the open-source standard)**.

### 🟨 Serverless — *the underlying servers are fully managed by AWS*
**Serverless** means the underlying servers are **managed by AWS** — you **don't provision, configure, or worry about servers** at all.

| Service | What it is | Key facts |
|---|---|---|
| **AWS Lambda** | A **serverless functions service** — run code **without provisioning or managing servers**. | Upload **small pieces of code**, choose **memory** and a **timeout**; **charged on runtime, rounded to the nearest 100 ms**. Inherently elastic. |

### Quick "which compute?" guide
| You want to… | Use |
|---|---|
| Full control of a virtual server | **EC2** |
| A simple, cheap, predictable server (no deep AWS knowledge) | **Lightsail** |
| Run Docker containers (managing the EC2 cluster yourself) | **ECS** |
| Store your container images | **ECR** |
| Run containers **without** managing any servers | **Fargate** |
| Run **Kubernetes** as a managed service | **EKS** |
| Just run code with **no servers at all** | **Lambda** |

---

## 3. High Performance Computing (HPC) & the Nitro System

![Higher Performance Computing Services — the Nitro System (Nitro Cards, Security Chips, Hypervisor) powering all new EC2 instances; Bare Metal instances (M5, R5) with no hypervisor; Bottlerocket OS for containers; High Performance Computing (HPC) clusters; and AWS ParallelCluster to deploy/manage HPC](AWS_NOtes_Images/HPC.png)

This group is about squeezing **maximum performance** out of EC2 — the underlying technology (**Nitro**), the rawest instance type (**Bare Metal**), a purpose-built container OS (**Bottlerocket**), and clustering many servers together for supercomputer-scale work (**HPC + ParallelCluster**).

### The Nitro System
The **Nitro System** is a combination of **dedicated hardware and a lightweight hypervisor** that enables **faster innovation and enhanced security**. **All new EC2 instance types use the Nitro System.**

| Component | What it does |
|---|---|
| **Nitro Cards** | Specialized cards for **VPC, EBS, and Instance Storage**, plus a controller card — offload networking/storage off the main CPU. |
| **Nitro Security Chips** | **Integrated into the motherboard**; **protect the hardware resources**. |
| **Nitro Hypervisor** | A **lightweight hypervisor** handling **memory and CPU allocation**, delivering **bare-metal-like performance**. |

### Bare Metal Instance
A **Bare Metal instance** is an EC2 instance with **no hypervisor**, so you run workloads **directly on the hardware** for **maximum performance and control**.
- The **M5** and **R5** EC2 instances run as **bare metal**.

### Bottlerocket
**Bottlerocket** is a **Linux-based, open-source operating system** that is **purpose-built by AWS for running containers** — on Virtual Machines **or** bare-metal hosts.

### What is High Performance Computing (HPC)?
**HPC** is a **cluster of hundreds of thousands of servers** with **fast connections between them**, whose purpose is to **boost computing capacity**.
> Use it when you need a **supercomputer** to perform **computational problems too large to run on standard computers** or that would **take too long**. (e.g. genomics, weather modelling, simulations, financial risk.)

### AWS ParallelCluster
**AWS ParallelCluster** is an **AWS-supported, open-source cluster-management tool** that makes it **easy to deploy and manage HPC clusters** on AWS.

- **Built on AWS CloudFormation** — ParallelCluster takes your simple text **config file** and uses **CloudFormation** (Topic 3 — declarative IaC) to **provision the whole cluster as a stack** (the EC2 compute fleet, networking, shared storage, scheduler). So the cluster is created/updated/torn down the same repeatable, version-controlled way as any other CloudFormation stack.
- **Driven by the `pcluster` CLI** — you operate it with the **`pcluster`** command-line tool (e.g. `pcluster create-cluster`, `pcluster delete-cluster`), which builds and manages those CloudFormation stacks for you.

> **Mental model:** **HPC** = the *concept* (a supercomputer made of many fast-connected servers); **AWS ParallelCluster** = the *tool* you use to **build and manage** that HPC cluster; the **`pcluster` CLI** is *how you drive it*, and **CloudFormation** is *what it uses under the hood* to provision everything.

---

## 4. Edge & Hybrid Computing Services

![Edge and Hybrid Computing Services — Edge computing (pushing compute close to the destination, e.g. phones/IoT); Hybrid computing (running workloads across on-premise + AWS VPC); AWS Outposts (rack of servers in your data center), AWS Wavelength (apps in a 5G telecom data center), VMware Cloud on AWS (manage on-prem VMware VMs as EC2), AWS Local Zones (edge data centers outside an AWS Region)](AWS_NOtes_Images/Edge_Hybrid_High_Computing_service.png)

Two concepts the exam defines precisely:

| Concept | Definition |
|---|---|
| **Edge Computing** | Pushing computing workloads **outside your network to run close to the destination location** — e.g. on **phones, IoT devices, or external servers** not within your cloud network. |
| **Hybrid Computing** | Being able to run workloads on **both** your **on-premise data center *and* Amazon VPC** (the AWS cloud) at the same time. |

> **Edge = close to the *end user/device*. Hybrid = spanning *on-prem + cloud*.** Don't mix them.

### The services

| Service | What it does | Angle / keyword |
|---|---|---|
| **AWS Outposts** | A **physical rack of servers** you put **in your own data center** — lets you use **AWS APIs and services (e.g. EC2) right in your data center**. | **Hybrid** — AWS hardware on-prem. *(Full detail in Topic 1.)* |
| **AWS Wavelength** | **Build & launch applications in a telecom data center**, so they get **ultra-low latency** by being pushed over the **5G network**, as close as possible to the end user. | **Edge** — 5G / mobile. *(Topic 1.)* |
| **VMware Cloud on AWS** | Lets you **manage on-premise virtual machines using VMware as EC2 instances**. The data center **must already use VMware** for virtualization. | **Hybrid** — VMware shops migrating/extending to AWS. |
| **AWS Local Zones** | **Edge data centers located outside an AWS Region**, so AWS sits **closer to the end destination** — faster compute, storage, and databases in **populated areas far from a Region**. | **Edge** — low latency in a specific metro. *(Topic 1.)* |

> **Cross-reference:** **Outposts**, **Wavelength**, and **Local Zones** are explained in depth in **Topic 1 — AWS Global Infrastructure**. Here they're grouped by their **compute role**: which ones bring AWS *on-prem* (**hybrid**) vs *close to users* (**edge**). **VMware Cloud on AWS** is the new one — the go-to answer for **"we run VMware on-prem and want to extend/migrate to AWS."**

---

## 5. Cost & Capacity Management Services

![Cost and Capacity Management Computing Services — EC2 purchasing options (Spot, Reserved, Savings Plans) to save money; AWS Batch for batch workloads; AWS Compute Optimizer (ML-based right-sizing); EC2 Auto Scaling Groups; Elastic Load Balancer; and AWS Elastic Beanstalk for easy app deployment](AWS_NOtes_Images/Cost_Capacity_Management_Computing_Service.png)

Two related questions the exam frames this around:

| Concept | The question it answers |
|---|---|
| **Cost Management** | **"How do we save money?"** |
| **Capacity Management** | **"How do we meet the demand of traffic/usage** by adding or upgrading servers?" |

### EC2 purchasing options — *the cost levers*
Ways to **save on compute** by **paying up front** (full/partial), **committing to a term**, or **being flexible about interruption**. The four exam-critical models:

| Option | How you save | Best for |
|---|---|---|
| **On-Demand** | No commitment — **pay per second/hour** (the baseline, most expensive). | Short-term, unpredictable, spiky workloads. |
| **Reserved Instances (RI)** | **Commit to 1 or 3 years** (pay all/partial/no upfront) → big discount. | **Steady, predictable** always-on workloads. |
| **Savings Plans** | Commit to a **$/hour of compute** for 1–3 years → discount with **more flexibility** than RIs. | Steady usage where you want flexibility across instance types/services. |
| **Spot Instances** | Use **spare AWS capacity** at up to ~90% off — but AWS **can interrupt/reclaim** them anytime. | **Fault-tolerant, flexible, interruptible** work (batch, CI, big data). |

> **Exam shortcut:** **predictable & long-term → Reserved / Savings Plans**; **can tolerate interruption & want cheapest → Spot**; **short-term & unpredictable → On-Demand**.

### Capacity & deployment helpers

| Service | What it does | Keyword |
|---|---|---|
| **AWS Batch** | **Plans, schedules, and executes batch computing workloads** across the full range of AWS compute services; can use **Spot Instances** to save money. | "batch jobs," "schedule/run batch workloads" |
| **AWS Compute Optimizer** | Uses **machine learning** to analyze your **past usage history** and recommends how to **reduce cost and improve performance** (right-sizing). | "ML recommendations," "right-size," "based on usage history" |
| **EC2 Auto Scaling Groups (ASG)** | **Automatically adds/removes EC2 instances** to meet current traffic demand — you only run what you need. | "auto add/remove servers," "match demand" *(detail in Topic 2 — Elasticity)* |
| **Elastic Load Balancer (ELB)** | **Distributes traffic** across instances and **re-routes from unhealthy to healthy** ones, across **multiple AZs**. | "distribute traffic," "route around failures" *(detail in Topic 2 — HA)* |
| **AWS Elastic Beanstalk (EB)** | **Easily deploy web applications** without developers having to set up or understand the underlying AWS services — **similar to Heroku**. (PaaS.) | "deploy app without managing infrastructure," "like Heroku," "PaaS" |

> **Cross-reference:** **ASG (Elasticity)** and **ELB (High Availability)** are explained fully in **Topic 2 — Cloud Architecture**. They appear here because together they form the **cost+capacity engine**: ASG runs **only as many servers as you need**, and ELB **spreads traffic across them** — you save money *and* meet demand.

---

## 6. Exam Triggers

- "**Launch a virtual machine / server in the cloud**" → **EC2**.
- "A running EC2 virtual machine is called an…" → **instance**.
- "**Predefined template / configuration** used to launch an instance (OS + settings)" → **AMI (Amazon Machine Image)**.
- "Choose **CPU, RAM, network, OS, storage** for a server" → **EC2 (highly configurable)**.
- "Attach **virtual hard drives / block storage** to an instance" → **EBS (Elastic Block Store)**.
- "**Most fundamental / backbone compute service** other AWS services run on" → **EC2**.
- "Run **multiple VMs on the same physical hardware**, sharing cost" → **server virtualization**.
- "**Simple / friendly / cheap** server, **little AWS knowledge**, launch a **WordPress** site" → **Lightsail**.
- "Run **Docker containers** / container **orchestration** on a cluster I manage" → **ECS**.
- "**Store / repository for container images**" → **ECR**.
- "Run containers **without managing or scaling servers** / pay **per running container**" → **Fargate**.
- "Managed **Kubernetes** / **K8s** as a service / open-source orchestration standard" → **EKS**.
- "Run **code without managing servers** / **serverless**, billed per **100 ms** of runtime" → **Lambda**.
- "**Dedicated hardware + lightweight hypervisor**, used by **all new EC2 types**" → **Nitro System**.
- "EC2 with **no hypervisor** / run **directly on the hardware** / **M5, R5**" → **Bare Metal instance**.
- "**Open-source OS purpose-built by AWS for running containers**" → **Bottlerocket**.
- "**Supercomputer** / cluster of many fast-connected servers / problem too big for a normal computer" → **HPC**.
- "**Deploy and manage an HPC cluster** on AWS (the tool)" → **AWS ParallelCluster**.
- "ParallelCluster **CLI command** to create/manage a cluster" → **`pcluster`**.
- "ParallelCluster **provisions the cluster** using which IaC service?" → **CloudFormation** (Topic 3).
- "Push compute **close to the end user / onto phones / IoT devices**" → **Edge Computing**.
- "Run workloads on **both on-premise *and* AWS**" → **Hybrid Computing**.
- "We run **VMware on-prem** and want to **manage those VMs as EC2 / extend to AWS**" → **VMware Cloud on AWS**.
- "**Rack of AWS servers in my own data center**" → **AWS Outposts**.
- "Ultra-low latency over **5G / telecom** network" → **AWS Wavelength**.
- "AWS **edge data center outside a Region**, closer to users in a metro" → **AWS Local Zones**.
- "**Cheapest** EC2, can be **interrupted**, spare capacity, fault-tolerant work" → **Spot Instances**.
- "**Commit 1–3 years** for a discount on **steady/predictable** workloads" → **Reserved Instances** (or **Savings Plans** for flexibility).
- "**Short-term / unpredictable**, pay per hour, no commitment" → **On-Demand**.
- "Plan, schedule & run **batch computing workloads**" → **AWS Batch**.
- "**ML recommendations** to reduce cost / right-size based on **past usage**" → **AWS Compute Optimizer**.
- "**Deploy a web app without managing the underlying infrastructure** / like **Heroku**" → **Elastic Beanstalk**.

---

## 7. Common Confusions to Nail

1. **EC2 ≠ AMI.** EC2 is the *service that runs the instance*; the **AMI is the template** you launch it *from*.
2. **"Instance" is the running thing.** The AMI is the blueprint; the **instance** is the live VM created from it.
3. **EBS is separate storage, not EC2 itself.** EC2 is the compute; **EBS** is the attachable virtual hard drive.
4. **Virtualization = shared hardware, not shared data.** Multiple customers' VMs sit on one physical server, but they're **isolated** (the hypervisor — AWS's responsibility, per the [[shared-responsibility]] model).
5. **EC2 is IaaS** — you still manage the **guest OS and patching** yourself (links back to Shared Responsibility Model, Topic 4).
6. **ECS vs Fargate.** ECS = containers on **EC2 servers you keep running** (pay even when idle). Fargate = **serverless**, pay **per running container**, AWS manages the servers.
7. **ECS vs EKS.** Both orchestrate containers: **ECS = AWS's own Docker service**; **EKS = managed Kubernetes** (the open-source standard from Google).
8. **ECR is *storage*, not compute.** It's the **image repository** — it holds the images ECS/EKS/Fargate then run.
9. **Lightsail vs EC2.** Lightsail = **simplified, predictable-price** server for beginners; EC2 = **full control & configurability**.
10. **Lambda vs Fargate (both "serverless").** Lambda runs **your code/functions** (event-driven, 100 ms billing); Fargate runs **your containers** without managing servers.
11. **Nitro vs Bare Metal.** **Nitro** = the underlying hardware+hypervisor tech behind *all new* EC2; **Bare Metal** = an instance with **no hypervisor** for direct hardware access.
12. **Bottlerocket is an OS, not a service.** It's an **AWS-built Linux OS for containers** — not an orchestrator (that's ECS/EKS).
13. **HPC vs ParallelCluster.** **HPC** = the *concept* (supercomputer-scale cluster); **ParallelCluster** = the *tool* to deploy/manage it.
14. **Edge vs Hybrid.** **Edge** = compute **close to the end user/device** (Wavelength, Local Zones); **Hybrid** = workloads spanning **on-prem + AWS** (Outposts, VMware Cloud on AWS).
15. **VMware Cloud on AWS requires VMware on-prem.** It only fits when the data center **already virtualizes with VMware** — it manages those VMs as EC2.
16. **Outposts vs VMware Cloud on AWS.** Outposts = **AWS hardware placed in *your* data center**; VMware Cloud on AWS = **manage *your existing VMware* VMs in AWS** (no new hardware shipped to you).
17. **Reserved Instances vs Savings Plans.** Both are **1–3 year commitments** for a discount; **RIs** lock to instance attributes, **Savings Plans** commit to a **$/hour** spend with **more flexibility**.
18. **Spot ≠ Reserved.** Spot = **cheapest but interruptible** (spare capacity); Reserved = **discount for a long-term commitment** on steady workloads. Don't put production-critical, non-interruptible work on Spot alone.
19. **Compute Optimizer vs Trusted Advisor.** Compute Optimizer = **ML right-sizing from usage history** (Topic 5); Trusted Advisor = **broad best-practice checks** across 5 categories (Topic 3).
20. **Elastic Beanstalk vs CloudFormation.** Beanstalk = **deploy an app, AWS handles the infra** (PaaS, "like Heroku"); CloudFormation = **define any infrastructure as code** (Topic 3). Beanstalk *uses* CloudFormation under the hood.

---

## Quick Revision Cheat Sheet

| Concept | Meaning | Keyword |
|---|---|---|
| **EC2** | Elastic Compute Cloud — launch VMs in AWS | "virtual machine," "server in the cloud" |
| **Instance** | A **running** EC2 virtual machine | "launched VM" |
| **AMI** | Amazon Machine Image — **predefined VM template** (OS + config) | "image," "template," "predefined configuration" |
| **Configurable options** | CPU, RAM, network bandwidth, OS, storage | "choose your server specs" |
| **EBS** | Elastic Block Store — virtual hard drives attached to EC2 | "block storage," "virtual hard drive" |
| **Server virtualization** | Many VMs share one physical server | "emulation," "shared hardware" |
| **Backbone of AWS** | Most AWS services run **on EC2** under the hood | "S3, RDS, DynamoDB, Lambda run on EC2" |
| **Lightsail** | Managed, simplified, predictable-price VM | "friendly EC2," "beginner," "WordPress" |
| **ECS** | Container orchestration on an EC2 cluster (Docker) | "Docker as a Service," "run containers" |
| **ECR** | Repository for container **images** | "image registry," "store images" |
| **Fargate** | **Serverless** containers — pay per running container | "no servers to manage," "per-container" |
| **EKS** | Managed **Kubernetes** (K8s) | "Kubernetes as a Service" |
| **Lambda** | **Serverless** functions — run code, no servers | "serverless," "run code," "100 ms billing" |
| **Nitro System** | Dedicated hardware + lightweight hypervisor behind all new EC2 | "Nitro cards/chips/hypervisor," "all new EC2" |
| **Bare Metal** | EC2 with **no hypervisor** — direct hardware access | "M5, R5," "no hypervisor," "max performance" |
| **Bottlerocket** | AWS open-source Linux OS for running containers | "container OS," "purpose-built by AWS" |
| **HPC** | Supercomputer-scale cluster of fast-connected servers | "supercomputer," "huge computation" |
| **AWS ParallelCluster** | Tool to deploy/manage HPC clusters (uses **CloudFormation**, driven by **`pcluster`** CLI) | "manage HPC cluster," "pcluster," "CloudFormation under the hood" |
| **Edge Computing** | Compute pushed close to the end user/device | "phones, IoT, close to destination" |
| **Hybrid Computing** | Workloads across on-prem + AWS VPC | "on-premise *and* cloud" |
| **AWS Outposts** | AWS server rack in your own data center | "AWS hardware on-prem" (Topic 1) |
| **AWS Wavelength** | Apps in a 5G telecom data center | "5G, ultra-low latency" (Topic 1) |
| **VMware Cloud on AWS** | Manage on-prem VMware VMs as EC2 | "we use VMware on-prem" |
| **AWS Local Zones** | Edge data centers outside an AWS Region | "closer to users in a metro" (Topic 1) |
| **On-Demand** | Pay per second/hour, no commitment (baseline) | "short-term," "unpredictable" |
| **Reserved Instances** | 1–3 yr commitment → discount | "steady," "predictable," "commit" |
| **Savings Plans** | Commit to $/hour for 1–3 yr → flexible discount | "flexible commitment" |
| **Spot Instances** | Spare capacity, up to ~90% off, interruptible | "cheapest," "interruptible," "fault-tolerant" |
| **AWS Batch** | Schedule & run batch workloads (can use Spot) | "batch jobs" |
| **Compute Optimizer** | ML right-sizing from usage history | "reduce cost," "right-size," "ML" |
| **Elastic Beanstalk** | Deploy apps without managing infra (PaaS, like Heroku) | "deploy app easily," "Heroku" |

### Top exam points to remember
1. **EC2 = launch virtual machines (instances) in the cloud** — the core compute service.
2. A launched VM is an **"instance"**; the template it's built from is an **"AMI."**
3. EC2 is **highly configurable**: CPU, memory, network, OS, and attachable **EBS** storage.
4. EC2 is the **backbone of AWS** — S3, RDS, DynamoDB, and Lambda all run on it.
5. EC2 is **IaaS**, so **you** still manage the guest OS and patching (Shared Responsibility Model).
6. **Three compute families:** **VMs** (EC2, Lightsail) → **Containers** (ECS, ECR, Fargate, EKS) → **Serverless** (Lambda) — the further right, the **less infrastructure you manage**.
7. **ECS = Docker on EC2 you run; Fargate = serverless containers (pay per container); EKS = managed Kubernetes; ECR = where the images live.**
8. **Lambda vs Fargate:** Lambda runs **code/functions**; Fargate runs **containers** — both serverless.
9. **Nitro System powers all new EC2** (hardware + lightweight hypervisor); **Bare Metal** = EC2 with **no hypervisor** (M5, R5).
10. **HPC** = supercomputer-scale cluster; **AWS ParallelCluster** = the tool to deploy/manage it; **Bottlerocket** = AWS's container OS.
11. **Edge = close to the end user** (Wavelength, Local Zones); **Hybrid = on-prem + AWS** (Outposts, VMware Cloud on AWS). **VMware Cloud on AWS** needs **VMware already on-prem**.
12. **EC2 pricing:** **On-Demand** (short/unpredictable) · **Reserved/Savings Plans** (commit 1–3 yr, steady) · **Spot** (cheapest, interruptible). **Compute Optimizer** ML-recommends right-sizing; **Elastic Beanstalk** deploys apps for you (PaaS, "like Heroku").
