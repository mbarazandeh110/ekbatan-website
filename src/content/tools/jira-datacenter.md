---
name: "Jira Data Center"
category: "Project & Issue Tracking"
badge: "Active-Active HA Clustering"
description: "استقرار کلاسترینگ دیتاسنتر جیرا با معماری Active-Active روی کوبرنتیز. تضمین پایداری در سطح نود با تنظیمات Anti-Affinity و اتصال به استوریج‌های توزیع‌شده."
architectureDetails:
  - "اجرای همزمان نودهای پردازشی (Active-Active) متصل به کلاستر Hazelcast برای همگام‌سازی Sessionها"
  - "اتصال به دیتابیس PostgreSQL (مدیریت شده توسط Patroni) خارج از کلاستر جهت تفکیک Failure Domain"
  - "تخصیص دیسک‌های Shared (RWX) از طریق CephFS برای فایل‌های پیوست و ایندکس‌های توزیع‌شده"
  - "پیکربندی TopologySpreadConstraints برای جلوگیری از استقرار پادها روی یک رک (Rack) فیزیکی مشترک"
features:
  - "مهاجرت بدون قطعی (Zero-Downtime Migration) از نسخه‌های Server به Data Center"
  - "پشتیبان‌گیری خودکار از دیتابیس و Shared Home روی Ceph S3 با سیاست‌های RPO زیر ۱۵ دقیقه"
  - "رصدپذیری کامل (JMX Metrics) از طریق Prometheus و اتصال به داشبوردهای SRE"
  - "مقیاس‌پذیری افقی (Horizontal Scaling) در زمان پیک ترافیک سازمانی"
yamlCode: |
  apiVersion: apps/v1
  kind: StatefulSet
  metadata:
    name: jira-datacenter
    namespace: atlassian
  spec:
    replicas: 3 # Enterprise HA configuration
    serviceName: jira-headless
    template:
      spec:
        affinity:
          podAntiAffinity:
            requiredDuringSchedulingIgnoredDuringExecution:
            - labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values: ["jira-datacenter"]
              topologyKey: "topology.kubernetes.io/zone"
        containers:
        - name: jira
          image: atlassian/jira-software:9.14.1-ubuntu # Pinned & Validated Version
          resources:
            requests:
              memory: "8Gi"
              cpu: "4"
          volumeMounts:
          - name: jira-shared-home
            mountPath: /var/atlassian/application-data/jira/shared
---
