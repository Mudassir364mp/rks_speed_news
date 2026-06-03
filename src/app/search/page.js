'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatRelativeTime } from '@/lib/utils';
import { Search as SearchIcon } from 'lucide-react';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [categories, setCategories] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load categories for display
    fetch('/api/categories')
      .then(r => r.json())
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(() => { });

    // Check URL for query param
    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get('q');
    if (q) {
      setQuery(q);
      doSearch(q);
    }
  }, []);

  const doSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      // Fetch all articles then filter client-side
      const res = await fetch('/api/articles');
      const allArticles = await res.json();
      const q = searchQuery.toLowerCase();
      const filtered = Array.isArray(allArticles)
        ? allArticles.filter(art =>
          art.title?.toLowerCase().includes(q) ||
          art.excerpt?.toLowerCase().includes(q) ||
          art.content?.toLowerCase().includes(q)
        )
        : [];
      setResults(filtered);
      setHasSearched(true);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    doSearch(query);
  };

  return (
    <div className="container" style={{ padding: '4rem 1rem', minHeight: '60vh' }}>
      <h1 className="heading-serif" style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '2rem', textAlign: 'center' }}>Search News</h1>

      <form onSubmit={onSubmit} style={{ maxWidth: '600px', margin: '0 auto 4rem', display: 'flex', gap: '0.5rem' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <SearchIcon size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search keywords, topics, or authors..."
            style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', fontSize: '1.125rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ padding: '0 2rem', fontSize: '1.125rem', borderRadius: 'var(--radius-lg)' }}>
          Search
        </button>
      </form>

      {loading && (
        <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>Searching...</div>
      )}

      {hasSearched && !loading && (
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
            {results.length} Results for "{query}"
          </h2>

          {results.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-text-muted)' }}>
              <p style={{ fontSize: '1.25rem' }}>No news matching your search.</p>
              <p>Try different keywords or browse our categories.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
              {results.map(article => (
                <div key={article._id || article.id} style={{ display: 'flex', gap: '1.5rem', backgroundColor: 'var(--color-bg-alt)', padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                  {article.imageUrl && (
                    <div style={{ width: '200px', height: '130px', flexShrink: 0, borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                      <img src={article.imageUrl} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '0.5rem' }}>
                      <Link href={`/article/${article.slug}`} className="hover:underline">{article.title}</Link>
                    </h3>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{article.excerpt}</p>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', display: 'flex', gap: '1rem' }}>
                      <span>{formatRelativeTime(article.publishedAt)}</span>
                      <span style={{ color: 'var(--color-primary)' }}>
                        {categories.find(c => String(c.id || c._id) === String(article.categoryId))?.name}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
