'use client';
import { useState, useEffect } from 'react';
import { Edit, Trash2, Plus } from 'lucide-react';
import { generateSlug } from '@/lib/utils';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({ name: '', color: '#ef4444' });
  const [saving, setSaving] = useState(false);

  async function loadCategories() {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCategories(); }, []);

  const handleDelete = async (cat) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    const id = cat._id || cat.id;
    const updated = categories.filter(c => (c._id || c.id) !== id);
    try {
      // Save updated list
      for (const c of updated) {
        await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(c),
        });
      }
      setCategories(updated);
    } catch (err) {
      alert('Failed to delete category.');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentCategory.name) return;
    setSaving(true);

    const payload = {
      ...currentCategory,
      slug: generateSlug(currentCategory.name),
      id: currentCategory.id || Date.now().toString(),
    };

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.success) {
        await loadCategories();
        setIsEditing(false);
        setCurrentCategory({ name: '', color: '#ef4444' });
      } else {
        alert(result.error || 'Failed to save.');
      }
    } catch (err) {
      alert('Network error.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#111827' }}>Categories</h1>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#ef4444', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontWeight: 600 }}>
            <Plus size={20} /><span>New Category</span>
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        <div style={{ flex: 2, backgroundColor: 'white', borderRadius: '0.75rem', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Loading...</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb', color: '#6b7280', fontSize: '0.875rem' }}>
                  <th style={{ padding: '1rem' }}>Name</th>
                  <th style={{ padding: '1rem' }}>Slug</th>
                  <th style={{ padding: '1rem' }}>Color</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => (
                  <tr key={cat._id || cat.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '1rem', fontWeight: 600, color: '#111827' }}>{cat.name}</td>
                    <td style={{ padding: '1rem', color: '#6b7280' }}>/{cat.slug}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: cat.color || '#ef4444' }} />
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => { setIsEditing(true); setCurrentCategory(cat); }} style={{ color: '#f59e0b' }}><Edit size={18} /></button>
                        <button onClick={() => handleDelete(cat)} style={{ color: '#ef4444' }}><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>No categories found. Create one.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {isEditing && (
          <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
              {currentCategory._id || currentCategory.id ? 'Edit Category' : 'New Category'}
            </h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Category Name</label>
                <input type="text" value={currentCategory.name} onChange={e => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                  placeholder="e.g. Technology" required
                  style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Brand Color</label>
                <input type="color" value={currentCategory.color || '#ef4444'} onChange={e => setCurrentCategory({ ...currentCategory, color: e.target.value })}
                  style={{ width: '100%', height: '40px', padding: '0.25rem', borderRadius: '0.5rem', border: '1px solid #d1d5db' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" disabled={saving} style={{ flex: 1, padding: '0.75rem', backgroundColor: '#ef4444', color: 'white', borderRadius: '0.5rem', fontWeight: 600 }}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={() => { setIsEditing(false); setCurrentCategory({ name: '', color: '#ef4444' }); }}
                  style={{ flex: 1, padding: '0.75rem', backgroundColor: '#f3f4f6', color: '#4b5563', borderRadius: '0.5rem', fontWeight: 600 }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}