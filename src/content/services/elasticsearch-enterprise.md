---
title: "استقرار Elasticsearch Enterprise"
metaTitle: "راه‌اندازی کلاسترهای Elasticsearch و استک Elastic روی K8s | اکباتان"
description: "طراحی کلاسترهای توزیع‌شده Elastic با معماری Hot-Warm-Cold، مدیریت چرخه حیات ایندکس‌ها (ILM) و یکپارچه‌سازی امنیتی."
tag: "OBSERVABILITY & SEARCH"
order: 4
faqs:
  - question: "برای جلوگیری از مشکل OOMKilled و افت پرفورمنس در نودهای Data چه تدابیری دارید؟"
    answer: "پیکربندی مهندسی‌شده JVM Heap (حداکثر ۵۰٪ از RAM فیزیکی و اکیداً کمتر از 32GB برای فعال‌ماندن Compressed OOPs)، ایزوله‌سازی نقش‌های Master-eligible از Data Nodeها، تنظیم `bootstrap.memory_lock: true` در سطح OS برای جلوگیری از Paging، و استفاده از استوریج‌های Local (نظیر TopoLVM/OpenEBS LVM) با استراتژی `mq-deadline` IO Scheduler."
  - question: "امنیت کلاستر در سطح Enterprise چگونه تامین می‌شود؟"
    answer: "فعال‌سازی بومی mTLS بین تمام نودهای کلاستر (Transport Layer Security)، پیکربندی Role-Based Access Control (RBAC) در سطح ایندکس و فیلد، و یکپارچه‌سازی با OIDC/SAML Provider سازمان برای مدیریت متمرکز هویت."
---
استقرار کلاسترهای لاگینگ، APM و موتورهای جستجوی بلادرنگ در مقیاس Enterprise با استفاده از ECK (Elastic Cloud on Kubernetes) Operator. 

معماری ما برای جلوگیری از پدیده‌ی Split-Brain و Split-Routing، مبتنی بر جداسازی کامل نقش‌های کلاستر است (Dedicated Master, Data, Ingest, Coordinating/Client Nodes). با پیاده‌سازی دقیق Index Lifecycle Management (ILM) و معماری Data Tiering (انتقال داده‌ها از Hot به Warm و Cold/Frozen بر بستر S3 یا Ceph RGW)، هزینه‌های ذخیره‌سازی را تا ۷۰٪ کاهش داده، بدون آنکه تاخیری در سرعت Ingest نودهای Hot ایجاد شود. منابع سخت‌افزاری با استفاده از StatefulSetهای مجزا و کانفیگ‌های Pod Topology Spread Constraints مستقیماً در سطح Availability Zoneها توزیع می‌شوند.
