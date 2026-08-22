# PostgreSQL Migration Guide

This guide explains how to migrate the Dayflow HRMS backend from SQLite (development) to PostgreSQL (production).

## Prerequisites

- PostgreSQL 14+ installed and running
- Database credentials (username, password, host, port)
- Access to create databases and manage schemas

## Step-by-Step Migration

### 1. Install PostgreSQL

**Windows:**
```bash
# Download from https://www.postgresql.org/download/windows/
# Or use chocolatey
choco install postgresql
```

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Production Database

```bash
# Connect to PostgreSQL as admin
psql -U postgres

# Create database
CREATE DATABASE dayflow_hrms;

# Create user with password
CREATE USER dayflow_user WITH PASSWORD 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE dayflow_hrms TO dayflow_user;

# Exit psql
\q
```

### 3. Update Environment Variables

Update your `.env` file:

```env
# Comment out SQLite
# DATABASE_URL="file:./dev.db"

# Add PostgreSQL connection string
DATABASE_URL="postgresql://dayflow_user:your_secure_password@localhost:5432/dayflow_hrms?schema=public"
```

**Connection String Format:**
```
postgresql://[username]:[password]@[host]:[port]/[database]?schema=[schema]
```

**Examples:**

Local PostgreSQL:
```
postgresql://dayflow_user:password123@localhost:5432/dayflow_hrms?schema=public
```

Heroku Postgres:
```
postgresql://user:pass@ec2-host.compute-1.amazonaws.com:5432/dbname
```

Supabase:
```
postgresql://postgres:password@db.project-ref.supabase.co:5432/postgres
```

### 4. Run Database Migrations

Prisma will automatically create the schema in PostgreSQL:

```bash
cd server

# Generate Prisma Client for PostgreSQL
npm run prisma:generate

# Create database schema
npx prisma migrate dev --name init

# Or for production (without interactive prompts)
npx prisma migrate deploy
```

### 5. Seed the Database

```bash
# Seed with test data
npm run prisma:seed
```

This will create:
- 1 HR Admin account (hr@dayflow.com / Test@123)
- 10 Employee accounts (employee1-10@dayflow.com / Test@123)
- 7 days of attendance records
- Sample leave requests
- Payroll data

### 6. Verify Migration

Check that tables were created:

```bash
# Connect to database
psql -U dayflow_user -d dayflow_hrms

# List all tables
\dt

# You should see:
# User, Employee, Attendance, LeaveRequest, Payroll,
# SalarySlip, Document, Notification, ActivityLog

# Check record counts
SELECT 'Users' as table_name, COUNT(*) FROM "User"
UNION ALL
SELECT 'Employees', COUNT(*) FROM "Employee"
UNION ALL
SELECT 'Attendance', COUNT(*) FROM "Attendance";

# Exit
\q
```

### 7. Test API Connection

```bash
# Start the server
npm run dev

# Test health endpoint
curl http://localhost:5000/api/health

# Test login
curl -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "hr@dayflow.com",
    "password": "Test@123"
  }'
```

## Data Migration (SQLite to PostgreSQL)

If you have existing data in SQLite that you want to migrate:

### Option 1: Use Prisma's Data Platform

```bash
# Export from SQLite
npx prisma db pull --schema=./prisma/schema-sqlite.prisma

# Import to PostgreSQL
npx prisma db push --schema=./prisma/schema.prisma
```

### Option 2: Manual Export/Import

```bash
# Install pgloader
sudo apt install pgloader  # Linux
brew install pgloader       # macOS

# Run migration (adjust paths)
pgloader --with "include no drop" \
  sqlite://./dev.db \
  postgresql://dayflow_user:password@localhost/dayflow_hrms
```

### Option 3: Custom Migration Script

Create a migration script in `server/scripts/migrate.ts`:

```typescript
import { PrismaClient as SQLiteClient } from '@prisma/client';
import { PrismaClient as PostgreSQLClient } from '@prisma/client';

const sqlite = new SQLiteClient({
  datasources: { db: { url: 'file:./dev.db' } },
});

const postgres = new PostgreSQLClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

async function migrate() {
  // Migrate users
  const users = await sqlite.user.findMany();
  for (const user of users) {
    await postgres.user.create({ data: user });
  }

  // Migrate employees
  const employees = await sqlite.employee.findMany();
  for (const employee of employees) {
    await postgres.employee.create({ data: employee });
  }

  // ... migrate other tables

  console.log('Migration completed!');
}

migrate().finally(() => {
  sqlite.$disconnect();
  postgres.$disconnect();
});
```

