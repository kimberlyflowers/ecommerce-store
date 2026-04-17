'use client';
import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [adminKey, setAdminKey] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [tab, setTab] = useState('vendors');
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [productFilter, setProductFilter] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('admin_key');
    if (saved) { setAdminKey(saved); setLoggedIn(true); }
  }, []);

  useEffect(() => {
    if (!loggedIn) return;
    localStorage.setItem('admin_key', adminKey);
    loadData();
  }, [loggedIn, tab]);

  async function loadData() {
    const headers = { 'x-admin-key': adminKey };
    if (tab === 'vendors') {
      const r = await fetch('/api/admin/vendors', { headers });
      if (r.ok) setVendors((await r.json()).vendors);
    } else if (tab === 'products') {
      const url = productFilter ? `/api/admin/products?status=${productFilter}` : '/api/admin/products';
      const r = await fetch(url, { headers });
      if (r.ok) setProducts((await r.json()).products);
    } else if (tab === 'orders') {
      const r = await fetch('/api/admin/orders', { headers });
      if (r.ok) setOrders((await r.json()).orders);
    }
  }

  async function updateVendor(vendorId, status) {
    await fetch('/api/admin/vendors', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ vendor_id: vendorId, status }),
    });
    loadData();
  }

  async function updateProduct(productId, status) {
    await fetch('/api/admin/products', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ product_id: productId, status }),
    });
    loadData();
  }

  async function deleteProduct(productId) {
    if (!confirm('Delete this product?')) return;
    await fetch('/api/admin/products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ product_id: productId }),
    });
    loadData();
  }

  async function updateOrder(orderId, status) {
    await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ order_id: orderId, status }),
    });
    loadData();
  }

  if (!loggedIn) {
    return (
      <main style={{ maxWidth: 400, margin: '8rem auto', padding: '0 2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>Admin Login</h1>
        <div className="form-group">
          <label>Admin Key</label>
          <input type="password" value={adminKey} onChange={e => setAdminKey(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && setLoggedIn(true)} placeholder="Enter admin key" />
        </div>
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setLoggedIn(true)}>Login</button>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 1200, margin: '2rem auto', padding: '0 2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem' }}>Admin Dashboard</h1>
        <button className="btn btn-outline" style={{ padding: '0.5rem 1.5rem' }} onClick={() => { setLoggedIn(false); localStorage.removeItem('admin_key'); }}>Logout</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
        {['vendors', 'products', 'orders'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '0.5rem 1.5rem', background: tab === t ? 'var(--charcoal)' : 'transparent', color: tab === t ? '#fff' : 'var(--text)', border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {t}
          </button>
        ))}
      </div>

      {/* Vendors Tab */}
      {tab === 'vendors' && (
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', marginBottom: '1.5rem' }}>Vendors ({vendors.length})</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                <th style={thStyle}>Business</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Products</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map(v => (
                <tr key={v.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={tdStyle}><strong>{v.business_name}</strong><br/><span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{v.description?.slice(0, 60)}</span></td>
                  <td style={tdStyle}>{v.email}</td>
                  <td style={tdStyle}>{v.product_count}</td>
                  <td style={tdStyle}><StatusBadge status={v.status} /></td>
                  <td style={tdStyle}>
                    {v.status !== 'approved' && <ActionBtn onClick={() => updateVendor(v.id, 'approved')} color="#2d7d46">Approve</ActionBtn>}
                    {v.status !== 'suspended' && <ActionBtn onClick={() => updateVendor(v.id, 'suspended')} color="#c0392b">Suspend</ActionBtn>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {vendors.length === 0 && <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-light)' }}>No vendors yet</p>}
        </div>
      )}

      {/* Products Tab */}
      {tab === 'products' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)' }}>Products ({products.length})</h2>
            <select value={productFilter} onChange={e => { setProductFilter(e.target.value); setTimeout(loadData, 0); }}
              style={{ padding: '0.5rem 1rem', border: '1px solid var(--border)', fontFamily: 'var(--font-sans)', fontSize: '0.8rem' }}>
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                <th style={thStyle}>Image</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Vendor</th>
                <th style={thStyle}>Price</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={tdStyle}>
                    {p.images?.[0] ? <img src={p.images[0]} alt="" style={{ width: 50, height: 50, objectFit: 'cover' }} /> : <div style={{ width: 50, height: 50, background: 'var(--light-gray)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-serif)', color: 'var(--gold-light)' }}>&#9826;</div>}
                  </td>
                  <td style={tdStyle}><strong>{p.name}</strong><br/><span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{p.metal_type} · {p.stone_type}</span></td>
                  <td style={tdStyle}>{p.vendor_name}</td>
                  <td style={tdStyle}>${p.price?.toLocaleString()}</td>
                  <td style={tdStyle}>{p.category_name}</td>
                  <td style={tdStyle}><StatusBadge status={p.status} /></td>
                  <td style={tdStyle}>
                    {p.status !== 'approved' && <ActionBtn onClick={() => updateProduct(p.id, 'approved')} color="#2d7d46">Approve</ActionBtn>}
                    {p.status !== 'rejected' && <ActionBtn onClick={() => updateProduct(p.id, 'rejected')} color="#e67e22">Reject</ActionBtn>}
                    <ActionBtn onClick={() => deleteProduct(p.id)} color="#c0392b">Delete</ActionBtn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-light)' }}>No products found</p>}
        </div>
      )}

      {/* Orders Tab */}
      {tab === 'orders' && (
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', marginBottom: '1.5rem' }}>Orders ({orders.length})</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                <th style={thStyle}>Order ID</th>
                <th style={thStyle}>Customer</th>
                <th style={thStyle}>Total</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={tdStyle}><code style={{ fontSize: '0.75rem' }}>{o.id}</code></td>
                  <td style={tdStyle}>{o.customer_name}<br/><span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{o.customer_email}</span></td>
                  <td style={tdStyle}>${o.total?.toLocaleString()}</td>
                  <td style={tdStyle}><StatusBadge status={o.status} /></td>
                  <td style={tdStyle}>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td style={tdStyle}>
                    <select onChange={e => updateOrder(o.id, e.target.value)} value={o.status}
                      style={{ padding: '0.3rem', border: '1px solid var(--border)', fontSize: '0.75rem', fontFamily: 'var(--font-sans)' }}>
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-light)' }}>No orders yet</p>}
        </div>
      )}
    </main>
  );
}

const thStyle = { padding: '0.8rem 0.5rem', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' };
const tdStyle = { padding: '0.8rem 0.5rem', verticalAlign: 'middle' };

function StatusBadge({ status }) {
  const colors = { pending: '#e67e22', approved: '#2d7d46', rejected: '#c0392b', suspended: '#c0392b', paid: '#2d7d46', shipped: '#2980b9', delivered: '#2d7d46', cancelled: '#999' };
  return (
    <span style={{ display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '3px', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', background: `${colors[status] || '#999'}15`, color: colors[status] || '#999' }}>
      {status}
    </span>
  );
}

function ActionBtn({ onClick, color, children }) {
  return (
    <button onClick={onClick} style={{ padding: '0.3rem 0.6rem', marginRight: '0.3rem', marginBottom: '0.3rem', border: `1px solid ${color}`, background: 'transparent', color, cursor: 'pointer', fontSize: '0.7rem', fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
      {children}
    </button>
  );
}
