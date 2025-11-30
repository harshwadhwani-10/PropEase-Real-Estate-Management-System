# ---------- Build Stage ----------
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies ONLY from client folder
COPY ./client/package.json ./client/package-lock.json ./
RUN npm ci

# Copy client source code
COPY ./client ./

# Copy .env from client into build root
COPY ./client/.env .env

# Build Vite project (env vars get injected here)
RUN npm run build

# ---------- Nginx Stage ----------
FROM nginx:alpine

# Copy static files
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx config
COPY ./client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]




# # ---------- Build Stage ----------
# FROM node:20-alpine AS build
# WORKDIR /app

# # Install dependencies
# COPY package.json package-lock.json ./
# RUN npm ci

# # Copy source
# COPY . .

# # Build production site (Vite will inline the VITE_* env vars at build time)
# RUN npm run build

# # ---------- Nginx Stage ----------
# FROM nginx:alpine

# WORKDIR /usr/share/nginx/html

# # Copy React build
# COPY --from=build /app/dist .

# # Copy custom Nginx config to the proper place
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]