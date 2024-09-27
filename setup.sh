#!/bin/bash

cd frontend
if ! pnpm install; then
    echo "Frontend dependency installation failed."
    exit 1
fi

if ! pnpm build; then
    echo "Frontend build failed."
    exit 1
fi

cd ..

# Install backend dependencies
if ! pip install -r backend/requirements.txt; then
    echo "Backend dependency installation failed."
    exit 1
fi

echo "Build completed successfully."