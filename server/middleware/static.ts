import { defineEventHandler, serveStatic } from 'h3';
import { readFile, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';

/**
 * Middleware to serve static assets from the built client bundle (dist/client).
 * Uses h3's serveStatic with custom node filesystem handlers.
 */
export default defineEventHandler((event) => {
  const clientDist = resolve(process.cwd(), 'dist', 'client');

  return serveStatic(event, {
    getContents: (id) => readFile(join(clientDist, id)),
    getMeta: async (id) => {
      try {
        const stats = await stat(join(clientDist, id));
        if (stats.isFile()) {
          return {
            size: stats.size,
            mtime: stats.mtimeMs,
          };
        }
      } catch {
        // Ignored, will fall through to next handler
      }
      return undefined;
    },
  });
});
