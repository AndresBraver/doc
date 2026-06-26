# Clínica · Recordatorios

App para que **doctores y secretaría** registren pacientes (peso, edad, contacto), sus **vacunas** y **citas**, y que a los pacientes les lleguen **recordatorios por email y SMS** automáticamente.

Stack: **Next.js 14** · **Supabase** (auth + DB) · **Resend** (email) · **Twilio** (SMS) · **Vercel** (deploy + cron).

---

## 1. Supabase

1. Crea un proyecto en supabase.com.
2. Ve a **SQL Editor** y pega TODO el contenido de `supabase/schema.sql` → **Run**.
3. En **Project Settings → API** copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` (el JWT **largo**, NO el que empieza con `sb_secret_`) → `SUPABASE_SERVICE_ROLE_KEY`
4. (Opcional) En **Authentication → Providers → Email** desactiva "Confirm email" para entrar más rápido en pruebas.

## 2. Resend (email)

1. Crea cuenta en resend.com, verifica tu dominio (o usa `onboarding@resend.dev` para pruebas).
2. Copia el API key → `RESEND_API_KEY`.
3. `RESEND_FROM` → ej. `Clinica <recordatorios@tudominio.com>`.

## 3. Twilio (SMS)

1. Crea cuenta en twilio.com, consigue un número.
2. Copia `Account SID`, `Auth Token` y el número (`+1...`) a `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM`.
   > Los teléfonos de pacientes deben ir con lada internacional, ej. `+52155...`.

## 4. Local

```bash
npm install
cp .env.example .env.local   # llena tus valores
npm run dev
```
Abre http://localhost:3000 → crea tu cuenta de staff → registra pacientes.

## 5. Deploy en Vercel + GitHub

1. Sube esto a GitHub (`github.com/AndresBraver/...`).
2. En Vercel: **New Project** → importa el repo.
3. Pega todas las variables de `.env.example` con tus valores reales (incluye `CRON_SECRET` con un string largo random).
4. Deploy. El `vercel.json` ya programa el cron **diario 8am CDMX** (`0 14 * * *` UTC).
   > Después de cambiar variables, redeploy con caché limpio.

## Cómo funcionan los recordatorios

Cada día Vercel llama a `/api/cron/recordatorios`, que:
- busca **vacunas** con `proxima_dosis` dentro de los próximos `DIAS_AVISO_VACUNA` días (7 por defecto),
- busca **citas** dentro de `DIAS_AVISO_CITA` días (1 por defecto),
- manda email (Resend) y SMS (Twilio) a cada paciente,
- marca `recordatorio_enviado = true` para no repetir.

Para probarlo manualmente:
```
https://tu-app.vercel.app/api/cron/recordatorios?secret=TU_CRON_SECRET
```

## Notas
- Todo es responsive para iPhone/Mac (Safari). Inputs a 16px para que iOS no haga zoom.
- RLS está activo: solo staff logueado puede ver/editar. Los pacientes NO entran al sistema.
