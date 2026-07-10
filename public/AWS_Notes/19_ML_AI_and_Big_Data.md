# Machine Learning, AI & Big Data

> **Exam:** AWS Certified Cloud Practitioner (CLF-C02)
> **Topic 19:** **Machine Learning, AI & Big Data** — the AWS services that let you **build/train/deploy machine-learning models** and the **pre-trained, ready-to-use AI services** (vision, speech, language, etc.). The exam tests this as *"which service matches this AI/ML/analytics need?"* — match the **use case** (label images, transcribe audio, build a custom model, run SQL on S3…) to the **service**.

AWS gives you a **stack of AI/ML services** at three levels: **(1) ML frameworks/infrastructure** for experts, **(2) Amazon SageMaker** to build-train-deploy your own models, and **(3) pre-trained AI services** (Rekognition, Comprehend, Polly…) you call with an API — **no ML expertise needed.** Most exam questions live at levels 2 and 3.

---

## 1. AI vs ML vs Deep Learning (the slide)

![Machine Learning and AI Services — nested AI ⊃ ML ⊃ Deep Learning concept, plus Amazon SageMaker (build, train, deploy ML models at scale with MXNet/TensorFlow/PyTorch), SageMaker Ground Truth (data labeling) and Amazon Augmented AI (human review of low-confidence predictions)](AWS_NOtes_Images/AWS_AI_ML_Overview.png)

The slide first defines three **nested** terms (each is a subset of the one above it):

| Term | What it is |
|---|---|
| **Artificial Intelligence (AI)** | Machines that **perform jobs that mimic human behavior**. The broadest term. |
| **Machine Learning (ML)** | Machines that **get better at a task without explicit programming** — they learn from data. A subset of AI. |
| **Deep Learning (DL)** | Machines that use an **artificial neural network inspired by the human brain** to solve complex problems. A subset of ML. |

> **Mental model:** **AI ⊃ ML ⊃ Deep Learning** (three circles, biggest to smallest). All deep learning is ML; all ML is AI — but not the reverse.

---

## 2. Amazon SageMaker — build, train & deploy your own models

- **Amazon SageMaker** is a **fully managed service to *build, train, and deploy* machine-learning models at scale.**
- It's the **#1 ML service** on the exam — whenever a question says "**build/train your own custom model**," the answer is **SageMaker.**
- Removes the heavy lifting of each step in the ML workflow (data prep → build → train → tune → deploy → monitor).
- Supports the major open-source ML **frameworks**:

| Framework on AWS | What it is |
|---|---|
| **Apache MXNet on AWS** | Open-source **deep learning** framework |
| **TensorFlow on AWS** | Open-source **machine intelligence** library |
| **PyTorch on AWS** | Open-source **machine learning** framework |

> **Exam hook:** "**train and deploy a custom ML model**", "fully managed ML", "data scientists need a workbench" → **Amazon SageMaker.**

---

## 3. SageMaker Ground Truth — data labeling

- **Amazon SageMaker Ground Truth** is a **data-labeling service.**
- It has **humans label a dataset** that will then be used to **train your machine-learning model** (supervised learning needs labeled data).
- Can use your own workforce, third-party vendors, or **Amazon Mechanical Turk** to do the labeling.
- **Exam hook:** "need a **labeled dataset** / label thousands of images before training" → **SageMaker Ground Truth.**

---

## 4. Amazon Augmented AI (A2I) — human review of predictions

- **Amazon Augmented AI (A2I)** is a **human-intervention / human-review service.**
- When an ML model makes a prediction it is **not confident** about (low confidence score), A2I **queues that prediction up for a human to review** instead of trusting it blindly.
- Builds the **human-in-the-loop** workflow for you.
- **Exam hook:** "model is **unsure / low confidence**, send to a **human to review**", "human-in-the-loop" → **Amazon Augmented AI (A2I).**

---

## 5. Pre-trained AI Services (the slide — no ML expertise needed)

These are **ready-to-use, pre-trained** AI services — you just call an **API**; you don't build or train a model. **Match the use case to the service** — this is the densest area of exam questions.

![Machine Learning and AI Services roll-call — Amazon CodeGuru (ML code analysis/reviews), Lex (voice & text chatbots), Personalize (real-time recommendations), Polly (text-to-speech), Rekognition (image & video recognition), Transcribe (speech-to-text), Textract (OCR/extract text from scanned documents), Translate (neural machine-learning translation) and Comprehend (NLP — find relationships in text to produce insights)](AWS_NOtes_Images/AWS_ML_AI_Services.png)

The slide describes nine services (note **CodeGuru** is the new one):

