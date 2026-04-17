import { getDb } from '../../../../lib/db';
import { authenticateVendor } from '../../../../lib/auth';
import { generateId, slugify, jsonResponse, errorResponse } from '../../../../lib/helpers';

// GET - List vendor's products
export async function GET(request) {
  try {
    const db = getDb();
    const vendor = authenticateVendor(request, db);
    if (!vendor) return errorResponse('Unauthorized', 401);

    const products = db.prepare(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.vendor_id = ?
      ORDER BY p.created_at DESC
    `).all(vendor.id);

    return jsonResponse({
      products: products.map(p => ({ ...p, images: JSON.parse(p.images || '[]'), ring_sizes: JSON.parse(p.ring_sizes || '[]') }))
    });
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}

// POST - Create a product
export async function POST(request) {
  try {
    const db = getDb();
    const vendor = authenticateVendor(request, db);
    if (!vendor) return errorResponse('Unauthorized', 401);
    if (vendor.status !== 'approved') return errorResponse('Vendor account not yet approved', 403);

    const body = await request.json();
    const { name, description, price, compare_at_price, category_id, metal_type, stone_type, carat_weight, ring_sizes, images, sku, inventory_count } = body;

    if (!name || !price) {
      return errorResponse('name and price are required');
    }

    const id = generateId('prod');
    const slug = slugify(name) + '-' + id.slice(-6);

    db.prepare(`
      INSERT INTO products (id, vendor_id, category_id, name, slug, description, price, compare_at_price, metal_type, stone_type, carat_weight, ring_sizes, images, sku, inventory_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, vendor.id, category_id || null, name, slug, description || null,
      Math.round(price * 100), compare_at_price ? Math.round(compare_at_price * 100) : null,
      metal_type || null, stone_type || null, carat_weight || null,
      JSON.stringify(ring_sizes || []), JSON.stringify(images || []),
      sku || null, inventory_count || 0
    );

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);

    return jsonResponse({
      product: { ...product, images: JSON.parse(product.images), ring_sizes: JSON.parse(product.ring_sizes || '[]') },
      message: 'Product created. It will be visible after admin approval.'
    }, 201);
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}
