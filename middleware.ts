// middleware.ts
// Clerk middleware — protects routes that require authentication
// /seller/* → requires logged-in user with role = 'seller'
// /payment   → requires any logged-in user

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isSellerRoute = createRouteMatcher(['/seller(.*)']);
const isProtectedRoute = createRouteMatcher(['/payment(.*)']);

export default clerkMiddleware(async (auth, req) => {
  // Protect payment page — must be logged in
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // Protect seller routes — must be logged in (role check happens inside the page)
  if (isSellerRoute(req)) {
    await auth.protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
