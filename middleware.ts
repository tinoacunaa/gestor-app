import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const rol = (req.nextauth.token as any)?.rol;

    if (pathname.startsWith("/admin/empresas") && rol !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/hoy", req.url));
    }
    if (pathname.startsWith("/admin/usuarios") && rol !== "ADMIN_EMPRESA") {
      return NextResponse.redirect(new URL("/hoy", req.url));
    }
    return NextResponse.next();
  },
  { callbacks: { authorized: ({ token }) => !!token } }
);

export const config = {
  matcher: [
    "/hoy/:path*",
    "/proyectos/:path*",
    "/calendario/:path*",
    "/citas/:path*",
    "/cumpleanos/:path*",
    "/pagos/:path*",
    "/admin/:path*",
  ],
};
