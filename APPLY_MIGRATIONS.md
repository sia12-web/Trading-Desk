# How to Apply Database Migrations

Since you're using a remote Supabase instance, follow these steps:

## Step 1: Check Current State

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor**
4. Run the diagnostic query from `check-migrations.sql`:

```sql
-- Check which migrations have been applied
SELECT
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name IN (
    'trades',
    'wave_analysis',
    'technical_analyses',
    'scalp_sessions',
    'scalp_trades',
    'ai_coaching_sessions',
    'bb_sessions'
)
AND column_name = 'oanda_account_id'
ORDER BY table_name;
```

## Step 2: Apply Missing Migrations

### Option A: Apply All Migrations in Order (Safest)

If you haven't applied all migrations, run them in order:

1. **Migration 001-017**: Check if these are already applied
2. **Migration 018** (`supabase/migrations/018_account_isolation.sql`):
   - Copy the entire file contents
   - Paste into Supabase SQL Editor
   - Click "Run"

3. **Migration 019** (`supabase/migrations/019_add_missing_columns.sql`):
   - Copy the entire file contents
   - Paste into Supabase SQL Editor
   - Click "Run"

### Option B: Apply Only Migration 019 (If 018 is already applied)

1. Copy contents of `supabase/migrations/019_add_missing_columns.sql`
2. Paste into Supabase SQL Editor
3. Click "Run"
4. Check the **Messages** tab for green checkmarks:
   - ✅ All wave_analysis columns present
   - ✅ technical_analyses table exists
   - ✅ scalp_trades table exists

## Step 3: Verify Success

Run this verification query:

```sql
-- Verify all new tables exist
SELECT
    table_name,
    'exists' as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'technical_analyses',
    'scalp_trades'
)
ORDER BY table_name;

-- Should return 2 rows
```

## Step 4: Restart Your Dev Server

```bash
npm run dev
```

## Common Issues

### "column oanda_account_id does not exist"
- **Solution**: Run migration 018 first, then migration 019

### "table already exists"
- **Solution**: This is okay! The migration uses `IF NOT EXISTS` and will skip

### "function uuid_generate_v4() does not exist"
- **Solution**: Run this first:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

## Manual Migration Method

If the migrations don't work, apply this single consolidated script:

See `MANUAL_FIX.sql` (created next)
