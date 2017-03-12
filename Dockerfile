FROM node:boron

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install --production

# Copy files
COPY dist /usr/src/app

# Set the running environment as production
ENV NODE_ENV production

# Expose on specified network port
EXPOSE 8080

# Executing defaults
CMD [ "npm", "start" ]