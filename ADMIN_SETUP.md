## Admin Dashboard Setup Guide

### Prerequisites
- User must be registered in Supabase `auth.users`
- User must have a profile in `profiles` table
- User's profile must have `role = 'admin'` in the `role` column

### Step 1: Add Role Column to Database (if needed)

If your database was created before the role column was added, you need to run the migration:

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Create a new query and paste the content from `database/migrations/001_add_role_to_profiles.sql`
4. Click **Run**

### Step 2: Set User Role to Admin

Once the migration is applied:

1. In Supabase SQL Editor, run:
```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'your-admin-email@example.com';
```

Replace `your-admin-email@example.com` with your actual admin email address.

### Step 3: Verify Role Assignment

```sql
SELECT id, email, role FROM public.profiles WHERE email = 'your-admin-email@example.com';
```

You should see: `admin` in the role column.

### Step 4: Access Admin Dashboard

1. Sign out and sign back in with your admin account
2. Navigate to `/admin`
3. You should now have access to the admin dashboard

### Debug Tips

If you still can't access the admin dashboard, check the browser console (F12) for debug logs starting with `[v0]`:

- `[v0] AdminGuard: Checking access` - Shows current user, role, and loading state
- `[v0] Auth context: Fetching user role with token` - Indicates role fetch is in progress
- `[v0] Auth context: Got role from API: admin` - Shows the role retrieved from API
- `[v0] User role API: user = ... role = admin` - Shows the server-side role fetch result

### Troubleshooting

**Issue:** Role shows as 'client' instead of 'admin'
- **Solution:** Check that you ran the UPDATE query with the correct email address in Supabase SQL Editor

**Issue:** Getting infinite redirect loop
- **Solution:** Make sure your user profile has the `role` column. Run the migration from Step 1.

**Issue:** 404 on `/admin` after redirecting from login
- **Solution:** Verify that your user is authenticated and has `role = 'admin'` in the database
