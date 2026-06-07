import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const STORAGE_BUCKET = 'menu-images';

function canUseSupabaseStorage() {
  return (
    Boolean(process.env.SUPABASE_URL) &&
    Boolean(process.env.SUPABASE_SERVICE_KEY) &&
    !process.env.SUPABASE_SERVICE_KEY.startsWith('http')
  );
}

function createSupabaseClient() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
  });
}

function dataUrlFromFile(file) {
  return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
}

function apiImageUrlFor(baseUrl, objectPath) {
  return `${(baseUrl || '').replace(/\/$/, '')}/api/images?path=${encodeURIComponent(objectPath)}`;
}

function objectPathFor(file) {
  const originalExt = file.originalname.split('.').pop()?.toLowerCase() || 'jpg';
  const safeExt = originalExt.replace(/[^a-z0-9]/g, '') || 'jpg';
  return `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${safeExt}`;
}

export async function uploadMenuImage(file, { baseUrl } = {}) {
  if (!canUseSupabaseStorage()) {
    return { url: dataUrlFromFile(file), storage: 'memory' };
  }

  try {
    const supabase = createSupabaseClient();
    const objectPath = objectPathFor(file);
    const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(objectPath, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

    if (error) throw error;

    return {
      url: apiImageUrlFor(baseUrl, objectPath),
      path: objectPath,
      storage: 'supabase'
    };
  } catch (error) {
    console.warn(`Using in-memory upload fallback: ${error.code || error.message}`);
    return { url: dataUrlFromFile(file), storage: 'memory' };
  }
}

export async function downloadMenuImage(objectPath) {
  if (!canUseSupabaseStorage()) {
    const error = new Error('Image storage is not configured.');
    error.status = 503;
    throw error;
  }

  const supabase = createSupabaseClient();
  const { data, error } = await supabase.storage.from(STORAGE_BUCKET).download(objectPath);

  if (error) {
    const downloadError = new Error(error.message || 'Image not found.');
    downloadError.status = error.statusCode === '404' ? 404 : 502;
    throw downloadError;
  }

  return {
    buffer: Buffer.from(await data.arrayBuffer()),
    contentType: data.type || 'application/octet-stream'
  };
}
