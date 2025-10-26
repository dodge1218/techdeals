import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { job } = await request.json()

  try {
    const { runDealsRadar } = await import('@/lib/jobs/deals-radar')
    const { runTrendFinder } = await import('@/lib/jobs/trend-finder')

    let result

    switch (job) {
      case 'deals-radar':
        result = await runDealsRadar()
        break
      case 'trend-finder':
        result = await runTrendFinder()
        break
      default:
        return NextResponse.json({ error: 'Invalid job' }, { status: 400 })
    }

    return NextResponse.json({ success: true, job, result })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
