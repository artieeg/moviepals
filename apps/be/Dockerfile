# Use an official Node.js runtime as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the entire monorepo into the container
COPY . .

# Install app dependencies
RUN yarn install

# Set the working directory to the app's location
WORKDIR /usr/src/app/apps/be

# Expose the port that the app will listen on
EXPOSE 3000

# Command to run your Node.js application
CMD ["yarn", "be:prod"]

