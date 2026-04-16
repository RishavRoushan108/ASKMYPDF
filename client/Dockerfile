# /client/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files first to use Docker caching
COPY package*.json ./
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Build the Next.js app
# This turns your TSX/TS into optimized JS
RUN npm run build

EXPOSE 3000

# Start the Next.js production server
CMD ["npm", "start"]