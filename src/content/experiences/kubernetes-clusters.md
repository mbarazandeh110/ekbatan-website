---
title: "پلتفرم مهندسی کوبرنتیز و Cloud-Native HA"
scale: "80+ Worker Nodes / Multi-Region HA"
category: "Kubernetes & DevOps"
description: "طراحی، امن‌سازی و مدیریت چرخه حیات کلاسترهای کوبرنتیز در محیط‌های Bare-metal با تمرکز بر پایداری (SLA 99.96%)، مانیتورینگ متمرکز و Disaster Recovery."
metrics:
  - label: "Worker Nodes در پروداکشن"
    value: "80+ Nodes"
  - label: "پایداری سالیانه (SLA)"
    value: "99.96%"
  - label: "کاهش Latency شبکه با eBPF"
    value: "40%"
  - label: "RPO بازیابی از بحران"
    value: "< 15m"
highlights:
  - "پیاده‌سازی معماری Multi-Region (Active-Active) و تفکیک دقیق Failure Domains در سطح Rack و دیتاسنتر برای تضمین دسترس‌پذیری سرویس‌ها"
  - "مدیریت متمرکز اسرار (Secrets Management) با استقرار HashiCorp Vault و External Secrets Operator جهت حذف Hardcoded Secrets"
  - "استقرار CNI پیشرفته Cilium مبتنی بر eBPF برای امنیت شبکه، مقیاس‌پذیری بالا و جایگزینی کامل kube-proxy"
  - "پیاده‌سازی پشته جامع Observability شامل OpenTelemetry، Elastic APM، VictoriaMetrics و Elasticsearch برای پایش Metrics، تحلیل Logs و Distributed Tracing با هدف Troubleshooting و Root Cause Analysis."
techs: ["Kubernetes", "Cilium eBPF", "HashiCorp Vault", "OpenTelemetry", "ArgoCD", "GitOps", "VictoriaMetrics", "Bare-Metal"]
---

### معماری اجرایی کلاسترهای کوبرنتیز در مقیاس بیش از ۸۰ نود

در پیاده‌سازی زیرساخت‌های کانتینری برای بارهای کاری پرترافیک سازمانی، اجرای [کوبرنتیز روی سرورهای Bare-Metal](/services/kubernetes/) نیازمند مهندسی دقیق در لایه‌های شبکه، ذخیره‌سازی و امنیت کرنل است. تیم مهندسی اکباتان در این پروژه، کلاسترهای پراکنده و آسیب‌پذیر را به یک پلتفرم یکپارچه، خودترمیم‌گر (Self-Healing) و منطبق بر اصول GitOps تبدیل کرد.

* **شبکه مبتنی بر eBPF و حذف `iptables`:** با جایگزینی کامل `kube-proxy` توسط **Cilium eBPF** و فعال‌سازی DSR (Direct Server Return) به همراه BGP Peering مستقیم با سوئیچ‌های Top-of-Rack، سربار مسیریابی پکت‌ها در مقیاس هزاران Service و Pod به حداقل رسید و توان عملیاتی ترافیک ورودی ([Edge & Load Balancing](/services/edge-cdn-networking/)) به شکل محسوسی ارتقا یافت.
* **پایداری Control Plane و `etcd`:** جداسازی دیسک‌های NVMe اختصاصی برای `etcd` جهت تضمین Latency نوشتن (fsync) زیر ۲ میلی‌ثانیه و توزیع نودهای Control Plane در ۳ ناحیه خطای مستقل (Failure Domains).
* **ذخیره‌سازی پایدار (Stateful Workloads):** اتصال کلاسترها به [استوریج توزیع‌شده Ceph](/services/ceph/) از طریق درایورهای CSI برای تامین دیسک‌های RBD و CephFS همراه با Snapshot و Backup خودکار توسط Velero روی Object Storage.
* **چرخه استقرار Declarative با GitOps:** مدیریت صددرصدی وضعیت کلاسترها، پالیسی‌های امنیتی Kyverno/OPA و استقرار سرویس‌ها از طریق [پایپ‌لاین‌های GitLab و Argo CD](/services/enterprise-devops-gitlab/) بدون دخالت دستی در محیط Production.

برای بررسی جزئیات خدمات مشاوره و پیاده‌سازی این معماری در سازمان خود، صفحه **[مشاوره و استقرار کوبرنتیز سازمانی](/services/kubernetes/)** را مشاهده کنید.