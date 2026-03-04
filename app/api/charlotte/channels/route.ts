import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { homedir } from 'os'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface Channel {
  name: string
  type: 'telegram' | 'whatsapp' | 'discord' | 'slack'
  status: 'connected' | 'disconnected' | 'error'
  icon: string
  details?: {
    enabled?: boolean
    hasToken?: boolean
    configured?: boolean
    lastChecked?: string
  }
}

export async function GET() {
  try {
    const channels: Channel[] = []
    const configPath = join(homedir(), '.openclaw', 'openclaw.json')
    
    // Read OpenClaw config
    let config: any = {}
    try {
      const configContent = await readFile(configPath, 'utf-8')
      config = JSON.parse(configContent)
    } catch (error) {
      console.error('Failed to read openclaw.json:', error)
      return NextResponse.json({
        status: 'error',
        error: 'Could not read OpenClaw configuration'
      }, { status: 500 })
    }

    const now = new Date().toISOString()

    // Check Telegram
    const telegramConfig = config.channels?.telegram
    const telegramPlugin = config.plugins?.entries?.telegram
    if (telegramConfig || telegramPlugin) {
      const hasToken = !!telegramConfig?.botToken
      const isEnabled = telegramConfig?.enabled === true && telegramPlugin?.enabled === true
      
      channels.push({
        name: 'Telegram',
        type: 'telegram',
        status: hasToken && isEnabled ? 'connected' : 'disconnected',
        icon: '📱',
        details: {
          enabled: isEnabled,
          hasToken,
          configured: !!telegramConfig,
          lastChecked: now
        }
      })
    }

    // Check WhatsApp
    const whatsappPlugin = config.plugins?.entries?.whatsapp
    const whatsappChannel = config.channels?.whatsapp
    if (whatsappPlugin !== undefined || whatsappChannel !== undefined) {
      let hasWacli = false
      try {
        const { stdout } = await execAsync('which wacli')
        hasWacli = !!stdout.trim()
      } catch {
        hasWacli = false
      }

      const isEnabled = whatsappPlugin?.enabled === true || whatsappChannel?.enabled === true
      
      channels.push({
        name: 'WhatsApp',
        type: 'whatsapp',
        status: hasWacli && isEnabled ? 'connected' : 'disconnected',
        icon: '💬',
        details: {
          enabled: isEnabled,
          hasToken: hasWacli,
          configured: !!whatsappChannel,
          lastChecked: now
        }
      })
    }

    // Check Discord (if configured)
    const discordChannel = config.channels?.discord
    if (discordChannel) {
      const hasToken = !!discordChannel.token
      const isEnabled = discordChannel.enabled === true
      
      channels.push({
        name: 'Discord',
        type: 'discord',
        status: hasToken && isEnabled ? 'connected' : 'disconnected',
        icon: '🎮',
        details: {
          enabled: isEnabled,
          hasToken,
          configured: true,
          lastChecked: now
        }
      })
    }

    // Check Slack (if configured)
    const slackChannel = config.channels?.slack
    if (slackChannel) {
      const hasToken = !!slackChannel.token
      const isEnabled = slackChannel.enabled === true
      
      channels.push({
        name: 'Slack',
        type: 'slack',
        status: hasToken && isEnabled ? 'connected' : 'disconnected',
        icon: '💼',
        details: {
          enabled: isEnabled,
          hasToken,
          configured: true,
          lastChecked: now
        }
      })
    }

    return NextResponse.json({
      status: 'success',
      data: channels,
      timestamp: now
    })
  } catch (error) {
    console.error('Channels check error:', error)
    return NextResponse.json({
      status: 'error',
      error: 'Failed to fetch channels status',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
