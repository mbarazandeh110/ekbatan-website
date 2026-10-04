---
title: "زیرساخت ذخیره‌سازی توزیع‌شده Ceph"
metaTitle: "معماری و استقرار استوریج توزیع‌شده Ceph در مقیاس Petabyte | اکباتان"
description: "طراحی، پیاده‌سازی و نگهداری کلاسترهای Ceph با معماری Software-Defined Storage (SDS) برای ارائه سرویس‌های Block، File و Object (S3) با تضمین پایداری ۹۹.۹۶٪."
tag: "STORAGE & DATA"
order: 2
faqs:
  - question: "چگونه از Split-Brain در سطح استوریج جلوگیری و Data Locality را تضمین می‌کنید؟"
    answer: "با توزیع دقیق MONها و OSDها در Failure Domainهای مختلف (Rack/Zone/Datacenter) از طریق تدوین پیشرفته CRUSH Map. برای ورک‌لودهای حساس به تاخیر (Latency)، از NVMe-oF و در محیط‌های Kubernetes از Rook-Ceph Operator با استراتژی‌های Node Anti-Affinity سخت‌گیرانه استفاده می‌شود."
---
پیاده‌سازی لایه استوریج Mission-Critical مبتنی بر معماری BlueStore. ما کلاسترهای Ceph را برای هندلینگ ترافیک عظیم I/O روی کلاسترهای Bare-metal معماری می‌کنیم. 

این فرآیند شامل Tuning سطح کرنل لینوکس (نظیر تنظیمات `vm.swappiness`، `dirty_ratio` و `dirty_background_ratio`)، پیکربندی شبکه توزیع‌شده (تفکیک Cluster Network و Public Network با MTU 9000 در لایه فیزیکی LACP/BGP)، و یکپارچه‌سازی کامل با کوبرنتیز از طریق CSI Driverها جهت Provisioning داینامیک دیسک‌های RBD (RWO) و CephFS (RWX) است.
