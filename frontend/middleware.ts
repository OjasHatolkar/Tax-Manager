// NOTE: if your project uses Next.js 16, the quickstart may want this file
// named proxy.ts instead. Check package.json and the Auth0 quickstart.
import type { NextRequest } from "next/server";
import { auth0 } from "./lib/auth0";

export async function middleware(request: NextRequest) {
  return await auth0.middleware(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
