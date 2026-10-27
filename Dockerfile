# Use an Node.js image
FROM node:alpine

# Create a directory for the application and set ownership
WORKDIR /usr/src/app

# Copy dependency files first for layer caching
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy application files with appropriate ownership
COPY --chown=node:node . .

# Drop privileges to non-root user
USER node

# Expose the port that your application uses
EXPOSE 8080

# Start the application
CMD [ "node", "app.js" ]