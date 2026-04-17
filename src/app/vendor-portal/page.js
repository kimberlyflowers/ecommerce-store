'use client';
import { useState } from 'react';

export default function VendorPortal() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ business_name: '', email: '', password: '', description: '', website: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    const r = await fetch('/api/vendors/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email, password: form.password }),
    });
    const data = await r.json();
    if (!r.ok) return setError(data.error);

    localStorage.setItem('vendor_token', data.token);
    localStorage.setItem('vendor_data', JSON.stringify(data.vendor));
    window.location.href = '/vendor-portal/dashboard';
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError('');
    const r = await fetch('/api/vendors/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await r.json();
    if (!r.ok) return setError(data.error);

    setSuccess(`Registration successful! Your API key is: ${data.vendor.api_key} — Save this! Your account is pending approval.`);
    localStorage.setItem('vendor_token', data.token);
    localStorage.setItem('vendor_data', JSON.stringify(data.vendor));
  }

  return (
    <main className="vendor-page">
      <h1>Vendor Portal</h1>
      <p style={{ textAlign: 'center', color: 'var(--text-light)', marginBottom: '2rem' }}>
        {mode === 'login' ? 'Log in to manage your products' : 'Register to start selling your rings'}
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button className={mode === 'login' ? 'btn btn-primary' : 'btn btn-outline'} style={{ padding: '0.6rem 2rem' }} onClick={() => setMode('login')}>Login</button>
        <button className={mode === 'register' ? 'btn btn-primary' : 'btn btn-outline'} style={{ padding: '0.6rem 2rem' }} onClick={() => setMode('register')}>Register</button>
      </div>

      {error && <div style={{ background: '#fdeaea', color: '#c0392b', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>{error}</div>}
      {success && <div style={{ background: '#eafde8', color: '#2d7d46', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem', wordBreak: 'break-all' }}>{success}</div>}

      {mode === 'login' ? (
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Login</button>
        </form>
      ) : (
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>Business Name</label>
            <input type="text" required value={form.business_name} onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Tell us about your jewelry business..." />
          </div>
          <div className="form-group">
            <label>Website (optional)</label>
            <input type="url" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://..." />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Register</button>
        </form>
      )}
    </main>
  );
}
