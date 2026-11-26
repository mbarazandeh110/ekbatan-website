---
title: "سیستم‌های ذخیره‌سازی توزیع‌شده Ceph"
scale: "Multi-Petabyte Object, File & Block Storage"
category: "Distributed Storage & SRE"
description: "طراحی، پیاده‌سازی و بهینه‌سازی کلاسترهای چندپتابایتی Ceph و Rook-Ceph با معماری Replication و Erasure Coding برای سرویس‌دهی Block، File و Object Storage."
metrics:
  - label: "ظرفیت ذخیره‌سازی"
    value: "Multi-PB"
  - label: "دسترس‌پذیری استوریج"
    value: "99.96%"
  - label: "کاهش سربار فضا با EC"
    value: "45%+"
  - label: "تحمل خطای فیزیکی"
    value: "Rack-Level"
highlights:
  - "راه‌اندازی یکپارچه سرویس‌های Ceph RBD (Block)، CephFS (Shared File) و Ceph RGW (S3 Object Storage) روی سرورهای Bare-Metal"
  - "طراحی CRUSH Map چندسطحی (Host/Rack) با پروفایل‌های ترکیبی Replication (ضریب ۳ روی NVMe) و Erasure Coding برای داده‌های حجیم"
  - "یکپارچه‌سازی کامل با کوبرنتیز از طریق Rook-Ceph و درایورهای CSI برای تامین داینامیک PVCهای RWO و RWX"
  - "تفکیک فیزیکی شبکه Public و Cluster Replication با MTU 9000 و پایش مداوم سلامت PGها و تاخیر OSDها در VictoriaMetrics"
techs: ["Ceph BlueStore", "Rook-Ceph", "Ceph RGW (S3)", "CephFS", "Ceph RBD", "CRUSH Map", "NVMe", "Kubernetes CSI"]
---

### چالش و معماری پیاده‌سازی‌شده

در زیرساخت‌های بزرگ سازمانی، استفاده از SANهای سنتی به‌دلیل محدودیت مقیاس‌پذیری عمودی، هزینه بالای ارتقا و وجود نقطه تک‌خرابی در کنترلرها پاسخگوی رشد چندپتابایتی داده نیست. تیم مهندسی اکباتان در پیاده‌سازی [زیرساخت ذخیره‌سازی توزیع‌شده Ceph](/services/ceph/)، یک پلتفرم Software-Defined Storage یکپارچه را برای تامین هم‌زمان دیسک‌های کانتینری، فایل‌سیستم اشتراکی و باکت‌های S3 طراحی و عملیاتی کرد.

* **معماری دولایه کارایی و هزینه (Tiered Pools):** بارهای کاری حساس به Latency نظیر [پایگاه‌های داده سازمانی](/services/enterprise-databases/) و دیسک‌های RBD روی Poolهای تمام‌NVMe با ضریب Replication سه‌برابری قرار گرفتند؛ در حالی که فایل‌های آرشیوی، Snapshotهای [کلاسترهای Elasticsearch](/services/elasticsearch-enterprise/) و ذخیره‌سازی سرویس‌هایی نظیر [Nextcloud Enterprise](/enterprise/nextcloud-enterprise/) روی Poolهای Erasure-Coded پیاده‌سازی شدند که هزینه فضای خام را بیش از ۴۵٪ کاهش داد.
* **پایداری در زمان Recovery و Backfill:** با تفکیک فیزیکی شبکه‌های ۲۵/۱۰۰ گیگابیتی `Public` و `Cluster`، تنظیم `mClock` QoS و ایزوله‌سازی WAL/DB روی NVMeهای Enterprise دارای PLP، عملیات بازسازی پس از خرابی دیسک یا نود بدون افت محسوس IOPS روی سرویس‌های Production انجام می‌شود.
* **اتوماسیون و مشاهده‌پذیری SRE:** تمام متریک‌های `ceph-mgr` شامل Latency دیسک‌ها، وضعیت Placement Groupها، نرخ Recovery و مصرف فضا به صورت بلادرنگ در **VictoriaMetrics و Grafana** رصد شده و یکپارچه‌سازی با [کلاسترهای کوبرنتیز](/services/kubernetes/) از طریق **Rook-Ceph** مدیریت چرخه حیات و ارتقاها را بدون قطعی ممکن کرده است.

برای بررسی جزئیات خدمات طراحی، تیونینگ و پشتیبانی استوریج در سازمان خود، صفحه **[خدمات استقرار Ceph و Rook-Ceph](/services/ceph/)** را مشاهده کنید یا از طریق **[فرم ارزیابی معماری](/assessment/)** با تیم ما در ارتباط باشید.
