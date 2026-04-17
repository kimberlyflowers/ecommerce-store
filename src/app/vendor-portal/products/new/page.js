'use client';
import { useState, useEffect } from 'react';

export default function NewProduct() {
  const [token, setToken] = useState('');
  const [categories, setCategories] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', description: '', price: '', compare_at_price: '',
    category_id: '', metal_type: '', stone_type: '', carat_weight: '',
    ring_sizes: '', sku: '', inventory_count: '1', images: [],
  });

  useEffect(() => {
    const t = localStorage.getItem('vendor_token');
    if (!t) { window.location.href = '/vendor-portal'; return; }
    setToken(t);
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories || []));
  }, []);

  function updateField(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function uploadImages(e) {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    setError('');

    const formData = new FormData();
    for (const file of files) {
      formData.append('images', file);
    }

    try {
      const r = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);

      setForm(f => ({ ...f, images: [...f.images, ...data.urls] }));
    } catch (err) {
      setError(err.message);
    }
    setUploading(false);
  }

  function removeImage(idx) {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const body = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : undefined,
      category_id: form.category_id || undefined,
      metal_type: form.metal_type || undefined,
      stone_type: form.stone_type || undefined,
      carat_weight: form.carat_weight ? parseFloat(form.carat_weight) : undefined,
      ring_sizes: form.ring_sizes ? form.ring_sizes.split(',').map(s => parseFloat(s.trim())).filter(Boolean) : [],
      sku: form.sku || undefined,
      inventory_count: parseInt(form.inventory_count) || 1,
      images: form.images,
    };

    try {
      const r = await fetch('/api/vendors/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);

      window.location.href = '/vendor-portal/dashboard';
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  }

  return (
    <main style={{ maxWidth: 700, margin: '2rem auto', padding: '0 2rem 4rem' }}>
      <a href="/vendor-portal/dashboard" style={{ fontSize: '0.8rem', color: 'var(--text-light)', display: 'block', marginBottom: '1rem' }}>&larr; Back to Dashboard</a>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '2rem' }}>Add New Product</h1>

      {error && <div style={{ background: '#fdeaea', color: '#c0392b', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Images */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500, marginBottom: '0.8rem' }}>Product Images</label>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {form.images.map((url, i) => (
              <div key={i} style={{ width: 120, height: 120, position: 'relative', border: '1px solid var(--border)', overflow: 'hidden' }}>
                <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button type="button" onClick={() => removeImage(i)}
                  style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', width: 22, height: 22, cursor: 'pointer', fontSize: '0.7rem', borderRadius: '50%' }}>×</button>
              </div>
            ))}
            <label style={{ width: 120, height: 120, border: '2px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'var(--light-gray)', fontSize: '0.75rem', color: 'var(--text-light)' }}>
              {uploading ? 'Uploading...' : <>
                <span style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>+</span>
                Add Images
              </>}
              <input type="file" multiple accept="image/*" onChange={uploadImages} style={{ display: 'none' }} disabled={uploading} />
            </label>
          </div>
        </div>

        {/* Basic Info */}
        <div className="form-group">
          <label>Product Name *</label>
          <input type="text" required value={form.name} onChange={e => updateField('name', e.target.value)} placeholder="e.g. Classic Round Solitaire" />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea rows={4} value={form.description} onChange={e => updateField('description', e.target.value)}
            placeholder="Describe the ring — materials, craftsmanship, inspiration..." />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>Price (USD) *</label>
            <input type="number" step="0.01" required value={form.price} onChange={e => updateField('price', e.target.value)} placeholder="4999.99" />
          </div>
          <div className="form-group">
            <label>Compare at Price</label>
            <input type="number" step="0.01" value={form.compare_at_price} onChange={e => updateField('compare_at_price', e.target.value)} placeholder="Original price" />
          </div>
        </div>

        <div className="form-group">
          <label>Category</label>
          <select value={form.category_id} onChange={e => updateField('category_id', e.target.value)}
            style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid var(--border)', fontFamily: 'var(--font-sans)', fontSize: '0.9rem' }}>
            <option value="">Select a category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Ring Details */}
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', marginTop: '2rem', marginBottom: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>Ring Details</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>Metal Type</label>
            <select value={form.metal_type} onChange={e => updateField('metal_type', e.target.value)}
              style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid var(--border)', fontFamily: 'var(--font-sans)', fontSize: '0.9rem' }}>
              <option value="">Select metal</option>
              <option>White Gold</option>
              <option>Yellow Gold</option>
              <option>Rose Gold</option>
              <option>Platinum</option>
              <option>Silver</option>
              <option>Palladium</option>
            </select>
          </div>
          <div className="form-group">
            <label>Stone Type</label>
            <select value={form.stone_type} onChange={e => updateField('stone_type', e.target.value)}
              style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid var(--border)', fontFamily: 'var(--font-sans)', fontSize: '0.9rem' }}>
              <option value="">Select stone</option>
              <option>Diamond</option>
              <option>Moissanite</option>
              <option>Sapphire</option>
              <option>Ruby</option>
              <option>Emerald</option>
              <option>Pink Sapphire</option>
              <option>Morganite</option>
              <option>Lab Diamond</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>Carat Weight</label>
            <input type="number" step="0.01" value={form.carat_weight} onChange={e => updateField('carat_weight', e.target.value)} placeholder="1.5" />
          </div>
          <div className="form-group">
            <label>Available Sizes (comma separated)</label>
            <input type="text" value={form.ring_sizes} onChange={e => updateField('ring_sizes', e.target.value)} placeholder="5, 5.5, 6, 6.5, 7, 7.5, 8" />
          </div>
        </div>

        {/* Inventory */}
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', marginTop: '2rem', marginBottom: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>Inventory</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>SKU</label>
            <input type="text" value={form.sku} onChange={e => updateField('sku', e.target.value)} placeholder="SOL-WG-1CT" />
          </div>
          <div className="form-group">
            <label>Inventory Count</label>
            <input type="number" value={form.inventory_count} onChange={e => updateField('inventory_count', e.target.value)} placeholder="1" />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '2rem', padding: '1.2rem' }} disabled={saving}>
          {saving ? 'Saving...' : 'Add Product'}
        </button>
      </form>
    </main>
  );
}
