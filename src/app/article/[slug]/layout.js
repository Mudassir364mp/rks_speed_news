export async function generateMetadata({ params }) {
    const { slug } = await params;
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_SITE_URL || "https://rks-speed-news.vercel.app"}/api/articles/${slug}`,
            { cache: "no-store" }
        );
        const article = await res.json();
        const imageUrl = article.imageUrl || "https://rks-speed-news.vercel.app/og-default.jpg";
        return {
            title: article.title,
            description: article.excerpt,
            metadataBase: new URL("https://rks-speed-news.vercel.app"),
            openGraph: {
                title: article.title,
                description: article.excerpt,
                url: `https://rks-speed-news.vercel.app/article/${slug}`,
                siteName: "RKS Speed News",
                images: [{ url: imageUrl, width: 1200, height: 630, alt: article.title }],
                type: "article",
                locale: "mr_IN",
            },
            twitter: {
                card: "summary_large_image",
                title: article.title,
                description: article.excerpt,
                images: [imageUrl],
            },
        };
    } catch {
        return { title: "RKS Speed News" };
    }
}

export default function ArticleLayout({ children }) {
    return children;
}