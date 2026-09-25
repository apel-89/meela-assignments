create table submissions (
    id uuid primary key default gen_random_uuid(),
    answers jsonb not null default '{}'::jsonb,
    current_step int not null default 0,
    completed boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);