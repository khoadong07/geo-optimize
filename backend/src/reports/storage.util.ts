import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export const UPLOADS_ROOT = process.env.UPLOADS_DIR || join(process.cwd(), 'uploads');
export const COVERS_DIR = join(UPLOADS_ROOT, 'covers');
export const FILES_DIR = join(UPLOADS_ROOT, 'files');

export function ensureUploadDirs() {
  for (const dir of [COVERS_DIR, FILES_DIR]) {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  }
}
