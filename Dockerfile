# Use the TLS version of the Node.js image as the base image
FROM node:lts

# Set working directory of the image to /app
WORKDIR /app

# Copy package.json and package-lock.json from my machine to the image's working directory
COPY package*.json ./

# Install application dependencies using npm install
RUN npm install

# Copies application code from my machine (.) to the image's working directory (.)
COPY . .

# Expose port 3000, which the app runs on
EXPOSE 3000

# Specify the command to run the app when the container runs by running npm start to start the Express server
CMD ["npm", "start"]