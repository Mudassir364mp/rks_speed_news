import dbConnect from '@/lib/mongoose';
import Article from '@/models/Article';
import Category from '@/models/Category';

export const dynamic = 'force-dynamic';

export default async function sitemap() {
  await dbConnect();

  const articles = await Article.find({})
    .select('slug updatedAt publishedAt')
    .lean();

  const categories = await Category.find({})
    .select('slug')
    .lean();

  const baseUrl = 'https://rks-speed-news.vercel.app';

  const staticPages = [
    { url: `${baseUrl}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  const articlePages = articles.map(article => ({
    url: `${baseUrl}/article/${article.slug}`,
    lastModified: new Date(article.updatedAt || article.publishedAt || Date.now()),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const categoryPages = categories.map(cat => ({
    url: `${baseUrl}/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  return [...staticPages, ...articlePages, ...categoryPages];
}
