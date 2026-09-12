---
name: "Elasticsearch & ECK Operator"
category: "Observability & Search"
badge: "K8s Operator & Bare-Metal"
description: "استقرار و مدیریت کلاسترهای مقیاس‌پذیر الاستیک سرچ با استفاده از ECK (Elastic Cloud on Kubernetes) برای لاگینینگ، مانیتورینگ و موتورهای جستجوی سازمانی."
architectureDetails:
  - "راه‌اندازی معماری Multi-Node High Availability"
  - "مدیریت خودکار کراش‌ها و رولینگ آپدیت‌ها توسط ECK Operator"
  - "اتصال استوریج‌های پرسرعت NVMe از طریق Local Storage / TopoLVM"
  - "تنظیمات بهینه‌سازی شده JVM Heap و هسته‌های پردازشی"
features:
  - "پشتیبان‌گیری خودکار به S3 (Ceph)"
  - "امنیت و رمزنگاری پیش‌فرض TLS"
  - "پایش لحظه‌ای با Kibana Enterprise"
  - "مقیاس‌پذیری پویا بر اساس بار مصرفی"
yamlCode: |
  apiVersion: elasticsearch.k8s.elastic.co/v1
  kind: Elasticsearch
  metadata:
    name: hegmataneh-es-cluster
    namespace: observability
  spec:
    version: 8.12.0
    nodeSets:
    - name: default
      count: 3
      config:
        node.store.allow_mmap: true
      volumeClaimTemplates:
      - metadata:
          name: elasticsearch-data
        spec:
          accessModes: [ "ReadWriteOnce" ]
          resources:
            requests:
              storage: 500Gi
---

