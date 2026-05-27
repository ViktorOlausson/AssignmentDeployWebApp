#!/bin/sh
set -eu

case "${DATABASE_URL:-}" in
  file:*)
    db_path="${DATABASE_URL#file:}"
    mkdir -p "$(dirname "$db_path")"
    ;;
esac

npx prisma migrate deploy
node prisma/seed.js

exec node dist/server.js
