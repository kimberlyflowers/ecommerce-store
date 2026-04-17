const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

function generateToken(vendor) {
  return jwt.sign(
    { id: vendor.id, email: vendor.email, business_name: vendor.business_name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

function generateApiKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = 'rk_';
  for (let i = 0; i < 40; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

// Extract vendor from request (JWT or API key)
function authenticateVendor(request, db) {
  // Check API key header first
  const apiKey = request.headers.get('x-api-key');
  if (apiKey) {
    const vendor = db.prepare('SELECT * FROM vendors WHERE api_key = ? AND status = ?').get(apiKey, 'approved');
    if (vendor) return vendor;
  }

  // Check JWT Bearer token
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    const vendor = db.prepare('SELECT * FROM vendors WHERE id = ?').get(payload.id);
    if (vendor) return vendor;
  }

  return null;
}

module.exports = { generateToken, verifyToken, generateApiKey, authenticateVendor };
