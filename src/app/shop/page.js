'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

export default function Shop() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '4rem' }}>Loading...</div>}>
      <ShopContent />
    </Suspense>
  );
}

function ShopContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    sort: 'newest',
    search: '',
    metal: '',
  });

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories || []));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.category) params.set('category', filters.category);
    if (filters.sort) params.set('sort', filters.sort);
    if (filters.search) params.set('search', filters.search);
    if (filters.metal) params.set('metal', filters.metal);

    fetch(`/api/products?${params}`).then(r => r.json()).then(d => {
      setProducts(d.products || []);
      setPagination(d.pagination || {});
    });
  }, [filters]);

  return (
    <main className="products-section">
      <div className="section-header">
        <h2>{filters.category ? categories.find(c => c.slug === filters.category)?.name || 'Shop' : 'All Rings'}</h2>
        <div className="filters">
          <input
            type="text"
            placeholder="Search rings..."
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
          />
          <select value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}>
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
          <select value={filters.metal} onChange={e => setFilters(f => ({ ...f, metal: e.target.value }))}>
            <option value="">All Metals</option>
            <option value="White Gold">White Gold</option>
            <option value="Yellow Gold">Yellow Gold</option>
            <option value="Rose Gold">Rose Gold</option>
            <option value="Platinum">Platinum</option>
            <option value="Silver">Silver</option>
          </select>
          <select value={filters.sort} onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))}>
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '6rem 0', color: 'var(--text-light)' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '1rem' }}>No rings found</h3>
          <p>Check back soon — our jewelers are adding new pieces daily.</p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map(product => (
            <a key={product.id} href={`/shop/${product.slug}`} className="product-card">
              <div className="product-image">
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt={product.name} />
                ) : (
                  <span>&#9826;</span>
                )}
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <div className="product-meta">
                  {[product.metal_type, product.stone_type].filter(Boolean).join(' · ') || product.vendor_name}
                </div>
                <div className="product-price">
                  ${product.price?.toLocaleString()}
                  {product.compare_at_price && (
                    <span className="compare">${product.compare_at_price.toLocaleString()}</span>
                  )}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      {pagination.pages > 1 && (
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <p style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>
            Showing {products.length} of {pagination.total} rings
          </p>
        </div>
      )}
    </main>
  );
}
