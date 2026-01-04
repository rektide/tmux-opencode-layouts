#!/usr/bin/env node

import { realpath } from 'node:fs/promises'
import { findOpencodeCommand } from './command/find-opencode.ts'
import { hsplitCommand, hsplit } from './command/hsplit.ts'
import { vsplitCommand, vsplit } from './command/vsplit.ts'

if (await realpath(process.argv[1]) === new URL(import.meta.url).pathname) {
  const subcommand = process.argv[2]
  
  if (subcommand === 'find-opencode') {
    await findOpencodeCommand.run()
  } else if (subcommand === 'hsplit') {
    const sessionArgIndex = process.argv.indexOf('-s')
    const session = sessionArgIndex !== -1 ? process.argv[sessionArgIndex + 1] : null
    
    if (!session) {
      console.log('Error: session argument is required')
      console.log('Usage: node cli.ts hsplit -s <session>')
      process.exit(1)
    }
    
    await hsplit(session)
  } else if (subcommand === 'vsplit') {
    const sessionArgIndex = process.argv.indexOf('-s')
    const session = sessionArgIndex !== -1 ? process.argv[sessionArgIndex + 1] : null
    
    if (!session) {
      console.log('Error: session argument is required')
      console.log('Usage: node cli.ts vsplit -s <session>')
      process.exit(1)
    }
    
    await vsplit(session)
  } else {
    console.log('tmux-opencode v1.0.0')
    console.log('\nUsage: node cli.ts <command>')
    console.log('\nCommands:')
    console.log('  find-opencode    Find all tmux sessions where opencode is the first window')
    console.log('  hsplit            Create horizontal split with opencode on top and window 1 on bottom')
    console.log('  vsplit            Create vertical split with opencode on left and window 1 on right')
    console.log('\nOptions:')
    console.log('  -h, --help       Display this help message')
    console.log('  -v, --version    Display version')
  }
}

export { findOpencodeCommand, hsplitCommand, vsplitCommand }
