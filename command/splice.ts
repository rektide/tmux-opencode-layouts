import { $ } from 'zx'
import { listWindows } from './utils.ts'

export interface SpliceOptions {
  session: string
  start: number
  insert?: number
  delete?: number
  names?: string[]
  disjoint?: boolean
}

export const spliceCommand = {
  name: 'splice',
  description: 'Delete and insert tmux windows at a specific index (like array splice)',
  args: {
    session: {
      type: 'string',
      short: 's',
      description: 'Session name to modify',
      required: true
    },
    start: {
      type: 'number',
      short: 'S',
      description: 'Starting window index (0-based)',
      required: true
    },
    insert: {
      type: 'number',
      short: 'i',
      description: 'Number of windows to insert (alternative to --name)',
      required: false
    },
    delete: {
      type: 'number',
      short: 'd',
      description: 'Number of windows to delete',
      required: false
    },
    name: {
      type: 'string',
      short: 'n',
      description: 'Window name to insert (can be specified multiple times)',
      required: false
    },
    disjoint: {
      type: 'boolean',
      description: 'Delete next n existing windows instead of up to start+delete',
      required: false
    }
  },
  run: async (ctx: any) => {
    const options: SpliceOptions = {
      session: ctx.values.session,
      start: ctx.values.start,
      insert: ctx.values.insert,
      delete: ctx.values.delete,
      names: ctx.values.name,
      disjoint: ctx.values.disjoint
    }
    await splice(options)
  }
}

async function deleteWindows(session: string, start: number, count: number, disjoint: boolean) {
  const windows = await listWindows(session)
  
  if (count === 0 || count === undefined) return
  
  if (disjoint) {
    let deleted = 0
    for (const window of windows) {
      if (deleted >= count) break
      const match = window.match(/^(\d+):/)
      if (match) {
        const index = parseInt(match[1])
        if (index >= start) {
          await $`tmux kill-window -t ${session}:${index}`.nothrow()
          deleted++
          console.log(`Deleted window ${index}`)
        }
      }
    }
  } else {
    const targetIndex = start + count - 1
    const windowToDelete = windows.find(w => w.startsWith(`${targetIndex}:`))
    if (windowToDelete) {
      for (let i = start; i <= targetIndex; i++) {
        const window = windows.find(w => w.startsWith(`${i}:`))
        if (window) {
          await $`tmux kill-window -t ${session}:${i}`.nothrow()
          console.log(`Deleted window ${i}`)
        }
      }
    }
  }
}

async function insertWindows(session: string, start: number, insertCount: number, names?: string[]) {
  if (names && names.length > 0) {
    for (const name of names) {
      await $`tmux new-window -t ${session} -n ${name}`
      console.log(`Created window "${name}"`)
    }
    await renumberWindows(session)
  } else if (insertCount && insertCount > 0) {
    for (let i = 0; i < insertCount; i++) {
      await $`tmux new-window -t ${session} -n "window${start + i}"`
      console.log(`Created window at index ${start + i}`)
    }
    await renumberWindows(session)
  }
}

async function renumberWindows(session: string) {
  const windows = await listWindows(session)
  const windowMap = new Map<number, string>()
  
  for (const window of windows) {
    const match = window.match(/^(\d+):(.+)$/)
    if (match) {
      windowMap.set(parseInt(match[1]), match[2])
    }
  }
  
  const sortedIndices = Array.from(windowMap.keys()).sort((a, b) => a - b)
  
  for (let i = 0; i < sortedIndices.length; i++) {
    const oldIndex = sortedIndices[i]
    const name = windowMap.get(oldIndex)
    
    if (oldIndex !== i) {
      await $`tmux rename-window -t ${session}:${oldIndex} ${name}`
      await $`tmux move-window -s ${session}:${oldIndex} -t ${session}:${i}`.nothrow()
      console.log(`Moved window "${name}" from ${oldIndex} to ${i}`)
    }
  }
}

export async function splice(options: SpliceOptions) {
  const { session, start, insert, delete: deleteCount, names, disjoint } = options
  
  if (start < 0) {
    console.log('Error: start index cannot be negative')
    process.exit(1)
  }
  
  if (names && names.length > 0 && insert) {
    console.log('Warning: both --name and --insert provided, using --name')
  }
  
  await deleteWindows(session, start, deleteCount || 0, disjoint || false)
  await insertWindows(session, start, insert || 0, names)
  
  console.log(`Splice operation completed on session "${session}"`)
}
