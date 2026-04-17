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
    const orders = db.prepare(`
      SELECT * FROM orders ORDER BY created_at DESC
    `).all();

    return jsonResponse({
      orders: orders.map(o => ({
        ...o,
        subtotal: o.subtotal / 100,
        total: o.total / 100,
        items: JSON.parse(o.items || '[]'),
        shipping_address: typeof o.shipping_address === 'string' ? JSON.parse(o.shipping_address) : o.shipping_address,
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
    const { order_id, status } = await request.json();
    if (!order_id || !status) return errorResponse('order_id and status required');

    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, order_id);
    return jsonResponse({ message: `Order ${status}` });
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}
