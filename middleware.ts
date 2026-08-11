export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/hoy/:path*", "/proyectos/:path*", "/calendario/:path*", "/citas/:path*", "/cumpleanos/:path*", "/pagos/:path*"],
};
