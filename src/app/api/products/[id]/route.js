import { getDb } from '../../../../lib/db';
import { jsonResponse, errorResponse } from '../../../../lib/helpers';

export async function GET(request, { params }) {
  try {
    const db = getDb();
    const { id } = await params;

    const product = db.prepare(`
      SELECT p.*, c.name as category_name, c.slug as category_slug,
             v.business_name as vendor_name, v.description as vendor_description
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN vendors v ON p.vendor_id = v.id
      WHERE (p.id = ? OR p.slug = ?) AND p.status = 'approved'
    `).get(id, id);

    if (!product) {
      return errorResponse('Product not found', 404);
    }

    // Get related products from same category
    const related = db.prepare(`
      SELECT id, name, slug, price, images, metal_type
      FROM products
      WHERE category_id = ? AND id != ? AND status = 'approved'
      ORDER BY RANDOM()
      LIMIT 4
    `).all(product.category_id, product.id);

    return jsonResponse({
      product: {
        ...product,
        price: product.price / 100,
        compare_at_price: product.compare_at_price ? product.compare_at_price / 100 : null,
        images: JSON.parse(product.images || '[]'),
        ring_sizes: JSON.parse(product.ring_sizes || '[]'),
      },
      related: related.map(r => ({
        ...r,
        price: r.price / 100,
        images: JSON.parse(r.images || '[]'),
      })),
    });
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}
