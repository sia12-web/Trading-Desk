# Testing Optimizer API

## Issue: "Failed to fetch optimizations"

This error appears on the `/optimizer` page when trying to load optimizations.

## Troubleshooting Steps:

### 1. **Check Browser Console**

Open browser console (F12) and look for:
- Network tab → Check `/api/optimizer/list` request
- Console tab → Look for error messages
- What's the actual HTTP status code?

### 2. **Test API Directly**

Open a new browser tab and go to:
```
http://localhost:3000/api/optimizer/list
```

**Expected Response:**
```json
{
  "success": true,
  "optimizations": []
}
```

**Possible Errors:**
- `401 Unauthorized` → Not logged in
- `500 Internal Server Error` → Database issue
- `404 Not Found` → Route not found (server needs restart)

### 3. **Restart Development Server**

The new API route might not be loaded. Restart:
```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

### 4. **Check Database**

The API queries `indicator_optimizations` table. Make sure:
- Table exists in Supabase
- You have at least one optimization saved
- RLS policies allow reading

### 5. **Test with Existing Optimize Page**

The old `/optimize` page uses `/api/optimizer/results`. Try:
```
http://localhost:3000/optimize
```

If this works but `/optimizer` doesn't, the issue is with the new `/api/optimizer/list` endpoint.

### 6. **Check Console Logs**

The API now logs:
```
✅ Fetched X optimizations for user Y
```

Look for this in your terminal where `npm run dev` is running.

### 7. **Verify File Structure**

Make sure this file exists:
```
app/
  api/
    optimizer/
      list/
        route.ts    ← Should exist
```

---

## Quick Fix: Use Existing Endpoint

If `/api/optimizer/list` isn't working, you can temporarily use the existing endpoint.

**Change in `app/(dashboard)/optimizer/page.tsx`:**

Find line ~40:
```typescript
const res = await fetch('/api/optimizer/list')
```

Change to:
```typescript
const res = await fetch('/api/optimizer/results')
```

Then update the response handling to match the format.

---

## Most Likely Issue:

**Server needs restart** after creating new API routes.

1. Stop server (Ctrl+C)
2. Run `npm run dev`
3. Refresh `/optimizer` page
4. Check browser console for errors

If still not working, share:
1. Browser console error
2. Terminal logs
3. HTTP status code from Network tab
