'use client';
import { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Megaphone } from 'lucide-react';

export default function AdminBreakingNews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState({ text: '', link: '' });
  const [saving, setSaving] = useState(false);

  async function loadNews() {
    try {
      const res = await fetch('/api/breaking');
      const data = await res.json();
      setNews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load breaking news:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadNews(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this breaking news alert?')) return;
    const updated = news.filter(n => (n._id || n.id) !== id);
    try {
      await fetch('/api/breaking', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      setNews(updated);
    } catch (err) {
      alert('Failed to delete.');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    let updated;
    if (currentItem._id || currentItem.id) {
      updated = news.map(n => (n._id || n.id) === (currentItem._id || currentItem.id) ? currentItem : n);
    } else {
      updated = [{ ...currentItem, id: `break-${Date.now()}` }, ...news];
    }
    try {
      await fetch('/api/breaking', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      setNews(updated);
      setIsEditing(false);
      setCurrentItem({ text: '', link: '' });
    } catch (err) {
      alert('Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Megaphone color="#ef4444" /> Breaking News
        </h1>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#ef4444', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontWeight: 600 }}>
            <Plus size={20} /><span>New Alert</span>
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
                  <th style={{ padding: '1rem' }}>Alert Text</th>
                  <th style={{ padding: '1rem' }}>Link</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {news.map(item => (
                  <tr key={item._id || item.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '1rem', fontWeight: 600, color: '#111827' }}>{item.text}</td>
                    <td style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>{item.link || 'None'}</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => { setIsEditing(true); setCurrentItem(item); }} style={{ color: '#f59e0b' }}><Edit size={18} /></button>
                        <button onClick={() => handleDelete(item._id || item.id)} style={{ color: '#ef4444' }}><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {news.length === 0 && (
                  <tr><td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>No breaking news alerts.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {isEditing && (
          <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
              {currentItem._id || currentItem.id ? 'Edit Alert' : 'New Alert'}
            </h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Alert Text</label>
                <textarea value={currentItem.text} onChange={e => setCurrentItem({ ...currentItem, text: e.target.value })}
                  placeholder="e.g. Major updates from the Central Bank..." required
                  style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', minHeight: '80px', fontFamily: 'inherit' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Target Link (Optional)</label>
                <input type="text" value={currentItem.link} onChange={e => setCurrentItem({ ...currentItem, link: e.target.value })}
                  placeholder="/article/some-slug"
                  style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" disabled={saving} style={{ flex: 1, padding: '0.75rem', backgroundColor: '#ef4444', color: 'white', borderRadius: '0.5rem', fontWeight: 600 }}>
                  {saving ? 'Saving...' : 'Save Alert'}
                </button>
                <button type="button" onClick={() => { setIsEditing(false); setCurrentItem({ text: '', link: '' }); }}
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