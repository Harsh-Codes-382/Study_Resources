# Exam Initialisms & Acronyms (Quick-Reference / Revision)

> **Exam:** AWS Certified Cloud Practitioner (CLF-C02)
> **Topic 24:** **Know Your Initialisms** — a dedicated **revision / quick-reference** topic. The CLF-C02 exam loves to drop a service by its **acronym** ("Which service do you use — *SQS* or *SNS*?"). If you can instantly expand the initialism, half the question is already answered. This topic collects the common AWS initialisms, links each to where it's covered in depth, and flags the ones whose **official expansion differs from the slide**.

This is a **lookup sheet**, not a concept topic — skim it before the exam. The service details live in their own Topics (linked); here we just nail **letter → words → what it is**.

---

## 1. The Initialisms (grouped for recall)

### Identity, Security & Governance

| Acronym | Expansion | One-liner | Topic |
|---|---|---|---|
| **IAM** | **Identity and Access Management** | Users, groups, roles, policies (authn + authz) | [10](10_Identity.md) |
| **PoLP** | **Principle of Least Privilege** | Grant only the permissions actually needed | [10](10_Identity.md) |
| **WAF** | **Web Application Firewall** | Filters malicious L7 HTTP requests (SQLi/XSS) | [23](23_Security.md) |
| **ACM** | **AWS Certificate Manager** | Provision/manage **TLS/SSL certificates** | [23](23_Security.md) |
| **RAM** | **Resource Access Manager** | Share resources **across accounts** | [23](23_Security.md) |
| **SSM** | **(AWS) Systems Manager** | Manage/patch/operate EC2 & resources at scale | [03](03_Management_and_Development_Tools.md) |

### Compute & Containers

| Acronym | Expansion | One-liner | Topic |
|---|---|---|---|
| **EC2** | **Elastic Compute Cloud** | Virtual machines (instances) | [09](09_EC2.md) |
| **ASG** | **Auto Scaling Group** | Add/remove EC2 automatically for elasticity & self-healing | [09](09_EC2.md) |
| **ECS** | **Elastic Container Service** | AWS-native container orchestration | [12](12_Containers_and_Virtualization.md) |
| **EKS** | **Elastic Kubernetes Service** | Managed **Kubernetes** | [12](12_Containers_and_Virtualization.md) |
| **ECR** | **Elastic Container Registry** | Store/push container **images** | [12](12_Containers_and_Virtualization.md) |
| **EMR** | **Elastic MapReduce** | Big-data processing (Hadoop/Spark) | [19](19_ML_AI_and_Big_Data.md) |

### Load Balancers (the ELB family)

| Acronym | Expansion | Layer / use |
|---|---|---|
| **ELB** | **Elastic Load Balancing** | The umbrella service (all the LBs below) |
| **ALB** | **Application Load Balancer** | **Layer 7** (HTTP/HTTPS) |
| **NLB** | **Network Load Balancer** | **Layer 4** (TCP/UDP, ultra-fast) |
| **GWLB** | **Gateway Load Balancer** | **Layer 3** (deploy 3rd-party appliances) |
| **CLB** | **Classic Load Balancer** | Legacy (avoid for new work) |

### Storage

| Acronym | Expansion | One-liner | Topic |
|---|---|---|---|
| **S3** | **Simple Storage Service** | Object storage | [06](06_Storage_Services.md) |
| **EBS** | **Elastic Block Store** | Block storage (disks) for EC2 | [06](06_Storage_Services.md) |
| **EFS** | **Elastic File System** | Shared file storage (NFS) | [06](06_Storage_Services.md) |

### Database & Analytics

| Acronym | Expansion | One-liner | Topic |
|---|---|---|---|
| **RDS** | **Relational Database Service** | Managed SQL databases | [07](07_Databases.md) |
| **ES** | **Elasticsearch** → now **OpenSearch** | Search & log analytics | [19](19_ML_AI_and_Big_Data.md) |

### Application Integration & Messaging

