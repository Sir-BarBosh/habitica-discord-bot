# Use a Node.js image
FROM node:22-alpine

# Create a directory for the application
WORKDIR /usr/src/app

# Copy the application configuration files
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the port that your application uses
EXPOSE 8080

# Start the application
CMD [ "node", "app.js" ]