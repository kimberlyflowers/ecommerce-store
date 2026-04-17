'use client';

export default function VendorPortal() {
  return (
    <main className="vendor-page">
      <h1>Vendor Portal</h1>
      <p style={{ textAlign: 'center', color: 'var(--text-light)', marginBottom: '3rem', lineHeight: 1.8 }}>
        Join our curated marketplace and reach thousands of engaged couples.
        Register for an account and start uploading your catalog via our API.
      </p>

      <div className="api-docs">
        <h3>Getting Started</h3>
        <ol style={{ lineHeight: 2.2, paddingLeft: '1.5rem' }}>
          <li>Register for a vendor account</li>
          <li>Wait for admin approval</li>
          <li>Use your API key to upload products</li>
          <li>Products go live after review</li>
        </ol>
      </div>

      <div className="api-docs">
        <h3>API Documentation</h3>
        <p style={{ marginBottom: '1rem' }}>Base URL: <code>https://your-domain.com/api</code></p>

        <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', fontWeight: 600, marginTop: '1.5rem' }}>1. Register</h4>
        <pre>{`POST /api/vendors/register
Content-Type: application/json

{
  "business_name": "Your Jewelry Co",
  "email": "you@example.com",
  "password": "secure_password",
  "description": "Handcrafted rings since 1990",
  "website": "https://yoursite.com"
}`}</pre>

        <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', fontWeight: 600, marginTop: '1.5rem' }}>2. Upload a Product</h4>
        <pre>{`POST /api/vendors/products
x-api-key: rk_your_api_key_here
Content-Type: application/json

{
  "name": "Classic Solitaire Diamond Ring",
  "description": "A timeless 1ct round brilliant...",
  "price": 4999.99,
  "category_id": "cat_solitaire",
  "metal_type": "White Gold",
  "stone_type": "Diamond",
  "carat_weight": 1.0,
  "ring_sizes": [5, 5.5, 6, 6.5, 7, 7.5, 8],
  "images": ["https://example.com/ring1.jpg"],
  "sku": "SOL-WG-1CT",
  "inventory_count": 10
}`}</pre>

        <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', fontWeight: 600, marginTop: '1.5rem' }}>3. Bulk Catalog Upload</h4>
        <pre>{`POST /api/vendors/catalogs
x-api-key: rk_your_api_key_here
Content-Type: application/json

{
  "products": [
    { "name": "Ring 1", "price": 2999.99, ... },
    { "name": "Ring 2", "price": 5499.99, ... }
  ]
}`}</pre>

        <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', fontWeight: 600, marginTop: '1.5rem' }}>4. List Your Products</h4>
        <pre>{`GET /api/vendors/products
x-api-key: rk_your_api_key_here`}</pre>

        <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', fontWeight: 600, marginTop: '1.5rem' }}>Categories</h4>
        <pre>{`cat_solitaire  - Solitaire
cat_halo       - Halo
cat_vintage    - Vintage
cat_three_stone - Three Stone
cat_pave       - Pavé
cat_cluster    - Cluster
cat_custom     - Custom`}</pre>

        <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', fontWeight: 600, marginTop: '1.5rem' }}>Authentication</h4>
        <p>Include your API key in the <code>x-api-key</code> header, or use a Bearer token from login:</p>
        <pre>{`Authorization: Bearer your_jwt_token`}</pre>
      </div>

      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <p style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>
          Questions? Contact us at <strong>vendors@ringmarketplace.com</strong>
        </p>
      </div>
    </main>
  );
}
