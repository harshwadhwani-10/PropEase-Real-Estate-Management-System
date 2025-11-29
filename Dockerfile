# Backend Dockerfile (builds server and optional client static)
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install server dependencies (production)
COPY package*.json ./
RUN npm install --production

# Copy everything
COPY . .

# NOTE: Client is built in its own `client/Dockerfile` (multi-stage) and
# served by nginx. Building the client here required devDependencies
# (like `vite`) which are omitted when running `npm install --production`,
# causing `vite: not found`. To keep the backend image small and avoid
# installing devDependencies, the client build step was removed.

ENV PORT=8000
EXPOSE 8000

CMD ["node", "api/index.js"]
