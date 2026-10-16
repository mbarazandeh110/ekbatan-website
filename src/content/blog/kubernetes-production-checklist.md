---
title: "چک‌لیست استقرار Kubernetes قبل از Go-Live در Production"
description: "چک‌لیست جامع و عملیاتی ارزیابی آمادگی کلاستر کوبرنتیز برای محیط Production؛ شامل معماری HA کنترل‌پلین، شبکه Cilium eBPF، استوریج Ceph، امنیت RBAC و مانیتورینگ SRE."
pubDate: 2026-10-04
author: "تیم مهندسی اکباتان"
tags: ["Kubernetes", "SRE", "Cloud Native", "Production"]
---

## چرا آمادگی Production در کوبرنتیز نیازمند چک‌لیست مهندسی است؟

راه‌اندازی اولیه یک کلاستر کوبرنتیز با ابزارهایی نظیر Kubespray یا kubeadm تنها بخش کوچکی از مسیر است. در تجربیات تیم ما در [استقرار کوبرنتیز سازمانی](/services/kubernetes/) و مدیریت [کلاسترهای بالای ۸۰ نود](/experience/kubernetes-clusters/)، بیش از ۸۰٪ رخدادهای بحرانی (Outages) ناشی از تنظیمات پیش‌فرضی هستند که برای بارهای کاری Production بهینه‌سازی نشده‌اند. این چک‌لیست تضمین می‌کند که کلاستر شما فاقد Single Point of Failure (SPOF) بوده و برای ترافیک واقعی آماده است.

### ۱. معماری High Availability (HA) و Control Plane
* **توزیع نودهای Control Plane:** استقرار حداقل ۳ یا ۵ نود Control Plane (تعداد فرد برای حفظ Quorum) در Rackها یا Availability Zoneهای مستقل.
* **ایزولاسیون دیسک `etcd`:** اختصاص دیسک‌های Local NVMe مستقل به مسیر `/var/lib/etcd` جهت تضمین زمان `wal_fsync_duration_seconds` کمتر از ۱۰ میلی‌ثانیه در صدک ۹۹ (P99).
* **لودبالانسینگ API Server:** پیاده‌سازی لودبالانسر خارجی بدون نقطه تک‌خرابی با استفاده از Keepalived + HAProxy/Envoy و پایش سلامت پورت `6443`.
* **تنظیمات منابع نودهای کاری:** رزرو منابع سیستم‌عامل و Kubelet (`system-reserved` و `kube-reserved`) جهت جلوگیری از Starvation سرویس‌های حیاتی نود در زمان پر شدن حافظه.

### ۲. شبکه، CNI (Cilium) و هدایت ترافیک
* **فعال‌سازی eBPF و حذف `kube-proxy`:** استقرار Cilium در حالت `kubeProxyReplacement=true` جهت حذف جداول سنگین `iptables` و کاهش Latency مسیریابی سرویس‌ها.
* **سیاست‌های شبکه (NetworkPolicies):** پیاده‌سازی استراتژی Zero-Trust با اعمال سیاست `Default Deny` در هر Namespace و باز کردن ترافیک صرفاً بین سرویس‌های مجاز.
* **مسیریابی آگاه از توپولوژی:** فعال‌سازی [Topology Aware Routing در کوبرنتیز](/blog/topology-aware-routing/) به همراه `topologySpreadConstraints` برای جلوگیری از ترافیک اضافه بین رک‌ها و زون‌ها.
* **معماری Ingress و لبه شبکه:** جداسازی نودهای Ingress/Edge و استفاده از کنترلرهای بهینه‌سازی‌شده در لایه [شبکه و Load Balancing](/services/edge-cdn-networking/).

### ۳. مدیریت Storage و پایداری داده‌ها (Stateful Workloads)
* **تفکیک کلاس‌های ذخیره‌سازی (StorageClasses):** اتصال کلاستر به [زیرساخت ذخیره‌سازی توزیع‌شده Ceph](/services/ceph/) از طریق درایورهای CSI (شامل `rbd` برای دیسک‌های Block پرسرعت و `cephfs` برای دسترسی اشتراکی `ReadWriteMany`).
* **استراتژی Backup و Disaster Recovery:** استقرار Velero برای پشتیبان‌گیری زمان‌بندی‌شده از مانیفست‌های کلاستر و Volume Snapshotها روی Object Storage سازگار با S3 خارج از کلاستر و تست دوره‌ای فرآیند Restore.

### ۴. امنیت، مدیریت دسترسی (RBAC) و Secrets
* **حذف Hardcoded Secrets:** یکپارچه‌سازی کلاستر با **HashiCorp Vault** و `ExternalSecretsOperator` جهت تزریق امن و چرخش خودکار رمزها.
* **ممیزی CIS Benchmark:** اجرای ابزار `kube-bench` و محدودسازی دسترسی‌ها بر اساس اصل کمترین سطح دسترسی (Least Privilege RBAC) و اتصال احراز هویت به OIDC سازمانی.
* **ایمن‌سازی Podها:** اعمال استانداردهای `PodSecurityStandards` (سطح Restricted/Baseline)، اجرای کانتینرها به صورت Non-Root و تنظیم `readOnlyRootFilesystem: true`.

### ۵. مدیریت منابع، مقیاس‌پذیری و پایداری بار کاری
* **تعریف Requests و Limits:** الزام به تعیین دقیق `resources.requests` و `resources.limits` برای تمامی کانتینرها از طریق `LimitRange` و `ResourceQuota` در سطح هر Namespace.
* **پروب‌های سلامت (Probes):** پیکربندی دقیق `startupProbe`، `readinessProbe` و `livenessProbe` متناسب با زمان واقعی بالا آمدن اپلیکیشن جهت جلوگیری از Restart Loopهای کاذب.
* **تضمین بودجه اختلال (PDB):** تعریف `PodDisruptionBudget` برای تمامی سرویس‌های حیاتی تا در زمان Drain کردن نودها یا ارتقای کلاستر، حداقل تعداد Replicaهای فعال حفظ شود.

### ۶. مشاهده‌پذیری (Observability) و آمادگی SRE
* **مانیتورینگ و متریک‌ها:** جمع‌آوری متریک‌های کلاستر، نودها و CNI با **VictoriaMetrics** و تعریف Alertهای هدفمند بر اساس SLO و مصرف Error Budget.
* **مدیریت متمرکز لاگ و تریس:** ارسال لاگ‌ها با Vector به [کلاسترهای Elasticsearch (ECK)](/services/elasticsearch-enterprise/) و پیاده‌سازی Distributed Tracing با **OpenTelemetry** برای ریشه‌یابی سریع خطاها (RCA).

---

### نیاز به ممیزی کلاستر کوبرنتیز خود دارید؟
تیم SRE شرکت اکباتان کلاسترهای شما را بر اساس بیش از ۱۰۰ شاخص امنیتی، پایداری و پرفورمنس ممیزی می‌کند. برای دریافت گزارش تخصصی کلاستر خود، از طریق صفحه **[درخواست ارزیابی آمادگی زیرساخت برای Production](/assessment/)** اقدام نمایید.