## Production Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000

# PostgreSQL (use environment-specific URL)
DATABASE_URL="postgresql://..."

# JWT (use strong secret in production)
JWT_SECRET=your-very-long-random-secret-key-here
JWT_EXPIRES_IN=7d

# Email (configure real SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-app-password
FRONTEND_URL=https://your-frontend.com

# CORS
ALLOWED_ORIGINS=https://your-frontend.com,https://www.your-frontend.com
```

### Hosting Providers

**Recommended PostgreSQL Hosting:**

1. **Supabase** (Free tier available)
   - Managed PostgreSQL
   - Automatic backups
   - Built-in auth (optional)
   - Connection pooling
   ```
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
   ```

2. **Railway** (Free tier available)
   - One-click PostgreSQL deployment
   - Automatic backups
   - Easy integration with Node.js apps
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   ```

3. **Heroku Postgres** (Free tier deprecated, paid plans available)
   - Managed PostgreSQL
   - Automatic backups
   - Dataclips for analytics

4. **AWS RDS**
   - Production-grade
   - Multi-AZ deployments
   - Automated backups
   - Pay-as-you-go

5. **DigitalOcean Managed Databases**
   - Affordable pricing
   - Automated backups
   - Easy scaling

### Connection Pooling

For production, use connection pooling to optimize database connections:

**Install pg-pool:**
```bash
npm install pg-pool
```

**Update Prisma Client:**

```typescript
// src/utils/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
```

**Using Prisma Data Proxy (for serverless):**
```
DATABASE_URL="prisma://aws-us-east-1.prisma-data.com/?api_key=..."
```

## Performance Optimization

### 1. Indexes

Already included in `schema.prisma`:
```prisma
@@index([employeeId, date])
@@index([status])
@@index([userId])
```

### 2. Connection Pool Configuration

```env
# Add to DATABASE_URL
DATABASE_URL="postgresql://...?connection_limit=10&pool_timeout=20"
```

### 3. Enable Query Logging

```typescript
// Only in development
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'info', 'warn', 'error']
    : ['error'],
});
```

## Troubleshooting

### Connection Refused
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution:** Ensure PostgreSQL is running
```bash
sudo systemctl status postgresql
sudo systemctl start postgresql
```

### Authentication Failed
```
Error: password authentication failed for user "dayflow_user"
```
**Solution:** Check credentials in DATABASE_URL

### Schema Out of Sync
```
Error: The schema is out of sync with the database
```
**Solution:** Run migrations
```bash
npx prisma migrate dev
```

### SSL Connection Required
```
Error: SSL connection required
```
**Solution:** Add SSL to connection string
```
DATABASE_URL="postgresql://...?sslmode=require"
```

## Rollback Plan

If migration fails:

1. **Keep SQLite backup:**
   ```bash
   cp dev.db dev.db.backup
   ```

2. **Switch back to SQLite:**
   ```env
   DATABASE_URL="file:./dev.db"
   ```

3. **Regenerate Prisma Client:**
   ```bash
   npx prisma generate
   ```

## Monitoring

### Database Health Checks

```sql
-- Active connections
SELECT count(*) FROM pg_stat_activity;

-- Database size
SELECT pg_size_pretty(pg_database_size('dayflow_hrms'));

-- Table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

## Security Best Practices

1. **Use strong passwords** for database users
2. **Limit database access** to application server IPs only
3. **Enable SSL/TLS** for database connections
4. **Regular backups** (automated daily backups recommended)
5. **Separate credentials** for development, staging, and production
6. **Never commit** .env files to version control
7. **Rotate credentials** periodically
8. **Use least privilege** principle for database users

## Next Steps

After successful migration:

1. ✅ Run comprehensive API tests
2. ✅ Set up automated backups
3. ✅ Configure monitoring/alerts
4. ✅ Load test the application
5. ✅ Document deployment procedures
6. ✅ Train team on production operations

## Support

For issues:
- Prisma Docs: https://www.prisma.io/docs
- PostgreSQL Docs: https://www.postgresql.org/docs/
- Dayflow HRMS: Check README.md and API documentation
