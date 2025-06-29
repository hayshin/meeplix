# PostgreSQL Migration Guide

This guide explains how to migrate from SQLite to PostgreSQL in the Narrari project.

## Overview

The Narrari project has been converted from SQLite to PostgreSQL for better scalability, concurrent connections, and production readiness. This migration includes:

- Database schema conversion from SQLite to PostgreSQL
- UUID primary keys instead of text IDs
- Proper foreign key relationships with cascade deletes
- Timestamp fields with timezone support
- Docker-based PostgreSQL setup

## Changes Made

### 1. Schema Changes (`src/db/schema.ts`)

**Before (SQLite):**
```typescript
export const gameSessions = sqliteTable("game_sessions", {
  id: text("id").primaryKey(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$type<Date>()
    .notNull(),
  // ...
});
```

**After (PostgreSQL):**
```typescript
export const gameSessions = pgTable("game_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  // ...
});
```

### 2. Database Connection (`src/db/index.ts`)

- Changed from `drizzle-orm/bun-sqlite` to `drizzle-orm/postgres-js`
- Added environment variable support for database configuration
- Improved error handling and connection management

### 3. Key Improvements

- **UUIDs**: All IDs are now proper UUIDs instead of text
- **Foreign Keys**: Proper relationships with cascade deletes
- **Timestamps**: Timezone-aware timestamps
- **Indexes**: Added performance indexes
- **Connection Pooling**: Better connection management

## Setup Instructions

### 1. Start PostgreSQL Database

```bash
# Start PostgreSQL with Docker Compose
docker-compose up -d postgres

# Or use the setup script
./scripts/dev-setup.sh
```

### 2. Environment Configuration

Copy the environment template:
```bash
cp server/.env.example server/.env
```

Edit `.env` if needed (default values should work for development):
```env
DATABASE_URL=postgresql://narrari_user:narrari_password@localhost:5432/narrari_db
DB_HOST=localhost
DB_PORT=5432
DB_NAME=narrari_db
DB_USER=narrari_user
DB_PASSWORD=narrari_password
```

### 3. Install Dependencies

```bash
cd server
bun install
```

### 4. Initialize Database

```bash
# Push schema to database
bun run db:push

# Or start the development server (it will auto-initialize)
bun run dev
```

## Database Management

### Available Scripts

```bash
# Generate migration files
bun run db:generate

# Apply migrations
bun run db:migrate

# Push schema changes directly
bun run db:push

# Open Drizzle Studio (database GUI)
bun run db:studio

# Drop all tables
bun run db:drop
```

### Database Access

- **PostgreSQL**: `localhost:5432`
- **Adminer (Web GUI)**: `http://localhost:8080`
- **Drizzle Studio**: `bun run db:studio`

### Adminer Login

- **System**: PostgreSQL
- **Server**: postgres (or localhost if accessing from host)
- **Username**: narrari_user
- **Password**: narrari_password
- **Database**: narrari_db

## Docker Commands

```bash
# Start only PostgreSQL
docker-compose up -d postgres

# Start PostgreSQL and Adminer
docker-compose up -d

# View database logs
docker-compose logs postgres

# Stop services
docker-compose down

# Reset database (WARNING: deletes all data)
docker-compose down -v
./scripts/dev-setup.sh
```

## Migration Notes

### Data Compatibility

The new PostgreSQL schema is compatible with existing game logic. Key changes:

1. **IDs**: Now UUIDs instead of text strings
2. **Timestamps**: Proper timezone support
3. **Booleans**: Native boolean type instead of integers
4. **Foreign Keys**: Proper referential integrity

### Performance Improvements

- Added indexes on frequently queried columns
- Better connection pooling
- Optimized queries with proper foreign keys

### Production Considerations

- Environment variables for all configuration
- Health checks for Docker containers
- Proper error handling and logging
- Graceful connection closing

## Troubleshooting

### Common Issues

**1. PostgreSQL not starting:**
```bash
# Check if port 5432 is in use
lsof -i :5432

# Check Docker logs
docker-compose logs postgres
```

**2. Connection refused:**
```bash
# Ensure PostgreSQL is healthy
docker exec narrari_postgres pg_isready -U narrari_user -d narrari_db

# Check environment variables
cat server/.env
```

**3. Schema out of sync:**
```bash
# Reset and recreate tables
bun run db:drop
bun run db:push
```

**4. Permission errors:**
```bash
# Ensure proper file permissions
chmod +x scripts/dev-setup.sh
```

### Database Reset

To completely reset the database:

```bash
# Stop containers and remove volumes
docker-compose down -v

# Restart setup
./scripts/dev-setup.sh
```

## Development Workflow

1. **Start development environment:**
   ```bash
   ./scripts/dev-setup.sh
   ```

2. **Make schema changes:**
   - Edit `src/db/schema.ts`
   - Run `bun run db:push` to apply changes

3. **View data:**
   - Use `bun run db:studio` for Drizzle Studio
   - Use `http://localhost:8080` for Adminer

4. **Production deployment:**
   - Use environment variables for database connection
   - Run migrations with `bun run db:migrate`
   - Ensure proper backup strategies

## Benefits of PostgreSQL Migration

1. **Scalability**: Better performance with multiple concurrent users
2. **Data Integrity**: Proper foreign keys and constraints
3. **Production Ready**: Robust database suitable for deployment
4. **Tooling**: Better development tools and monitoring
5. **Standards**: Industry-standard database with extensive ecosystem