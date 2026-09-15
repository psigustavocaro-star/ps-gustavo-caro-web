import 'server-only';
import prisma from '@/lib/db';
import { blogPosts, isBlogPostPublished, type BlogPost } from '@/lib/data/blog';

type ManagedPost = Awaited<ReturnType<typeof prisma.contentPost.findMany>>[number];

function toBlogPost(post: ManagedPost, fallback?: BlogPost): BlogPost {
    return {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        date: (post.publishedAt || post.updatedAt).toISOString().slice(0, 10),
        author: 'Ps. Gustavo Caro',
        category: post.category as BlogPost['category'],
        image: post.image,
        keywords: post.keywords,
        resources: fallback?.resources,
    };
}

export async function getEffectiveBlogPosts(referenceDate = new Date()) {
    const managedPosts = await prisma.contentPost.findMany().catch(() => []);
    const managedBySlug = new Map(managedPosts.map((post) => [post.slug, post]));
    const merged: BlogPost[] = [];

    for (const staticPost of blogPosts) {
        const managed = managedBySlug.get(staticPost.slug);
        if (!managed) {
            if (isBlogPostPublished(staticPost, referenceDate)) merged.push(staticPost);
            continue;
        }

        managedBySlug.delete(staticPost.slug);
        if (managed.status === 'PUBLISHED' && (!managed.publishedAt || managed.publishedAt <= referenceDate)) {
            merged.push(toBlogPost(managed, staticPost));
        }
    }

    for (const managed of managedBySlug.values()) {
        if (managed.status === 'PUBLISHED' && (!managed.publishedAt || managed.publishedAt <= referenceDate)) {
            merged.push(toBlogPost(managed));
        }
    }

    return merged.sort((first, second) => Date.parse(second.date) - Date.parse(first.date));
}

export async function getEffectiveBlogPost(slug: string, referenceDate = new Date()) {
    const posts = await getEffectiveBlogPosts(referenceDate);
    return posts.find((post) => post.slug === slug) || null;
}
