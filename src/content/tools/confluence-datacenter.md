---
name: "Confluence Data Center"
category: "Enterprise Knowledge Base"
badge: "Collaborative Documentation"
description: "میزبانی از پایگاه دانش و مستندات سازمانی با قابلیت کلاسترینگ پیشرفته، جستجوی پرسرعت و دسترسی امن همزمان."
architectureDetails:
  - "معماری کلاستر هماهنگ با Hazelcast جهت تبادل پیام بین نودها"
  - "استفاده از سیستم فایل مشترک (Shared Home) روی بستر Ceph"
  - "پایش سلامت مداوم نودها با Liveness و Readiness Probes"
  - "بهینه‌سازی حافظه برای پاسخ‌دهی آنی به درخواست‌های مستندسازی"
features:
  - "مستندسازی امن و متمرکز برای تیم‌های فنی و اجرایی"
  - "کنترل دسترسی دقیق و لایه‌ای به فضای کاری"
  - "جستجوی قدرتمند میان هزاران صفحه مستند"
  - "هماهنگی کامل با جیرا"
yamlCode: |
  apiVersion: apps/v1
  kind: Deployment
  metadata:
    name: confluence-datacenter
    namespace: management
  spec:
    replicas: 2
    template:
      spec:
        containers:
        - name: confluence
          image: atlassian/confluence:latest
---