| Service | What the slide says it does | Keyword hook |
|---|---|---|
| **Amazon CodeGuru** | **Machine-learning code-analysis** service — performs **code reviews** & suggests changes to improve code quality; shows **visual code profiles** (internals of your code) to pinpoint **performance** issues | "automated **code review**", "code quality/performance profiling" |
| **Amazon Lex** | **Conversational-interface** service — build **voice and text chatbots** (the tech behind Alexa) | "chatbot", "voice/text bot" |
| **Amazon Personalize** | **Real-time recommendations** service — same technology used for **product recommendations on Amazon.com** | "product/content recommendations" |
| **Amazon Polly** | **Text-to-speech** — upload text, get an **audio file** spoken by a synthesized voice | "text to speech", "read text aloud" |
| **Amazon Rekognition** | **Image & video recognition** service — analyze images/video to **detect & label objects, people, celebrities** | "analyze images/video", "facial recognition" |
| **Amazon Transcribe** | **Speech-to-text** service — upload an **audio file** and it is converted to text | "transcribe audio", "speech to text" |
| **Amazon Textract** | **OCR** — **extract text from scanned documents**; for paper **forms** you want to digitally extract the data | "scanned documents", "OCR", "forms" |
| **Amazon Translate** | **Neural machine-learning translation** — deep-learning models for **accurate & natural** translations | "translate languages" |
| **Amazon Comprehend** | **Natural Language Processor (NLP)** — find **relationships in text** to produce insights; looks at customer emails / support tickets / social media and **makes predictions** | "sentiment analysis", "understand text" |

**Other pre-trained AI services** (not on this slide, worth knowing for the exam):

| Service | What it does | Keyword hook |
|---|---|---|
| **Amazon Kendra** | **Intelligent enterprise search** (ML-powered) | "smart document search" |
| **Amazon Forecast** | **Time-series forecasting** | "predict future demand/sales" |
| **Amazon Fraud Detector** | Detect **online fraud** | "detect fraud" |
| **Amazon Comprehend Medical** | NLP for **medical text** | "extract info from medical notes" |

> **Mental shortcut:** **Polly = "speak"** (text→speech), **Transcribe = "type"** (speech→text), **Translate = "language"**, **Comprehend = "understand"**, **Lex = "chat"**, **Rekognition = "see"**, **Textract = "read documents"**, **CodeGuru = "review my code".**

---

## 6. ML Frameworks, Infrastructure & Hands-On "Deep" Devices (slide 2)

![Machine Learning and AI Services (continued) — Amazon Forecast (time-series forecasting), AWS Deep Learning AMIs & Deep Learning Containers (pre-installed DL frameworks), AWS DeepComposer (ML musical keyboard), AWS DeepLens (deep-learning video camera), AWS DeepRacer (ML toy race car / autonomous driving), Amazon Elastic Inference (low-cost GPU acceleration for EC2), Amazon Fraud Detector and Amazon Kendra (ML search engine)](AWS_NOtes_Images/AWS+ML_AI_Services_2.png)

This second slide rounds out the catalogue with the **framework/infrastructure layer** (for ML practitioners) and AWS's **hands-on "Deep" learning devices** (built to *teach* you ML).

**Frameworks & infrastructure** — for when you build your own deep-learning models:

| Service | What the slide says it does | Keyword hook |
|---|---|---|
| **AWS Deep Learning AMIs** | **EC2 instances pre-installed** with popular deep-learning **frameworks & interfaces** — TensorFlow, PyTorch, Apache MXNet, Chainer, Gluon, Horovod, Keras | "pre-built **EC2 image** for deep learning" |
| **AWS Deep Learning Containers** | **Docker images pre-installed** with popular DL frameworks (TensorFlow, PyTorch, Apache MXNet) | "**container** image for deep learning", "ECS/EKS DL" |
| **Amazon Elastic Inference** | Attach **low-cost GPU-powered acceleration to EC2** instances to **cut deep-learning inference cost by up to 75%** | "cheaper inference", "fractional GPU on EC2" |

**Hands-on "Deep" learning devices** — fun gadgets AWS sells to *learn* ML (⭐ easy exam points — match the gadget to its domain):

| Service | What it is | Keyword hook |
|---|---|---|
| **AWS DeepComposer** | A **machine-learning-enabled musical keyboard** | "**music** keyboard" |
| **AWS DeepLens** | A **video camera that uses deep learning** | "deep-learning **camera**" |
| **AWS DeepRacer** | A **toy race car** powered by ML to perform **autonomous driving** | "**race car**", "reinforcement learning" |

**Also featured on this slide** (already covered in §5 — richer descriptions here):

| Service | Slide description |
|---|---|
| **Amazon Forecast** | **Time-series forecasting** — forecast business outcomes such as **product demand, resource needs, financial performance** |
| **Amazon Fraud Detector** | **Fully managed fraud-detection** service — identify potentially fraudulent online activity such as **online payment fraud** and **creation of fake accounts** |
| **Amazon Kendra** | **Enterprise ML search-engine** service — uses **natural language** to *suggest answers to questions* instead of just simple keyword matching |

