# ---- Build Stage ----
FROM node:20-alpine AS build
# Set working directory
WORKDIR /app

# Copy package.json and lock file first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm install --force

# Copy the rest of the app
COPY . .

# Build the Vite project (output goes to /app/dist)
RUN npm run build

# ---- Production Stage ----
FROM nginx:alpine

# Copy built files to Nginx web root
COPY --from=build /app/dist /usr/share/nginx/html

# Copy default Nginx config (optional, custom port, caching, etc.)
# If you want to change port or setup SPA fallback:
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]