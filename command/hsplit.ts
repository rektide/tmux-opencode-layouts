import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { ensureWindow2Exists } from './utils.ts'

const execAsync = promisify(exec)

async function hsplitSession(session: string) {
  await ensureWindow2Exists(session)
  
  await execAsync(`tmux select-window -t "${session}:0"`)
  await execAsync(`tmux join-pane -s "${session}:1" -t "${session}:0" -h`)
  
  console.log(`Created horizontal split in session "${session}"`)
  console.log('Top pane: opencode window')
  console.log('Bottom pane: window 1')
}

export const hsplitCommand = {
  name: 'hsplit',
  description: 'Create horizontal split with opencode on top and window 1 on bottom',
  args: {
    session: {
      type: 'string',
      short: 's',
      description: 'Session name to modify',
      required: true
    }
  },
  run: async (ctx: any) => {
    const session = ctx.values.session
    await hsplitSession(session)
  }
}

export async function hsplit(session: string) {
  return hsplitSession(session)
}
