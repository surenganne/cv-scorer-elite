-- Create the storage bucket if it doesn't exist
insert into storage.buckets (id, name)
values ('cvs', 'cvs')
on conflict do nothing;

-- Allow public access to read files in the cvs bucket
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'cvs' );

-- Allow authenticated users to upload files to the cvs bucket
create policy "Allow Uploads"
on storage.objects for insert
with check ( bucket_id = 'cvs' );

-- Allow authenticated users to update their own files
create policy "Allow Updates"
on storage.objects for update
using ( bucket_id = 'cvs' );

-- Allow authenticated users to delete their own files
create policy "Allow Deletes"
on storage.objects for delete
using ( bucket_id = 'cvs' );
