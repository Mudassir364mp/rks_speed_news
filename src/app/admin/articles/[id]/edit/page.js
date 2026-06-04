'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

const JoditEditor = dynamic(() => import('jodit-react'), { ssr: false });

export default function EditArticlePage() {
    const router = useRouter();
    const { id } = useParams();
    const fileInputRef = useRef(null);

    const [form, setForm] = useState({
        title: '', excerpt: '', content: '', category: '',
        author: '', imageUrl: '', status: 'published',
    });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [imageUploading, setImageUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [articleRes, catRes] = await Promise.all([
                    fetch(`/api/articles/id/${id}`),
                    fetch('/api/categories'),
                ]);
                const articleData = await articleRes.json();
                const catData = await catRes.json();

                if (articleData.article) {
                    const a = articleData.article;
                    setForm({
                        title: a.title || '',
                        excerpt: a.excerpt || '',
                        content: a.content || '',
                        category: a.categoryId || '',
                        author: a.author || '',
                        imageUrl: a.imageUrl || '',
                        status: a.status || 'published',
                    });
                }
                setCategories(catData.categories || []);
            } catch (err) {
                setError('Failed to load article');
            }
            setLoading(false);
        };
        if (id) fetchData();
    }, [id]);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.success) setForm(prev => ({ ...prev, imageUrl: data.url }));
            else setError(data.error || 'Upload failed');
        } catch (err) {
            setError('Upload failed');
        }
        setImageUploading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const res = await fetch(`/api/articles/id/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (data.success) {
                setSuccess('Article updated successfully!');
                setTimeout(() => router.push('/admin/articles'), 1500);
            } else {
                setError(data.error || 'Failed to update article');
            }
        } catch (err) {
            setError('Failed to update article');
        }
        setSaving(false);
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <Link href="/admin/articles" style={{ color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ArrowLeft size={20} /> Back
                </Link>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Edit Article</h1>
            </div>

            {error && <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>{error}</div>}
            {success && <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>{success}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Title *</label>
                        <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required
                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '1rem' }} />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Excerpt *</label>
                        <textarea value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} required rows={3}
                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.875rem', resize: 'vertical' }} />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Article Content *</label>
                        <JoditEditor value={form.content} onChange={content => setForm(prev => ({ ...prev, content }))} />
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1.25rem' }}>
                        <h3 style={{ fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>Article Settings</h3>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.375rem', fontSize: '0.875rem' }}>Category</label>
                            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                                style={{ width: '100%', padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
                                <option value="">Select Category</option>
                                {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                            </select>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.375rem', fontSize: '0.875rem' }}>Author *</label>
                            <input value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} required
                                style={{ width: '100%', padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.875rem' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.375rem', fontSize: '0.875rem' }}>Status</label>
                            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                                style={{ width: '100%', padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
                                <option value="published">Published</option>
                                <option value="draft">Draft</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1.25rem' }}>
                        <h3 style={{ fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>Featured Image</h3>
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} />
                        <button type="button" onClick={() => fileInputRef.current.click()} disabled={imageUploading}
                            style={{ width: '100%', padding: '0.75rem', marginBottom: '0.75rem', backgroundColor: imageUploading ? '#9ca3af' : '#ef4444', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 600, cursor: imageUploading ? 'not-allowed' : 'pointer', fontSize: '0.875rem' }}>
                            {imageUploading ? 'Uploading...' : 'Upload Image'}
                        </button>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>Or paste Image URL</label>
                        <input value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..."
                            style={{ width: '100%', padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.875rem' }} />
                        {form.imageUrl && (
                            <div style={{ marginTop: '0.75rem', borderRadius: '0.5rem', overflow: 'hidden', height: '150px' }}>
                                <img src={form.imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                        )}
                    </div>

                    <button type="submit" disabled={saving}
                        style={{ width: '100%', padding: '0.875rem', backgroundColor: saving ? '#9ca3af' : '#ef4444', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 700, fontSize: '1rem', cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}