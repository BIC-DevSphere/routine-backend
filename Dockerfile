# Step 1: Use an official Node.js image as a base
FROM node:20

# Step 2: Set the working directory in the container
WORKDIR /app

# Step 3: Copy package.json and package-lock.json files to the container
COPY package.json ./

COPY package-lock.json ./ 

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of the application files to the container
COPY . .

# Step 6: Expose the port on which your app runs
EXPOSE 3000

# Step 7: Define the command to run the app
CMD ["npx", "nodemon", "src/index.ts"]
