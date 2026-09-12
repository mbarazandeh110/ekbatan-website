---
name: "Nexus Repository"
category: "Artifact Management"
badge: "Proxy & Host Registry"
description: "مدیریت و میزبانی متمرکز پکیج‌های نرم‌افزاری، کانتینرها و کتابخانه‌ها به صورت کش‌شده و امن برای تسریع فرآیندهای بیلد و توسعه."
architectureDetails:
  - "پشتیبانی از انواع فرمت‌ها (Docker, Maven, npm, PyPI, Helm)"
  - "ذخیره‌سازی پایدار و حجیم روی حجم‌های توزیع‌شده Ceph"
  - "مکانیزم‌های پاکسازی هوشمند و سیاست‌های نگهداری (Cleanup Policies)"
  - "ایزوله‌سازی دسترسی تیم‌های مختلف به مخازن"
features:
  - "کاهش چشمگیر زمان دانلود وابستگی‌ها در CI/CD"
  - "امنیت بالا و اسکن آسیب‌پذیری پکیج‌ها"
  - "پشتیبانی از مخازن پروکسی و میزبان (Hosted)"
  - "هماهنگی کامل با رانرهای گیت‌لَب"
yamlCode: |
  apiVersion: apps/v1
  kind: StatefulSet
  metadata:
    name: sonatype-nexus
    namespace: devops
  spec:
    replicas: 1
    template:
      spec:
        containers:
        - name: nexus
          image: sonatype/nexus3:latest
---

