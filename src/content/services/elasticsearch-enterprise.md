---
title: "استقرار Elasticsearch Enterprise"
metaTitle: "استقرار Elasticsearch و ECK روی کوبرنتیز | اکباتان تک"
description: "طراحی و استقرار کلاسترهای Elasticsearch با ECK Operator روی کوبرنتیز؛ معماری Hot-Warm-Cold، بهینه‌سازی JVM و NVMe، امنیت mTLS/SSO و کاهش هزینه لاگینگ."
tag: "OBSERVABILITY & SEARCH"
order: 4
faqs:
  - question: "برای جلوگیری از مشکل OOMKilled و افت پرفورمنس در نودهای Data چه تدابیری دارید؟"
    answer: "پیکربندی مهندسی‌شده JVM Heap (حداکثر ۵۰٪ از RAM فیزیکی و اکیداً کمتر از 32GB برای فعال‌ماندن Compressed OOPs)، ایزوله‌سازی نقش‌های Master-eligible از Data Nodeها، تنظیم bootstrap.memory_lock در سطح سیستم‌عامل جهت جلوگیری از Swap، و اتصال به استوریج‌های Local NVMe (نظیر DirectPV یا TopoLVM) با IO Scheduler مناسب."
  - question: "امنیت کلاستر در سطح Enterprise چگونه تامین می‌شود؟"
    answer: "فعال‌سازی بومی mTLS بین تمامی نودهای کلاستر و لایه HTTP، پیکربندی Role-Based Access Control (RBAC) در سطح ایندکس و سند، و یکپارچه‌سازی Kibana با Keycloak یا Identity Provider سازمان از طریق OIDC/SAML."
  - question: "معماری Hot-Warm-Cold چقدر در کاهش هزینه‌های ذخیره‌سازی لاگ مؤثر است؟"
    answer: "با تعریف سیاست‌های دقیق ILM (Index Lifecycle Management)، لاگ‌های داغ و پرترافیک روی دیسک‌های NVMe سریع قرار می‌گیرند و ایندکس‌های قدیمی‌تر به‌صورت خودکار فشرده‌سازی (Force Merge) شده و به نودهای ارزان‌تر یا Searchable Snapshots روی Ceph S3 منتقل می‌شوند؛ این رویکرد معمولاً هزینه سخت‌افزار ذخیره‌سازی را بین ۵۰ تا ۷۰ درصد کاهش می‌دهد."
  - question: "چگونه پایداری و بازیابی از بحران (DR) بین دو دیتاسنتر پیاده‌سازی می‌شود؟"
    answer: "از ترکیب Snapshotهای زمان‌بندی‌شده روی Object Storage سازگار با S3 و قابلیت Cross-Cluster Replication (CCR) برای ایندکس‌های حیاتی جستجو و APM استفاده می‌کنیم تا در صورت از دست رفتن یک سایت، سرویس‌دهی با حداقل RPO ادامه یابد."
---

## مهندسی جستجوی سازمانی و مشاهده‌پذیری با Elasticsearch (ECK)

اجرای کلاسترهای بزرگ **Elasticsearch** برای لاگینگ متمرکز، جستجوی تمام‌متن (Full-Text Search) و **APM** بدون طراحی دقیق Sharding و معماری حافظه، به‌سرعت به ناپایداری کلاستر، `CircuitBreakingException` و هزینه‌های نجومی سخت‌افزار منجر می‌شود. شرکت اکباتان کلاسترهای **Elasticsearch Enterprise** را با استفاده از **ECK Operator** روی [کوبرنتیز سازمانی](/services/kubernetes/) به‌صورت کاملاً Declarative و GitOps پیاده‌سازی می‌کند.

### ۱. تفکیک نقش‌ها و توپولوژی ضد Split-Brain
برای تضمین پایداری زیر بار سنگین Indexing و Query هم‌زمان، نقش‌های کلاستر به‌صورت کامل ایزوله می‌شوند:
* **Dedicated Master Nodes (۳ یا ۵ نود فرد):** توزیع‌شده در Rackهای مستقل با `PodTopologySpreadConstraints` برای حفظ Quorum.
* **Hot / Warm / Cold Data Nodes:** تخصیص نودهای Hot به دیسک‌های Local NVMe پرسرعت و انتقال خودکار ایندکس‌ها از طریق **ILM** به لایه‌های کم‌هزینه‌تر و [استوریج Ceph S3](/services/ceph/).
* **Dedicated Ingest & Coordinating Nodes:** جداسازی پردازش Pipelineهای سنگین پارسینگ لاگ و تجمیع کوئری‌های پیچیده (Aggregations) از نودهای ذخیره‌سازی داده.

### ۲. پشته یکپارچه Observability (Logs + Metrics + Traces)
معماری ما Elasticsearch را به قلب یک سامانه ریشه‌یابی خطا (RCA) تبدیل می‌کند:
* جمع‌آوری و غنی‌سازی کم‌مصرف لاگ‌ها با **Vector** (جایگزین سبک‌تر و سریع‌تر Logstash/Filebeat).
* همبستگی (Correlation) کامل بین لاگ‌ها در Elasticsearch، متریک‌ها در **VictoriaMetrics / Grafana** و تریس‌های توزیع‌شده با **OpenTelemetry** و **Elastic APM** از طریق `trace.id` و متادیتای کوبرنتیز.

### ۳. پیکربندی مرجع ECK و مطالعه موردی واقعی
برای مشاهده فایل مانیفست مرجع و جزئیات استقرار ECK، صفحه **[پیکربندی مرجع Elasticsearch و ECK Operator](/enterprise/elasticsearch-eck/)** را ببینید. همچنین تجربه عملیاتی تیم ما در بهره‌برداری از کلاسترهای ۴۰+ نودی در صفحه **[پلتفرم داده و Stateful Workloads](/experience/data-platform/)** مستند شده است.

جهت سایزینگ دقیق کلاستر، رفع گلوگاه‌های Indexing یا مهاجرت بدون قطعی، فرم **[درخواست ارزیابی معماری زیرساخت](/assessment/)** را تکمیل نمایید.