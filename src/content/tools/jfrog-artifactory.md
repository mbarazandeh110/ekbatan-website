---
name: "JFrog Artifactory"
category: "Universal Artifacts"
badge: "Enterprise Binary Repository"
description: "پلتفرم جامع مدیریت باینری‌ها و انتشار نرم‌افزار با قابلیت پشتیبانی از تمامی فرمت‌های استاندارد صنعتی در مقیاس سازمانی."
architectureDetails:
  - "معماری کلاسترینگ High Availability برای پوشش درخواست‌های حجیم بیلد"
  - "اتصال مستقیم به دیتابیس خارجی و استوریج ابری S3"
  - "مدیریت متمرکز مجوزها و کنترل دسترسی دقیق (RBAC)"
  - "یکپارچگی عمیق با ابزارهای امنیتی Xray"
features:
  - "مدیریت چرخه حیات باینری‌ها (BLM)"
  - "سرعت بسیار بالا در جستجو و تحویل پکیج‌ها"
  - "گزارش‌گیری پیشرفته از مصرف پکیج‌ها"
  - "سازگاری کامل با زیرساخت کوبرنتیز"
yamlCode: |
  apiVersion: apps/v1
  kind: Deployment
  metadata:
    name: jfrog-artifactory
    namespace: devops
  spec:
    replicas: 2
    template:
      spec:
        containers:
        - name: artifactory
          image: releases-docker.jfrog.io/jfrog/artifactory-pro:latest
---

