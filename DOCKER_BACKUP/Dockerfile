# Use official Node.js LTS image
FROM node:22.16.0-alpine

# Set working directory
WORKDIR /API

# Copy package.json and package-lock.json first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application
COPY . .

# Expose the port that your app runs on
ENV PORT=3000
EXPOSE 3000

# Start the application
CMD ["node", "index.js"]
