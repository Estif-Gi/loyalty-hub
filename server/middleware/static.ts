import { defineEventHandler, serveStatic } from "h3";
import { resolve } from "path";
import { stat, readFile } from "fs/promises";

export default defineEventHandler((event) => {
  return serveStatic(event, {
    getContents: (id) => readFile(resolve("dist/client" + id)),
    getMeta: async (id) => {
      const stats = await stat(resolve("dist/client" + id)).catch(() => null);
      if (!stats || !stats.isFile()) return;
      return { size: stats.size, mtime: stats.mtimeMs };
    },
  });
});