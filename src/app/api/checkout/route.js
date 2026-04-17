import Stripe from 'stripe';
import { getDb } from '../../../lib/db';
import { generateId, jsonResponse, errorResponse } from '../../../lib/helpers';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export async function POST(request) {
  try {
    const db = getDb();
    const { items, customer_email, customer_name, shipping_address } = await request.json();

    if (!items?.length || !customer_email || !customer_name || !shipping_address) {
      return errorResponse('items, customer_email, customer_name, and shipping_address are required');
    }

    // Validate products and calculate totals
    const lineItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = db.prepare("SELECT * FROM products WHERE id = ? AND status = 'approved'").get(item.product_id);
      if (!product) {
        return errorResponse(`Product ${item.product_id} not found or not available`);
      }
      if (product.inventory_count < (item.quantity || 1)) {
        return errorResponse(`Insufficient inventory for ${product.name}`);
      }

      const qty = item.quantity || 1;
      subtotal += product.price * qty;

      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            description: `${product.metal_type || ''} ${product.stone_type || ''}`.trim(),
            images: JSON.parse(product.images || '[]').slice(0, 1),
          },
          unit_amount: product.price,
        },
        quantity: qty,
      });
    }

    // Create Stripe checkout session
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email,
      success_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/shop?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/shop?cancelled=true`,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB'],
      },
    });

    // Save order
    const orderId = generateId('ord');
    db.prepare(`
      INSERT INTO orders (id, customer_email, customer_name, shipping_address, items, subtotal, total, stripe_payment_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `).run(orderId, customer_email, customer_name, JSON.stringify(shipping_address), JSON.stringify(items), subtotal, subtotal, session.id);

    return jsonResponse({ checkout_url: session.url, order_id: orderId });
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}
