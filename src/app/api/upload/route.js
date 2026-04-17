import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { authenticateVendor } from '../../../lib/auth';
import { getDb } from '../../../lib/db';
import { jsonResponse, errorResponse } from '../../../lib/helpers';

export async function POST(request) {
  try {
    const db = getDb();
    const vendor = authenticateVendor(request, db);
    if (!vendor) return errorResponse('Unauthorized', 401);

    const formData = await request.formData();
    const files = formData.getAll('images');

    if (!files || files.length === 0) {
      return errorResponse('No images provided');
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const urls = [];
    for (const file of files) {
      if (!file.type?.startsWith('image/')) continue;

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext = file.name?.split('.').pop() || 'jpg';
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const filepath = path.join(uploadDir, filename);

      await writeFile(filepath, buffer);
      urls.push(`/uploads/${filename}`);
    }

    return jsonResponse({ urls, count: urls.length }, 201);
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}
