const { v4: uuidv4 } = require('uuid');

function generateId(prefix = '') {
  const id = uuidv4().replace(/-/g, '').slice(0, 16);
  return prefix ? `${prefix}_${id}` : id;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function formatPrice(cents) {
  return (cents / 100).toFixed(2);
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function errorResponse(message, status = 400) {
  return jsonResponse({ error: message }, status);
}

module.exports = { generateId, slugify, formatPrice, jsonResponse, errorResponse };
