# MoneyMap - Personal Finance Tracker
## Now using Supabase (PostgreSQL)

### STEP 1: Create Supabase Project
1. Go to https://supabase.com → sign up free
2. Click New Project, wait ~1 min

### STEP 2: Run SQL Setup
1. Supabase Dashboard → SQL Editor → New Query
2. Paste contents of backend/supabase_setup.sql
3. Click Run → should say "Success. No rows returned"
4. Check Table Editor → you should see users + transactions tables

### STEP 3: Get Your Keys
Supabase Dashboard → Settings → API
- Copy "Project URL"
- Copy "service_role" key (NOT the anon key)

### STEP 4: Backend
  cd moneymap/backend
  npm install
  copy .env.example .env
  (edit .env with your Supabase URL, service_role key, and a JWT secret)
  npm run dev

Expected output:
  MoneyMap server running on port 5000
  Supabase connected successfully

### STEP 5: Frontend
  cd moneymap/frontend
  npm install
  npm start

Opens at http://localhost:3000

### Troubleshooting
- "relation users does not exist" → run supabase_setup.sql in SQL Editor
- 401 errors → log out and back in, check JWT_SECRET in .env
- Connection failed → use service_role key not the anon key
