---
name: "Jira Data Center"
category: "Project & Issue Tracking"
badge: "Active-Active HA Clustering"
description: "استقرار نسخه دیتاسنتر جیرا با معماری Active-Active روی کوبرنتیز برای مدیریت پروژه‌های سازمانی بدون هیچ‌گونه قطعی."
architectureDetails:
  - "اجرای همزمان چندین نود فعال (Active-Active Nodes)"
  - "مدیریت نشست‌ها و کش‌ها با استفاده از Hazelcast Cluster"
  - "استفاده از دیتابیس PostgreSQL پرقدرت و متمرکز"
  - "ذخیره‌سازی پیوست‌ها روی Ceph Shared FileSystem (RWX)"
features:
  - "تضمین پایداری و مقیاس‌پذیری برای هزاران کاربر"
  - "کارایی بالا در پردازش بوردها و جستجوهای پیچیده"
  - "اتصال امن به سامانه هویت‌سنجی سازمان"
  - "پشتیبان‌گیری خودکار بدون قطعی سرویس"
yamlCode: |
  apiVersion: apps/v1
  kind: Deployment
  metadata:
    name: jira-datacenter
    namespace: management
  spec:
    replicas: 2
    template:
      spec:
        containers:
        - name: jira
          image: atlassian/jira-software:latest
---

