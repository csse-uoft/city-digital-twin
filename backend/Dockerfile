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
EXPOSE 3000

# Define environment variable (You can set it directly in your docker-compose)
ENV NODE_ENV=development

# Run the backend application
CMD ["npm", "start"]
