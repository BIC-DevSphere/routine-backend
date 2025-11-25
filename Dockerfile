# Step 1: Use an official Node.js image as a base
FROM node:20

# Step 2: Set the working directory in the container
WORKDIR /app

# Step 3: Copy package.json and pnpm-lock.yaml files to the container
COPY package.json ./

COPY pnpm-lock.yaml ./ 

# Step 4: Install pnpm
RUN npm install -g pnpm

# Step 5: Install dependencies
RUN npm install

# Step 6: Copy the rest of the application files to the container
COPY . .

# Step 7: Generate Prisma client before starting the app
RUN pnpx prisma generate

# Step 8: Build the TypeScript files
RUN pnpm run build

# Step 9: Expose the port on which your app runs
EXPOSE 3000

# Step 10: Define the command to run the app
CMD ["pnpm", "run", "start"]
