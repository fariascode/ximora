type ErrorLike = {
  message?: string;
  code?: string;
  details?: string;
  error?: string;
  statusCode?: string | number;
  status?: string | number;
  name?: string;
};

function readErrorMessage(error: ErrorLike) {
  return [error.message, error.details, error.error].filter(Boolean).join(' ').toLowerCase();
}

export function getErrorMessage(error: unknown, fallback: string) {
  if (!error || typeof error !== 'object') {
    return fallback;
  }

  const currentError = error as ErrorLike;
  const message = readErrorMessage(currentError);
  const status = String(currentError.statusCode ?? currentError.status ?? '');

  if (message.includes('register_sale') || message.includes('function')) {
    return 'Falta ejecutar `supabase/register_sale.sql` en Supabase para registrar ventas.';
  }

  if (message.includes('product-images') || message.includes('bucket') || message.includes('storage')) {
    return 'No existe el bucket `product-images` en Supabase o no tiene permisos listos.';
  }

  if (message.includes('products') || message.includes('relation') || status === '404') {
    return 'No existe la tabla `products` en el proyecto de Supabase conectado. Ejecuta `supabase/schema.sql` en ese proyecto.';
  }

  if (currentError.message) {
    return currentError.message;
  }

  return fallback;
}

export function isForeignKeyReferenceError(error: unknown) {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const currentError = error as ErrorLike;
  const message = readErrorMessage(currentError);

  return currentError.code === '23503' || message.includes('foreign key constraint') || message.includes('still referenced');
}
