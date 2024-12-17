import { supabase } from './supabaseClient.ts';

export async function processFile(fileArrayBuffer: ArrayBuffer): Promise<string> {
  const chunkSize = 256 * 1024;
  const chunks: string[] = [];
  
  for (let i = 0; i < fileArrayBuffer.byteLength; i += chunkSize) {
    const chunk = fileArrayBuffer.slice(i, Math.min(i + chunkSize, fileArrayBuffer.byteLength));
    const uint8Array = new Uint8Array(chunk);
    const binary = Array.from(uint8Array, byte => String.fromCharCode(byte)).join('');
    chunks.push(btoa(binary));
  }
  
  return chunks.join('');
}

export async function verifyFileExists(filePath: string): Promise<boolean> {
  try {
    console.log('Checking file existence for path:', filePath);
    
    // Clean the file path (remove 'cvs/' prefix if present)
    const cleanPath = filePath.replace(/^cvs\//, '');
    console.log('Clean path:', cleanPath);
    
    // First try to get the file directly
    const { data: fileData, error: fileError } = await supabase.storage
      .from('cvs')
      .download(cleanPath);

    if (fileData) {
      console.log('File found directly:', cleanPath);
      return true;
    }

    if (fileError) {
      console.log('Error getting file directly:', fileError);
      
      // If direct download fails, try listing the files
      const { data: listData, error: listError } = await supabase.storage
        .from('cvs')
        .list('', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' },
        });

      if (listError) {
        console.error('Error listing files:', listError);
        return false;
      }

      const fileExists = listData.some(file => file.name === cleanPath);
      console.log('File exists in listing?', fileExists, 'Clean path:', cleanPath);
      return fileExists;
    }

    return false;
  } catch (error) {
    console.error('Error in verifyFileExists:', error);
    return false;
  }
}

export async function getSignedUrl(filePath: string): Promise<string> {
  const cleanPath = filePath.replace(/^cvs\//, '');
  const { data, error } = await supabase.storage
    .from('cvs')
    .createSignedUrl(cleanPath, 300);

  if (error) {
    console.error('Signed URL error:', error);
    throw new Error(`Failed to get signed URL: ${error.message}`);
  }
  if (!data?.signedUrl) {
    throw new Error('No signed URL received');
  }
  
  return data.signedUrl;
}

export async function downloadFile(url: string): Promise<ArrayBuffer> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.arrayBuffer();
  } finally {
    clearTimeout(timeout);
  }
}