---
title: "پایگاه‌های داده توزیع‌شده و سازمانی"
metaTitle: "استقرار دیتابیس HA سازمانی (PostgreSQL & ClickHouse) | اکباتان"
description: "طراحی، استقرار و تیونینگ کلاسترهای دیتابیس OLTP و OLAP روی کوبرنتیز و Bare-Metal؛ شامل PostgreSQL (CloudNativePG/Patroni)، ClickHouse، StarRocks و Redis HA."
tag: "DATABASES & ANALYTICS"
order: 3
faqs:
  - question: "مکانیزم Failover در کلاسترهای PostgreSQL به چه صورت پیاده‌سازی می‌شود؟"
    answer: "بسته به معماری محیط شما، از CloudNativePG Operator روی کوبرنتیز یا Patroni به همراه کلاستر etcd اختصاصی روی Bare-Metal استفاده می‌شود. در صورت بروز Network Partition یا کرش نود Primary، فرآیند Leader Election با الگوریتم Raft به‌صورت خودکار و در چند ثانیه انجام شده و ترافیک از طریق سرویس Read/Write یا PgBouncer بدون مداخله دستی به نود سالم هدایت می‌شود."
  - question: "آیا اجرای دیتابیس‌های سنگین Stateful روی کوبرنتیز در Production امن و پرسرعت است؟"
    answer: "بله، مشروط به طراحی صحیح لایه Storage و Affinity. ما برای دیتابیس‌های حساس به Latency از دیسک‌های Local NVMe (مانند DirectPV یا TopoLVM) به همراه Replication سطح اپلیکیشن و PodTopologySpreadConstraints استفاده می‌کنیم تا سربار شبکه استوریج حذف شده و کارایی هم‌سطح Bare-Metal به دست آید."
  - question: "بک‌آپ‌گیری و بازیابی نقطه‌ای (PiTR) چگونه تضمین می‌شود؟"
    answer: "برای PostgreSQL از Continuous WAL Archiving با ابزارهای Barman یا pgBackRest روی Object Storage سازگار با S3 (مانند Ceph RGW) استفاده می‌کنیم تا بازیابی به هر ثانیه دلخواه (Point-in-Time Recovery) ممکن باشد. همچنین سناریوی Restore به‌صورت دوره‌ای در محیط ایزوله تست و راستی‌آزمایی می‌شود."
  - question: "چه زمانی باید از ClickHouse یا StarRocks در کنار PostgreSQL استفاده کرد؟"
    answer: "PostgreSQL بهترین گزینه برای تراکنش‌های OLTP است، اما کوئری‌های تحلیلی سنگین روی میلیاردها ردیف باعث قفل شدن منابع آن می‌شود. با انتقال بلادرنگ داده‌ها از طریق CDC (Debezium + Kafka) به ClickHouse یا StarRocks، داشبوردهای تحلیلی و گزارش‌گیری در کسری از ثانیه بدون فشار روی دیتابیس عملیاتی اجرا می‌شوند."
---

## مهندسی لایه داده بدون نقطه تک‌خرابی (Zero-SPOF Data Layer)

در سیستم‌های پرترافیک سازمانی، کندی یا قطعی پایگاه داده مستقیماً به توقف کامل کسب‌وکار منجر می‌شود. تیم مهندسی پلتفرم اکباتان کلاسترهای پایگاه داده **OLTP** و **OLAP** را بر بستر [کوبرنتیز سازمانی](/services/kubernetes/) و سرورهای Bare-Metal با تمرکز بر **High Availability**، بازیابی نقطه‌ای (PiTR) و بهینه‌سازی I/O طراحی و عملیاتی می‌کند.

### ۱. پایگاه‌های داده تراکنشی (OLTP) با Failover خودکار
* **PostgreSQL Cloud-Native & Bare-Metal:** پیاده‌سازی کلاسترهای HA با **CloudNativePG Operator** یا **Patroni + etcd**، تفکیک ترافیک Read/Write، مدیریت Pool اتصالات با **PgBouncer** و تنظیمات دقیق `shared_buffers`، `work_mem` و `autovacuum` متناسب با الگوی بار کاری.
* **دیتابیس‌های سندمحور و کلید-مقدار:** استقرار **MongoDB** (با Percona Operator) در قالب ReplicaSet/Sharded Cluster و کلاسترهای **Redis / Dragonfly** با Sentinel یا Cluster Mode جهت کشینگ کم‌تاخیر و مدیریت Session.

### ۲. موتورهای تحلیلی کلان‌داده (OLAP) و CDC
* **ClickHouse & StarRocks:** راه‌اندازی کلاسترهای Sharded و Replicated با **Altinity Operator**، جداسازی **ClickHouse Keeper** روی نودهای مستقل با دیسک NVMe اختصاصی برای حفظ `fsync` پایدار و بهینه‌سازی کلیدهای مرتب‌سازی (`ORDER BY`) و پارتیشن‌بندی.
* **خط لوله داده بلادرنگ (CDC):** همگام‌سازی تغییرات دیتابیس‌های عملیاتی با **Apache Kafka** و انتقال به Data Lake روی [استوریج توزیع‌شده Ceph S3](/services/ceph/) بدون تحمیل بار اضافه به سیستم‌های OLTP.

### ۳. مقایسه معماری‌های پیشنهادی لایه داده

| نیاز سازمان | پشته پیشنهادی اکباتان | لایه Storage و Backup | هدف پایداری (RPO / Failover) |
| :--- | :--- | :--- | :--- |
| سرویس‌های مالی و تراکنشی | PostgreSQL (CloudNativePG / Patroni) + PgBouncer | Local NVMe / Ceph RBD + WAL روی S3 | RPO زیر ۱ دقیقه / Failover زیر ۱۰ ثانیه |
| تحلیل بلادرنگ و BI مقیاس بزرگ | ClickHouse / StarRocks + Keeper | Local NVMe + Cold Tier روی Ceph S3 | تحمل خرابی رک (Multi-Rack HA) |
| کشینگ و صف پیام پرترافیک | Redis HA / Dragonfly + Kafka / NATS | دیسک سریع با AOF/RDB Snapshot | بازیابی خودکار بدون از دست رفتن سرویس |

### ۴. مشاهده‌پذیری و ممیزی مداوم دیتابیس
تمام کلاسترهای تحویلی به متریک‌های دقیق `postgres_exporter`، تحلیل کوئری‌های کند (`pg_stat_statements`)، داشبوردهای **VictoriaMetrics / Grafana** و هشدارهای هوشمند بر اساس Saturation (دیسک، Lock، Replication Lag و Connection Pool) مجهز می‌شوند.

برای مشاهده تجربه عملیاتی تیم ما در مدیریت کلاسترهای ۴۰+ نودی، مطالعه موردی **[پلتفرم داده و دیتابیس‌های توزیع‌شده](/experience/data-platform/)** را ببینید یا برای طراحی معماری داده سازمان خود فرم **[ارزیابی معماری زیرساخت](/assessment/)** را تکمیل کنید.