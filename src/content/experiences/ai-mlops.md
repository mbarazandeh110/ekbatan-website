---
title: "زیرساخت پردازش هوش مصنوعی و MLOps در مقیاس Enterprise"
scale: "HPE ProLiant DL380a Gen11 & NVIDIA H200 NVL"
category: "AI, ML & MLOps"
description: "طراحی، استقرار و بهینه‌سازی کلاسترهای GPU برای آموزش و استنتاج مدل‌های هوش مصنوعی و LLM با استفاده از NVLink، RoCE، NVIDIA MIG و vLLM روی کوبرنتیز."
metrics:
  - label: "بهره‌وری منابع GPU"
    value: "80%+"
  - label: "تاخیر Inference (P95)"
    value: "< 50ms"
  - label: "درخواست هم‌زمان LLM"
    value: "500+ RPS"
  - label: "زمان استقرار مدل"
    value: "< 10m"
highlights:
  - "طراحی کلاسترهای GPU-Dense مبتنی بر سرورهای HPE ProLiant Gen11 و مدیریت یکپارچه منابع از طریق NVIDIA GPU Operator روی کوبرنتیز"
  - "تخصیص، اشتراک‌گذاری و ایزوله‌سازی GPUهای NVIDIA H100/H200 با ترکیب NVIDIA MIG برای ایزولیشن سخت‌افزاری بارهای Production و GPU Time-Slicing برای محیط‌های توسعه"
  - "همگام‌سازی فوق‌سریع حافظه میان کارت‌های گرافیک با پل‌های ارتباطی NVLink و شبکه‌های کم‌تاخیر RoCE"
  - "یکپارچه‌سازی پشته MLOps شامل Model Registry (MLflow)، Feature Store و سروینگ مقیاس‌پذیر مدل‌های LLM با KServe و vLLM"
techs: ["NVIDIA H200 NVL", "NVIDIA MIG", "vLLM", "KServe", "NVLink", "MLflow", "RoCE", "Kubernetes"]
---

### معماری اجرایی و متریک‌های دستاورد (Evidence & Outcomes)

در استقرار [زیرساخت MLOps و کلاسترهای هوش مصنوعی](/services/mlops-ai-clusters/) برای پلتفرم‌های پردازش زبان طبیعی، چالش اصلی سازمان بهره‌وری پایین کارت‌های گرافیکی (کمتر از ۲۵٪) و زمان طولانی انتقال مدل از مرحله پژوهش به محیط عملیاتی بود. تیم مهندسی اکباتان با پیاده‌سازی معماری زیر روی [کوبرنتیز Bare-Metal](/services/kubernetes/) نتایج ملموس زیر را در Production رقم زد:

* **بهینه‌سازی منابع گرافیکی (GPU Utilization):** افزایش نرخ بهره‌وری از متوسط ۲۵٪ به بالای **۸۰٪** با پارتیشن‌بندی سخت‌افزاری **NVIDIA MIG** برای سرویس‌های حساس به تاخیر و **GPU Time-Slicing** برای نوت‌بوک‌های دیتاساینس و محیط‌های آزمایشی.
* **کاهش Latency و افزایش Throughput در Inference:** استقرار موتور **vLLM** و **KServe** با تنظیم دقیق `max-model-len`، `gpu-memory-utilization` و **Tensor Parallelism** روی NVLink که به تاخیر کمتر از **50ms** در پردازش هم‌زمان بیش از ۵۰۰ درخواست روی مدل‌های Llama-3 منجر شد.
* **سرعت بارگذاری مدل و چابکی استقرار:** نگهداری وزن مدل‌ها روی [استوریج S3 توزیع‌شده Ceph](/services/ceph/) همراه با لایه کش محلی NVMe و پایپ‌لاین‌های خودکار [CI/CD و GitOps](/services/enterprise-devops-gitlab/) که زمان انتقال مدل از Staging به Production را از چند روز به **کمتر از ۱۰ دقیقه** کاهش داد.

برای مشاوره در زمینه سایزینگ سرورهای GPU و طراحی پلتفرم سروینگ LLM درون‌سازمانی، صفحه **[خدمات کلاسترهای GPU و MLOps](/services/mlops-ai-clusters/)** را بررسی کرده یا فرم **[درخواست ارزیابی معماری](/assessment/)** را تکمیل نمایید.
