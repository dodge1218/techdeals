#!/usr/bin/env node

/**
 * Scheduled Worker - Runs background jobs on schedule
 * Usage: node scripts/scheduler.js
 */

import { runDealsRadar } from '../lib/jobs/deals-radar.js'
import { runTrendFinder } from '../lib/jobs/trend-finder.js'

const JOBS = {
  'deals-radar': {
    fn: runDealsRadar,
    interval: 60 * 60 * 1000, // 1 hour
    lastRun: null,
  },
  'trend-finder': {
    fn: runTrendFinder,
    interval: 6 * 60 * 60 * 1000, // 6 hours
    lastRun: null,
  },
}

async function runJob(name: string) {
  const job = JOBS[name as keyof typeof JOBS]
  if (!job) {
    console.error(`Unknown job: ${name}`)
    return
  }

  try {
    console.log(`[${new Date().toISOString()}] Running ${name}...`)
    const result = await job.fn()
    job.lastRun = Date.now()
    console.log(`[${new Date().toISOString()}] ✅ ${name} complete:`, result)
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ ${name} failed:`, error)
  }
}

async function scheduler() {
  console.log('🕐 Scheduler started')
  console.log('Jobs:', Object.keys(JOBS))

  // Run all jobs immediately on startup
  for (const jobName of Object.keys(JOBS)) {
    await runJob(jobName)
  }

  // Schedule recurring jobs
  for (const [jobName, job] of Object.entries(JOBS)) {
    setInterval(() => runJob(jobName), job.interval)
    console.log(`✅ Scheduled ${jobName} every ${job.interval / 1000}s`)
  }

  console.log('🚀 Scheduler running. Press Ctrl+C to stop.')
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Scheduler stopping...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n👋 Scheduler stopping...')
  process.exit(0)
})

scheduler().catch((error) => {
  console.error('Scheduler failed:', error)
  process.exit(1)
})
