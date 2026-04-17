import { getDb } from '../../../../lib/db';
import { generateToken } from '../../../../lib/auth';
import { jsonResponse, errorResponse } from '../../../../lib/helpers';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const db = getDb();
    const { email, password } = await request.json();

    if (!email || !password) {
      return errorResponse('email and password are required');
    }

    const vendor = db.prepare('SELECT * FROM vendors WHERE email = ?').get(email);
    if (!vendor || !bcrypt.compareSync(password, vendor.password_hash)) {
      return errorResponse('Invalid credentials', 401);
    }

    const token = generateToken(vendor);

    return jsonResponse({
      vendor: {
        id: vendor.id,
        business_name: vendor.business_name,
        email: vendor.email,
        api_key: vendor.api_key,
        status: vendor.status,
      },
      token,
    });
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}
