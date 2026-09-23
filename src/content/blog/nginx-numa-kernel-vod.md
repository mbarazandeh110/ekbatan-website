---
title: "تیونینگ نودهای CDN: معماری NUMA-Aware و بهینه‌سازی Nginx"
description: "تحلیل و رفع گلوگاه‌های CPU و شبکه در نودهای CDN لبه با ترافیک بالا از طریق NUMA Locality، تنظیمات NIC و IRQ، Kernel TLS، I/O غیرمسدودکننده و معماری توزیع بار Storage."
pubDate: 2026-09-22
author: "تیم مهندسی اکباتان"
tags: ["CDN", "Nginx", "NUMA", "Performance Tuning", "kTLS", "VOD", "Networking"]
---

## صورت‌مسئله: افت پایداری نودهای CDN زیر بار سنگین VOD
در معماری زیرساخت یکی از سرویس‌های VOD پرترافیک کشور، نودهای لبه (Edge Nodes) با وجود ظرفیت اسمی شبکه‌ای معادل ۸۰ گیگابیت‌برثانیه (Gbps)، در بار ترافیکی حدود ۳۰ تا ۳۵ گیگابیت‌برثانیه با مشکلات جدی در مصرف CPU، پردازش شبکه و پاسخگویی مدیریتی مواجه بودند.

**علائم مشاهده‌شده:**
* مصرف ۱۰۰٪ پردازنده (به‌ویژه در هسته‌های درگیر با `ksoftirqd`).
* افزایش Latency در پردازش درخواست‌ها و ارسال داده.
* افزایش Packet Drop در لایه شبکه.
* کاهش پاسخگویی سرویس‌های مدیریتی، از جمله SSH.
* عدم استفاده مؤثر از ظرفیت اسمی لینک شبکه.

این علائم لزوماً یک علت واحد ندارند. در سرورهای پرترافیک، گلوگاه می‌تواند از تعامل چندین زیرسیستم شامل NIC، PCIe، CPU، NUMA، Kernel Networking، TLS، Nginx و Storage ناشی شود.

**روند عیب‌یابی (Root Cause Analysis):**

برای بررسی این وضعیت، چهار حوزه اصلی مورد توجه قرار گرفت:

1. **NUMA Locality و CPU/IRQ Affinity:** احتمال افزایش سربار دسترسی Remote Memory و پردازش نامناسب وقفه‌های شبکه.
2. **TLS و هزینه پردازش رمزنگاری:** بررسی سهم رمزنگاری، مدیریت TLS Record و انتقال داده در مصرف CPU.
3. **Kernel Networking و Nginx:** بررسی توزیع Connectionها، SoftIRQ، Socket Processing و تنظیمات Workerها.
4. **Storage و I/O:** بررسی تأخیر خواندن فایل، Page Cache، ظرفیت IOPS و نحوه توزیع داده روی دیسک‌ها.

برای عبور از سد ۳۵ گیگابیت و رسیدن به ظرفیت اسمی کارت‌های شبکه (نزدیک به ۷۵ گیگابیت)، تغییرات معماری زیر به صورت لایه‌به‌لایه پیاده‌سازی شد.

## ۱. لایه سیستم‌عامل و شبکه: اصلاح PCIe Affinity و حذف NUMA Cross-Talk

اصلی‌ترین دلیل از دست رفتن SSH و فریز شدن سیستم در ترافیک ۳۵ گیگابیت، درگیری شدید و اشباع گذرگاه UPI/QPI بین سوکت‌های پردازنده بود. در سرورهای Multi-Socket، کارت شبکه به‌صورت فیزیکی به Root Complex یک پردازنده (مثلاً Node 0) متصل است. زمان‌بندی شدنِ پردازش وقفه‌های کارت شبکه (SoftIRQ) یا Workerهای Nginx روی پردازنده سوکت دیگر (مثلاً Node 1)، باعث می‌شود تمام پکت‌های ورودی برای پردازش شدن، مجبور به عبور از گذرگاه ارتباطی بین دو CPU شوند.

در این حجم از ترافیک، این واکشی‌های مداوم از Remote Memory باعث ایجاد تاخیر شدید (Memory Stall) و اشباع باس UPI می‌شود. در نتیجه، هسته‌های CPU در سرویس `ksoftirqd` گیر کرده و سرور از پاسخگویی به ساده‌ترین درخواست‌ها (مانند اتصالات SSH) باز می‌ماند.

