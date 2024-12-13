-- Create the cv_uploads table if it doesn't exist
create table if not exists public.cv_uploads (
  id uuid default gen_random_uuid() primary key,
  file_name text not null,
  file_path text not null,
  content_type text,
  file_size bigint,
  upload_date timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.cv_uploads enable row level security;

-- Create policies
create policy "Public Access"
on public.cv_uploads for select
to authenticated
using (true);

create policy "Enable insert access for authenticated users"
on public.cv_uploads for insert
to authenticated
with check (true);

create policy "Enable update access for authenticated users"
on public.cv_uploads for update
to authenticated
using (true);

create policy "Enable delete access for authenticated users"
on public.cv_uploads for delete
to authenticated
using (true);

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger handle_updated_at
  before update on public.cv_uploads
  for each row
  execute function public.handle_updated_at();
