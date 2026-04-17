import { getDb } from '../../../lib/db';
import { jsonResponse, errorResponse } from '../../../lib/helpers';

export async function GET() {
  try {
    const db = getDb();
    const categories = db.prepare(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id AND p.status = 'approved'
      GROUP BY c.id
      ORDER BY c.name
    `).all();

    return jsonResponse({ categories });
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}
