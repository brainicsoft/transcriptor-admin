import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"
import { cookies } from 'next/headers'

// Paths that require authentication
const authPaths = ["/api/user", "/api/usage"]

// Paths that require admin access
const adminPaths = [
  "/api/admin",
  "/admin",
  "/modules",
  "/packages",
  "/users",
  "/logs"
]

// Secret key for JWT verification
const secret = new TextEncoder().encode(process.env.JWT_SECRET)

async function verifyAccessToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the path requires authentication
  const requiresAuth = authPaths.some(path => pathname.startsWith(path))
  
  // Check if the path requires admin access
  const requiresAdmin = adminPaths.some(path => pathname.startsWith(path))

  if (requiresAuth || requiresAdmin) {
    // Try to get token from both Authorization header and cookies
    const authHeader = request.headers.get("authorization")
    const cookieToken = cookies().get('token')?.value
    
    const token = authHeader?.startsWith("Bearer ") 
      ? authHeader.split(" ")[1] 
      : cookieToken

    if (!token) {
      if (pathname.startsWith('/api')) {
        return NextResponse.json(
          { success: false, message: "Authentication required" },
          { status: 401 }
        )
      } else {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }

    // Verify token using jose
    const payload = await verifyAccessToken(token)
    
    if (!payload) {
      if (pathname.startsWith('/api')) {
        return NextResponse.json(
          { success: false, message: "Invalid or expired token" },
          { status: 401 }
        )
      } else {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }

    // For admin routes, verify isAdmin flag
    if (requiresAdmin && !payload.isAdmin) {
      if (pathname.startsWith('/api')) {
        return NextResponse.json(
          { success: false, message: "Admin privileges required" },
          { status: 403 }
        )
      } else {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }

    // Add user info to request headers for API routes
    if (pathname.startsWith('/api')) {
      const headers = new Headers(request.headers)
      headers.set('x-user-id', payload.userId as string)
      headers.set('x-user-email', payload.email as string)
      headers.set('x-is-admin', payload.isAdmin ? 'true' : 'false')
      
      return NextResponse.next({ headers })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/user/:path*',
    '/api/usage/:path*',
    '/api/admin/:path*',
    '/admin/:path*',
    '/modules/:path*',
    '/packages/:path*',
    '/users/:path*',
    '/logs/:path*'
  ]
}