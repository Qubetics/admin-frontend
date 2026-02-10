FROM node:20-alpine

WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm install --force

# Copy source & build
COPY . .
RUN npm run build

# Vite preview serves dist correctly with base path
EXPOSE 4173

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]