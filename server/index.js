import server from './server.js';
import path from 'node:path';
import fs from 'node:fs';

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const filePath = path.join(process.cwd(), 'dist/client', url.pathname);
    
    try {
      if (fs.existsSync(filePath)) {
        const stat = fs.statSync(filePath);
        if (stat.isFile()) {
          return new Response(Bun.file(filePath));
        }
      }
    } catch (e) {
      // Ignore and fall through
    }

    return server.fetch(request);
  }
};
