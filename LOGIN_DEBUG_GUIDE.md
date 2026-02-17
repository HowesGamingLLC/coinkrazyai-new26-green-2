# Login Error Debug & Fix Guide

## Issue
Getting error: `[API Error] /api/auth/login: Invalid username or password`

## Root Cause
The error occurs when:
1. Test users haven't been seeded to the database yet
2. Database is empty or doesn't have the username
3. Password hash mismatch or corrupted password data

## Solutions

### Solution 1: Use the Debug Check Endpoint (Recommended)
First, check if test users exist:

```bash
curl http://localhost:8080/api/auth/debug/check-users
```

**Response if users exist:**
```json
{
  "success": true,
  "message": "Test user check complete",
  "testUsersAvailable": [
    {
      "username": "johndoe",
      "name": "John Doe",
      "email": "john@example.com",
      "status": "Active",
      "hasPasswordHash": true,
      "createdAt": "2026-02-17T00:00:00.000Z"
    }
  ],
  "hint": "Test credentials - username: johndoe, password: testpass123"
}
```

**Response if users are missing:**
```json
{
  "success": true,
  "message": "Test user check complete",
  "testUsersAvailable": [
    {
      "username": "johndoe",
      "found": false
    }
  ],
  "hint": "Test credentials - username: johndoe, password: testpass123"
}
```

### Solution 2: Re-seed Test Users

If test users don't exist, use this endpoint to create/update them:

```bash
curl -X POST http://localhost:8080/api/auth/debug/reseed-users
```

**Success Response:**
```json
{
  "success": true,
  "message": "Reseeded test users - Created: 4, Updated: 0",
  "testCredentials": {
    "username": "johndoe",
    "password": "testpass123"
  }
}
```

After reseeding, you can now login with:
- **Username:** `johndoe`
- **Password:** `testpass123`

### Solution 3: Register a New User

If you want to create your own account instead:

1. Go to the Registration page
2. Fill in:
   - Username: `yourname`
   - Name: `Your Name`
   - Email: `youremail@example.com`
   - Password: (at least 6 characters)
3. Click Register

Then login with your new credentials

### Solution 4: Check Database Directly

If you have database access, you can verify users exist:

```sql
-- Check if any players exist
SELECT COUNT(*) FROM players;

-- Check specific user
SELECT username, email, status, password_hash FROM players WHERE username = 'johndoe';

-- Check if password_hash column exists
SELECT column_name FROM information_schema.columns 
WHERE table_name='players' AND column_name='password_hash';
```

## Available Test Users

After seeding, the following test users are available:

| Username | Name | Email | Password | Balance |
|----------|------|-------|----------|---------|
| johndoe | John Doe | john@example.com | testpass123 | 5,250 GC, 125 SC |
| janesmith | Jane Smith | jane@example.com | testpass123 | 12,000 GC, 340 SC |
| mikejohnson | Mike Johnson | mike@example.com | testpass123 | 2,100 GC, 89 SC |
| sarahwilson | Sarah Wilson | sarah@example.com | testpass123 | 8,500 GC, 215 SC |

## Admin Account

The admin account is automatically created during initialization:

- **Email:** `coinkrazy26@gmail.com`
- **Password:** `admin123`
- **Access:** Admin Dashboard

## Troubleshooting Steps

### Step 1: Check if Database is Running
Verify the database connection:
```bash
curl http://localhost:8080/api/games
```
If you get a response with games data, database is connected.

### Step 2: Check Test Users Exist
```bash
curl http://localhost:8080/api/auth/debug/check-users
```
Look at the response to see if users are listed.

### Step 3: Re-seed if Needed
If users are missing:
```bash
curl -X POST http://localhost:8080/api/auth/debug/reseed-users
```

### Step 4: Verify Login Works
After seeding:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"johndoe","password":"testpass123"}'
```

Should return:
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "player": {
    "id": 1,
    "username": "johndoe",
    "name": "John Doe",
    "email": "john@example.com",
    "status": "Active"
  }
}
```

## Common Issues & Solutions

### "Invalid username or password"
- **Cause:** Username doesn't exist or password is wrong
- **Fix:** Check with debug endpoint, then reseed if needed

### "Account is suspended or inactive"
- **Cause:** User status is not 'Active'
- **Fix:** The reseed endpoint sets status to 'Active', so reseed will fix this

### "Database unavailable"
- **Cause:** Database connection failed
- **Fix:** Check if database is running and DATABASE_URL is set

### "No test users found"
- **Cause:** Seeding didn't run during initialization
- **Fix:** Use reseed endpoint to create them

## Debugging Logs

Watch the server logs for helpful information:

```
[Auth] Attempting login for username: johndoe
[Auth] Found player: johndoe with status: Active
[Auth] Password verification for johndoe: SUCCESS
```

If you see:
- `Username not found:` - User doesn't exist, use reseed
- `account status is: Suspended` - User is inactive, reseed will fix
- `Password verification ... FAILED` - Wrong password or corrupted hash

## Password Hashing Details

Passwords are hashed using bcrypt (10 rounds) and stored as:
- Type: VARCHAR(255)
- Column: `password_hash`
- Algorithm: bcrypt
- Never stored plain text

If password verification fails but user exists:
- The stored hash may be corrupted
- Reseed endpoint will fix by rehashing the password

## Production Notes

The debug endpoints (`/api/auth/debug/*`) should be:
- **Development:** Always enabled for debugging
- **Production:** Considered for security (optional to disable)
- **Recommended:** Keep enabled but require admin authentication if needed

To disable in production, comment out these lines in `server/index.ts`:
```typescript
// app.get("/api/auth/debug/check-users", handleDebugCheckUsers);
// app.post("/api/auth/debug/reseed-users", handleDebugReseedUsers);
```

## Summary

1. Check if users exist: `/api/auth/debug/check-users`
2. If missing, re-seed: `/api/auth/debug/reseed-users`
3. Login with: `johndoe` / `testpass123`
4. Or register a new account

The issue should be resolved after these steps!
