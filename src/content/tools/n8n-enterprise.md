---
name: "n8n Enterprise"
category: "Workflow & AI Automation"
badge: "Queue Mode & AI Agents"
description: "راه‌اندازی پلتفرم اتوماسیون جریان کار و ایجنت‌های هوش مصنوعی در حالت صف (Queue Mode) برای پردازش تعداد درخواست‌های بالا بدون اتلاف منابع."
architectureDetails:
  - "اجرا در حالت Queue Mode با استفاده از Redis به عنوان بروکر"
  - "مقیاس‌پذیری افقی Workerها بر اساس حجم تسک‌های ورودی"
  - "اتصال امن به مدل‌های هوش مصنوعی محلی یا ابری"
  - "پایداری بالا و عدم از دست رفتن تسک‌ها در صورت بروز اختلال"
features:
  - "مدیریت تسک‌های همزمان سنگین"
  - "امنیت داده‌های سازمانی در گردش کار"
  - "اتصال به صدها سرویس و دیتابیس مختلف"
  - "امکان توسعه نودهای سفارشی"
yamlCode: |
  version: '3.8'
  services:
    n8n-worker:
      image: n8nio/n8n:latest
      command: worker
      deploy:
        replicas: 5
---

