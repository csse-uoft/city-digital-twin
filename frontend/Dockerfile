# Use an official Node.js runtime as a parent image
FROM node:16

# Set the working directory in the container
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app will run on
EXPOSE 3001

# Set environment variable for development (can be overridden by docker-compose)
ENV NODE_ENV=development

# Run the frontend application (make sure this is the right command for your frontend)
CMD ["npm", "start"]
