import { $ } from 'zx'

export interface UnsplitOptions {
  session: string
  window?: number
}

export const unsplitCommand = {
  name: 'unsplit',
  description: 'Remove a split by moving one pane to a new window or specified window number',
  args: {
    session: {
      type: 'string',
      short: 's',
      description: 'Session name to modify',
      required: true
    },
    window: {
      type: 'number',
      short: 'w',
      description: 'Target window number (optional, creates new window if not specified)',
      required: false
    }
  },
  run: async (ctx: any) => {
    const options: UnsplitOptions = {
      session: ctx.values.session,
      window: ctx.values.window
    }
    await unsplit(options)
  }
}

async function getCurrentWindow(session: string) {
  const result = await $`tmux display-message -t ${session} -p "#{window_index}"`.nothrow()
  return result ? parseInt(result.stdout.trim()) : null
}

async function getCurrentPaneIndex(session: string) {
  const result = await $`tmux display-message -t ${session} -p "#{pane_index}"`.nothrow()
  return result ? parseInt(result.stdout.trim()) : null
}

async function getPanesCount(session: string, windowIndex: number) {
  const result = await $`tmux display-message -t ${session}:${windowIndex} -p "#{window_panes}"`.nothrow()
  return result ? parseInt(result.stdout.trim()) : 0
}

async function getAvailableWindowIndex(session: string) {
  const result = await $`tmux list-windows -t ${session} -F "#{window_index}"`.nothrow()
  if (!result) return 0
  
  const indices = result.stdout.split('\n')
    .map(line => parseInt(line.trim()))
    .filter(n => !isNaN(n))
    .sort((a, b) => a - b)
  
  for (let i = 0; i < indices.length; i++) {
    if (indices[i] !== i) {
      return i
    }
  }
  
  return indices.length
}

async function unsplitSession(session: string, targetWindow?: number) {
  const currentWindow = await getCurrentWindow(session)
  if (currentWindow === null) {
    console.log('Error: Could not determine current window')
    process.exit(1)
  }
  
  const paneCount = await getPanesCount(session, currentWindow)
  if (paneCount <= 1) {
    console.log('Error: Current window is not split')
    process.exit(1)
  }
  
  const currentPane = await getCurrentPaneIndex(session)
  if (currentPane === null) {
    console.log('Error: Could not determine current pane')
    process.exit(1)
  }
  
  const targetWindowIndex = targetWindow !== undefined 
    ? targetWindow 
    : await getAvailableWindowIndex(session)
  
  console.log(`Moving pane ${currentPane} from window ${currentWindow} to window ${targetWindowIndex}`)
  
  if (targetWindow !== undefined) {
    await $`tmux break-pane -s ${session}:${currentWindow}.${currentPane} -t ${session}:${targetWindowIndex}`.nothrow()
    console.log(`Pane moved to window ${targetWindowIndex}`)
  } else {
    await $`tmux break-pane -s ${session}:${currentWindow}.${currentPane} -t ${session}:${targetWindowIndex}`
    console.log(`Pane moved to new window ${targetWindowIndex}`)
  }
  
  console.log(`Unsplit completed for session "${session}"`)
}

export async function unsplit(options: UnsplitOptions) {
  const { session, window: targetWindow } = options
  
  await unsplitSession(session, targetWindow)
}
