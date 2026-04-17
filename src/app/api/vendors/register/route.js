import { getDb } from '../../../../lib/db';
import { generateToken, generateApiKey } from '../../../../lib/auth';
import { generateId, jsonResponse, errorResponse } from '../../../../lib/helpers';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const db = getDb();
    const { business_name, email, password, description, website } = await request.json();

    if (!business_name || !email || !password) {
      return errorResponse('business_name, email, and password are required');
    }

    const existing = db.prepare('SELECT id FROM vendors WHERE email = ?').get(email);
    if (existing) {
      return errorResponse('Email already registered', 409);
    }

    const id = generateId('vnd');
    const password_hash = bcrypt.hashSync(password, 10);
    const api_key = generateApiKey();

    db.prepare(`
      INSERT INTO vendors (id, business_name, email, password_hash, api_key, description, website)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, business_name, email, password_hash, api_key, description || null, website || null);

    const vendor = db.prepare('SELECT id, business_name, email, api_key, status, created_at FROM vendors WHERE id = ?').get(id);
    const token = generateToken(vendor);

    return jsonResponse({
      vendor,
      token,
      message: 'Registration successful. Your account is pending approval. Save your API key - you will need it to upload products.'
    }, 201);
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}
