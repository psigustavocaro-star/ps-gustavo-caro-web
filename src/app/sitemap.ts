import type { MetadataRoute } from 'next';
import { blogPosts } from '@/lib/data/blog';

const BASE = 'https://psgustavocaro.cl';

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();
    const staticRoutes: MetadataRoute.Sitemap = [
        { url: `${BASE}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
        { url: `${BASE}/agendar`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
        { url: `${BASE}/reservar`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
        { url: `${BASE}/calendario`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
        { url: `${BASE}/sobre-mi`, lastModified: now, changeFrequency: 'yearly', priority: 0.6 },
        { url: `${BASE}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
        { url: `${BASE}/aviso-legal`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
        { url: `${BASE}/privacidad`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
        { url: `${BASE}/cookies`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    ];

    const blogRoutes: MetadataRoute.Sitemap = blogPosts.map(post => ({
        url: `${BASE}/blog/${post.slug}`,
        lastModified: post.date ? new Date(post.date) : now,
        changeFrequency: 'monthly',
        priority: 0.7,
    }));

    return [...staticRoutes, ...blogRoutes];
}