اسکریپت توسعه‌داده‌شده در لایه سیستم‌عامل، با خواندن توپولوژی سخت‌افزاری، ابتدا تشخیص می‌دهد که کارت‌ شبکه روی کدام NUMA Node قرار دارد. سپس با تنظیم دقیق Receive Side Scaling (RSS) از طریق `ethtool`، وقفه‌های سخت‌افزاری را به هسته‌های همان سوکت (Local Node) محدود می‌کند. با تنظیم IRQ و CPU affinity متناسب با توپولوژی NUMA، می‌توان سهم دسترسی‌های Remote Memory و سربار جابه‌جایی داده بین سوکت‌ها را به‌شدت کاهش داد.

```bash
#!/bin/bash

iface_queue_len() {
    interface_file="/proc/net/bonding/$1"
    if [ -f "$interface_file" ]; then
        bond_ifaces=$(cat $interface_file | grep "Slave Interface:" | awk '{print $3}')
        bond_ifaces=( $bond_ifaces )
        num_interfaces=${#bond_ifaces[@]}

        ifaces_numa_nodes=()
        for item in ${bond_ifaces[@]};do
            tmp=$(cat /sys/class/net/$item/device/numa_node)
            ifaces_numa_nodes+=("$tmp")
        done
        ifaces_numa_nodes=($(echo "${ifaces_numa_nodes[@]}" | tr ' ' '\n' | sort -u | tr '\n' ' '))
        num_ifaces_numa_nodes=${#ifaces_numa_nodes[@]}
    else
        bond_ifaces=( $1 )
        num_interfaces=1
        num_ifaces_numa_nodes=1
    fi

    num_numa_nodes=$(ls -d /sys/devices/system/node/node* | awk '{print $1}' | wc -l)

    if (( num_numa_nodes > 2 )); then
            echo "There are more than 2 numa nodes!"
    fi

    if (( num_ifaces_numa_nodes != num_numa_nodes )); then
        echo "The interfaces are in the same numa node!"
    fi

    num_inface_queue=$(ethtool -x ${bond_ifaces[0]} | wc -l)
    num_inface_queue=$(( num_inface_queue - 7))

    num_cores=$(nproc)
    num_cores=$(( num_cores / num_numa_nodes ))

    num_interface_per_numa=$(( $num_interfaces / num_numa_nodes ))

    for ((chrono=$num_inface_queue; chrono > 0; chrono--)); do
            tmp=$(( $chrono * num_interface_per_numa ))
            tmp=$(( tmp % num_cores))
            if (( tmp == 0 )); then
                    iface_queue=$chrono
                    break
            fi
    done
    if (( chrono == 0 )); then
            iface_queue=$num_inface_queue
    fi

    iface_queue_result=$iface_queue
}

BOND_IFACES=$(cat /proc/net/bonding/bond0 | grep "Slave Interface:" | awk '{print $3}')

iface_queue_len "bond0"

for INTERFACE in $BOND_IFACES
do
    ethtool -G $INTERFACE rx 4096 tx 4096
    ethtool -C $INTERFACE rx-usecs 75
    sudo ethtool -X $INTERFACE equal $iface_queue_result
    sudo ethtool -L $INTERFACE combined $iface_queue_result
done

# نکته معماری: سرویس irqbalance باید حتما غیرفعال شود تا با تنظیمات دستی تداخل پیدا نکند.
# systemctl disable --now irqbalance

exit 0
```

*Best Practice عملیاتی:* برای تایید صحت عملکرد این معماری، از ابزار `numastat` استفاده کنید. در ترافیک‌های بالا، شاخص‌های `numa_miss` و `numa_foreign` باید به صفر نزدیک شوند و ترافیک روی `numa_hit` متمرکز باشد.

## ۲. لایه رمزنگاری: سخت‌افزاری‌سازی TLS با kTLS (Kernel TLS)

پردازش ترافیک HTTPS با الگوریتم‌های استاندارد در فضای کاربری (OpenSSL) دومین دلیل چسبیدن CPU به سقف بود. با فعال‌سازی **kTLS**، پردازش TLS Record به لایه سوکت کرنل منتقل می‌شود. این امر سربار کپی‌شدن داده‌ها بین User-Space و Kernel-Space را کاهش می‌دهد و در صورت فراهم بودن پیش‌نیازهای سخت‌افزاری و درایور، می‌تواند مسیر Zero-Copy را تسهیل کند.

**تنظیمات Nginx برای kTLS:**

```nginx
# فعال‌سازی kTLS برای انتقال رمزنگاری به کرنل
ssl_conf_command Options KTLS;

# پیکربندی Cipherهای مدرن و ترجیح ECDSA به دلیل سرعت پردازش بالاتر نسبت به RSA
ssl_prefer_server_ciphers on;
ssl_ciphers "ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-CHACHA20-POLY1305:EECDH+ECDSA+AESGCM:EECDH+aRSA+AESGCM:EECDH+ECDSA+SHA256:EECDH+aRSA+SHA256:EECDH:DHE+AESGCM:DHE:!RSA!aNULL:!eNULL:!LOW:!RC4:!3DES:!MD5:!EXP:!PSK:!SRP:!DSS:!CAMELLIA:!SEED";

# بهینه‌سازی Handshake
ssl_session_timeout 24h;
ssl_session_tickets off;
ssl_protocols TLSv1.2 TLSv1.3;
```

