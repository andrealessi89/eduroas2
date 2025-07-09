import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Páginas públicas que não precisam de autenticação
  const publicPaths = ["/login", "/unauthorized", "/logout"];
  
  // Se é uma página pública, permite acesso
  if (publicPaths.includes(path)) {
    return NextResponse.next();
  }

  // Para todas as outras rotas, verifica autenticação
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  console.log(`Middleware: path=${path}, hasToken=${!!token}`);

  // Se não tem token, redireciona para login
  if (!token) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(url);
  }

  // Se tem token, permite acesso
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
    "/dashboard/:path*",
  ],
};