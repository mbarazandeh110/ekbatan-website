---
name: "Unleash Enterprise"
category: "Feature Management"
badge: "Feature Flags & A/B Testing"
description: "استقرار و مدیریت پلتفرم Unleash برای Feature Flagging و کنترل تدریجی انتشار فیچرها (Canary Releases) در مقیاس سازمانی و ابری."
architectureDetails:
  - "معماری High Availability با استقرار چندین نود (Stateless) پشت لودبالانسر"
  - "استفاده از PostgreSQL مجهز به Patroni برای پایداری ۱۰۰٪ اطلاعات استیت و فلگ‌ها"
  - "راه‌اندازی معماری Unleash Edge جهت کاهش تاخیر (Latency) در ارزیابی فلگ‌ها در لبه شبکه"
  - "یکپارچه‌سازی امن با سامانه احراز هویت و دایرکتوری سازمانی (SSO / SAML / OIDC)"
features:
  - "فعال‌سازی و غیرفعال‌سازی آنی فیچرها در پروداکشن بدون نیاز به استقرار مجدد"
  - "پشتیبانی از A/B Testing و آزمایش‌های هدفمند مبتنی بر سگمنت‌های کاربری"
  - "پایش تغییرات و داشتن Audit Log کامل برای امنیت و تطابق (Compliance)"
  - "ایزوله‌سازی کامل محیط‌های توسعه، تست (Stage) و پروداکشن"
yamlCode: |
  apiVersion: apps/v1
  kind: Deployment
  metadata:
    name: unleash-enterprise
    namespace: feature-management
  spec:
    replicas: 3
    template:
      spec:
        containers:
        - name: unleash
          image: unleashorg/unleash-enterprise:8.2.1
          env:
          - name: DATABASE_URL
            valueFrom:
              secretKeyRef:
                name: unleash-pg-cluster-secret
                key: url
---

**Unleash** یک ابزار قدرتمند متن‌باز و سازمانی (Enterprise) است که تیم‌های توسعه را قادر می‌سازد تا فیچرهای جدید را با سرعت و امنیت بسیار بیشتری منتشر کنند.

با استقرار Unleash توسط تیم **اکباتان** روی زیرساخت کوبرنتیز، شما به یک سیستم مدیریت فیچر با پایداری ۹۹.۹۹٪ دسترسی خواهید داشت که توانایی هندل کردن تعداد زیادی درخواست ارزیابی فلگ را در ثانیه به کمک معماری **Unleash Edge** دارد. این پلتفرم از استراتژی‌های پیچیده Rollout نظیر انتشار Canary، درصد تدریجی، و تفکیک بر اساس ویژگی‌های خاص کاربران پشتیبانی می‌کند و با ایزوله‌سازی بی‌نقص، ریسک قطعی‌های ناشی از دیپلوی را به حداقل ممکن می‌رساند.