*نتیجه:* کاهش چشمگیر Overhead جابجایی داده‌ها بین User-Space و Kernel-Space و تسهیل مسیر Zero-Copy (مشروط به پشتیبانی کامل سخت‌افزار NIC و درایور).


## ۳. لایه Application: معماری Non-Blocking و سوکت‌های شارد شده

برای بهره‌برداری کامل از سخت‌افزار، معماری Workerهای Nginx باید کاملاً Asynchronous شود.

### ۳.۱. استفاده از `reuseport` در Listen Directive

```nginx
listen 443 ssl http2 reuseport backlog=65536;
```

آرگومان `reuseport` به کرنل اجازه می‌دهد یک صف مجزا برای هر Worker Process ایجاد کند. این امر پدیده مخرب Thundering Herd را از بین برده و توزیع بار اتصالات جدید را در سطح کرنل کاملاً متوازن می‌کند. (نیازمند تنظیم `net.core.somaxconn = 65536`).

### ۳.۲. بهینه‌سازی رویدادها و هم‌گام‌سازی با NUMA

جهت تکمیل بهینه‌سازی NUMA، بهتر است از `worker_cpu_affinity` به جای حالت `auto` با Bitmaskهای اختصاصی استفاده شود تا Workerها به هسته‌های Local کارت شبکه Bind شوند.

```nginx
user www-data;
worker_processes auto;
worker_cpu_affinity auto;       # در محیط‌های ایزوله، از Bitmask مربوط به NUMA Node محلی استفاده شود
worker_rlimit_nofile 1000000;

events {
    multi_accept off;
    worker_connections 65536;
    use epoll;
}
```

## ۴. لایه Storage و I/O: معماری JBOD و Thread Pools

در ترافیک لبه VOD، خواندن دیتای حجیم از دیسک (Page Cache Thrashing) قاتل پرفورمنس است.

### ۴.۱. ترکیب Direct I/O و Sendfile

```nginx
sendfile on;
sendfile_max_chunk 512k;
directio 8m;
directio_alignment 4K;
```

فایل‌های زیر ۸ مگابایت (نظیر مانیفست‌های HLS/DASH) از طریق `sendfile` و از روی RAM با بالاترین سرعت سرو می‌شوند. مکانیزم `directio` با استفاده از مسیر `O_DIRECT` می‌تواند از ورود بخش‌هایی از داده‌های حجیم به Page Cache جلوگیری کند، هرچند عملکرد نهایی آن به Alignment سیستم‌فایل (مثلاً 4K در XFS) و الگوی دسترسی وابسته است.

### ۴.۲. استفاده از Thread Pools

```nginx
# در بلاک اصلی (Main)
thread_pool pool_$disk threads=32 max_queue=7000;

# در بلاک http یا server:
aio threads=pool_$disk; 
```

توزیع تسک‌های I/O به استخر تردها باعث می‌شود اگر یک دیسک دچار Latency شود، Worker مربوطه مسدود نشده و به پردازش کلاینت‌های دیگر ادامه دهد.

### ۴.۳. توزیع بار (JBOD)

استفاده از مکانیزم توزیع احتمالاتی (Probabilistic Distribution) روی آدرس محتوا جهت پخش کردن بار روی دیسک‌های مستقل (JBOD)، می‌تواند توان عملیاتی مجموع دیسک‌ها را بهینه‌تر درگیر کرده و سربار RAID Controller را حذف کند.

```nginx
split_clients $uri $disk {
    25.0% "/disk1";
    25.0% "/disk2";
    25.0% "/disk3";
    *     "/disk4";
}
```

## جمع‌بندی عملیاتی

با اجرای همزمان این ۴ لایه بهینه‌سازی، سرورهایی که در ترافیک ۳۵ گیگابیت به‌طور کامل از کار می‌افتادند، توانستیم ترافیک **۷۰ الی ۷۵ گیگابیت‌بر‌ثانیه** را به صورت پایدار سرویس دهیم. پردازنده در ترافیک ماکزیمم (Peak) رفتار کاملاً کنترل‌شده‌ای در محدوده ۹۶ الی ۹۸ درصد کاهش ترافیک مخرب Cross-Node در سطح QPI باعث شد تا منابع CPU آزاد شده و سیستم برای تسک‌های زیرساختی و تعاملات شبکه‌ای (نظیر SSH و مانیتورینگ) در پیک ترافیک کاملاً پاسخگو باقی بماند.