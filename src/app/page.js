'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories || []));
    fetch('/api/products?limit=8').then(r => r.json()).then(d => setFeatured(d.products || []));
  }, []);

  return (
    <main>
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <h1>Where Forever Begins</h1>
          <p>
            Discover handcrafted engagement rings from the world&apos;s most talented jewelers.
            Every ring in our collection is a masterpiece of artistry and devotion.
          </p>
          <a href="/shop" className="btn btn-primary">Explore Collection</a>
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section">
        <h2>Browse by Style</h2>
        <p className="subtitle">Find the perfect ring that tells your unique love story</p>
        <div className="categories-grid">
          {categories.map(cat => (
            <a key={cat.id} href={`/shop?category=${cat.slug}`} className="category-card">
              <h3>{cat.name}</h3>
              <p>{cat.product_count} {cat.product_count === 1 ? 'ring' : 'rings'}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="products-section">
          <div className="section-header">
            <h2>Featured Rings</h2>
            <a href="/shop" className="btn btn-outline">View All</a>
          </div>
          <div className="product-grid">
            {featured.map(product => (
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
        </section>
      )}

      {/* Trust Section */}
      <section className="categories-section" style={{ background: 'var(--light-gray)' }}>
        <h2>Why Choose Us</h2>
        <p className="subtitle">A marketplace built on trust and transparency</p>
        <div className="categories-grid" style={{ maxWidth: '900px' }}>
          <div className="category-card" style={{ background: '#fff' }}>
            <h3>Verified Jewelers</h3>
            <p>Every vendor is vetted</p>
          </div>
          <div className="category-card" style={{ background: '#fff' }}>
            <h3>Secure Checkout</h3>
            <p>Powered by Stripe</p>
          </div>
          <div className="category-card" style={{ background: '#fff' }}>
            <h3>Free Returns</h3>
            <p>30-day guarantee</p>
          </div>
        </div>
      </section>
    </main>
  );
}
