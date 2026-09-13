---
name: "Elasticsearch & ECK Operator"
category: "Observability & Search"
badge: "K8s Operator & Bare-Metal"
description: "استقرار و مدیریت کلاسترهای مقیاس‌پذیر الاستیک سرچ با استفاده از ECK (Elastic Cloud on Kubernetes) برای لاگینگ، مانیتورینگ و موتورهای جستجوی سازمانی با رعایت اصول امنیتی."
architectureDetails:
  - "راه‌اندازی کلاسترهای توزیع‌شده با جداسازی نقش‌های Master, Data و Ingest/ML Nodes برای High Availability"
  - "اتوماسیون استقرار، مدیریت Certificateها (TLS) و رول‌بک ایمن توسط ECK Operator"
  - "اتصال نودهای Data به دیسک‌های پرسرعت NVMe با استفاده از TopoLVM/DirectPV برای تضمین I/O بالا"
  - "پیاده‌سازی مکانیزم‌های ILM (Index Lifecycle Management) و اتصال ردیف‌های داده قدیمی به Ceph S3 (Snapshot & Cold Storage)"
features:
  - "پشتیبان‌گیری خودکار و متصل به Object Storage سازمانی (Ceph/MinIO)"
  - "تامین امنیت انتقال داده‌ها (End-to-End TLS) و کنترل دسترسی بر پایه RBAC"
  - "یکپارچگی عمیق با OpenTelemetry، Loki و FluentBit برای Observability جامع"
  - "مقیاس‌پذیری پویا بدون از دست رفتن داده با معماری Sharding بهینه"
yamlCode: |
  apiVersion: elasticsearch.k8s.elastic.co/v1
  kind: Elasticsearch
  metadata:
    name: ekbatan-es-cluster
    namespace: observability
  spec:
    version: 8.x.x # Version managed dynamically via ArgoCD / GitOps
    nodeSets:
    - name: data-nodes
      count: 5
      config:
        node.roles: ["data", "ingest"]
        node.store.allow_mmap: true
      volumeClaimTemplates:
      - metadata:
          name: elasticsearch-data
        spec:
          accessModes: [ "ReadWriteOnce" ]
          storageClassName: "local-nvme-directpv"
          resources:
            requests:
              storage: 2Ti
---

