'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [selectedSize, setSelectedSize] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(r => r.json())
      .then(d => {
        setProduct(d.product);
        setRelated(d.related || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '8rem 2rem', color: 'var(--text-light)' }}>
        Loading...
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '8rem 2rem' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '1rem' }}>Ring Not Found</h2>
        <a href="/shop" className="btn btn-outline">Back to Shop</a>
      </div>
    );
  }

  return (
    <main>
      <div className="product-detail">
        <div className="product-gallery">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '6rem', color: 'var(--gold-light)' }}>&#9826;</span>
          )}
        </div>

        <div className="product-detail-info">
          <div className="vendor">By {product.vendor_name}</div>
          <h1>{product.name}</h1>
          <div className="price">
            ${product.price?.toLocaleString()}
            {product.compare_at_price && (
              <span style={{ textDecoration: 'line-through', color: 'var(--text-light)', marginLeft: '1rem', fontSize: '1rem', fontWeight: 300 }}>
                ${product.compare_at_price.toLocaleString()}
              </span>
            )}
          </div>

          {product.description && (
            <p className="description">{product.description}</p>
          )}

          <div className="specs">
            {product.metal_type && (
              <div className="spec-item">
                <label>Metal</label>
                <span>{product.metal_type}</span>
              </div>
            )}
            {product.stone_type && (
              <div className="spec-item">
                <label>Stone</label>
                <span>{product.stone_type}</span>
              </div>
            )}
            {product.carat_weight && (
              <div className="spec-item">
                <label>Carat Weight</label>
                <span>{product.carat_weight} ct</span>
              </div>
            )}
            {product.category_name && (
              <div className="spec-item">
                <label>Style</label>
                <span>{product.category_name}</span>
              </div>
            )}
          </div>

          {product.ring_sizes?.length > 0 && (
            <div>
              <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500, display: 'block', marginBottom: '0.8rem' }}>
                Select Size
              </label>
              <div className="size-selector">
                {product.ring_sizes.map(size => (
                  <button
                    key={size}
                    className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Add to Cart
          </button>
          <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-light)' }}>
            Free shipping &middot; 30-day returns &middot; Certificate of authenticity
          </p>
        </div>
      </div>

      {related.length > 0 && (
        <section className="products-section">
          <h2 style={{ marginBottom: '2rem' }}>You May Also Love</h2>
          <div className="product-grid">
            {related.map(r => (
              <a key={r.id} href={`/shop/${r.slug}`} className="product-card">
                <div className="product-image">
                  {r.images?.[0] ? <img src={r.images[0]} alt={r.name} /> : <span>&#9826;</span>}
                </div>
                <div className="product-info">
                  <h3>{r.name}</h3>
                  <div className="product-price">${r.price?.toLocaleString()}</div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
