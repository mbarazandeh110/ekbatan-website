import { getCollection } from 'astro:content';

export async function GET() {
  const posts = await getCollection('blog');
  
  // مرتب‌سازی از جدیدترین به قدیمی‌ترین
  const sortedPosts = posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  // استخراج فقط دیتای مورد نیاز برای لیست (حذف Content برای کاهش حجم)
  const lightweightPosts = sortedPosts.map(post => ({
    id: post.id,
    title: post.data.title,
    description: post.data.description,
    pubDate: post.data.pubDate.toISOString(),
    author: post.data.author,
    tags: post.data.tags || [],
  }));

  return new Response(JSON.stringify(lightweightPosts), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      // کش طولانی برای کلاینت، چون فایل استاتیک است و با هر بیلد آپدیت می‌شود
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
    }
  });
}