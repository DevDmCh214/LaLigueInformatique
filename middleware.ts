export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/sports/:path*",
    "/equipes/:path*",
    "/evenements/:path*",
    "/matchs/:path*",
    "/calendar/:path*",
    "/profil/:path*",
  ],
};
