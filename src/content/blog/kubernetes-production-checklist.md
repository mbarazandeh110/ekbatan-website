---
title: "چک‌لیست استقرار Kubernetes قبل از Go-Live در Production"
description: "بررسی الزامات حیاتی معماری کوبرنتیز در محیط عملیاتی از جمله High Availability کنترل‌پلین، تنظیمات شبکه Cilium، استوریج توزیع‌شده و استراتژی‌های SRE."
pubDate: 2026-10-04
author: "تیم مهندسی اکباتان"
tags: ["Kubernetes", "SRE", "Cloud Native", "Production"]
---

## آمادگی برای محیط Production

راه‌اندازی کوبرنتیز در محیط عملیاتی فراتر از یک نصب ساده است. این چک‌لیست تضمین می‌کند که کلاستر شما فاقد Single Point of Failure (SPOF) بوده و برای بارهای کاری سنگین بهینه‌سازی شده است.

### ۱. معماری High Availability (HA)
* استقرار حداقل ۳ نود Control Plane در Availability Zone های مختلف.
* جداسازی ترافیک etcd روی دیسک‌های NVMe اختصاصی جهت جلوگیری از Latency در عملیات نوشتن.
* پیاده‌سازی لودبالانسر خارجی (External LB) برای API Server با استفاده از Keepalived و HAProxy یا Envoy.

### ۲. شبکه و CNI (Cilium)
* استقرار Cilium به عنوان CNI با فعال‌سازی کامل eBPF.
* جایگزینی kube-proxy با Cilium جهت بهبود پرفورمنس مسیریابی ترافیک.
* تدوین Network Policy های سخت‌گیرانه (Default Deny) برای ایزوله‌سازی Namespace ها.

### ۳. مدیریت Storage
* ادغام CSI درایورهای مناسب برای استوریج‌های Block و Object (نظیر Ceph RBD و CephFS).
* پیاده‌سازی مکانیزم‌های Backup خودکار با استفاده از Velero و همگام‌سازی با S3 Bucket ها.

*(این سند در حال تکمیل و به‌روزرسانی توسط تیم معماری است)*

