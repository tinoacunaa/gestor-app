import type { RolUsuario } from "@prisma/client";

export type UsuarioSesion = {
  id: string;
  rol: RolUsuario;
  empresaId: string | null;
};

/**
 * Cláusula `where` de Prisma para filtrar proyectos/citas/pagos/cumpleaños
 * según quién está mirando:
 *
 * - ADMIN_EMPRESA: ve TODO lo de su empresa (de cualquier usuario).
 * - USUARIO normal: ve lo suyo (privado o compartido) + lo que otros de su
 *   empresa marcaron como EMPRESA (compartido).
 * - SUPER_ADMIN: no debería usarse para listar datos operativos (no tiene
 *   empresa), pero por seguridad no ve nada si se llama por error.
 */
export function alcanceDatos(usuario: UsuarioSesion) {
  if (usuario.rol === "ADMIN_EMPRESA" && usuario.empresaId) {
    return { empresaId: usuario.empresaId };
  }

  if (usuario.rol === "SUPER_ADMIN") {
    // El super admin no gestiona datos operativos, solo empresas/usuarios.
    return { id: "__ninguno__" };
  }

  return {
    OR: [
      { usuarioId: usuario.id },
      ...(usuario.empresaId
        ? [{ empresaId: usuario.empresaId, visibilidad: "EMPRESA" as const }]
        : []),
    ],
  };
}

/**
 * ¿Puede este usuario editar/eliminar un registro dado (proyecto, cita, pago,
 * cumpleaños)? Sí si es el creador, o si es admin de la misma empresa que el
 * registro.
 */
export function puedeEditar(
  usuario: UsuarioSesion,
  registro: { usuarioId: string; empresaId: string | null }
) {
  if (registro.usuarioId === usuario.id) return true;
  if (usuario.rol === "ADMIN_EMPRESA" && usuario.empresaId && usuario.empresaId === registro.empresaId) {
    return true;
  }
  return false;
}

/**
 * ¿Puede este usuario VER un registro? Además de quien puede editarlo, un
 * usuario normal también puede ver lo que un compañero de su misma empresa
 * marcó como EMPRESA (compartido), aunque no pueda editarlo.
 */
export function puedeVer(
  usuario: UsuarioSesion,
  registro: { usuarioId: string; empresaId: string | null; visibilidad: string }
) {
  if (puedeEditar(usuario, registro)) return true;
  return registro.visibilidad === "EMPRESA" && !!usuario.empresaId && usuario.empresaId === registro.empresaId;
}

/**
 * ¿Puede este usuario gestionar (editar/eliminar) la cuenta de otro usuario?
 * - ADMIN_EMPRESA: solo usuarios de su propia empresa.
 * - SUPER_ADMIN: cualquier usuario (típicamente los admins de empresa que creó).
 */
export function puedeGestionarUsuario(
  usuario: UsuarioSesion,
  objetivo: { id: string; empresaId: string | null }
) {
  if (usuario.rol === "SUPER_ADMIN") return true;
  if (usuario.rol === "ADMIN_EMPRESA" && usuario.empresaId && usuario.empresaId === objetivo.empresaId) {
    return true;
  }
  return false;
}
