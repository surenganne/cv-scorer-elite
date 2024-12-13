-- Enable RLS
alter table storage.objects enable row level security;

-- Allow anonymous uploads to cvs bucket
create policy "Allow anonymous uploads"
on storage.objects for insert
with check (
  bucket_id = 'cvs' 
  and auth.role() = 'anon'
);

-- Allow anonymous reads from cvs bucket
create policy "Allow anonymous reads"
on storage.objects for select
using (
  bucket_id = 'cvs' 
  and auth.role() = 'anon'
);

-- Allow anonymous updates to cvs bucket
create policy "Allow anonymous updates"
on storage.objects for update
using (
  bucket_id = 'cvs' 
  and auth.role() = 'anon'
);

-- Allow anonymous deletes from cvs bucket
create policy "Allow anonymous deletes"
on storage.objects for delete
using (
  bucket_id = 'cvs' 
  and auth.role() = 'anon'
);
