#!/usr/bin/env python3
"""
Create Owl Talk (Flask) `user` rows for NAPTIN portal demo accounts if missing.

Passwords match the SPA (`src/chat/owlTalkSession.js`): naptin-<hex from email hash>.

Run on the server from repo root (after venv + .env with DATABASE_URL):

  ./dev/venv/bin/python dev/scripts/owl_bootstrap_demo_roster.py

Or: npm run owl:bootstrap-roster
"""
from __future__ import annotations

import os
import sys
from ctypes import c_int32 as _I32

_SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
_DEV_DIR = os.path.dirname(_SCRIPT_DIR)
_REPO_ROOT = os.path.dirname(_DEV_DIR)

sys.path[:0] = [_REPO_ROOT, _DEV_DIR]
os.chdir(_DEV_DIR)


def _to_base36(n: int) -> str:
    """Match JavaScript `Number.prototype.toString(36)` (lowercase)."""
    n = abs(int(n))
    alphabet = "0123456789abcdefghijklmnopqrstuvwxyz"
    if n == 0:
        return "0"
    out = []
    while n:
        n, rem = divmod(n, 36)
        out.append(alphabet[rem])
    return "".join(reversed(out))


def portal_derived_password(email: str) -> str:
    """Must match `src/chat/owlTalkSession.js`: (Math.imul(31,h)+charCode)|0, then `naptin-${Math.abs(h).toString(36)}`."""
    h = 0
    for ch in email.lower().strip():
        h = _I32(_I32(31 * h).value + ord(ch)).value
    return f"naptin-{_to_base36(abs(h))}"


# One row per unique username (portal DEMO_USERS, deduped).
DEMO_ROSTER: tuple[tuple[str, str], ...] = (
    ("adebayo.okonkwo", "a.okonkwo@naptin.gov.ng"),
    ("grace.okafor", "hod@naptin.gov.ng"),
    ("biodun.adeyemi", "director@naptin.gov.ng"),
    ("emmanuel.bello", "ict@naptin.gov.ng"),
    ("ngozi.eze", "audit@naptin.gov.ng"),
)


def main() -> None:
    import main as owl_main  # noqa: PLC0415 — loads Flask app + db + create_all

    from src.models.user import User, db  # noqa: PLC0415

    app = owl_main.app
    created = 0
    skipped = 0
    with app.app_context():
        for username, email in DEMO_ROSTER:
            if User.query.filter_by(email=email).first():
                skipped += 1
                continue
            if User.query.filter_by(username=username).first():
                print(f"[owl-bootstrap] skip username taken: {username!r}")
                skipped += 1
                continue
            u = User(username=username, email=email)
            u.set_password(portal_derived_password(email))
            db.session.add(u)
            created += 1
        if created:
            db.session.commit()
    print(f"[owl-bootstrap] done: created={created}, skipped_existing={skipped}")


if __name__ == "__main__":
    main()
