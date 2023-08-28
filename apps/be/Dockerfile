# Use an official Node.js runtime as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

#Copy package.json and yarn.lock into the container
COPY package.json yarn.lock ./

#Copy package.json files from each package into the container
COPY apps/be/package.json ./apps/be/
COPY packages/api/package.json ./packages/api/
COPY packages/app-db/package.json ./packages/app-db/
COPY packages/movie-swipe-db/package.json ./packages/movie-swipe-db/
COPY packages/config/ ./packages/config/

# Install app dependencies
RUN yarn install

# Copy the entire monorepo into the container
COPY . .

# Set the working directory to the app's location
WORKDIR /usr/src/app/apps/be

# Expose the port that the app will listen on
EXPOSE 3000

# Command to run your Node.js application
CMD ["yarn", "be:prod"]

