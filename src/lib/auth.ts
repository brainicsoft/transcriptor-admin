import type { NextRequest } from "next/server"
import { verifyAccessToken } from "@/lib/jwt"

// Function to extract user payload from authorization header
export function getUserFromRequest(req: NextRequest) {
  try {
const authHeader = req.headers.get("authorization")
const cookieToken = req.cookies.get("token")?.value

  

    const token = authHeader.split(" ")[1] || cookieToken
    console.log(token,'token ')
    return verifyAccessToken(token)
  } catch (error) {
    console.error("Error extracting user from request:", error)
    return null
  }
}

// Function to check if a user is authenticated
export function isAuthenticated(req: NextRequest): boolean {
  const user = getUserFromRequest(req)
  return user !== null
}

// Function to check if a user is an admin
export function isAdmin(req: NextRequest): boolean {
  const user = getUserFromRequest(req)
  return user?.isAdmin || false
}
