FROM node:20-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
COPY .npmrc ./

# Install dependencies with more explicit flags
RUN npm ci --legacy-peer-deps --production=false

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 4200

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4200

# Start the application
CMD ["npm", "start"] 