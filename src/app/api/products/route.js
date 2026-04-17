import { getDb } from '../../../lib/db';
import { jsonResponse, errorResponse } from '../../../lib/helpers';

// GET - Public product listing
export async function GET(request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'newest';
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    const metal = searchParams.get('metal');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '24'), 100);
    const offset = (page - 1) * limit;

    let where = "WHERE p.status = 'approved'";
    const params = [];

    if (category) {
      where += ' AND c.slug = ?';
      params.push(category);
    }
    if (search) {
      where += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (minPrice) {
      where += ' AND p.price >= ?';
      params.push(Math.round(parseFloat(minPrice) * 100));
    }
    if (maxPrice) {
      where += ' AND p.price <= ?';
      params.push(Math.round(parseFloat(maxPrice) * 100));
    }
    if (metal) {
      where += ' AND p.metal_type = ?';
      params.push(metal);
    }

    const orderBy = {
      newest: 'p.created_at DESC',
      price_asc: 'p.price ASC',
      price_desc: 'p.price DESC',
      name: 'p.name ASC',
    }[sort] || 'p.created_at DESC';

    const countRow = db.prepare(`
      SELECT COUNT(*) as total FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${where}
    `).get(...params);

    const products = db.prepare(`
      SELECT p.id, p.name, p.slug, p.description, p.price, p.compare_at_price,
             p.metal_type, p.stone_type, p.carat_weight, p.ring_sizes, p.images,
             p.inventory_count, c.name as category_name, c.slug as category_slug,
             v.business_name as vendor_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN vendors v ON p.vendor_id = v.id
      ${where}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    return jsonResponse({
      products: products.map(p => ({
        ...p,
        price: p.price / 100,
        compare_at_price: p.compare_at_price ? p.compare_at_price / 100 : null,
        images: JSON.parse(p.images || '[]'),
        ring_sizes: JSON.parse(p.ring_sizes || '[]'),
      })),
      pagination: {
        page,
        limit,
        total: countRow.total,
        pages: Math.ceil(countRow.total / limit),
      }
    });
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}
