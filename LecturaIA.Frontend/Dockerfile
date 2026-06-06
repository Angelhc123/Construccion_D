# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Remove local .env file to ensure production env is used
RUN rm -f .env

# Receive backend URL as build argument
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Create .env.production with the build arg (replaces the COPY)
RUN echo "VITE_API_URL=${VITE_API_URL}" > .env.production

# Build the application (Vite will use .env.production automatically)
RUN npm run build

# Stage 2: Production with Nginx
FROM nginx:alpine AS production

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]