---
title: "زیرساخت ذخیره‌سازی توزیع‌شده Ceph"
metaTitle: "معماری و استقرار استوریج توزیع‌شده Ceph در مقیاس Petabyte | شرکت اکباتان"
description: "طراحی، پیاده‌سازی و نگهداری کلاسترهای Ceph و Rook-Ceph با معماری Software-Defined Storage (SDS) برای ارائه سرویس‌های Block، File و Object (S3) با پایداری ۹۹.۹۶٪."
tag: "STORAGE & DATA"
order: 2
faqs:
  - question: "چگونه از Split-Brain در سطح استوریج جلوگیری و Data Locality را تضمین می‌کنید؟"
    answer: "با توزیع دقیق MONها و OSDها در Failure Domainهای مختلف (Rack/Zone/Datacenter) از طریق تدوین پیشرفته CRUSH Map. برای ورک‌لودهای حساس به تاخیر (Latency)، از NVMe-oF و در محیط‌های Kubernetes از Rook-Ceph Operator با استراتژی‌های Node Anti-Affinity سخت‌گیرانه استفاده می‌شود."
  - question: "تفاوت استقرار Ceph به صورت Bare-Metal (cephadm) با Rook-Ceph روی کوبرنتیز چیست؟"
    answer: "در معماری‌های Multi-Cluster یا زمانی که استوریج باید به صورت مستقل به محیط‌های مجازی‌سازی و چندین کلاستر سرویس دهد، استقرار Bare-Metal با cephadm روی سرورهای اختصاصی توصیه می‌شود. در مقابل، Rook-Ceph مدیریت چرخه حیات استوریج را به صورت Cloud-Native و از طریق اپراتورهای کوبرنتیز یکپارچه می‌کند. تیم اکباتان بر اساس توپولوژی و مقیاس IOPS شما بهترین گزینه را طراحی و پیاده‌سازی می‌کند."
  - question: "چه مکانیزم‌هایی برای بهینه‌سازی هزینه ذخیره‌سازی در حجم‌های پتابایتی به کار می‌گیرید؟"
    answer: "برای داده‌های حساس به Latency (مانند دیسک‌های دیتابیس و ماشین‌های مجازی) از Poolهای مبتنی بر NVMe با استراتژی Replication (ضریب ۳) استفاده می‌کنیم و برای داده‌های حجیم Object Storage (S3)، آرشیو لاگ‌ها و فایل‌های ویدیویی، پروفایل‌های بهینه Erasure Coding (مانند 4+2 یا 8+3) را پیاده‌سازی می‌کنیم که سربار فضای دیسک را تا ۵۰٪ کاهش می‌دهد."
---

## مهندسی استوریج‌های Mission-Critical با معماری Ceph BlueStore

در زیرساخت‌های ابری مدرن و [کلاسترهای کوبرنتیز سازمانی](/services/kubernetes/)، لایه ذخیره‌سازی مهم‌ترین گلوگاه در تضمین پایداری بارهای کاری Stateful است. شرکت اکباتان کلاسترهای ذخیره‌سازی توزیع‌شده **Ceph** را در مقیاس‌های چندپتابایتی (Multi-Petabyte) بر بستر سرورهای Bare-Metal طراحی، تیونینگ و پشتیبانی می‌کند.

### ۱. ارائه یکپارچه Block، File و Object Storage
معماری ما تمامی نیازهای ذخیره‌سازی سازمان را در یک پلتفرم یکپارچه، مقیاس‌پذیر و بدون نقطه تک‌خرابی (SPOF) پوشش می‌دهد:
* **Ceph RBD (Block Storage):** تامین دیسک‌های `ReadWriteOnce` با IOPS بالا و تاخیر زیر میلی‌ثانیه برای ماشین‌های مجازی و [پایگاه‌های داده سازمانی](/services/enterprise-databases/).
* **CephFS (Shared File System):** سیستم فایل توزیع‌شده سازگار با POSIX با قابلیت `ReadWriteMany` (RWX) برای کلاسترهای Active-Active (مانند Jira Data Center و سرویس‌های پردازش موازی).
* **Ceph RGW (S3-Compatible Object Storage):** پیاده‌سازی استوریج شیءگرا با قابلیت Multi-Site Replication برای میزبانی فایل‌های رسانه‌ای، Snapshotهای [کلاسترهای Elasticsearch](/services/elasticsearch-enterprise/)، مخازن آرتیفکت و بک‌آپ‌های Velero.

### ۲. تیونینگ کرنل، شبکه و سخت‌افزار برای حداکثر IOPS
دستیابی به پرفورمنس پایدار در Ceph نیازمند مهندسی دقیق در لایه سیستم‌عامل و شبکه است:
* **تفکیک شبکه فیزیکی:** جداسازی کامل ترافیک `Public Network` و `Cluster Replication Network` روی کارت‌های شبکه ۲۵/۱۰۰ گیگابیتی با پیکربندی LACP/BGP و تنظیم `MTU 9000` (Jumbo Frames).
* **تیونینگ کرنل و BlueStore:** بهینه‌سازی پارامترهای کرنل لینوکس (`vm.swappiness`، `vm.min_free_kbytes` و CPU C-States)، تخصیص درایوهای Enterprise NVMe دارای PLP (حفاظت در برابر قطع برق) برای ` RocksDB/WAL` و تنظیم دقیق `osd_memory_target`.
* **طراحی پیشرفته CRUSH Map:** تعریف سلسله‌مراتب Failure Domain در سطح Host، Rack و Room تا در صورت خاموشی کامل یک رک فیزیکی، دسترسی به داده‌ها بدون وقفه ادامه یابد.

برای مشاهده نمونه‌های عملیاتی پیاده‌سازی‌شده توسط تیم ما، مطالعه موردی **[سیستم‌های ذخیره‌سازی توزیع‌شده Ceph](/experience/ceph-storage/)** را بررسی کنید و یا جهت ممیزی استوریج فعلی سازمان خود، فرم **[درخواست ارزیابی معماری زیرساخت](/assessment/)** را تکمیل نمایید.
