import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const cookiesStore = await cookies();
  const session = cookiesStore.get('stockcontrol_session')?.value;

  if (session !== 'admin') {
    redirect('/');
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@stockcontrol.com';

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-12 sm:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-10 shadow-[0_40px_120px_rgba(15,23,42,0.55)] backdrop-blur-xl">
          <div className="space-y-6 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-indigo-300/80">Panel administrativo</p>
            <h1 className="text-4xl font-semibold text-white sm:text-5xl">Bienvenido, administrador</h1>
            <p className="mx-auto max-w-2xl text-base leading-7 text-slate-400">
              Has iniciado sesión correctamente con el usuario <span className="font-semibold text-white">{adminEmail}</span>.
              Aquí puedes comenzar a administrar tu proyecto StockControl.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <div className="rounded-[1.75rem] border border-white/5 bg-slate-950/70 p-6 shadow-lg shadow-slate-950/20">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Estado</p>
              <p className="mt-4 text-3xl font-semibold text-white">Admin</p>
              <p className="mt-2 text-sm text-slate-400">Acceso completo de administrador para configuraciones y usuarios.</p>
            </div>
            <div className="rounded-[1.75rem] border border-white/5 bg-slate-950/70 p-6 shadow-lg shadow-slate-950/20">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Siguiente paso</p>
              <p className="mt-4 text-3xl font-semibold text-white">Conectar tu base de datos</p>
              <p className="mt-2 text-sm text-slate-400">Instala tu tabla de productos y crea usuarios desde el panel de administración.</p>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <form action="/api/auth/logout" method="post" className="sm:inline-block">
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-[1.75rem] bg-gradient-to-r from-fuchsia-500 to-indigo-500 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition duration-200 hover:brightness-110"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