> **Memory hook — the three "Deep" gadgets:** **DeepComposer = music 🎹**, **DeepLens = camera 📷**, **DeepRacer = car 🏎️**. The "**AWS Deep Learning** AMIs/Containers" (no "Deep<thing>") are the **dev environments**, not gadgets.

---

## 7. Big Data & Analytics Services (the slide)

![Big Data and Analytics Services — Athena (serverless interactive query on S3 CSV/JSON), CloudSearch (managed full-text site search), Elasticsearch Service (managed Elasticsearch cluster), EMR (data processing/analysis, unstructured→structured), and the Kinesis family: Data Streams (real-time, producers→stream→consumers), Firehose (serverless simpler version), Data Analytics (query the live stream), Video Streams (process real-time video)](AWS_NOtes_Images/AWS_BigData_Analytics_1.png)

> **What is Big Data?** A term for **massive volumes of structured/unstructured data** that is **so large it's difficult to *move* and *process*** using traditional database & software techniques.

The slide walks through the core query, search and streaming services:

| Service | What the slide says it does | Keyword hook |
|---|---|---|
| **Amazon Athena** | **Serverless interactive query** service — point it at **CSV/JSON files in an S3 bucket**, it loads them into **temporary SQL tables** so you can run SQL queries. *"When you want to query CSV or JSON files."* | "SQL on S3", "serverless query", "query CSV/JSON" |
| **Amazon CloudSearch** | **Fully managed full-text search** service. *"When you want to add search to your website."* | "**add search to a website**" |
| **Amazon Elasticsearch Service (ES)** | **Managed Elasticsearch cluster** (open-source full-text search engine). **More robust than CloudSearch** but needs **more server & operational maintenance.** *(now **Amazon OpenSearch Service**)* | "Elasticsearch / OpenSearch", "robust search + analytics" |
| **Amazon EMR** (Elastic MapReduce) | For **data processing & analysis** — can create reports like Redshift, but is better suited when you need to **transform unstructured data into structured data on the fly** (Hadoop/Spark) | "Hadoop/Spark", "transform unstructured→structured" |

**The Kinesis family** (real-time streaming — also in Topic 11):

| Service | What the slide says it does | Keyword hook |
|---|---|---|
| **Kinesis Data Streams** | **Real-time streaming** service — **Producers** send data to a **stream**, **multiple Consumers** read it. Use for real-time analytics, **clickstreams**, ingesting from a **fleet of IoT devices** | "real-time stream", "producers/consumers", "clickstream/IoT" |
| **Kinesis Data Firehose** | **Serverless, simpler** version of Data Streams — **pay-on-demand** by how much data flows through, **no underlying servers to manage**; loads/delivers the stream to destinations | "serverless streaming", "load stream to S3/Redshift" |
| **Kinesis Data Analytics** | **Run queries against data flowing through the live stream** → reports & analysis on **emerging data** | "query the live stream", "SQL on streaming data" |
| **Kinesis Video Streams** | **Analyze / apply processing on real-time streaming video** | "real-time **video** stream" |

**Slide 2 — warehouse, ETL, movement & data lakes:**

![Big Data and Analytics Services (continued) — Managed Kafka (MSK) fully managed Apache Kafka, Redshift petabyte data warehouse (OLAP), QuickSight BI dashboard, Data Pipeline automates data movement, Glue ETL service, Lake Formation centralized curated secured data lake, and Data Exchange catalogue of third-party datasets](AWS_NOtes_Images/AWS_BigData_Analtyics_2.png)

