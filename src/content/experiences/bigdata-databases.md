---
title: "پلتفرم داده‌های کلان و دیتابیس‌های توزیع‌شده (Data Lakehouse)"
scale: "40+ Nodes Clusters (StarRocks & ClickHouse)"
category: "Distributed Data & Analytics"
description: "طراحی معماری و استقرار کلاسترهای Stateful دیتابیس‌های تحلیلی (OLAP) و پردازش جریانی (Stream Processing) بر بستر کوبرنتیز با تمرکز بر Performance Tuning دیسک‌ها."
highlights:
  - "استقرار و مدیریت کلاسترهای ۴۰+ نودی StarRocks و ClickHouse روی توپولوژی‌های Multi-Rack با تنظیمات Anti-Affinity"
  - "بهینه‌سازی لایه ذخیره‌سازی با تخصیص Local NVMe و استفاده از DirectPV برای رفع چالش‌های I/O در Workloadهای سنگین Stateful روی کوبرنتیز"
  - "پیاده‌سازی معماری Change Data Capture (CDC) با Apache Kafka و استریم داده‌ها به دیتالیک‌های مبتنی بر Ceph S3"
  - "تأمین حاکمیت داده (Data Governance) و امنیت دسترسی‌ها با پیاده‌سازی کامل Apache Ranger و Knox در اکوسیستم کلان‌داده"
techs: ["StarRocks", "ClickHouse", "DirectPV", "Apache Ranger", "Kafka CDC", "Ceph S3"]
---

### متریک‌های معماری و دستاوردها (Evidence & Outcomes)
* **پرفورمنس ذخیره‌سازی:** دستیابی به IOPS و Throughput معادل Bare-metal برای پادهای ClickHouse از طریق دور زدن لایه‌های شبکه و اتصال مستقیم (Direct Volume) به NVMe.
* **سرعت کوئری‌ها (Query Latency):** کاهش زمان اجرای کوئری‌های پیچیده تحلیلی روی دیتاسِت‌های چند ترابایتی از مقیاس ساعت به **زیر ۱ ثانیه** با معماری MPP در StarRocks.
* **پایداری کلاستر (HA):** اجرای Zero-downtime Upgrade روی کلاسترهای توزیع‌شده Elasticsearch و ClickHouse بدون افت ترافیک Read/Write.

