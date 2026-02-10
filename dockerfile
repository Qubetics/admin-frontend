# ---- Build Stage ----
    FROM node:20-alpine AS build
    WORKDIR /app
    
    COPY package*.json ./
    RUN npm install --force
    
    COPY . .
    RUN npm run build
    
    # ---- Production Stage ----
    FROM nginx:alpine
    
    # Create provider directory and copy build output into it
    RUN mkdir -p /usr/share/nginx/html/provider
    
    COPY --from=build /app/dist /usr/share/nginx/html/provider
    
    # Copy Nginx config
    COPY nginx.conf /etc/nginx/conf.d/default.conf
    
    # Nginx listens on 3000
    EXPOSE 3000
    
    CMD ["nginx", "-g", "daemon off;"]