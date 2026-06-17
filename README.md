# CuratedLodges — Local Setup Guide (Windows)

Step-by-step instructions to run the **backend** and **frontend** on a Windows
machine, load the sample data, and open the admin panel.

This assumes you have already cloned **both** repositories into the same folder, so
your folder looks like this:

```
Curated_Lodges_Development\
├── CuratedLodges\            ← frontend (Next.js)
└── CuratedLodges_Backend\    ← backend (Express + Prisma + PostgreSQL)
```

> If your folder names are different, just use your actual folder names in the
> `cd` commands below.

Use **PowerShell** (or Windows Terminal). You will keep **two terminals open** at
the end — one for the backend, one for the frontend.

---

## 1. Install prerequisites (one time)

1. **Node.js LTS (v20 or newer)** — download from <https://nodejs.org> and install
   with default options. This also installs `npm`.
2. **PostgreSQL (v14 or newer)** — download from
   <https://www.postgresql.org/download/windows/> (the EDB installer).
   - During installation it asks you to set a **password for the `postgres` user** —
     **write this password down, you will need it below.**
   - Keep the default port **5432**.
   - This also installs **pgAdmin** (a database GUI) and **psql**.

Verify Node is installed (open PowerShell):

```powershell
node -v
npm -v
```

Both should print a version number.

---

## 2. Create the database (one time)

The app needs an empty PostgreSQL database named **`curated_lodges`**.

**Easiest way — pgAdmin (GUI):**
1. Open **pgAdmin** (installed with PostgreSQL).
2. Connect using the `postgres` password you set during install.
3. In the left tree: right-click **Databases → Create → Database…**
4. Name it exactly `curated_lodges` and click **Save**.

**Alternative — command line:** open PowerShell and run (it will prompt for the
`postgres` password):

```powershell
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -c "CREATE DATABASE curated_lodges;"
```

> Adjust `16` to your installed PostgreSQL version if needed.

---

## 3. Start the BACKEND

Open a **first** PowerShell terminal.

```powershell
cd CuratedLodges_Backend

# 3a. Create the .env file from the template
copy .env.example .env
```

**3b. Edit the database connection.** Open `CuratedLodges_Backend\.env` in a text
editor (VS Code or Notepad) and update this line so the password matches the
`postgres` password you set during PostgreSQL install:

```
DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/curated_lodges
```

- Replace `YOUR_POSTGRES_PASSWORD` with your actual password.
- If your password literally is `postgres`, you can leave the line as-is.
- Keep `@localhost:5432/curated_lodges` unchanged (unless you used a different port
  or database name).

Save the file. Then, back in the terminal:

```powershell
# 3c. Install dependencies
npm install

# 3d. Generate the database client
npx prisma generate

# 3e. Create all the tables
npx prisma migrate deploy

# 3f. Load the sample data + admin account
npm run seed

# 3g. Start the backend (leave this terminal running)
npm run dev
```

When it works you will see:

```
🚀 CuratedLodges Backend running on port 4000
📡 API: http://localhost:4000/api/v1
```

**Leave this terminal open.** The backend is now running on
<http://localhost:4000>.

---

## 4. Start the FRONTEND

Open a **second** PowerShell terminal (do not close the backend one).

```powershell
cd CuratedLodges

# 4a. Create the .env.local file pointing the frontend at the backend
Set-Content -Path .env.local -Value "NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1"

# 4b. Install dependencies
npm install

# 4c. Start the frontend (leave this terminal running)
npm run dev
```

When it works you will see something like `Local: http://localhost:3000`.

**Leave this terminal open too.**

---

## 5. Open the site and the admin panel

- **Public website:** <http://localhost:3000>
- **Admin panel login:** <http://localhost:3000/admin/login>

**Admin login:**

| | |
|---|---|
| Email | `admin@curatedlodges.com` |
| Password | `69wU£19!eT}kN73{` |

After logging in you can open any section in the left sidebar (Lodges, Parks,
Field Notes, Testimonials, Bookings, etc.) and test creating/editing entries
through the forms. A sample lodge to look at on the public site:
<http://localhost:3000/park/india/kanha-national-park/surwahi-social-ecoestate>

---

## 6. Running it again later

You don't need to repeat the install/migrate/seed steps next time. Just:

1. Make sure PostgreSQL is running (it runs as a Windows service automatically).
2. Terminal 1: `cd CuratedLodges_Backend` → `npm run dev`
3. Terminal 2: `cd CuratedLodges` → `npm run dev`
4. Open <http://localhost:3000/admin/login>

---

## 7. Troubleshooting

**"Unable to connect" errors on the website / admin panel**
The backend isn't running or the database isn't reachable. Make sure Terminal 1
shows "running on port 4000" with no errors.

**Prisma error `P1000` (authentication failed)**
The password in `CuratedLodges_Backend\.env` `DATABASE_URL` is wrong. Fix it to
match your `postgres` password and re-run `npx prisma migrate deploy`.

**Prisma error `P1003` (database does not exist)**
You skipped Step 2. Create the `curated_lodges` database, then re-run
`npx prisma migrate deploy`.

**`npx prisma migrate deploy` reports no pending migrations / fails**
Run this instead, then re-seed:
```powershell
npx prisma migrate dev
npm run seed
```

**Port 4000 or 3000 already in use**
Close other apps using those ports, or restart the machine, then start again.

**Admin panel forms show empty dropdowns (no parks/lodges)**
The seed didn't run. In Terminal 1 (backend folder) run `npm run seed` again
(it's safe to run multiple times), then refresh the page.

---

## Quick reference

| What | Value |
|---|---|
| Backend URL | http://localhost:4000/api/v1 |
| Frontend URL | http://localhost:3000 |
| Admin login | http://localhost:3000/admin/login |
| Admin email / password | `admin@curatedlodges.com` / `69wU£19!eT}kN73{` |
| Database name | `curated_lodges` |
| Backend env file | `CuratedLodges_Backend\.env` (copied from `.env.example`) |
| Frontend env file | `CuratedLodges\.env.local` (create with `NEXT_PUBLIC_API_URL`) |
