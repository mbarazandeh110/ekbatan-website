---
title: "پایگاه‌های داده توزیع‌شده و سازمانی"
metaTitle: "معماری دیتابیس‌های مقیاس‌پذیر و HA (PostgreSQL & ClickHouse) | اکباتان"
description: "راه‌اندازی کلاسترهای دیتابیس OLTP و OLAP با مکانیزم‌های Failover خودکار، Sharding توزیع‌شده و Replication بدون تاخیر."
tag: "DATABASES & ANALYTICS"
order: 3
faqs:
  - question: "مکانیزم Failover در کلاسترهای PostgreSQL به چه صورت پیاده‌سازی می‌شود؟"
    answer: "از Patroni به همراه کلاستر etcd اختصاصی به عنوان Distributed Configuration Store استفاده می‌شود. در صورت بروز Network Partition یا کرش در نود Leader، فرآیند Leader Election با مکانیزم Consensus الگوریتم Raft به صورت خودکار و زیر ۳ ثانیه انجام شده و ترافیک از طریق HAProxy/PgBouncer مجدداً مسیردهی می‌شود."
---
طراحی توپولوژی‌های Multi-Node برای بارهای کاری پرترافیک با تحمل خطای بالا (Fault Tolerance). 

برای سیستم‌های OLTP، معماری PostgreSQL با استفاده از Patroni و کلاسترینگ مبتنی بر Quorum پیاده‌سازی می‌شود. برای کلان‌داده و بارهای کاری OLAP، از کلاسترهای ClickHouse روی زیرساخت کوبرنتیز استفاده می‌کنیم. در این سطح از استقرار، جداسازی ClickHouse Keeper (روی نودهای مستقل با استوریج Local NVMe برای جلوگیری از تاخیر fsync)، تیونینگ پارامترهای حافظه، و پیاده‌سازی استراتژی‌های Continuous WAL Archiving برای تضمین Point-in-Time Recovery (PiTR) از طریق ابزارهایی نظیر pgBackRest از استانداردهای قطعی است.
