import { defineNitroConfig } from 'nitropack/config';

export default defineNitroConfig({
  handlers: [
    {
      route: '/**',
      handler: './server/middleware/static.ts',
      middleware: true,
    },
  ],
});
