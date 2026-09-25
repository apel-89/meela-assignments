set dotenv-load := true

default: dev

db:
    docker compose up -d --wait

migrate: db
    cd backend && sqlx database create && sqlx migrate run

dev: migrate
    #!/usr/bin/env bash
    trap 'kill 0' EXIT
    cd backend && cargo run &
    cd frontend && npm install && npm run dev &
    wait

clean:
    docker compose down -v