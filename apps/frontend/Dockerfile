# ================================
# Build stage
# ================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first for better layer caching
COPY package*.json ./

RUN npm ci

# Copy application source
COPY . .

# Render provides service environment variables
# as Docker build arguments.
ARG VITE_API_BASE_URL

# Make the argument available to Vite during npm run build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build the Vite application
RUN npm run build


# ================================
# Production stage
# ================================
FROM nginx:alpine

# Copy compiled Vite assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Render detects nginx on port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]