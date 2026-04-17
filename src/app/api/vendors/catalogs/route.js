import { getDb } from '../../../../lib/db';
import { authenticateVendor } from '../../../../lib/auth';
import { generateId, slugify, jsonResponse, errorResponse } from '../../../../lib/helpers';

// POST - Bulk upload catalog (array of products)
export async function POST(request) {
  try {
    const db = getDb();
    const vendor = authenticateVendor(request, db);
    if (!vendor) return errorResponse('Unauthorized', 401);
    if (vendor.status !== 'approved') return errorResponse('Vendor account not yet approved', 403);

    const { products } = await request.json();

    if (!Array.isArray(products) || products.length === 0) {
      return errorResponse('products array is required');
    }

    if (products.length > 100) {
      return errorResponse('Maximum 100 products per batch upload');
    }

    const insert = db.prepare(`
      INSERT INTO products (id, vendor_id, category_id, name, slug, description, price, compare_at_price, metal_type, stone_type, carat_weight, ring_sizes, images, sku, inventory_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const results = { created: 0, errors: [] };

    const bulkInsert = db.transaction((items) => {
      for (const item of items) {
        try {
          if (!item.name || !item.price) {
            results.errors.push({ name: item.name, error: 'name and price are required' });
            continue;
          }

          const id = generateId('prod');
          const slug = slugify(item.name) + '-' + id.slice(-6);

          insert.run(
            id, vendor.id, item.category_id || null, item.name, slug,
            item.description || null,
            Math.round(item.price * 100),
            item.compare_at_price ? Math.round(item.compare_at_price * 100) : null,
            item.metal_type || null, item.stone_type || null,
            item.carat_weight || null,
            JSON.stringify(item.ring_sizes || []),
            JSON.stringify(item.images || []),
            item.sku || null, item.inventory_count || 0
          );
          results.created++;
        } catch (err) {
          results.errors.push({ name: item.name, error: err.message });
        }
      }
    });

    bulkInsert(products);

    return jsonResponse({
      message: `Catalog uploaded: ${results.created} products created`,
      created: results.created,
      errors: results.errors,
    }, 201);
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}
