---
name: "n8n Enterprise"
category: "Workflow & AI Automation"
badge: "Queue Mode & AI Agents"
description: "راه‌اندازی پلتفرم اتوماسیون جریان کار و ایجنت‌های هوش مصنوعی در حالت صف (Queue Mode) برای هندلینگ هزاران اجرای همزمان (Executions) با مقیاس‌پذیری افقی."
architectureDetails:
  - "استقرار در معماری Multi-Tier شامل نودهای Main، Webhook و Worker مجزا"
  - "استفاده از Redis Cluster به عنوان Message Broker برای توزیع وظایف بین Workerها"
  - "ذخیره‌سازی وضعیت اجراها (Execution Data) در کلاستر PostgreSQL با معماری HA"
  - "مدیریت کلیدهای رمزنگاری (Encryption Keys) از طریق HashiCorp Vault"
features:
  - "ایزوله‌سازی محیط‌های اجرای کدهای کاستوم (AI Agents) در کانتینرهای ایمن"
  - "مقیاس‌پذیری خودکار (HPA) نودهای Webhook در زمان پیک دریافت رویدادها"
  - "حفظ کامل پایداری؛ از کار افتادن یک Worker منجر به Fail شدن فرآیند نخواهد شد"
  - "تخلیه دوره‌ای دیتابیس (Data Pruning) و آرشیو لاگ‌ها روی Object Storage"
yamlCode: |
  # Production Queue Mode Deployment Snippet
  apiVersion: apps/v1
  kind: Deployment
  metadata:
    name: n8n-worker
    namespace: automation
  spec:
    replicas: 5 # Horizontally scaled workers
    template:
      spec:
        containers:
        - name: n8n-worker
          image: n8nio/n8n:1.31.2 # Production Pinned Version
          command: ["n8n", "worker", "--concurrency=50"]
          env:
          - name: EXECUTIONS_MODE
            value: "queue"
          - name: QUEUE_BULL_REDIS_HOST
            value: "redis-cluster.database.svc.cluster.local"
          - name: DB_TYPE
            value: "postgresdb"
---
