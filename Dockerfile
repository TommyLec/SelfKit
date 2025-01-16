# Step 1: Use a base Node.js image
FROM node:23-alpine AS builder
# Step 2: Set the working directory
WORKDIR /app
# Step 3: Copy package.json and pnpm-lock.yaml files to optimize cache
COPY package.json pnpm-lock.yaml drizzle.config.ts ./
COPY ./migrations ./migrations
# Step 4: Install pnpm globally
RUN npm install -g pnpm
# Step 5: Install dependencies
RUN pnpm install
# Step 6: Copy the rest of the application files
COPY . .
# Step 7: Build the application
RUN pnpm run build

FROM node:23-alpine

WORKDIR /app

COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
COPY package.json .
COPY pnpm-lock.yaml .
COPY drizzle.config.ts .

# Move folder for drizzle migration 
COPY --from=builder /app/migrations ./migrations

RUN npm install -g pnpm

# Expose the port on which the application runs
EXPOSE 5173
# Apply drizzle migration and start the application in production mode
CMD ["pnpm", "prod"]