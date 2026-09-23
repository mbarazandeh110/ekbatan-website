---
title: "بهینه‌سازی هزینه‌های شبکه در Kubernetes با Topology Aware Routing"
description: "بررسی معماری Topology Aware Routing در کوبرنتیز برای کاهش Latency و هزینه‌های ترافیک بین زون‌ها در محیط‌های ابری."
pubDate: 2026-09-22
author: "تیم مهندسی اکباتان"
tags: ["kubernetes", "networking", "cloud-cost", "sre", "devops"]
---
## **مقدمه**

در کلاسترهای ابری Multi-Zone کوبرنتیز، یکی از هزینه‌های پنهان و مداوم، ترافیک عبوری میان Availability Zoneها (Cross-Zone Data Transfer) است. به‌صورت پیش‌فرض، سرویس‌های Kubernetes ترافیک ورودی را به‌صورت تصادفی و Round-Robin میان تمامی Podهای پشتیبان توزیع می‌کنند؛ فارغ از اینکه درخواست از همان زون مبدا صادر شده یا نیازمند عبور از مرز زون‌هاست. قابلیت **Topology Aware Routing** پاسخی مهندسی برای کاهش تاخیر شبکه (Latency) و کنترل مستقیم این هزینه‌ها در کلاسترهای پرترافیک است.

## **مکانیزم عملکرد Topology Aware Routing**

قابلیت Topology Aware Routing (که جایگزین نسخه قدیمی TopologyKeys شده است) رفتار `kube-proxy` یا CNIهای سازگار را تغییر می‌دهد تا بسته‌های شبکه تا جای ممکن در همان ناحیه جغرافیایی یا زونی که Pod کلاینت در آن مستقر است، نگهداری شوند.

این مکانیزم توسط EndpointSlice Controller پیاده‌سازی می‌شود. کنترلر با ارزیابی متوازن بودن توزیع پادها و ظرفیت هر زون، تخصیص ترافیک را مدیریت می‌کند:

* **ارزیابی ظرفیت:** کنترلر نسبت تعداد Podها به وزن تخصیص‌یافته در هر زون را بررسی می‌کند.
* **انتساب Endpointها:** اگر نسبت پادها به ازای زون‌ها متقارن و متوازن باشد، Endpointها نشانه‌گذاری شده و پروکسی محلی هدایت ترافیک را صرفاً به Podهای همان زون محدود می‌کند.
* **Fall-back خودکار:** در صورتی که عدم توازن رخ دهد یا پادهای یک زون دچار خرابی شوند، الگوریتم به حالت عمومی بازمی‌گردد تا دسترسی‌پذیری فدای زون محلی نشود.

برای فعال‌سازی این قابلیت روی یک Service، کافی است حاشیه‌نویسی (Annotation) زیر به تعاریف اضافه شود:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: payment-api
  annotations:
    service.kubernetes.io/topology-mode: Auto
spec:
  selector:
    app: payment-api
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8080
```

## **مقایسه اثر معماری بر عملکرد و هزینه**

در زیرساخت‌های Cloud-Native سازمانی، فعال‌سازی کنترل‌شده این سازوکار تفاوت‌های ملموسی در معیارهای کلیدی ایجاد می‌کند:

| شاخص                        | پیش‌فرض (بدون Topology Routing)                                 | با Topology Aware Routing                                                      |
| ------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| ترافیک Cross-Zone         | تصادفی (~۶۰٪ ترافیک بین‌زونی در ۳ زون)        | به حداقل رسیده (نزدیک به صفر در شرایط پایدار) |
| هزینه Egress شبکه      | بالا بر اساس حجم دیتای تبادلی بین زون‌ها  | کاهش چشمگیر هزینه‌های مرتبط با Cross-AZ                |
| P99 Latency                     | ناپایدار به‌دلیل RTT متغیر بین دیتاسنترها | تثبیت‌شده در محدوده کمترین تاخیر درون‌زونی  |
| رفتار در قطعی زون | ارسال مستقیم به زون‌های فعال باقی‌مانده  | سوئیچ خودکار سهمیه‌بندی بدون قطعی سرویس۱      |

## **نکته مهندسی**

هشدار Production: پیش‌نیاز حیاتی Topology Aware Routing، توزیع کاملاً متوازن Replicaها در تمامی زون‌هاست. همواره در Deploymentها از topologySpreadConstraints استفاده کنید تا مطمئن شوید پادها به‌صورت یکنواخت در سطح زون‌ها پخش شده‌اند. در صورت وجود عدم تعادل شدید در تعداد پادها میان زون‌ها، کنترلر EndpointSlice برای جلوگیری از Overload شدن یک زون خاص، قابلیت را نادیده گرفته و به توزیع سراسری بازمی‌گردد.

```yaml
spec:
  topologySpreadConstraints:
    - maxSkew: 1
      topologyKey: topology.kubernetes.io/zone
      whenUnsatisfiable: DoNotSchedule
      labelSelector:
        matchLabels:
          app: payment-api
```

## **جمع‌بندی**

استفاده از service.kubernetes.io/topology-mode: Auto راهکاری استاندارد، بدون وابستگی به Service Mesh سنگین و مستقیم در هسته کوبرنتیز است که نه‌تنها Latency پاسخ‌دهی سرویس‌های داخلی را تثبیت می‌کند، بلکه مانع از اتلاف بودجه ابری ناشی از ترافیک عبوری بین زون‌ها در مقیاس‌های بزرگ می‌شود.

## **منابع**

* [مستندات رسمی کوبرنتیز: Topology Aware Routing](https://kubernetes.io/docs/concepts/services-networking/topology-aware-routing/?utm_source=gemini)
* [راهنمای وبلاگ رسمی کوبرنتیز درباره EndpointSlice و هدایت بهینه ترافیک](https://www.google.com/search?q=https://kubernetes.io/blog/2021/10/18/topology-aware-hints/&utm_source=gemini)
