import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDatosHoy } from "@/lib/hoy";
import EstadoToggle from "@/components/EstadoToggle";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default async function HoyPage() {
  const session = await getServerSession(authOptions);
  const usuarioId = (session!.user as any).id;
  const { ocurrenciasHoy, ocurrenciasAtrasadas, citasHoy, pagosPendientes, cumpleaniosHoy } =
    await getDatosHoy(usuarioId);

  const hoyTexto = format(new Date(), "EEEE d 'de' MMMM", { locale: es });

  return (
    <div className="px-4 pt-8 pb-4">
      <p className="text-noche-400 text-sm capitalize">{hoyTexto}</p>
      <h1 className="font-display text-2xl mb-6">Hoy</h1>

      {cumpleaniosHoy.length > 0 && (
        <div className="bg-arcilla-50 rounded-xl p-3 mb-4">
          {cumpleaniosHoy.map((c) => (
            <p key={c.id} className="text-sm text-arcilla-400">🎂 Hoy cumple años {c.nombre}</p>
          ))}
        </div>
      )}

      {ocurrenciasAtrasadas.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs uppercase tracking-wide text-arcilla-400 mb-2">Atrasadas</h2>
          <ul className="space-y-2">
            {ocurrenciasAtrasadas.map((o) => (
              <li key={o.id} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-arcilla-50">
                <EstadoToggle ocurrenciaId={o.id} estadoInicial={o.estado as any} />
                <div className="min-w-0">
                  <p className="text-sm truncate">{o.actividad.nombre}</p>
                  <p className="text-xs text-noche-400 truncate">{o.actividad.proyecto.nombre}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mb-6">
        <h2 className="text-xs uppercase tracking-wide text-noche-400 mb-2">Actividades de hoy</h2>
        {ocurrenciasHoy.length === 0 ? (
          <p className="text-sm text-noche-400">Nada programado para hoy.</p>
        ) : (
          <ul className="space-y-2">
            {ocurrenciasHoy.map((o) => (
              <li key={o.id} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-noche-100">
                <EstadoToggle ocurrenciaId={o.id} estadoInicial={o.estado as any} />
                <div className="min-w-0">
                  <p className="text-sm truncate">{o.actividad.nombre}</p>
                  <p className="text-xs text-noche-400 truncate">
                    {o.actividad.proyecto.nombre}
                    {o.actividad.hora ? ` · ${o.actividad.hora}` : ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {citasHoy.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs uppercase tracking-wide text-noche-400 mb-2">Citas</h2>
          <ul className="space-y-2">
            {citasHoy.map((c) => (
              <li key={c.id} className="bg-white rounded-xl p-3 border border-noche-100">
                <p className="text-sm">{c.titulo}</p>
                <p className="text-xs text-noche-400">
                  {c.hora ?? ""} {c.lugar ? `· ${c.lugar}` : ""}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {pagosPendientes.length > 0 && (
        <section>
          <h2 className="text-xs uppercase tracking-wide text-noche-400 mb-2">Pagos por vencer</h2>
          <ul className="space-y-2">
            {pagosPendientes.map((p) => (
              <li key={p.id} className="bg-white rounded-xl p-3 border border-noche-100 flex justify-between">
                <span className="text-sm">{p.concepto}</span>
                <span className="text-sm text-noche-400">{p.monto ? `S/ ${p.monto}` : ""}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
