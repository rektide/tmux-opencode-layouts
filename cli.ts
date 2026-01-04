#!/usr/bin/env node

import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { cli } from 'gunshi'

const execAsync = promisify(exec)

async function listSessions() {
  const { stdout } = await execAsync('tmux list-sessions')
  const sessions = stdout.split('\n').filter(line => line.trim())
  return sessions.map(line => {
    const match = line.match(/^([^:]+):/)
    return match ? match[1] : null
  }).filter(Boolean)
}

async function getFirstWindowName(session: string) {
  try {
    const { stdout } = await execAsync(`tmux list-windows -t "${session}" -F "#{window_index}:#{window_name}"`)
    const windows = stdout.split('\n').filter(line => line.trim())
    const firstWindow = windows.find(w => w.startsWith('0:'))
    if (firstWindow) {
      return firstWindow.replace(/^0:/, '').trim()
    }
  } catch (error) {
    return null
  }
  return null
}

const findOpencodeCommand = {
  name: 'find-opencode',
  description: 'Find all tmux sessions where opencode is the first window',
  run: async () => {
    const sessions = await listSessions()
    const opencodeSessions: string[] = []

    for (const session of sessions) {
      const firstWindow = await getFirstWindowName(session)
      if (firstWindow && firstWindow.startsWith('opencode')) {
        opencodeSessions.push(session)
      }
    }

    if (opencodeSessions.length === 0) {
      console.log('No sessions found with opencode as the first window')
    } else {
      console.log('Sessions with opencode as the first window:')
      opencodeSessions.forEach(session => console.log(`  - ${session}`))
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const subcommand = process.argv[2]
  
  if (subcommand === 'find-opencode') {
    await findOpencodeCommand.run()
  } else {
    console.log('tmux-opencode v1.0.0')
    console.log('\nUsage: node cli.ts <command>')
    console.log('\nCommands:')
    console.log('  find-opencode    Find all tmux sessions where opencode is the first window')
    console.log('\nOptions:')
    console.log('  -h, --help       Display this help message')
    console.log('  -v, --version    Display version')
  }
}

export { findOpencodeCommand }
