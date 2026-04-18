/**
 * Must be imported before any `server/` module that loads `db.js`.
 * Allows CI / deep-verify without a real `.env` for static load checks only.
 */
import 'dotenv/config'

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    'postgres://deepverify:deepverify@127.0.0.1:65432/deepverify_placeholder'
}
