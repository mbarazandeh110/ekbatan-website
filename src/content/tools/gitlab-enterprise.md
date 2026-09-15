---
name: "GitLab Enterprise"
category: "DevSecOps & SCM"
badge: "HA Architecture on K8s"
description: "پیاده‌سازی پلتفرم جامع چرخه حیات نرم‌افزار (DevSecOps) با معماری توزیع‌شده برای سازمان‌هایی با هزاران توسعه‌دهنده."
architectureDetails:
  - "استفاده از External PostgreSQL (Patroni/Cloudnative-pg) و External Redis برای تضمین HA"
  - "جداسازی سرویس‌های Gitaly، Sidekiq و Webservice روی نودهای پردازشی مجزا"
  - "ذخیره‌سازی حجیم کامپوننت‌ها روی Ceph S3 Object Storage"
  - "یکپارچه‌سازی با OIDC/SAML برای هویت‌سنجی متمرکز (SSO)"
features:
  - "محیط ایزوله (Air-gapped deployment) برای نهادهای مالی"
  - "به‌کارگیری استانداردهای Supply-chain security"
  - "مدیریت خودکار بک‌آپ‌ها (RPO & RTO تعریف شده)"
  - "مانیتورینگ جامع با VictoriaMetrics Service Monitors"
yamlCode: |
  # Reference Helm Values Snapshot for GitLab Cloud Native HA
  global:
    edition: ee
    hosts:
      domain: gitlab.ekbatan.tech
    appConfig:
      object_store:
        enabled: true
        connection:
          secret: ceph-s3-credentials
  postgresql:
    install: false # Managed via External Patroni/Cloudnative-pg Cluster
  redis:
    install: false # Managed via External Redis HA
  gitlab:
    webservice:
      replicaCount: 3
      image:
        repository: registry.gitlab.com/gitlab-org/build/cng/gitlab-webservice-ee
        tag: "19.3.1-ee.0"
      resources:
        requests:
          cpu: "2"
          memory: "4Gi"
    sidekiq:
      replicaCount: 4
      resources:
        requests:
          cpu: "1"
          memory: "2Gi"
---

