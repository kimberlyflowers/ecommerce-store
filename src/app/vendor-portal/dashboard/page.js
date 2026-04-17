'use client';
import { useState, useEffect } from 'react';

export default function VendorDashboard() {
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState('');

  useEffect(() => {
    const t = localStorage.getItem('vendor_token');
    const v = localStorage.getItem('vendor_data');
    if (!t || !v) { window.location.href = '/vendor-portal'; return; }
    setToken(t);
    setVendor(JSON.parse(v));
  }, []);

  useEffect(() => {
    if (!token) return;
    loadProducts();
  }, [token]);

  async function loadProducts() {
    const r = await fetch('/api/vendors/products', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (r.ok) {
      const data = await r.json();
      setProducts(data.products || []);
    }
  }

  function logout() {
    localStorage.removeItem('vendor_token');
    localStorage.removeItem('vendor_data');
    window.location.href = '/vendor-portal';
  }

  if (!vendor) return null;

  const statusCounts = products.reduce((acc, p) => { acc[p.status] = (acc[p.status] || 0) + 1; return acc; }, {});

  return (
    <main style={{ maxWidth: 1100, margin: '2rem auto', padding: '0 2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem' }}>{vendor.business_name}</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>
            Status: <StatusBadge status={vendor.status} /> &middot; API Key: <code style={{ fontSize: '0.75rem', background: 'var(--light-gray)', padding: '0.2rem 0.4rem' }}>{vendor.api_key?.slice(0, 12)}...</code>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <a href="/vendor-portal/products/new" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.75rem' }}>+ Add Product</a>
          <button className="btn btn-outline" style={{ padding: '0.6rem 1.5rem', fontSize: '0.75rem' }} onClick={logout}>Logout</button>
        </div>
      </div>

      {vendor.status === 'pending' && (
        <div style={{ background: '#fef3cd', padding: '1rem 1.5rem', marginBottom: '2rem', fontSize: '0.85rem', border: '1px solid #f0d78e' }}>
          Your account is pending approval. You can add products, but they won&apos;t be visible until your account and products are approved.
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard label="Total Products" value={products.length} />
        <StatCard label="Approved" value={statusCounts.approved || 0} />
        <StatCard label="Pending" value={statusCounts.pending || 0} />
        <StatCard label="Rejected" value={statusCounts.rejected || 0} />
      </div>

      {/* Product List */}
      <h2 style={{ fontFamily: 'var(--font-serif)', marginBottom: '1.5rem' }}>Your Products</h2>
      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--light-gray)' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', marginBottom: '1rem' }}>No products yet</h3>
          <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>Start by adding your first ring</p>
          <a href="/vendor-portal/products/new" className="btn btn-primary" style={{ padding: '0.8rem 2rem' }}>Add Your First Product</a>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {products.map(p => (
            <div key={p.id} style={{ border: '1px solid var(--border)', overflow: 'hidden' }}>
              <div style={{ aspectRatio: '1', background: 'var(--light-gray)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {p.images?.[0] ? <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem', color: 'var(--gold-light)' }}>&#9826;</span>}
              </div>
              <div style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem' }}>{p.name}</h3>
                  <StatusBadge status={p.status} />
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '0.5rem' }}>
                  {[p.metal_type, p.stone_type].filter(Boolean).join(' · ')}
                </p>
                <p style={{ fontWeight: 500 }}>${(p.price / 100).toLocaleString()}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.5rem' }}>
                  Stock: {p.inventory_count} &middot; SKU: {p.sku || 'N/A'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={{ padding: '1.5rem', background: 'var(--light-gray)', textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem' }}>{value}</div>
      <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-light)', marginTop: '0.3rem' }}>{label}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = { pending: '#e67e22', approved: '#2d7d46', rejected: '#c0392b', suspended: '#c0392b' };
  return (
    <span style={{ display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '3px', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', background: `${colors[status] || '#999'}15`, color: colors[status] || '#999' }}>
      {status}
    </span>
  );
}
