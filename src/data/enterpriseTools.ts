export interface ToolData {
  slug: string;
  name: string;
  category: string;
  badge: string;
  description: string;
  architectureDetails: string[];
  features: string[];
  yamlCode: string;
}

export const enterpriseTools: ToolData[] = [
  {
    slug: 'elasticsearch-eck',
    name: 'Elasticsearch & ECK Operator',
    category: 'Observability & Search',
    badge: 'K8s Operator & Bare-Metal',
    description: 'استقرار و مدیریت کلاسترهای مقیاس‌پذیر الاستیک سرچ با استفاده از ECK (Elastic Cloud on Kubernetes) برای لاگینینگ، مانیتورینگ و موتورهای جستجوی سازمانی.',
    architectureDetails: [
      'راه‌اندازی معماری Multi-Node High Availability',
      'مدیریت خودکار کراش‌ها و رولینگ آپدیت‌ها توسط ECK Operator',
      'اتصال استوریج‌های پرسرعت NVMe از طریق Local Storage / TopoLVM',
      'تنظیمات بهینه‌سازی شده JVM Heap و هسته‌های پردازشی'
    ],
    features: ['پشتیبان‌گیری خودکار به S3 (Ceph)', 'امنیت و رمزنگاری پیش‌فرض TLS', 'پایش لحظه‌ای با Kibana Enterprise', 'مقیاس‌پذیری پویا بر اساس بار مصرفی'],
    yamlCode: `apiVersion: elasticsearch.k8s.elastic.co/v1
kind: Elasticsearch
metadata:
  name: hegmataneh-es-cluster
  namespace: observability
spec:
  version: 8.12.0
  nodeSets:
  - name: default
    count: 3
    config:
      node.store.allow_mmap: true
    volumeClaimTemplates:
    - metadata:
        name: elasticsearch-data
      spec:
        accessModes: [ "ReadWriteOnce" ]
        resources:
          requests:
            storage: 500Gi`
  },
  {
    slug: 'gitlab-enterprise',
    name: 'GitLab Enterprise',
    category: 'DevSecOps & SCM',
    badge: 'HA Architecture on K8s',
    description: 'پیاده‌سازی پلتفرم جامع چرخه حیات نرم‌افزار (DevSecOps) با قابلیت مدیریت مخازن، پایپ‌لاین‌های CI/CD مقیاس‌پذیر و اسکن امنیتی کدها.',
    architectureDetails: [
      'معماری کاملاً توزیع‌شده (Stateless Rails pods)',
      'استفاده از PostgreSQL (Patroni) برای دیتابیس توزیع‌شده',
      'ذخیره‌سازی حجیم کامپوننت‌ها و پکیج‌ها روی Ceph Object Storage',
      'مدیریت رانرهای ابری ایزوله روی نودهای اختصاصی کوبرنتیز'
    ],
    features: ['محیط کاملاً ایزوله درون‌سازمانی (On-Premise)', 'یکپارچگی با ابزارهای امنیتی SAST و DAST', 'پشتیبانی از هزاران Developer به صورت همزمان', 'دسترسی امن از طریق SSO سازمانی'],
    yamlCode: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: gitlab-webservice
  namespace: devsecops
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: webservice
        image: gitlab/gitlab-ee:latest`
  },
  {
    slug: 'mattermost-enterprise',
    name: 'Mattermost Enterprise',
    category: 'Secure Real-Time Messaging',
    badge: 'High-Throughput Chat',
    description: 'راه‌اندازی پیام‌رسان سازمانی امن با قابلیت مقیاس‌پذیری بالا، ایمن‌سازی ارتباطات تیمی و انطباق کامل با استانداردهای حریم خصوصی درون‌شبکه.',
    architectureDetails: [
      'کلاسترینگ وب‌سرویس‌ها پشت لودبالانسر با استقرار Stateless',
      'استفاده از دیتابیس PostgreSQL مجهز به Patroni برای پایداری ۱۰۰٪',
      'مدیریت فایل‌ها و پیوست‌ها در بستر Ceph S3 Storage',
      'اتصال به دایرکتوری‌های سازمانی (LDAP / Active Directory / SAML SSO)'
    ],
    features: ['امنیت کامل داده‌ها در شبکه داخلی (Air-Gapped)', 'پشتیبانی از پلتفرم‌های مختلف و ربات‌های اتوماسیون', 'مدیریت دسترسی‌های پیشرفته سازمانی', 'عملکرد بی‌نقص در ترافیک‌های سنگین تیمی'],
    yamlCode: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: mattermost-enterprise
  namespace: collaboration
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: mattermost
        image: mattermost/mattermost-enterprise-edition:latest`
  },
  {
    slug: 'nexus-repository',
    name: 'Nexus Repository',
    category: 'Artifact Management',
    badge: 'Proxy & Host Registry',
    description: 'مدیریت و میزبانی متمرکز پکیج‌های نرم‌افزاری، کانتینرها و کتابخانه‌ها به صورت کش‌شده و امن برای تسریع فرآیندهای بیلد و توسعه.',
    architectureDetails: [
      'پشتیبانی از انواع فرمت‌ها (Docker, Maven, npm, PyPI, Helm)',
      'ذخیره‌سازی پایدار و حجیم روی حجم‌های توزیع‌شده Ceph',
      'مکانیزم‌های پاکسازی هوشمند و سیاست‌های نگهداری (Cleanup Policies)',
      'ایزوله‌سازی دسترسی تیم‌های مختلف به مخازن'
    ],
    features: ['کاهش چشمگیر زمان دانلود وابستگی‌ها در CI/CD', 'امنیت بالا و اسکن آسیب‌پذیری پکیج‌ها', 'پشتیبانی از مخازن پروکسی و میزبان (Hosted)', 'هماهنگی کامل با رانرهای گیت‌لَب'],
    yamlCode: `apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: sonatype-nexus
  namespace: devops
spec:
  replicas: 1
  template:
    spec:
      containers:
      - name: nexus
        image: sonatype/nexus3:latest`
  },
  {
    slug: 'jfrog-artifactory',
    name: 'JFrog Artifactory',
    category: 'Universal Artifacts',
    badge: 'Enterprise Binary Repository',
    description: 'پلتفرم جامع مدیریت باینری‌ها و انتشار نرم‌افزار با قابلیت پشتیبانی از تمامی فرمت‌های استاندارد صنعتی در مقیاس سازمانی.',
    architectureDetails: [
      'معماری کلاسترینگ High Availability برای پوشش درخواست‌های حجیم بیلد',
      'اتصال مستقیم به دیتابیس خارجی و استوریج ابری S3',
      'مدیریت متمرکز مجوزها و کنترل دسترسی دقیق (RBAC)',
      'یکپارچگی عمیق با ابزارهای امنیتی Xray'
    ],
    features: ['مدیریت چرخه حیات باینری‌ها (BLM)', 'سرعت بسیار بالا در جستجو و تحویل پکیج‌ها', 'گزارش‌گیری پیشرفته از مصرف پکیج‌ها', 'سازگاری کامل با زیرساخت کوبرنتیز'],
    yamlCode: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: jfrog-artifactory
  namespace: devops
spec:
  replicas: 2
  template:
    spec:
      containers:
      - name: artifactory
        image: releases-docker.jfrog.io/jfrog/artifactory-pro:latest`
  },
  {
    slug: 'n8n-enterprise',
    name: 'n8n Enterprise',
    category: 'Workflow & AI Automation',
    badge: 'Queue Mode & AI Agents',
    description: 'راه‌اندازی پلتفرم اتوماسیون جریان کار و ایجنت‌های هوش مصنوعی در حالت صف (Queue Mode) برای پردازش تعداد درخواست‌های بالا بدون اتلاف منابع.',
    architectureDetails: [
      'اجرا در حالت Queue Mode با استفاده از Redis به عنوان بروکر',
      'مقیاس‌پذیری افقی Workerها بر اساس حجم تسک‌های ورودی',
      'اتصال امن به مدل‌های هوش مصنوعی محلی یا ابری',
      'پایداری بالا و عدم از دست رفتن تسک‌ها در صورت بروز اختلال'
    ],
    features: ['مدیریت تسک‌های همزمان سنگین', 'امنیت داده‌های سازمانی در گردش کار', 'اتصال به صدها سرویس و دیتابیس مختلف', 'امکان توسعه نودهای سفارشی'],
    yamlCode: `version: '3.8'
services:
  n8n-worker:
    image: n8nio/n8n:latest
    command: worker
    deploy:
      replicas: 5`
  },
  {
    slug: 'jira-datacenter',
    name: 'Jira Data Center',
    category: 'Project & Issue Tracking',
    badge: 'Active-Active HA Clustering',
    description: 'استقرار نسخه دیتاسنتر جیرا با معماری Active-Active روی کوبرنتیز برای مدیریت پروژه‌های سازمانی بدون هیچ‌گونه قطعی.',
    architectureDetails: [
      'اجرای همزمان چندین نود فعال (Active-Active Nodes)',
      'مدیریت نشست‌ها و کش‌ها با استفاده از Hazelcast Cluster',
      'استفاده از دیتابیس PostgreSQL پرقدرت و متمرکز',
      'ذخیره‌سازی پیوست‌ها روی Ceph Shared FileSystem (RWX)'
    ],
    features: ['تضمین پایداری و مقیاس‌پذیری برای هزاران کاربر', 'کارایی بالا در پردازش بوردها و جستجوهای پیچیده', 'اتصال امن به سامانه هویت‌سنجی سازمان', 'پشتیبان‌گیری خودکار بدون قطعی سرویس'],
    yamlCode: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: jira-datacenter
  namespace: management
spec:
  replicas: 2
  template:
    spec:
      containers:
      - name: jira
        image: atlassian/jira-software:latest`
  },
  {
    slug: 'confluence-datacenter',
    name: 'Confluence Data Center',
    category: 'Enterprise Knowledge Base',
    badge: 'Collaborative Documentation',
    description: 'میزبانی از پایگاه دانش و مستندات سازمانی با قابلیت کلاسترینگ پیشرفته، جستجوی پرسرعت و دسترسی امن همزمان.',
    architectureDetails: [
      'معماری کلاستر هماهنگ با Hazelcast جهت تبادل پیام بین نودها',
      'استفاده از سیستم فایل مشترک (Shared Home) روی بستر Ceph',
      'پایش سلامت مداوم نودها با Liveness و Readiness Probes',
      'بهینه‌سازی حافظه برای پاسخ‌دهی آنی به درخواست‌های مستندسازی'
    ],
    features: ['مستندسازی امن و متمرکز برای تیم‌های فنی و اجرایی', 'کنترل دسترسی دقیق و لایه‌ای به فضای کاری', 'جستجوی قدرتمند میان هزاران صفحه مستند', 'هماهنگی کامل با جیرا'],
    yamlCode: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: confluence-datacenter
  namespace: management
spec:
  replicas: 2
  template:
    spec:
      containers:
      - name: confluence
        image: atlassian/confluence:latest`
  },
  {
    slug: 'nextcloud-enterprise',
    name: 'Nextcloud Enterprise',
    category: 'Private Cloud & Storage',
    badge: 'Secure File Sync & Share',
    description: 'راه‌اندازی کلود خصوصی سازمان برای اشتراک‌گذاری امن فایل‌ها، تقویم‌ها و ابزارهای همکاری تیمی تحت کنترل کامل زیرساخت داخلی.',
    architectureDetails: [
      'استقرار به صورت Stateless پشت لودبالانسر با صف پردازش پس‌زمینه (Cron)',
      'اتصال مستقیم حجم‌های ذخیره‌سازی به عنوان Object Storage (Ceph S3)',
      'تنظیمات سخت‌گیرانه امنیتی و رمزنگاری سمت سرور',
      'یکپارچگی با سرویس‌های احراز هویت سازمانی'
    ],
    features: ['کنترل کامل بر روی داده‌ها بدون خروج از سازمان', 'امکانات ویرایش همزمان اسناد و ویدیوکال داخلی', 'اپلیکیشن‌های موبایل و دسکتاپ اختصاصی', 'مدیریت دسترسی و اشتراک‌گذاری امن'],
    yamlCode: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: nextcloud-app
  namespace: collaboration
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: nextcloud
        image: nextcloud:latest`
  }
];
