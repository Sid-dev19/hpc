# MongoDB to Supabase Migration Guide

## Overview
This guide outlines the migration of the HPC Platform from MongoDB to Supabase PostgreSQL database.

## Completed Changes

### 1. Database Configuration
- ✅ Installed `@supabase/supabase-js` client
- ✅ Created `server/config/supabase.js` configuration file
- ✅ Updated environment variables in `.env`

### 2. Database Schema
- ✅ Created complete SQL schema in `server/database/supabase_schema.sql`
- ✅ Converted all MongoDB collections to PostgreSQL tables
- ✅ Added proper indexes and triggers for `updated_at` timestamps

### 3. Authentication System
- ✅ Updated authentication middleware to use Supabase queries
- ✅ Modified auth controllers to work with Supabase
- ✅ Maintained JWT-based authentication flow

### 4. API Routes Updated
- ✅ Updated users route to use Supabase queries
- ✅ Maintained all existing API endpoints and functionality
- ✅ Updated data relationships to use Supabase joins

### 5. Seed Script
- ✅ Converted seed script to use Supabase
- ✅ Maintains all demo accounts and relationships

## Setup Instructions

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

### 2. Set Up Database Schema
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and run the contents of `server/database/supabase_schema.sql`

### 3. Configure Environment
Update `server/.env` with your Supabase credentials:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Run Seed Script
```bash
cd server
node utils/seed.js
```

### 5. Start Application
```bash
npm run dev
```

## Key Differences

### Data Types
- MongoDB ObjectId → PostgreSQL UUID
- MongoDB arrays → PostgreSQL arrays
- MongoDB timestamps → PostgreSQL TIMESTAMP WITH TIME ZONE

### Relationships
- MongoDB references → PostgreSQL foreign keys
- Mongoose populate → Supabase joins with `_join` syntax

### Queries
- MongoDB queries → Supabase SQL queries
- Mongoose methods → Supabase client methods

## Testing
- All existing API endpoints should work without changes
- Authentication flow remains the same
- Frontend requires no modifications

## Notes
- The application maintains the same API contract
- All user roles and permissions are preserved
- Demo accounts are automatically created during seeding
