import { getDb } from '../../../../lib/db';
import { jsonResponse, errorResponse } from '../../../../lib/helpers';

const ADMIN_KEY = process.env.ADMIN_KEY || 'admin-secret';

function checkAdmin(request) {
  const key = request.headers.get('x-admin-key') || new URL(request.url).searchParams.get('admin_key');
  return key === ADMIN_KEY;
}

export async function GET(request) {
  if (!checkAdmin(request)) return errorResponse('Unauthorized', 401);
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = `
      SELECT p.*, v.business_name as vendor_name, c.name as category_name
      FROM products p
      LEFT JOIN vendors v ON p.vendor_id = v.id
      LEFT JOIN categories c ON p.category_id = c.id
    `;
    const params = [];
    if (status) {
      query += ' WHERE p.status = ?';
      params.push(status);
    }
    query += ' ORDER BY p.created_at DESC';

    const products = db.prepare(query).all(...params);
    return jsonResponse({
      products: products.map(p => ({
        ...p,
        price: p.price / 100,
        compare_at_price: p.compare_at_price ? p.compare_at_price / 100 : null,
        images: JSON.parse(p.images || '[]'),
        ring_sizes: JSON.parse(p.ring_sizes || '[]'),
      }))
    });
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}

export async function PATCH(request) {
  if (!checkAdmin(request)) return errorResponse('Unauthorized', 401);
  try {
    const db = getDb();
    const { product_id, status } = await request.json();
    if (!product_id || !status) return errorResponse('product_id and status required');
    if (!['pending', 'approved', 'rejected', 'archived'].includes(status)) return errorResponse('Invalid status');

    db.prepare("UPDATE products SET status = ?, updated_at = datetime('now') WHERE id = ?")
      .run(status, product_id);

    return jsonResponse({ message: `Product ${status}` });
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}

export async function DELETE(request) {
  if (!checkAdmin(request)) return errorResponse('Unauthorized', 401);
  try {
    const db = getDb();
    const { product_id } = await request.json();
    if (!product_id) return errorResponse('product_id required');

    db.prepare('DELETE FROM products WHERE id = ?').run(product_id);
    return jsonResponse({ message: 'Product deleted' });
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}
