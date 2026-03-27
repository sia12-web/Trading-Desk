# Database Diagnostic Check

## 🚨 Quick Fix for BB Strategy Errors

**If you're getting "created_at does not exist" errors:**
👉 **Follow this guide:** `FIX_BB_DATABASE_GUIDE.md`

---

## ✅ Step 1: Test BB Strategy Specifically

Open this URL in your browser:
```
http://localhost:3000/api/diagnostic/bb-test
```

This will test all BB Strategy tables and show you exactly what needs fixing.

---

## ✅ Step 2: Check All Database Tables

Open this URL in your browser:
```
http://localhost:3000/api/diagnostic/database
```

This will show you which tables exist and which are missing.

---

## 📊 Expected Output

### If All Tables Exist:
```json
{
  "tables": {
    "indicator_optimizations": { "exists": true, "has_data": false },
    "bb_sessions": { "exists": true, "has_data": false },
    "bb_trades": { "exists": true, "has_data": false },
    "scalp_sessions": { "exists": true, "has_data": true },
    "wave_analysis": { "exists": true, "has_data": true }
  },
  "summary": {
    "existing_tables": 5,
    "missing_tables": 0
  },
  "action_required": "All tables exist! ✅"
}
```

### If Tables Are Missing:
```json
{
  "tables": {
    "bb_sessions": {
      "exists": false,
      "error": "relation \"public.bb_sessions\" does not exist"
    }
  },
  "summary": {
    "existing_tables": 3,
    "missing_tables": 2
  },
  "action_required": "Missing tables: bb_sessions, bb_trades. Run migrations in Supabase SQL Editor."
}
```

---

## 🔧 Step 2: Fix Missing Tables

If tables are missing, apply the migrations:

### For BB Strategy (bb_sessions, bb_trades):
1. Go to Supabase Dashboard → SQL Editor
2. Copy SQL from `FIX_BB_STRATEGY_DATABASE.md`
3. Click Run

### For Indicator Optimizations (indicator_optimizations):
This table should already exist. If not:
1. Go to Supabase Dashboard → SQL Editor
2. Run:
```sql
-- Check if table exists
SELECT * FROM indicator_optimizations LIMIT 1;
```

If error, the table doesn't exist. Check earlier migrations.

---

## 🐛 Step 3: Check Server Logs

After checking the diagnostic, look at your terminal where `npm run dev` is running.

You should see logs like:
```
🔍 Optimizer list API called
✅ User authenticated: xxx-xxx-xxx
📊 Querying indicator_optimizations table...
❌ Database error: relation "public.bb_sessions" does not exist
```

This will tell you exactly what's failing.

---

## 📝 Step 4: Share Results

If still not working, share:

1. **Diagnostic output** from `/api/diagnostic/database`
2. **Server logs** from terminal
3. **Supabase Table Editor** screenshot showing which tables exist

Then I can give you the exact fix!

---

## ⚡ Quick Fix Checklist

- [ ] Check `/api/diagnostic/database` - which tables are missing?
- [ ] Apply BB Strategy migration if `bb_sessions` missing
- [ ] Restart dev server: `Ctrl+C`, then `npm run dev`
- [ ] Check server logs for detailed error messages
- [ ] Verify in Supabase Table Editor that tables exist

---

## 🎯 Most Likely Issues

1. **BB Strategy tables missing columns** → Follow `FIX_BB_DATABASE_GUIDE.md`
2. **BB Strategy tables not created yet** → Run `FIX_BB_TABLES_FRESH_START.sql`
3. **Server not restarted** → Restart after creating new files
4. **RLS policies blocking access** → Check Supabase RLS settings

---

## 📚 Detailed Fix Guides

### For BB Strategy Issues:
**File:** `FIX_BB_DATABASE_GUIDE.md`
- Complete step-by-step instructions
- Two SQL fix options (add columns OR fresh start)
- Verification steps
- Troubleshooting help

### SQL Files:
- `FIX_BB_TABLES_ADD_COLUMNS.sql` - Add missing columns to existing tables
- `FIX_BB_TABLES_FRESH_START.sql` - Drop and recreate tables (clean start)

Run the diagnostic first, then follow the guide!
