import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

async function entrar(formData: FormData) {
  "use server";
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect("/login?error=" + encodeURIComponent("Correo o contraseña incorrectos"));
  redirect("/dashboard");
}

async function registrar(formData: FormData) {
  "use server";
  const nombre = String(formData.get("nombre"));
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nombre } },
  });
  if (error) redirect("/login?error=" + encodeURIComponent(error.message));
  redirect("/login?msg=" + encodeURIComponent("Cuenta creada, ya puedes entrar"));
}

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; msg?: string }>;
}) {
  const sp = await searchParams;
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-marca">Clínica</h1>
        <p className="text-slate-500 text-sm mb-5">Acceso para doctores y secretaría</p>

        {sp.error && (
          <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3 mb-4">{sp.error}</div>
        )}
        {sp.msg && (
          <div className="bg-green-50 text-green-700 text-sm rounded-lg p-3 mb-4">{sp.msg}</div>
        )}

        <form action={entrar} className="space-y-3">
          <input name="email" type="email" required placeholder="Correo"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5" />
          <input name="password" type="password" required placeholder="Contraseña"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5" />
          <button className="w-full bg-marca text-white rounded-lg py-2.5 font-medium active:bg-marcaOscuro">
            Entrar
          </button>
        </form>

        <details className="mt-5">
          <summary className="text-sm text-slate-500 cursor-pointer">Crear cuenta nueva</summary>
          <form action={registrar} className="space-y-3 mt-3">
            <input name="nombre" type="text" required placeholder="Nombre"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5" />
            <input name="email" type="email" required placeholder="Correo"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5" />
            <input name="password" type="password" required minLength={6} placeholder="Contraseña (mín. 6)"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5" />
            <button className="w-full bg-slate-800 text-white rounded-lg py-2.5 font-medium">
              Registrarme
            </button>
          </form>
        </details>
      </div>
    </main>
  );
}
