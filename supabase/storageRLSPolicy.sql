-- Policy: Allow authenticated users to upload to 'government-ids' bucket
CREATE POLICY "Allow authenticated upload to government-ids"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'government-ids');

-- Policy: Allow authenticated users to read from 'government-ids' bucket
CREATE POLICY "Allow authenticated read from government-ids"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'government-ids');

-- Policy: Allow authenticated users to upload to 'id-selfies' bucket
CREATE POLICY "Allow authenticated upload to id-selfies"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'id-selfies');

-- Policy: Allow authenticated users to read from 'id-selfies' bucket
CREATE POLICY "Allow authenticated read from id-selfies"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'id-selfies');
