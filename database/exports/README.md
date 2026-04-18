# PostgreSQL exports

`npm run db:export` writes a timestamped **`naptin-pg-*.sql`** here using `DATABASE_URL` from the repo root `.env`.

- **Security:** dumps can include personal data and password hashes. Do **not** commit them to a **public** repository. For private repos only, you may `git add -f` a specific file after review.
- **Restore (production or staging):** see `docs/PRODUCTION_SERVER.md` § Database restore.
