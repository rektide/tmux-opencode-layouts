import { $ } from 'zx'

export async function listSessions() {
  const result = await $`tmux list-sessions`
  return result.stdout.split('\n')
    .filter(line => line.trim())
    .map(line => {
      const match = line.match(/^([^:]+):/)
      return match ? match[1] : null
    })
    .filter(Boolean)
}

export async function getFirstWindowName(session: string) {
  const result = await $`tmux list-windows -t ${session} -F "#{window_index}:#{window_name}"`.nothrow()
  if (!result) return null
  
  const windows = result.stdout.split('\n').filter(line => line.trim())
  const firstWindow = windows.find(w => w.startsWith('0:'))
  if (firstWindow) {
    return firstWindow.replace(/^0:/, '').trim()
  }
  return null
}

export async function listWindows(session: string) {
  const result = await $`tmux list-windows -t ${session} -F "#{window_index}:#{window_name}"`.nothrow()
  if (!result) return []
  
  return result.stdout.split('\n').filter(line => line.trim())
}

export async function ensureWindow2Exists(session: string) {
  const windows = await listWindows(session)
  const hasWindow2 = windows.some(w => w.startsWith('1:') || w.startsWith('2:'))
  
  if (!hasWindow2) {
    await $`tmux new-window -t ${session} -n "window2"`
    console.log('Created window 2')
  }
}