| Acronym | Expansion | One-liner | Topic |
|---|---|---|---|
| **SQS** | **Simple Queue Service** | Message **queue** (pull, decouple) | [11](11_Application_Integration.md) |
| **SNS** | **Simple Notification Service** | **Pub/sub** (push, fan-out) | [11](11_Application_Integration.md) |
| **SES** | **Simple Email Service** | **Transactional email** from your app | [14](14_Business_Centric_Services.md) |
| **SWF** | **Simple Workflow Service** | Legacy workflow orchestration (→ Step Functions) | [11](11_Application_Integration.md) |
| **MQ** | **Amazon MQ** | Managed message **broker** (ActiveMQ & RabbitMQ) | [11](11_Application_Integration.md) |
| **MSK** | **Managed Streaming for Apache Kafka** | Managed **Kafka** | [11](11_Application_Integration.md) |

### Networking

| Acronym | Expansion | One-liner | Topic |
|---|---|---|---|
| **VPC** | **Virtual Private Cloud** | Your isolated network in AWS | [08](08_Networks.md) |
| **VPN** | **Virtual Private Network** | Encrypted tunnel to AWS over the internet | [23](23_Security.md) |
| **IoT** | **Internet of Things** | Connected devices / sensors | — |

### Provisioning, Pricing & Support

| Acronym | Expansion | One-liner | Topic |
|---|---|---|---|
| **CFN** | **CloudFormation** | Infrastructure as Code (JSON/YAML templates) | [15](15_Provisioning.md) |
| **EB** | **Elastic Beanstalk** | PaaS — deploy web apps without managing infra | [15](15_Provisioning.md) |
| **RI** | **Reserved Instances** | 1-/3-year commitment for big EC2 discounts | [09](09_EC2.md) |
| **TAM** | **Technical Account Manager** | Your named contact on **Enterprise Support** | [22](22_Billing_Pricing_and_Support.md) |

---

## 2. ⚠️ Where the slide's expansion is slightly *off*

The exampro slide is a great list, but a few expansions aren't AWS's **official** wording. Memorise the **correct** form on the right — the exam uses AWS's naming:

