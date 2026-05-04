import { getSupabaseClient } from '../lib/supabaseClient';

const productImagesBucket = 'product-images';

function getFileExtension(file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase();
  return extension && extension.length <= 5 ? extension : 'jpg';
}

export async function uploadProductImage(file: File) {
  const supabase = getSupabaseClient();
  const filePath = `${crypto.randomUUID()}.${getFileExtension(file)}`;

  const { error } = await supabase.storage.from(productImagesBucket).upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(productImagesBucket).getPublicUrl(filePath);
  return data.publicUrl;
}
