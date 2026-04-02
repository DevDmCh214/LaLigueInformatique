export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*", "/teams/:path*", "/events/:path*", "/calendar/:path*"],
};
