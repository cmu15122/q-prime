#!/bin/bash
# Q-Prime Backup Script
# Usage: ./docker/scripts/backup.sh [backup_dir]
#
# Backs up the Convex data volume.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

BACKUP_DIR="${1:-$PROJECT_ROOT/backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "=========================================="
echo "Q-Prime Backup"
echo "=========================================="
echo ""

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Check if SQLite volume exists
if docker volume inspect qprime_convex_data &> /dev/null; then
    echo "Backing up Convex data volume..."

    # Create a temporary container to access the volume
    docker run --rm \
        -v qprime_convex_data:/data:ro \
        -v "$BACKUP_DIR:/backup" \
        alpine \
        tar czf "/backup/convex_data_$TIMESTAMP.tar.gz" -C /data .

    echo "Backup saved: $BACKUP_DIR/convex_data_$TIMESTAMP.tar.gz"
else
    echo "Warning: Convex data volume not found."
    echo "Make sure the Convex backend has been started at least once."
fi

echo ""
echo "=========================================="
echo "Backup complete!"
echo "=========================================="
echo ""

# Show recent backups
echo "Recent backups:"
ls -lh "$BACKUP_DIR"/*.tar.gz 2>/dev/null | tail -5 || echo "  No backups found"
