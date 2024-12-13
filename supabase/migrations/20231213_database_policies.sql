-- Enable RLS on cv_uploads table
alter table public.cv_uploads enable row level security;

-- Allow anonymous inserts to cv_uploads
create policy "Allow anonymous inserts"
on public.cv_uploads for insert
with check (
  auth.role() = 'anon'
);

-- Allow anonymous reads from cv_uploads
create policy "Allow anonymous reads"
on public.cv_uploads for select
using (
  auth.role() = 'anon'
);

-- Allow anonymous updates to cv_uploads
create policy "Allow anonymous updates"
on public.cv_uploads for update
using (
  auth.role() = 'anon'
);

-- Allow anonymous deletes from cv_uploads
create policy "Allow anonymous deletes"
on public.cv_uploads for delete
using (
  auth.role() = 'anon'
);
