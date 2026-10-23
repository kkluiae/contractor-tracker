# Contractor Location Tracker (Wrangler + Workers + D1)

This version uses **Cloudflare Workers + Static Assets + D1**.  
It does **not** rely on Pages Functions.

## Project Structure

```
contractor-tracker-wrangler/
├── public/
│   └── index.html          ← Frontend UI
├── src/
│   └── index.js            ← Worker (API + asset routing)
├── wrangler.toml           ← Configuration
├── schema.sql              ← Database table
├── package.json
└── README.md
```

---

## Step-by-step setup

### 1. Install Node.js (if you don’t have it)

Download from https://nodejs.org (LTS version is fine).

### 2. Open a terminal in this folder and install Wrangler

```bash
npm install
```

### 3. Login to Cloudflare

```bash
npx wrangler login
```

This opens a browser window so you can authorize Wrangler.

### 4. Create the D1 database

```bash
npx wrangler d1 create contractor-db
```

You will see output like:

```
[[d1_databases]]
binding = "DB"
database_name = "contractor-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**Copy the `database_id`** and paste it into `wrangler.toml`  
(replace `REPLACE_WITH_YOUR_DATABASE_ID`).

### 5. Create the table in the real (remote) database

```bash
npx wrangler d1 execute contractor-db --remote --file=./schema.sql
```

### 6. Test locally (optional but recommended)

```bash
# Create the table in the local SQLite too
npx wrangler d1 execute contractor-db --local --file=./schema.sql

# Start local dev server
npx wrangler dev
```

Open http://127.0.0.1:8787 in your browser.  
You can add locations and they will be stored in the **local** D1 database.

### 7. Deploy to Cloudflare

```bash
npx wrangler deploy
```

After a few seconds you will get a public URL, for example:

```
https://contractor-tracker.<your-subdomain>.workers.dev
```

This URL works on phones.

---

## Useful commands

| Command | What it does |
|---------|--------------|
| `npx wrangler dev` | Local development server |
| `npx wrangler deploy` | Deploy to production |
| `npx wrangler d1 execute contractor-db --remote --command="SELECT * FROM locations"` | Query production data |
| `npx wrangler d1 execute contractor-db --local --command="SELECT * FROM locations"` | Query local data |

---

## How it works

1. Browser loads `index.html` from the static assets.
2. Frontend calls `/api/locations` (GET) and `/api/location` (POST).
3. The Worker (`src/index.js`) intercepts `/api/*` requests and talks to D1.
4. All other requests are passed to the static assets (`env.ASSETS`).

---

## Troubleshooting

**“D1 binding not found”**  
→ Make sure you replaced `database_id` in `wrangler.toml` and ran `wrangler deploy` again.

**Empty list / errors on the page**  
→ Did you run the `schema.sql` against the **remote** database?  
  (`--remote` flag is required for production)

**Local data disappears after restart**  
→ That is normal. Local D1 is temporary. Use `--remote` for real data.
