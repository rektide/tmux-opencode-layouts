import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

export async function listSessions() {
  const { stdout } = await execAsync('tmux list-sessions')
  const sessions = stdout.split('\n').filter(line => line.trim())
  return sessions.map(line => {
    const match = line.match(/^([^:]+):/)
    return match ? match[1] : null
  }).filter(Boolean)
}

export async function getFirstWindowName(session: string) {
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

export async function listWindows(session: string) {
  try {
    const { stdout } = await execAsync(`tmux list-windows -t "${session}" -F "#{window_index}:#{window_name}"`)
    return stdout.split('\n').filter(line => line.trim())
  } catch (error) {
    return []
  }
}

export async function ensureWindow2Exists(session: string) {
  const windows = await listWindows(session)
  const hasWindow2 = windows.some(w => w.startsWith('1:') || w.startsWith('2:'))
  
  if (!hasWindow2) {
    await execAsync(`tmux new-window -t "${session}" -n "window2"`)
    console.log('Created window 2')
  }
}
