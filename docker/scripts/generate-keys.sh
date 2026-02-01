#!/bin/bash
# Q-Prime JWT Key Generation Script
# Usage: ./docker/scripts/generate-keys.sh
#
# Wrapper for generateKeys.mjs that outputs JWT keys for Convex Auth.
# Add the output to your .env.docker file.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "=========================================="
echo "Generating JWT Keys for Convex Auth"
echo "=========================================="
echo ""

# Check if node is available
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is required but not installed."
    echo "Install Node.js: https://nodejs.org/"
    exit 1
fi

# Check if generateKeys.mjs exists
if [ ! -f "$PROJECT_ROOT/generateKeys.mjs" ]; then
    echo "Error: generateKeys.mjs not found in project root"
    exit 1
fi

# Install jose if not present
if [ ! -d "$PROJECT_ROOT/node_modules/jose" ]; then
    echo "Installing jose dependency..."
    cd "$PROJECT_ROOT"
    npm install jose --save-dev
    echo ""
fi

# Run the key generation script
cd "$PROJECT_ROOT"
echo "Generated keys (add to .env.docker):"
echo ""
node generateKeys.mjs
echo ""
echo "=========================================="
echo ""
echo "IMPORTANT: Keep these keys secure!"
echo "Never commit them to version control."
