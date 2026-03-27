# 🔧 Diagnostic Tools Reference

Quick reference for all diagnostic endpoints and fix guides.

---

## 🚨 Current Issue: BB Strategy Errors

**Symptoms:**
- "Failed to fetch active BB session: column bb_sessions.created_at does not exist"
- "Failed to fetch optimizations"
- 500 errors from `/api/optimizer/list` or `/api/bb-strategy/session`

**Fix:**
📖 **Follow:** `FIX_BB_DATABASE_GUIDE.md`

---

## 🔍 Diagnostic Endpoints

### 1. BB Strategy Specific Test
```
http://localhost:3000/api/diagnostic/bb-test
```
**Tests:**
- ✅ Authentication
- ✅ bb_sessions table structure
- ✅ bb_trades table structure
- ✅ RLS policies
- ✅ indicator_optimizations table

**Output:** Pass/Fail for each test + next steps

---

### 2. All Database Tables
```
http://localhost:3000/api/diagnostic/database
```
**Tests:**
- indicator_optimizations
- bb_sessions
- bb_trades
- scalp_sessions
- wave_analysis

**Output:** Which tables exist, which are missing

---

## 📁 Fix Files

### SQL Fixes (Choose ONE):

**Option 1: Add Missing Columns**
- File: `FIX_BB_TABLES_ADD_COLUMNS.sql`
- Use if: You have existing BB strategy data
- Does: Adds created_at and updated_at columns

**Option 2: Fresh Start**
- File: `FIX_BB_TABLES_FRESH_START.sql`
- Use if: No existing data OR want clean slate
- Does: Drops and recreates bb_sessions and bb_trades

---

## 📖 Step-by-Step Guides

### Main Fix Guide
**File:** `FIX_BB_DATABASE_GUIDE.md`
- Complete instructions
- How to choose between Option 1 and 2
- Verification steps
- Troubleshooting

### General Diagnostics
**File:** `DIAGNOSTIC_CHECK.md`
- Overview of all diagnostic tools
- Quick fix checklist
- Common issues

---

## 🔄 Standard Fix Workflow

1. **Diagnose:**
   ```
   Visit: http://localhost:3000/api/diagnostic/bb-test
   ```

2. **Fix:**
   - Open `FIX_BB_DATABASE_GUIDE.md`
   - Choose SQL fix (Option 1 or 2)
   - Run in Supabase SQL Editor

3. **Restart:**
   ```bash
   # Stop server: Ctrl+C
   npm run dev
   ```

4. **Verify:**
   ```
   Visit: http://localhost:3000/api/diagnostic/bb-test
   Should show: "✅ ALL TESTS PASSED"
   ```

5. **Test App:**
   - Go to `/optimizer` - should load
   - Go to `/waves` - run auto-analysis
   - If sideways market, BB Strategy should unlock

---

## 🐛 Still Having Issues?

**Share these with me:**
1. Output from `/api/diagnostic/bb-test`
2. Output from `/api/diagnostic/database`
3. Exact error from Supabase SQL Editor (if SQL failed)
4. Console errors from terminal

Then I can provide a custom fix!
