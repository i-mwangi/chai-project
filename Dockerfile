# Stage 1: Builder - Install dependencies
FROM node:18-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy dependency definition files
COPY package.json ./
# If you have a pnpm-lock.yaml, uncomment the next line
# COPY pnpm-lock.yaml ./

# Install dependencies
# Using --frozen-lockfile is a best practice for CI/CD and Docker builds
RUN pnpm install --frozen-lockfile

# Copy the rest of the application source code
COPY . .

# The 'build' script seems to be for your backend. If you have a frontend-specific
# build step, you would run it here. For now, we'll skip it as it serves static files.
# RUN pnpm run frontend:build


# Stage 2: Production - Create the final, lean image
FROM node:18-alpine

WORKDIR /app

# Copy dependencies and source code from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/frontend ./frontend

# Copy the .env.example file. The user will mount their own .env file.
COPY .env.example ./.env.example

# Expose the ports the application will run on
EXPOSE 3000 3002

# The CMD will be provided by docker-compose to select which server to run.