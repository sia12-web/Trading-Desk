# Database Fix Guide

## Problems
1. ❌ `bb_sessions` and `bb_trades` tables missing or incomplete → 500 errors on optimizer/BB strategy
2. ❌ `wave_analysis` table missing Daily/4H columns → "Could not find 'daily_screenshot_path'" error

---

## ⚡ QUICK FIX: Fix Everything At Once (RECOMMENDED)

**File:** `FIX_ALL_TABLES.sql`

This single SQL file fixes ALL database issues:
- ✅ Adds missing columns to wave_analysis (Daily + 4H)
- ✅ Creates/fixes bb_sessions table
- ✅ Creates/fixes bb_trades table
- ✅ Sets up all indexes and RLS policies

**Steps:**
1. Go to Supabase Dashboard → SQL Editor
2. Copy the entire contents of `FIX_ALL_TABLES.sql`
3. Paste into SQL Editor
4. Click **Run**
5. You should see: "✅ ALL FIXES APPLIED SUCCESSFULLY!"

**Then:**
```bash
# Restart dev server
Ctrl+C
npm run dev
```

---

## 🔧 Individual Fixes (If you prefer targeted fixes)

### Individual Fix 1: Wave Analysis Table
✅ **Fixes:** "Could not find 'daily_screenshot_path'" error

**File:** `FIX_WAVE_ANALYSIS_ADD_TIMEFRAMES.sql`

**What it does:**
- Adds `daily_screenshot_path` and `daily_wave_count` columns
- Adds `h4_screenshot_path` and `h4_wave_count` columns
- Adds `analysis_type`, `data_payload`, `strategy_config` columns

---

### Individual Fix 2: BB Strategy Tables (Option A - Add Columns)
✅ **Use this if:** You have existing BB sessions/trades you want to keep

**File:** `FIX_BB_TABLES_ADD_COLUMNS.sql`

---

### Individual Fix 3: BB Strategy Tables (Option B - Fresh Start)
✅ **Use this if:** You don't have any BB strategy data yet OR want to start fresh

**File:** `FIX_BB_TABLES_FRESH_START.sql`

---

## After Running the Fix

### Step 1: Restart Dev Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Step 2: Verify Tables Are Fixed
Open in browser:
```
http://localhost:3000/api/diagnostic/database
```

**Expected Output:**
```json
{
  "tables": {
    "bb_sessions": { "exists": true, "has_data": false },
    "bb_trades": { "exists": true, "has_data": false },
    "indicator_optimizations": { "exists": true, "has_data": false }
  },
  "action_required": "All tables exist! ✅"
}
```

### Step 3: Test the APIs
1. **Test Optimizer:**
   - Go to `http://localhost:3000/optimizer`
   - Should load without errors

2. **Test BB Strategy:**
   - Go to Strategy Gate (`/waves`)
   - Run auto-analysis
   - If market is sideways, should unlock BB_STRATEGY
   - Click "Launch BB Strategy"
   - Should load without "created_at does not exist" error

---

## Troubleshooting

### If you still get errors:

**Error: "relation bb_sessions does not exist"**
- The SQL didn't run successfully
- Check Supabase SQL Editor for error messages
- Try Option 2 (Fresh Start) instead

**Error: "column created_at does not exist"**
- Option 1 SQL didn't add the columns
- Try Option 2 (Fresh Start) instead
- Make sure you clicked "Run" in SQL Editor

**Error: "Failed to fetch optimizations"**
- Check if `indicator_optimizations` table exists
- This is a different table - may need separate fix
- Check diagnostic output to see which tables are missing

---

## Quick Copy-Paste SQL

### For Option 1 (Add Columns):
```sql
-- Check C:\Users\shahb\myApplications\Trade Desk\FIX_BB_TABLES_ADD_COLUMNS.sql
-- Copy entire contents of that file
```

### For Option 2 (Fresh Start):
```sql
-- Check C:\Users\shahb\myApplications\Trade Desk\FIX_BB_TABLES_FRESH_START.sql
-- Copy entire contents of that file
```

---

## Need Help?

If both options fail:
1. Share the **exact error** from Supabase SQL Editor
2. Share the output from `/api/diagnostic/database`
3. Share any console errors from the terminal

I can then provide a custom fix!
