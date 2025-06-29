#!/bin/bash

# Development setup script for Narrari project
set -e

echo "🚀 Setting up Narrari development environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null 2>&1; then
    print_error "Docker Compose is not available. Please install Docker Compose and try again."
    exit 1
fi

# Navigate to project root
cd "$(dirname "$0")/.."

print_status "Starting PostgreSQL database..."

# Start PostgreSQL database with Docker Compose
if command -v docker-compose &> /dev/null; then
    docker-compose up -d postgres
else
    docker compose up -d postgres
fi

# Wait for PostgreSQL to be ready
print_status "Waiting for PostgreSQL to be ready..."
sleep 5

# Check if PostgreSQL is healthy
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if docker exec narrari_postgres pg_isready -U narrari_user -d narrari_db > /dev/null 2>&1; then
        print_status "PostgreSQL is ready!"
        break
    fi
    
    if [ $attempt -eq $max_attempts ]; then
        print_error "PostgreSQL failed to start after $max_attempts attempts"
        exit 1
    fi
    
    print_warning "Waiting for PostgreSQL... (attempt $attempt/$max_attempts)"
    sleep 2
    attempt=$((attempt + 1))
done

# Navigate to server directory
cd server

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    print_status "Creating .env file from .env.example..."
    cp .env.example .env
fi

# Install dependencies
print_status "Installing server dependencies..."
bun install

# Run database migrations/initialization
print_status "Initializing database schema..."
bun run db:push

print_status "✅ Development environment setup complete!"
echo ""
echo "🎮 Your Narrari development environment is ready!"
echo ""
echo "📊 Database Info:"
echo "   - PostgreSQL running on localhost:5432"
echo "   - Database: narrari_db"
echo "   - User: narrari_user"
echo "   - Adminer (DB GUI): http://localhost:8080"
echo ""
echo "🚀 To start development:"
echo "   cd server && bun run dev"
echo ""
echo "🛠️  Database Management:"
echo "   - Generate migrations: bun run db:generate"
echo "   - Push schema changes: bun run db:push"
echo "   - Open Drizzle Studio: bun run db:studio"
echo ""
echo "🐳 Docker Commands:"
echo "   - Stop database: docker-compose down"
echo "   - View logs: docker-compose logs postgres"
echo "   - Reset database: docker-compose down -v && ./scripts/dev-setup.sh"