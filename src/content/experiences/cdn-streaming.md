---
title: "شبکه توزیع محتوا (CDN) و استریمینگ مقیاس‌پذیر"
scale: "3 Tbps Bandwidth Peak"
category: "CDN & Edge Engineering"
description: "مهندسی و توسعه شبکه توزیع محتوای بومی با معماری Anycast و توسعه کنترلرهای اختصاصی توزیع بار جهت کاهش ترافیک Origin و افزایش Hit Ratio."
highlights:
  - "توسعه لودبالانسر هوشمند با Golang جهت هدایت ترافیک بر اساس سلامت نودها"
  - "طراحی معماری Failure-aware با قابلیت خروج خودکار نودهای معیوب از مدار ترافیک"
  - "یکپارچگی عمیق لبه شبکه (Edge) با استوریج‌های Ceph S3"
  - "توسعه پایپ‌لاین‌های تبدیل فرمت بلادرنگ (Transcoding) روی کوبرنتیز"
techs: ["CDN", "Anycast BGP", "Ceph S3", "Golang Edge Controller", "WebRTC", "HLS"]
---

### متریک‌ها و دستاوردهای کلیدی (Evidence Card)
این پروژه برای پلتفرم‌های پیام‌رسان و VOD با ترافیک حیاتی پیاده‌سازی شده است:

* **ترافیک در زمان پیک (Peak Traffic):** `3.1 Tbps`
* **نسبت کش هیت (Cache Hit Ratio):** `~94%` (کاهش چشمگیر بار روی Origin)
* **تاخیر (P95 Latency):** `< 15ms` در ارتباطات Edge-to-Edge داخلی
* **مقیاس کاربران همزمان:** توانایی پردازش صدها هزار کانکشن همزمان در WebRTC SFU
* **Availability شبکه:** `99.99%` در بازه ۱۲ ماهه (گزارش شده توسط سیستم Observability)

