# -------------------------------------------------
#  1️⃣  Builder – compile the Vite app
# -------------------------------------------------
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install only the lock‑file first so Docker can cache this layer
COPY package.json package-lock.json ./
RUN npm ci                     # fast, reproducible install

# Copy the rest of the source code & build
COPY . .
RUN npm run build             # → creates /app/dist (static assets)

# -------------------------------------------------
#  2️⃣  Runtime – serve the static files with Nginx
# -------------------------------------------------
FROM nginx:stable-alpine AS runner

# Copy the built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Use our custom Nginx config (see below)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the HTTP port
EXPOSE 80

# Nginx runs in foreground
CMD ["nginx", "-g", "daemon off;"]