import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { ensureWindow2Exists } from './utils.ts'

const execAsync = promisify(exec)

async function vsplitSession(session: string) {
  await ensureWindow2Exists(session)
  
  await execAsync(`tmux select-window -t "${session}:0"`)
  await execAsync(`tmux join-pane -s "${session}:1" -t "${session}:0" -v`)
  
  console.log(`Created vertical split in session "${session}"`)
  console.log('Left pane: opencode window')
  console.log('Right pane: window 1')
}

export const vsplitCommand = {
  name: 'vsplit',
  description: 'Create vertical split with opencode on left and window 1 on right',
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
    await vsplitSession(session)
  }
}

export async function vsplit(session: string) {
  return vsplitSession(session)
}
