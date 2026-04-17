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
    const vendors = db.prepare(`
      SELECT id, business_name, email, status, website, description, created_at,
             (SELECT COUNT(*) FROM products WHERE vendor_id = vendors.id) as product_count
      FROM vendors ORDER BY created_at DESC
    `).all();
    return jsonResponse({ vendors });
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}

export async function PATCH(request) {
  if (!checkAdmin(request)) return errorResponse('Unauthorized', 401);
  try {
    const db = getDb();
    const { vendor_id, status } = await request.json();
    if (!vendor_id || !status) return errorResponse('vendor_id and status required');
    if (!['pending', 'approved', 'suspended'].includes(status)) return errorResponse('Invalid status');

    db.prepare('UPDATE vendors SET status = ?, updated_at = datetime(?) WHERE id = ?')
      .run(status, 'now', vendor_id);

    return jsonResponse({ message: `Vendor ${status}` });
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}
