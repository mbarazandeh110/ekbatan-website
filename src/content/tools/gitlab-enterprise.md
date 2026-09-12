---
name: "GitLab Enterprise"
category: "DevSecOps & SCM"
badge: "HA Architecture on K8s"
description: "پیاده‌سازی پلتفرم جامع چرخه حیات نرم‌افزار (DevSecOps) با قابلیت مدیریت مخازن، پایپ‌لاین‌های CI/CD مقیاس‌پذیر و اسکن امنیتی کدها."
architectureDetails:
  - "معماری کاملاً توزیع‌شده (Stateless Rails pods)"
  - "استفاده از PostgreSQL (Patroni) برای دیتابیس توزیع‌شده"
  - "ذخیره‌سازی حجیم کامپوننت‌ها و پکیج‌ها روی Ceph Object Storage"
  - "مدیریت رانرهای ابری ایزوله روی نودهای اختصاصی کوبرنتیز"
features:
  - "محیط کاملاً ایزوله درون‌سازمانی (On-Premise)"
  - "یکپارچگی با ابزارهای امنیتی SAST و DAST"
  - "پشتیبانی از هزاران Developer به صورت همزمان"
  - "دسترسی امن از طریق SSO سازمانی"
yamlCode: |
  apiVersion: apps/v1
  kind: Deployment
  metadata:
    name: gitlab-webservice
    namespace: devsecops
  spec:
    replicas: 3
    template:
      spec:
        containers:
        - name: webservice
          image: gitlab/gitlab-ee:latest
---

