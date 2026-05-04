# XIMORA Admin

PWA privada para administrar inventario, productos y métricas iniciales del emprendimiento de joyería XIMORA.

## Requisitos

- Node.js 20 o superior
- Cuenta y proyecto en Supabase

## Instalación

```bash
npm install
npm run dev
```

En Windows PowerShell, si `npm` está bloqueado por políticas de ejecución, usa:

```bash
npm.cmd install
npm.cmd run dev
```

## Variables de entorno

Crea un archivo `.env.local` en la raíz:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=tu-publishable-key
```

## Supabase

Ejecuta el SQL de `supabase/schema.sql` en el SQL Editor de Supabase.

Si ya ejecutaste el esquema inicial antes de crear ventas, ejecuta tambien:

```txt
supabase/register_sale.sql
supabase/delete_sale.sql
```

Para limitar el acceso solo a correos autorizados, ejecuta:

```txt
supabase/authorized_users.sql
```

Antes de ejecutarlo, cambia `TU_CORREO@EJEMPLO.COM` por el correo real que usas para entrar.

Bucket sugerido para imágenes:

- Nombre: `product-images`
- Público: sí para esta primera versión simple.

## Estructura

- `src/components`: componentes reutilizables.
- `src/pages`: pantallas principales.
- `src/routes`: rutas públicas y privadas.
- `src/services`: acceso a datos.
- `src/lib`: clientes externos como Supabase.
- `src/hooks`: hooks de estado compartido.
- `src/types`: tipos de TypeScript.
- `src/utils`: utilidades de formato y cálculo.

## Modulos actuales

- Productos: inventario, fotos, stock y archivado.
- Ventas: registro de ventas, descuento de stock y restauracion al eliminar una venta.
- Gastos: registro, edicion, eliminacion, filtros por mes/categoria y metricas basicas.

## Usar en otros dispositivos

### Opcion rapida en la misma red Wi-Fi

Ejecuta:

```bash
npm.cmd run dev -- --host
```

Luego abre en tu iPhone, iPad o computadora la IP local de tu equipo, por ejemplo:

```txt
http://192.168.1.20:5173
```

Tu computadora y el otro dispositivo deben estar en la misma red.

### Opcion recomendada: publicarla con Vercel

1. Sube este proyecto a GitHub.
2. Entra a Vercel e importa el repositorio.
3. Agrega estas variables de entorno en Vercel:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

4. Despliega el proyecto.

Este repo ya incluye `vercel.json` para que las rutas de React funcionen correctamente en produccion.
