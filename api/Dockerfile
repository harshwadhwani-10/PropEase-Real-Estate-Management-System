FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --production

COPY . .

ENV PORT=8000
EXPOSE 8000

CMD ["node", "index.js"]



# # Backend Dockerfile (builds server and optional client static)
# FROM node:18-alpine

# # Create app directory
# WORKDIR /usr/src/app

# # Install server dependencies (production)
# COPY package*.json ./
# RUN npm install --production

# # Copy everything
# COPY . .

# ENV PORT=8000
# EXPOSE 8000

# CMD ["node", "index.js"]
