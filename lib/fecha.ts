/**
 * Las fechas "de solo día" (citas, pagos, cumpleaños, actividades) se guardan
 * en la base de datos como medianoche UTC (ej. 2026-08-18T00:00:00.000Z).
 *
 * Si esa fecha se formatea en el NAVEGADOR con `new Date(x)` + `format()` de
 * date-fns, JavaScript aplica la zona horaria local del usuario. En Perú
 * (UTC-5), medianoche UTC del día 18 equivale a las 19:00 del día 17 en hora
 * local, así que el día se muestra corrido uno hacia atrás — aunque en la
 * base de datos esté guardado correctamente.
 *
 * `soloFecha` arma un Date usando los componentes UTC (año/mes/día) como si
 * fueran hora local, para que el día que se muestra sea siempre el mismo que
 * se guardó, sin importar la zona horaria de quien esté viendo la pantalla.
 *
 * Se usa en componentes de cliente ("use client") que reciben una fecha ya
 * calculada en el servidor y la formatean para mostrarla o para precargar un
 * <input type="date">. Los componentes de servidor no lo necesitan: ahí
 * `format()` corre con la zona horaria del servidor (UTC en Vercel), que
 * coincide con la de guardado.
 */
export function soloFecha(fecha: Date | string): Date {
  const d = typeof fecha === "string" ? new Date(fecha) : fecha;
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}