| Service | What the slide says it does | Keyword hook |
|---|---|---|
| **Amazon MSK** (Managed Kafka) | **Fully managed Apache Kafka** — open-source platform for real-time streaming data pipelines & apps; **similar to Kinesis but more robust** | "**Kafka**", "robust streaming" |
| **Amazon Redshift** | **Petabyte-size data warehouse** for **OLAP** — can be expensive because data is kept **"hot"**; runs **very complex queries over huge data and returns results fast**. *"When you want to quickly generate analytics/reports from a large amount of data."* | "data warehouse", "OLAP", "analytics on huge data" |
| **Amazon QuickSight** | **Business Intelligence (BI) dashboard** — build business dashboards to power decisions; **little/no programming**, connects & ingests many database types | "BI dashboards", "visualize data" |
| **AWS Data Pipeline** | **Automates the movement of data** — reliably move data between **compute & storage** services | "move data between services" |
| **AWS Glue** | **Extract, Transform, Load (ETL)** service — move data location→location with **transformations before the final destination**; **similar to DMS but more robust** | "ETL", "transform data", "vs DMS" |
| **AWS Lake Formation** | A **centralized, curated, secured repository that stores all your data**. (A **data lake** = storage holding a vast amount of **raw data in native format** until needed) | "data lake", "central governed store" |
| **AWS Data Exchange** | A **catalogue of third-party datasets** — find/**subscribe to or purchase** (some free) external data. E.g. **COVID-19 foot-traffic, IMDB TV/movie, historical weather** data | "**third-party datasets**", "buy/subscribe to data" |

> **Big-data pipeline picture:** raw data lands in **S3 / a Lake Formation data lake** → **Glue** (ETL) catalogs/transforms it → query ad-hoc with **Athena** or load into **Redshift** (warehouse) → visualize in **QuickSight**; stream live data in via **Kinesis / MSK**; crunch huge batch jobs on **EMR**; add site search with **CloudSearch / Elasticsearch**; pull in external data via **Data Exchange**.

### 7.1 Amazon QuickSight — Deep-Dive

![Amazon QuickSight — a Business Intelligence (BI) dashboard that ingests data from AWS storage/database services to quickly visualize business data with minimal programming; powered by the SPICE in-memory engine, plus ML Insights (anomaly detection, forecasting, natural-language narratives) and QuickSight Q (ask questions in natural language)](AWS_NOtes_Images/AWS_QuickSights.png)

- **Amazon QuickSight** is a **Business Intelligence (BI) dashboard** that lets you **ingest data from various AWS storage or database services** and **quickly visualize business data** with **minimal programming or data-formula knowledge**.
- **SPICE engine** — QuickSight uses **SPICE** (**S**uper-fast, **P**arallel, **I**n-memory **C**alculation **E**ngine) to achieve **blazing-fast performance at scale.** ⭐ Common exam keyword — "SPICE" → QuickSight.
- **Amazon QuickSight ML Insights** — built-in machine learning that can **detect anomalies**, perform **accurate forecasting**, and **generate natural-language narratives** (plain-English summaries of your data).
- **Amazon QuickSight Q** — **ask questions of your data in natural language** ("what were sales last quarter?") and **receive answers in seconds** — no need to build the visualization yourself.

> **Exam hooks:** "**BI dashboards / visualize business data with little code**" → QuickSight; "**SPICE in-memory engine**" → QuickSight; "**ask data questions in natural language**" → QuickSight **Q**; "**ML-powered anomaly detection / forecasting inside a dashboard**" → QuickSight **ML Insights**.

### 7.2 Amazon Athena — Deep-Dive

![Amazon Athena — an interactive query service that makes it easy to analyze data directly from S3, based on the open-source distributed query engine Apache Presto; does two things (Athena SQL — run SQL queries on S3 buckets via Trino, a fork of Presto, accessed through the console, JDBC/ODBC drivers, CLI or SDKs; and Apache Spark on Amazon Athena — run data analytics with Spark via Jupyter-compatible notebooks); serverless so you pay only for what you use, and integrates with CloudFormation, CloudFront, CloudTrail, DataZone, ELB, EMR, Glue Data Catalog, IAM, QuickSight, S3 Inventory, Step Functions, Systems Manager Inventory and VPC](AWS_NOtes_Images/AWS_Athena.png)

- **Amazon Athena** is an **interactive query service** that makes it easy to **analyze data directly from S3** — no servers, no clusters, no loading data first.
- ⭐ It is built on the **open-source distributed query engine Apache Presto.**
- **Serverless** — you **pay only for the queries you run** (per amount of data scanned); nothing to manage when idle.

**Athena can do two things:**

| Mode | What it does | Details |
|---|---|---|
| **Athena SQL** | Run **SQL queries directly on S3 buckets** | Uses **Trino SQL** (a **fork of Apache Presto**). Access it via the **AWS Management Console** to type queries, **JDBC/ODBC drivers** to connect tools, or the **AWS CLI / AWS SDKs** |
| **Apache Spark on Amazon Athena** | Interactively run **data analytics using Apache Spark** | Access via **Jupyter-compatible notebooks** running Apache Spark |

**Athena integrates with** many AWS services: **CloudFormation, CloudFront, CloudTrail, DataZone, ELB, EMR, AWS Glue Data Catalog, IAM, QuickSight, S3 Inventory, Step Functions, Systems Manager Inventory, VPC** — e.g. point it at **CloudTrail/ELB/CloudFront logs in S3**, use the **Glue Data Catalog** as its table schema, and visualize results in **QuickSight.**

> **Exam hooks:** "**run SQL directly on data in S3, serverless, no cluster**" → **Athena**; "based on **Presto / Trino**" → **Athena**; "**query CloudTrail / ELB / CloudFront logs** sitting in S3" → **Athena**; "**Spark notebooks** without managing a cluster" → **Apache Spark on Athena**. Remember **Athena = data *at rest* in S3** (contrast Kinesis Data Analytics = data *in motion*).

### 7.3 AWS Glue — Deep-Dive

![AWS Glue — a serverless data integration service that makes it easy for analytics users to discover, prepare, move, and integrate data from multiple sources; use cases are analytics, machine learning and application development; connects to 70+ diverse data sources and manages data in a centralized data catalog; visually create, run and monitor extract-transform-load (ETL) pipelines to load data into data lakes; cataloged data can be searched/queried with Athena, EMR and Redshift Spectrum; capabilities = data discovery, modern ETL or ELT, cleansing, transforming, centralized cataloging](AWS_NOtes_Images/AWS_Glue.png)

- **AWS Glue** is a **serverless data integration service** that makes it easy for analytics users to **discover, prepare, move, and integrate data from multiple sources.**
- ⭐ Glue's headline job is **ETL** — **Extract, Transform, Load** — visually **create, run, and monitor ETL pipelines** to load data into your **data lakes.** (It does **modern ETL *or* ELT.**)
- **Serverless** — nothing to provision; you pay only when jobs run.

**Use cases for:** **Analytics**, **machine learning**, and **application development.**

**Two big things Glue does:**

| Capability | What it means |
|---|---|
| **Centralized Data Catalog** | **Discover and connect to 70+ diverse data sources** and manage all your data in **one centralized data catalog** (the **Glue Data Catalog** = the metadata/schema store). |
| **ETL/ELT pipelines** | **Visually create, run & monitor ETL pipelines** to **load data into data lakes.** |

**Once data is cataloged, immediately search & query it using:** **Amazon Athena**, **Amazon EMR**, and **Amazon Redshift Spectrum** (the Glue Data Catalog feeds all three their table definitions).

**What Glue can do** (the slide's list): **Data discovery · Modern ETL or ELT · Cleansing · Transforming · Centralized cataloging.**

> **Exam hooks:** "**serverless ETL / data integration**", "prepare & transform data", "**cleanse data**" → **AWS Glue**; "**central data catalog / discover data sources / table schemas** for Athena/EMR/Redshift Spectrum" → **AWS Glue Data Catalog**; "load/prepare data for a **data lake**" → **Glue** (the data lake itself = **Lake Formation**). Contrast **Glue (transforms) vs Data Pipeline (just moves)** and **Glue (ETL, more robust) vs DMS (database migration)**.

---

## 8. More AI/ML Services — Extended (slide 3)

![Machine Learning and AI Services (Extended) — Amazon Bedrock (LLM cloud service to generate text & image responses, "think ChatGPT"), Amazon CodeWhisperer (AI code generator that predicts code, "think GitHub Copilot"), Amazon DevOps Guru (ML detects operational abnormalities in your cloud), Amazon Lookout for Equipment/Metrics/Vision (ML quality control & automated inspections), Amazon Monitron (ML predicts unplanned equipment downtime using IoT vibration/sensor data), and AWS Neuron (SDK to run deep-learning workloads on AWS Inferentia & Trainium chips)](AWS_NOtes_Images/AWS_ML_AI_Services_3.png)

This third slide adds the **newer, higher-profile AI/ML services** — most importantly the **generative-AI** services (**Bedrock**, **CodeWhisperer**) plus a set of **operations / industrial ML** services.

**Generative AI & developer productivity:**

| Service | What the slide says it does | Keyword hook |
|---|---|---|
| **Amazon Bedrock** | A **Large Language Model (LLM) cloud service** offering to **generate text and image responses.** *"Think like ChatGPT."* The managed way to build **generative-AI** apps on foundation models (FMs) | "**generative AI**", "**LLM / foundation model**", "generate text/images", "ChatGPT-like" |
| **Amazon CodeWhisperer** | An **AI code generator** that will **predict code** to meet your use case. *"Think like GitHub Copilot."* | "**AI code generation / autocomplete**", "GitHub Copilot-like", "suggest code as I type" |

**Operations, monitoring & industrial ML:**

| Service | What the slide says it does | Keyword hook |
|---|---|---|
| **Amazon DevOps Guru** | Uses **ML to analyze your operational data, application metrics & events** to **detect operational abnormalities.** *"Is there something wrong with our cloud operations?"* | "**detect operational anomalies / abnormal behavior**", "is my cloud app misbehaving" |
| **Amazon Lookout** (for **Equipment / Metrics / Vision**) | Uses **ML models for quality control** and **automated inspections.** Three flavours: **Lookout for Equipment** (industrial sensor anomalies), **Lookout for Metrics** (anomalies in business metrics), **Lookout for Vision** (visual product-defect detection) | "**quality control / defect detection**", "anomaly detection in metrics/equipment/images" |
| **Amazon Monitron** | Uses **ML models to predict unplanned equipment downtime.** Ships as an **IoT sensor** that captures **vibrations and sensor data** from machinery | "**predictive maintenance**", "equipment downtime", "vibration sensor" |
| **AWS Neuron** | An **SDK used to run deep-learning workloads** on **AWS Inferentia** and **AWS Trainium** based instances (AWS's custom ML chips) | "**Inferentia / Trainium** SDK", "run DL on AWS ML chips" |

> **Memory hooks:** **Bedrock = ChatGPT** (generate text/images via LLMs) · **CodeWhisperer = Copilot** (predicts/writes code) · **DevOps Guru = "is something wrong with my ops?"** · **Lookout = quality control / inspect for defects (3 flavours)** · **Monitron = a physical IoT sensor that predicts machine breakdown** · **Neuron = the SDK for Inferentia/Trainium chips.**

> **Don't confuse:** **CodeWhisperer (writes code)** vs **CodeGuru (reviews code)** — both touch code, opposite jobs. **Lookout for Metrics** vs **DevOps Guru** — Lookout finds anomalies in *business/metric data you point at it*, DevOps Guru watches *your AWS application's operational health* specifically.

---

## 9. Exam Triggers

| Phrase in the question | Answer |
|---|---|
| "build, **train and deploy** a **custom** ML model" | **Amazon SageMaker** |
| "need a **labeled dataset** to train a model" | **SageMaker Ground Truth** |
| "low-confidence prediction → **human review**", "human-in-the-loop" | **Amazon Augmented AI (A2I)** |
| "analyze **images / video**", "facial recognition" | **Amazon Rekognition** |
| "**extract text** from scanned documents / forms (OCR)" | **Amazon Textract** |
| "**sentiment** / understand natural-language text" | **Amazon Comprehend** |
| "**text to speech**" | **Amazon Polly** |
| "**speech to text** / transcribe audio" | **Amazon Transcribe** |
| "**translate** between languages" | **Amazon Translate** |
| "automated **code review** / code-quality & performance profiling" | **Amazon CodeGuru** |
| "**generative AI**, **LLM / foundation model**, generate text/images, ChatGPT-like" | **Amazon Bedrock** |
| "**AI code generation / autocomplete**, GitHub Copilot-like, predicts code" | **Amazon CodeWhisperer** |
| "ML detects **operational anomalies** in my cloud app / something wrong with ops" | **Amazon DevOps Guru** |
| "ML for **quality control / defect detection / automated inspection** (equipment, metrics, vision)" | **Amazon Lookout** |
| "**predict unplanned equipment downtime**, IoT vibration sensor, predictive maintenance" | **Amazon Monitron** |
| "**SDK** to run deep learning on **AWS Inferentia / Trainium** chips" | **AWS Neuron** |
| "build a **chatbot** / conversational bot" | **Amazon Lex** |
| "product / content **recommendations**" | **Amazon Personalize** |
| "**forecast** future demand (time-series)" | **Amazon Forecast** |
| "detect **fraudulent online activity / fake accounts**" | **Amazon Fraud Detector** |
| "**natural-language enterprise search** engine" | **Amazon Kendra** |
| "**EC2 image pre-installed** with deep-learning frameworks" | **AWS Deep Learning AMIs** |
| "**Docker image** with deep-learning frameworks" | **AWS Deep Learning Containers** |
| "**cheaper GPU inference** attached to EC2 (up to 75% off)" | **Amazon Elastic Inference** |
| "ML **musical keyboard**" | **AWS DeepComposer** |
| "deep-learning **video camera**" | **AWS DeepLens** |
| "ML **toy race car** / autonomous driving / reinforcement learning" | **AWS DeepRacer** |
| "run **SQL directly on data in S3** / query **CSV/JSON** files, serverless" | **Amazon Athena** |
| "based on **Apache Presto / Trino**", "query CloudTrail/ELB/CloudFront **logs in S3**" | **Amazon Athena** |
| "**Apache Spark** analytics in **Jupyter notebooks**, no cluster to manage" | **Apache Spark on Amazon Athena** |
| "**add search to your website**" (fully managed) | **Amazon CloudSearch** |
| "**Elasticsearch / OpenSearch** cluster", "robust full-text search + analytics" | **Amazon Elasticsearch / OpenSearch Service** |
| "managed **Hadoop / Spark**", "transform **unstructured → structured** on the fly" | **Amazon EMR** |
| "**real-time stream**, producers & multiple consumers, clickstream/IoT" | **Kinesis Data Streams** |
| "**serverless** streaming, no servers, load/deliver stream to a destination" | **Kinesis Data Firehose** |
| "run **SQL queries on the live stream**" | **Kinesis Data Analytics** |
| "process **real-time streaming video**" | **Kinesis Video Streams** |
| "**serverless ETL / data integration** to prepare, cleanse & transform data" | **AWS Glue** |
| "**central data catalog** / discover data sources / table schemas for Athena/EMR/Redshift Spectrum" | **AWS Glue Data Catalog** |
| "build a **data lake**" | **AWS Lake Formation** |
| "find / **subscribe to or buy third-party datasets**" | **AWS Data Exchange** |
| "**BI dashboards** / visualize business data, little code" | **Amazon QuickSight** |
| "**SPICE** in-memory engine" | **Amazon QuickSight** |
| "**ask data questions in natural language**, answers in seconds" | **Amazon QuickSight Q** |
| "in-dashboard **anomaly detection / forecasting / NL narratives**" | **Amazon QuickSight ML Insights** |
| "**data warehouse** for analytics" / "OLAP, query huge data fast" | **Amazon Redshift** |
| "**deep learning** / neural network frameworks (MXNet/TensorFlow/PyTorch)" | **Amazon SageMaker** |

---

## 10. Common Confusions to Nail

- **SageMaker vs the pre-trained AI services** — ⭐ the #1 split. **SageMaker = you BUILD/train your own model.** **Rekognition/Comprehend/Polly/etc. = pre-trained, just call the API, no ML skill.** If the question says "no ML expertise / ready-to-use," it's **not** SageMaker.
- **Ground Truth vs Augmented AI (A2I)** — **Ground Truth = label data *before* training** (build the dataset). **A2I = humans review *predictions* a deployed model is unsure about** (after the model runs). Both use humans, different stage.
- **AI vs ML vs Deep Learning** — nested: **AI ⊃ ML ⊃ DL**. Deep Learning specifically = **neural networks inspired by the brain.**
- **Polly vs Transcribe** — **Polly = text→speech** ("AWS speaks"); **Transcribe = speech→text** ("AWS types"). Easy to flip.
- **Comprehend vs Translate vs Lex** — **Comprehend = understand/analyze text** (sentiment, entities); **Translate = change language**; **Lex = converse (chatbot).**
- **Rekognition vs Textract** — **Rekognition = images/video** (objects, faces); **Textract = pull text/data out of documents** (OCR, forms, tables). A doc with printed text → **Textract**.
- **CodeWhisperer vs CodeGuru** — ⭐ both touch code, opposite jobs: **CodeWhisperer = *writes/predicts* code** as you type (GitHub Copilot-like); **CodeGuru = *reviews* existing code** + performance profiling. "Write code for me" → CodeWhisperer; "review my code" → CodeGuru.
- **Bedrock vs SageMaker** — **Bedrock = managed *generative AI* on pre-built foundation models/LLMs** (generate text & images, ChatGPT-like, minimal ML work); **SageMaker = build/train/deploy *your own* model from scratch.** Generative-AI / LLM keyword → Bedrock.
- **DevOps Guru vs Lookout for Metrics vs CloudWatch** — **DevOps Guru = ML watches *your AWS application's operational health*** (detect abnormal ops); **Lookout for Metrics = anomaly detection in *any business metrics you feed it*** (sales, etc.); **CloudWatch = raw metrics/alarms with thresholds *you* define** (no ML). ML-driven anomaly detection → Guru/Lookout, not plain CloudWatch.
- **Monitron vs Lookout for Equipment** — both do **industrial predictive maintenance**: **Monitron = an end-to-end *hardware* solution (AWS-supplied IoT vibration/temperature sensor + app)**; **Lookout for Equipment = *software/ML service*** you feed your **existing** sensor data into.
- **AWS Neuron vs Elastic Inference** — **Neuron = SDK to run DL on AWS's custom ML chips (Inferentia for inference, Trainium for training)**; **Elastic Inference = attach a fraction of a (regular) GPU to EC2 to cut inference cost.** Both about cheaper ML compute, different mechanism.
- **Athena vs Redshift vs EMR** — **Athena = serverless ad-hoc SQL on S3** (no cluster); **Redshift = provisioned data warehouse** for sustained analytics; **EMR = Hadoop/Spark** for custom big-data processing.
- **Glue vs Data Pipeline** — both move/transform data; **Glue = serverless ETL + Data Catalog** (the modern default, transforms data); **Data Pipeline = automates *movement* of data** between compute & storage. Glue transforms; Data Pipeline mainly moves.
- **Glue vs DMS** — both move data; **Glue = ETL with transformations** (more robust); **DMS = Database Migration Service** (lift-and-shift a database). The slide frames Glue as "similar to DMS but more robust."
- **Data Exchange vs Data Pipeline** — **Data Exchange = a *catalogue* to acquire third-party/external datasets** (subscribe/buy); **Data Pipeline = move *your own* data** between services. Don't confuse "exchange/marketplace of data" with "move data."
- **CloudSearch vs Elasticsearch Service (OpenSearch)** — both do full-text search; **CloudSearch = simplest, fully managed, "add search to a website"**; **Elasticsearch/OpenSearch = more robust/powerful but more operational maintenance.**
- **Kinesis Data Streams vs Firehose** — **Data Streams = real-time, you manage shards & consumers** (lower latency, replayable); **Firehose = serverless & simpler, pay-per-use, auto-delivers to destinations** (S3/Redshift/OpenSearch), no servers. **Data Analytics = SQL on the live stream**; **Video Streams = streaming video.**
- **Athena vs Kinesis Data Analytics** — both run SQL, different data: **Athena = SQL on data at rest in S3**; **Kinesis Data Analytics = SQL on data in motion (the live stream).**
- **Kendra vs CloudSearch / Athena** — **Kendra = ML-powered *natural-language enterprise search***, not a SQL query engine.
- **The three "Deep" gadgets** — **DeepComposer = music keyboard 🎹**, **DeepLens = video camera 📷**, **DeepRacer = toy race car 🏎️**. They're **educational devices to learn ML**, not production services. Don't confuse them with the **"AWS Deep Learning" AMIs/Containers**, which are **dev environments** (EC2 images / Docker images) for building real DL models.
- **Deep Learning AMIs vs Deep Learning Containers** — same idea, different packaging: **AMI = pre-built EC2 instance image**; **Container = pre-built Docker image** (for ECS/EKS).
- **Elastic Inference vs a full GPU instance** — Elastic Inference **attaches a fraction of a GPU** to a cheaper instance just for **inference** (≤75% cheaper); it is *not* a standalone training service.

---

## Quick Revision Cheat Sheet

| Service | One-liner |
|---|---|
| **Amazon SageMaker** | Fully managed — **build, train & deploy** your own ML models at scale (MXNet/TensorFlow/PyTorch) |
| **SageMaker Ground Truth** | **Data labeling** — humans label data to train models |
| **Amazon Augmented AI (A2I)** | **Human review** of low-confidence model predictions (human-in-the-loop) |
| **CodeGuru** | ML-powered code reviews + performance profiling |
| **Bedrock** | Managed **generative AI** — LLMs/foundation models to generate text & images ("ChatGPT") |
| **CodeWhisperer** | **AI code generator** — predicts/writes code ("GitHub Copilot") |
| **DevOps Guru** | ML detects **operational abnormalities** in your cloud application |
| **Lookout** (Equipment / Metrics / Vision) | ML **quality control & automated inspection** / anomaly detection |
| **Monitron** | **Predictive maintenance** — IoT sensor + ML predicts equipment downtime |
| **AWS Neuron** | **SDK** to run deep learning on **AWS Inferentia / Trainium** chips |
| **Rekognition** | Image & video analysis |
| **Textract** | Extract text/data from documents (OCR) |
| **Comprehend** | NLP — sentiment, entities, language |
| **Polly** | Text → speech |
| **Transcribe** | Speech → text |
| **Translate** | Language translation |
| **Lex** | Chatbots / conversational AI (powers Alexa) |
| **Kendra** | Intelligent enterprise search |
| **Personalize** | Recommendations |
| **Forecast** | Time-series forecasting |
| **Fraud Detector** | Online fraud detection |
| **Deep Learning AMIs / Containers** | EC2 images / Docker images pre-installed with DL frameworks |
| **Elastic Inference** | Low-cost GPU acceleration attached to EC2 (cut inference cost ≤75%) |
| **DeepComposer / DeepLens / DeepRacer** | Hands-on ML learning devices — keyboard 🎹 / camera 📷 / race car 🏎️ |
| **Athena** | Serverless SQL on S3 (query CSV/JSON); built on **Apache Presto/Trino**; also runs **Apache Spark** notebooks |
| **CloudSearch** | Managed full-text "add search to your website" |
| **Elasticsearch / OpenSearch Service** | Managed Elasticsearch cluster (robust search + analytics) |
| **EMR** | Managed Hadoop/Spark; unstructured→structured |
| **Kinesis Data Streams / Firehose / Data Analytics / Video Streams** | Real-time stream (shards) / serverless deliver / SQL on live stream / video |
| **Glue** | **Serverless** ETL/ELT data integration — discover/cleanse/transform; **Data Catalog** (70+ sources) feeds Athena/EMR/Redshift Spectrum; "like DMS but more robust" |
| **Data Pipeline** | Automates **movement** of data between compute & storage |
| **Redshift** | Petabyte data warehouse (OLAP), data kept "hot" |
| **QuickSight** | BI dashboards/visualization; **SPICE** engine; **Q** = NL questions; **ML Insights** = anomaly/forecast/narratives |
| **Lake Formation** | Centralized, curated, secured **data lake** |
| **Data Exchange** | Catalogue of **third-party datasets** (subscribe/buy) |
| **Kinesis / MSK** | Real-time streaming (Kafka = MSK, "Kinesis but more robust") |

**Top exam points to remember**
1. **AI ⊃ ML ⊃ Deep Learning** — deep learning = brain-inspired **neural networks**.
2. **SageMaker = build/train/deploy YOUR OWN model.** The pre-trained services (Rekognition, Comprehend, Polly…) need **no ML expertise** — just call the API.
3. **Ground Truth = label data (before)**; **Augmented AI / A2I = review predictions (after).**
4. **Polly = text→speech**, **Transcribe = speech→text** (don't flip them).
5. **Rekognition = images/video**, **Textract = documents/OCR**, **Comprehend = understand text**.
6. **Athena = serverless SQL on S3**, **Glue = serverless ETL**, **EMR = Hadoop/Spark**, **Redshift = data warehouse** — the core Big Data four.
7. **Generative AI: Bedrock = LLM/foundation models (text & images, "ChatGPT"), CodeWhisperer = AI code generation ("Copilot").** Watch the **CodeWhisperer (writes) vs CodeGuru (reviews)** flip.
