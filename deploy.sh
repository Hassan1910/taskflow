#!/bin/bash

# Azure App Service deployment script for Next.js

echo "Starting deployment..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Build the application
echo "Building Next.js application..."
npm run build

echo "Deployment completed successfully!"
