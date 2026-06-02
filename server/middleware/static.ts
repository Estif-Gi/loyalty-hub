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
    getContents: (id) => {
      const filePath = join(clientDist, id);
      console.log(`[static-middleware] serving content for id="${id}" from filepath="${filePath}"`);
      return readFile(filePath);
    },
    getMeta: async (id) => {
      const filePath = join(clientDist, id);
      try {
        const stats = await stat(filePath);
        if (stats.isFile()) {
          console.log(`[static-middleware] file found for id="${id}" (size=${stats.size})`);
          return {
            size: stats.size,
            mtime: stats.mtimeMs,
          };
        }
      } catch (err) {
        console.log(`[static-middleware] file NOT found for id="${id}" at filepath="${filePath}":`, err instanceof Error ? err.message : err);
      }
      return undefined;
    },
  });
});
