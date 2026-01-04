import { listSessions, getFirstWindowName } from './utils.ts'

export const findOpencodeCommand = {
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

export async function findOpencode() {
  return findOpencodeCommand.run()
}
