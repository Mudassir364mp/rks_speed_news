export async function generateMetadata({ params }) {
    const { slug } = await params;
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_SITE_URL || 'https://rks-speed-news.vercel.app'}/api/articles/${slug}`,
            { cache: 'no-store' }
        );
        const article = await res.json();
        return {
            title: article.title,
            description: article.excerpt,
            openGraph: {
                title: article.title,
                description: article.excerpt,
                images: article.imageUrl ? [{ url: article.imageUrl, width: 1200, height: 630 }] : [],
                type: 'article',
            },
            twitter: {
                card: 'summary_large_image',
                title: article.title,
                description: article.excerpt,
                images: article.imageUrl ? [article.imageUrl] : [],
            },
        };
    } catch {
        return { title: 'RKS Speed News' };
    }
}

export default function ArticleLayout({ children }) {
    return children;
}