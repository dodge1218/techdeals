#!/usr/bin/env node

// Simple scheduler for background jobs
// Usage: node scripts/scheduler.js

const { spawn } = require('child_process')
const path = require('path')

const JOBS = {
  'deals-radar': {
    command: 'pnpm',
    args: ['jobs:deals-radar'],
    interval: 60 * 60 * 1000, // 1 hour
  },
  'trend-finder': {
    command: 'pnpm',
    args: ['jobs:trend-finder'],
    interval: 6 * 60 * 60 * 1000, // 6 hours
  },
}

function runJob(name) {
  const job = JOBS[name]
  if (!job) {
    console.error(`Unknown job: ${name}`)
    return Promise.reject(new Error(`Unknown job: ${name}`))
  }

  return new Promise((resolve, reject) => {
    console.log(`[${new Date().toISOString()}] Running ${name}...`)
    
    const proc = spawn(job.command, job.args, {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'inherit',
    })

    proc.on('close', (code) => {
      if (code === 0) {
        console.log(`[${new Date().toISOString()}] ✅ ${name} complete`)
        resolve()
      } else {
        console.error(`[${new Date().toISOString()}] ❌ ${name} failed with code ${code}`)
        reject(new Error(`Job failed with code ${code}`))
      }
    })
  })
}

async function scheduler() {
  console.log('🕐 Scheduler started')
  console.log('Jobs:', Object.keys(JOBS).join(', '))

  // Run all jobs immediately on startup
  for (const jobName of Object.keys(JOBS)) {
    try {
      await runJob(jobName)
    } catch (error) {
      console.error(`Failed to run ${jobName}:`, error.message)
    }
  }

  // Schedule recurring jobs
  for (const [jobName, job] of Object.entries(JOBS)) {
    setInterval(() => {
      runJob(jobName).catch((error) => {
        console.error(`Scheduled run of ${jobName} failed:`, error.message)
      })
    }, job.interval)
    console.log(`✅ Scheduled ${jobName} every ${job.interval / 1000 / 60} minutes`)
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
