/**
 * Simple authentication middleware
 * For production, use NextAuth.js or similar
 */

import { NextRequest, NextResponse } from 'next/server'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'techdeals2025'

/**
 * Basic authentication check
 * In production, use proper session management
 */
export function checkAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader) return false
  
  // Basic Auth format: "Basic base64(username:password)"
  const base64Credentials = authHeader.split(' ')[1]
  if (!base64Credentials) return false
  
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii')
  const [username, password] = credentials.split(':')
  
  return username === 'admin' && password === ADMIN_PASSWORD
}

/**
 * Middleware to protect admin routes
 */
export function requireAuth(request: NextRequest) {
  const isAuthenticated = checkAuth(request)
  
  if (!isAuthenticated) {
    return new NextResponse('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Admin Area"',
      },
    })
  }
  
  return null // Allow request to proceed
}
