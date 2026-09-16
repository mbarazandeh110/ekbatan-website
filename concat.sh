#!/bin/bash

OUTPUT_FILE="seo_source_code.txt"

# پاک کردن فایل خروجی در صورت وجود از قبل
> "$OUTPUT_FILE"

echo "Collecting files for SEO review..."

# جستجو و ادغام فایل‌های .astro، .ts، .mjs و .json
find src astro.config.mjs package.json \
    -type f \( -name "*.astro" -o -name "*.ts" -o -name "*.mjs" -o -name "*.json"  -o -name "*.txt" \) | \
while read -r file; do
    echo "Adding: $file"
    echo "// ==========================================================" >> "$OUTPUT_FILE"
    echo "// FilePath: $file" >> "$OUTPUT_FILE"
    echo "// ==========================================================" >> "$OUTPUT_FILE"
    cat "$file" >> "$OUTPUT_FILE"
    echo -e "\n\n" >> "$OUTPUT_FILE"
done

echo "Adding: robots.txt"
echo "// ==========================================================" >> "$OUTPUT_FILE"
echo "// FilePath: public/robots.txt" >> "$OUTPUT_FILE"
echo "// ==========================================================" >> "$OUTPUT_FILE"
cat public/robots.txt >> "$OUTPUT_FILE"
echo -e "\n\n" >> "$OUTPUT_FILE"

echo -e "------------" >> "$OUTPUT_FILE"

tree .  >> "$OUTPUT_FILE"
echo -e "\n\n" >> "$OUTPUT_FILE"


echo "Done! File created at: $OUTPUT_FILE"

