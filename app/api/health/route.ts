import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  const checks: any = {
    status: 'ok',
    timestamp: new Date().toISOString(),
  }

  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database = 'connected'
    checks.productCount = await prisma.product.count()
  } catch (error) {
    checks.database = 'error'
    checks.status = 'degraded'
  }

  await prisma.$disconnect()

  return NextResponse.json(checks, {
    status: checks.status === 'ok' ? 200 : 503,
  })
}
