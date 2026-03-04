import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { homedir } from 'os'

const execAsync = promisify(exec)

interface Integration {
  name: string
  type: string
  status: 'connected' | 'disconnected' | 'available' | 'error'
  icon: string
  details?: {
    authenticated?: boolean
    available?: boolean
    version?: string
    lastSync?: string
    lastChecked?: string
    error?: string
  }
}

export async function GET() {
  try {
    const integrations: Integration[] = []
    const now = new Date().toISOString()

    // Check GitHub CLI
    try {
      const { stdout: ghWhich } = await execAsync('which gh')
      if (ghWhich.trim()) {
        let authenticated = false
        let ghUser = ''
        try {
          const { stdout: ghStatus } = await execAsync('gh auth status 2>&1')
          authenticated = ghStatus.includes('Logged in to github.com')
          if (authenticated) {
            const userMatch = ghStatus.match(/account ([^\s]+)/)
            ghUser = userMatch ? userMatch[1] : ''
          }
        } catch {
          authenticated = false
        }

        let version = ''
        try {
          const { stdout: ghVersion } = await execAsync('gh --version')
          const versionMatch = ghVersion.match(/gh version ([\d.]+)/)
          version = versionMatch ? versionMatch[1] : ''
        } catch {}

        integrations.push({
          name: 'GitHub',
          type: 'cli',
          status: authenticated ? 'connected' : 'available',
          icon: '🐙',
          details: {
            authenticated,
            available: true,
            version,
            lastChecked: now,
            ...(ghUser && { lastSync: `User: ${ghUser}` })
          }
        })
      }
    } catch {
      // gh not available
    }

    // Check GOG (Google Workspace CLI)
    try {
      const { stdout: gogWhich } = await execAsync('which gog')
      if (gogWhich.trim()) {
        let authenticated = false
        let account = ''
        try {
          const { stdout: gogStatus } = await execAsync('gog auth status 2>&1')
          const accountMatch = gogStatus.match(/account\s+([^\s]+)/)
          account = accountMatch ? accountMatch[1] : ''
          authenticated = !!account
        } catch {}

        integrations.push({
          name: 'Google Workspace',
          type: 'cli',
          status: authenticated ? 'connected' : 'available',
          icon: '📧',
          details: {
            authenticated,
            available: true,
            lastChecked: now,
            ...(account && { lastSync: account })
          }
        })
      }
    } catch {
      // gog not available
    }

    // Check Apple Notes (memo CLI)
    try {
      const { stdout: memoWhich } = await execAsync('which memo')
      if (memoWhich.trim()) {
        integrations.push({
          name: 'Apple Notes',
          type: 'cli',
          status: 'connected',
          icon: '📝',
          details: {
            authenticated: true,
            available: true,
            lastChecked: now,
            lastSync: 'Local access'
          }
        })
      }
    } catch {
      // memo not available
    }

    // Check iMessage (imsg CLI)
    try {
      const { stdout: imsgWhich } = await execAsync('which imsg')
      if (imsgWhich.trim()) {
        integrations.push({
          name: 'iMessage',
          type: 'cli',
          status: 'connected',
          icon: '💭',
          details: {
            authenticated: true,
            available: true,
            lastChecked: now,
            lastSync: 'Local access'
          }
        })
      }
    } catch {
      // imsg not available
    }

    // Check Apple Reminders
    try {
      const { stdout: reminderWhich } = await execAsync('which remindctl')
      if (reminderWhich.trim()) {
        integrations.push({
          name: 'Apple Reminders',
          type: 'cli',
          status: 'connected',
          icon: '✅',
          details: {
            authenticated: true,
            available: true,
            lastChecked: now,
            lastSync: 'Local access'
          }
        })
      }
    } catch {
      // remindctl not available
    }

    // Check 1Password CLI
    try {
      const { stdout: opWhich } = await execAsync('which op')
      if (opWhich.trim()) {
        let authenticated = false
        try {
          const { stdout: opStatus } = await execAsync('op account list 2>&1')
          authenticated = opStatus.trim().length > 0 && !opStatus.includes('not signed in')
        } catch {}

        integrations.push({
          name: '1Password',
          type: 'cli',
          status: authenticated ? 'connected' : 'available',
          icon: '🔐',
          details: {
            authenticated,
            available: true,
            lastChecked: now
          }
        })
      }
    } catch {
      // op not available
    }

    // Check OpenClaw config for API keys
    try {
      const configPath = join(homedir(), '.openclaw', 'openclaw.json')
      const configContent = await readFile(configPath, 'utf-8')
      const config = JSON.parse(configContent)

      // Check Linear (if configured)
      if (config.skills?.entries?.linear) {
        integrations.push({
          name: 'Linear',
          type: 'api',
          status: config.skills.entries.linear.apiKey ? 'connected' : 'disconnected',
          icon: '📊',
          details: {
            authenticated: !!config.skills.entries.linear.apiKey,
            available: true,
            lastChecked: now
          }
        })
      }

      // Check Gemini API
      if (config.skills?.entries?.['nano-banana-pro']) {
        integrations.push({
          name: 'Gemini API',
          type: 'api',
          status: config.skills.entries['nano-banana-pro'].apiKey ? 'connected' : 'disconnected',
          icon: '✨',
          details: {
            authenticated: !!config.skills.entries['nano-banana-pro'].apiKey,
            available: true,
            lastChecked: now
          }
        })
      }
    } catch (error) {
      console.error('Failed to check config for API keys:', error)
    }

    return NextResponse.json({
      status: 'success',
      data: integrations,
      timestamp: now
    })
  } catch (error) {
    console.error('Integrations check error:', error)
    return NextResponse.json({
      status: 'error',
      error: 'Failed to fetch integrations status',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
