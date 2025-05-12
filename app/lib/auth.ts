// lib/auth.ts
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { redirect } from "next/navigation";

// Authentication middleware
export async function authMiddleware(req: NextRequest) {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

// Get session on the server side
export async function getSession() {
  const session = await getServerSession();
  return session;
}

// Check if authenticated on the server side and redirect if not
export async function requireAuth() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}