| Acronym | Slide says | ✅ Official AWS expansion | Note |
|---|---|---|---|
| **EC2** | Elastic *Cloud Compute* | **Elastic Compute Cloud** | Word order matters — "Compute Cloud" |
| **ECR** | Elastic Container *Repository* | **Elastic Container Registry** | It's a **Registry**, not "Repository" |
| **EFS** | Elastic File *Storage* | **Elastic File System** | "System", not "Storage" |
| **EBS** | Elastic Block *Storage* | **Elastic Block Store** | Officially "Store" (you'll see "Storage" loosely) |
| **RAM** | *AWS Resource Manager* | **Resource Access Manager** | It's about **Access** (cross-account sharing) |
| **ACM** | *Amazon* Certificate Manager | **AWS Certificate Manager** | "AWS", not "Amazon" |
| **SSM** | *Simple* Systems Manager | **AWS Systems Manager** | Old name was "Simple"; the API prefix `ssm` stuck |
| **MQ** | Amazon *ActiveMQ* | **Amazon MQ** | Supports **ActiveMQ *and* RabbitMQ** |
| **MSK** | Managed *Kafka Service* | **Managed Streaming for Apache Kafka** | — |
| **ES** | Elasticsearch | **OpenSearch** (renamed 2021) | Amazon ES → **Amazon OpenSearch Service** |

> 📌 **Exam tip:** you don't lose marks for thinking "Storage" vs "Store", but knowing the **right words** helps you spot the correct answer when two options look almost identical.

---

## 3. Common look-alikes to keep straight

The acronyms that share letters trip people up the most — pin these:

- **EC2 / ECS / ECR / EKS** — *Compute Cloud* (VMs) / *Container Service* (orchestration) / *Container Registry* (image store) / *Kubernetes Service*. All start "E-C-…" but do different jobs ([Topic 12](12_Containers_and_Virtualization.md)).
- **EBS vs EFS vs S3** — **Block** (one EC2's disk) / **File** (shared NFS) / **Object** (buckets) ([Topic 06](06_Storage_Services.md)).
- **SQS vs SNS vs SES** — **Queue** (pull) / **Notification** pub-sub (push/fan-out) / **Email** (transactional) ([Topic 11](11_Application_Integration.md)).
- **MQ vs MSK** — managed **broker** (ActiveMQ/RabbitMQ) vs managed **Kafka** streaming ([Topic 11](11_Application_Integration.md)).
- **VPC vs VPN** — your **network** *in* AWS vs the encrypted **tunnel** *to* AWS ([Topic 08](08_Networks.md) / [23](23_Security.md)).
- **RAM vs ACM** — **R**esource **A**ccess **M**anager (share resources) vs **A**WS **C**ertificate **M**anager (TLS certs). Both contain "A/M" — don't swap.
- **TAM** — a *person* (Technical Account Manager, Enterprise Support), **not** a service ([Topic 22](22_Billing_Pricing_and_Support.md)).

### ⭐ The Load Balancer family — ELB vs ALB vs NLB vs GLB vs CLB

**ELB (Elastic Load Balancing)** is the **umbrella service**; **ALB / NLB / GLB / CLB** are the **four types** under it. They differ by the **OSI layer** they work at and what they're for *(full detail in [Topic 09 §8](09_EC2.md))*:

| Type | Layer | Traffic | Use it for | Static IP? |
|---|---|---|---|---|
| **ELB** | — | — | The **umbrella term** for all four below | — |
| **ALB** — Application LB | **Layer 7** | HTTP / HTTPS / WebSocket | **Web apps, APIs, microservices, containers** — route by **URL / path / host** | ❌ (DNS name only) |
| **NLB** — Network LB | **Layer 4** | TCP / UDP / TLS | **Ultra-high performance, millions of req/s, low latency, non-HTTP**, or when you need a **static IP** | ✅ **Static / Elastic IP** |
| **GLB** — Gateway LB | **Layer 3** | IP packets | Routing traffic through **3rd-party virtual appliances** (firewalls, IDS/IPS) | n/a (transparent) |
| **CLB** — Classic LB | L4 & L7 | HTTP/HTTPS/TCP | **Legacy** — the original ELB; **avoid for new work** | ❌ |

> 🎯 **Exam reflex:** "route by **URL / path / host** / web app / microservices" → **ALB (L7)**. "**millions of requests / lowest latency / TCP-UDP / static IP**" → **NLB (L4)**. "route through **firewall / IDS-IPS appliances**" → **GLB (L3)**. "**old / classic**" → **CLB**. Mnemonic by layer: **A**LB = **7** (**A**pp), **N**LB = **4** (**N**etwork/TCP), **G**LB = **3** (**G**ateway).

---

## 4. Name-Collision Services — the "Connect" family (⭐ classic trap)

![Connect Names Services slide — "They all have 'Connect' in the name but they are not related or similar in functionality." Direct Connect = a dedicated fibre-optic connection from your data center to AWS, for large enterprises needing an insanely fast & private connection; add a VPN on top if you need it secure/encrypted. Amazon Connect = Call Center as a Service: get a toll-free number, accept inbound & outbound calls, set up automated phone systems and an interactive voice system. Media Connect = converts videos to different video types (transcoding) for large video libraries, watermarks, intro clips](AWS_NOtes_Images/AWS_Connect_Services.png)

Three AWS services share the word **"Connect"** but are **completely unrelated** — a favourite exam trick. Match each to its job:

| Service | What it actually is | Keyword |
|---|---|---|
| **AWS Direct Connect** | A **dedicated fibre-optic private line** from your **data center → AWS** (fast, private, consistent). Add a **VPN on top** if you need it **encrypted**. | "dedicated/private line," "data center to AWS" → [Topic 08](08_Networks.md) / [23 §13](23_Security.md) |
| **Amazon Connect** | **Call Center as a Service** (cloud contact center) — toll-free number, inbound/outbound calls, automated phone menus (**IVR**). | "call center," "contact center," "phone support" → [Topic 14](14_Business_Centric_Services.md) |
| **AWS Elemental MediaConnect** | **Live video transport** — reliably move live video feeds between points (broadcast-grade ingest/distribution). | "live video transport / feed" |

> 🎯 **Exam reflex:** "**private line** to AWS from my data center" → **Direct Connect**. "**call/contact center**, phone support" → **Amazon Connect**. "**video**" → a **Media** service.

### ⚠️ Two things the slide gets wrong (write the correct version)

- **"IVS" → it's IVR.** Amazon Connect uses **IVR = Interactive Voice *Response*** (the automated "press 1 for sales" phone menus). *(Confusingly, **Amazon IVS** is a separate "Interactive Video Service" for live streaming — nothing to do with Connect.)*
- **"Media Connect = a transcoder" is mislabeled.** The slide describes **converting videos to different formats** — that's **AWS Elemental MediaConvert** (the **file-based transcoder**, the successor to **Elastic Transcoder**). **AWS Elemental MediaConnect** is actually **live video *transport*** (moving live feeds), *not* transcoding.
  - **MediaConvert** = **convert/transcode** stored video files → different formats (watermarks, intros). *(This is what the slide's description really means.)*
  - **MediaConnect** = **transport** live video reliably between points.
  - Memory hook: **Conv**ert = **conv**ersion/transcoding · **Conn**ect = **conn**ection/transport.

> 📌 For CLF-C02 you mainly need: **Direct Connect (networking) ≠ Amazon Connect (call center) ≠ the Media services (video)** — and that **transcoding = MediaConvert**.

---

## 5. Quick Revision Cheat Sheet

| Family | Members (acronym → words) |
|---|---|
| **Storage** | S3 = Simple Storage Service · EBS = Elastic Block Store · EFS = Elastic File System |
| **Compute/Containers** | EC2 = Elastic Compute Cloud · ECS = Elastic Container Service · EKS = Elastic Kubernetes Service · ECR = Elastic Container Registry · ASG = Auto Scaling Group |
| **Load balancers** | ELB (umbrella) · ALB = L7 · NLB = L4 · GWLB = L3 · CLB = legacy |
| **Messaging** | SQS = queue · SNS = pub/sub notifications · SES = email · MQ = managed broker · MSK = managed Kafka · SWF = workflow |
| **Networking** | VPC = Virtual Private Cloud · VPN = Virtual Private Network |
| **Database/Analytics** | RDS = Relational Database Service · EMR = Elastic MapReduce · ES = Elasticsearch/OpenSearch |
| **Security/Identity** | IAM · PoLP = least privilege · WAF · ACM = AWS Certificate Manager · RAM = Resource Access Manager · SSM = Systems Manager |
| **Provisioning/Pricing/Support** | CFN = CloudFormation · EB = Elastic Beanstalk · RI = Reserved Instances · TAM = Technical Account Manager |
| **"Connect" name trap** | **Direct Connect** = private line to AWS · **Amazon Connect** = call center · **MediaConnect** = live video transport (transcoding = **MediaConvert**) |

**Top exam points to remember**
1. The exam often refers to services **only by acronym** — practice expanding each on sight.
2. Watch the slide's misspellings: **EC2 = Elastic *Compute Cloud*, ECR = *Registry*, EFS = *System*, RAM = *Resource Access Manager*, ACM = *AWS* Certificate Manager**.
3. Keep the **same-letter families** separate: EC2/ECS/ECR/EKS, EBS/EFS/S3, SQS/SNS/SES, ALB/NLB/GWLB/CLB.
4. **MQ = ActiveMQ *and* RabbitMQ**, **MSK = Kafka**, **ES = now OpenSearch**.
5. **TAM** is a **human** (Enterprise Support), not a product.
6. **"Connect" services are unrelated:** **Direct Connect** (private line to AWS) ≠ **Amazon Connect** (call center) ≠ **MediaConnect** (live video transport). And **transcoding = MediaConvert**, not MediaConnect.
