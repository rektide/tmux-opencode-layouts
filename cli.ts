#!/usr/bin/env node

import { realpath } from 'node:fs/promises'
import { findOpencodeCommand } from './command/find-opencode.ts'
import { hsplitCommand, hsplit } from './command/hsplit.ts'
import { vsplitCommand, vsplit } from './command/vsplit.ts'
import { splice, spliceCommand, type SpliceOptions } from './command/splice.ts'

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
  } else if (subcommand === 'splice') {
    const sessionArgIndex = process.argv.indexOf('-s')
    const startArgIndex = process.argv.indexOf('-S')
    const insertArgIndex = process.argv.indexOf('-i')
    const deleteArgIndex = process.argv.indexOf('-d')
    const nameIndices = []
    for (let i = 0; i < process.argv.length; i++) {
      if (process.argv[i] === '-n') {
        nameIndices.push(i)
      }
    }
    const disjoint = process.argv.includes('--disjoint')
    
    const session = sessionArgIndex !== -1 ? process.argv[sessionArgIndex + 1] : null
    const start = startArgIndex !== -1 ? parseInt(process.argv[startArgIndex + 1]) : null
    const insert = insertArgIndex !== -1 ? parseInt(process.argv[insertArgIndex + 1]) : undefined
    const delCount = deleteArgIndex !== -1 ? parseInt(process.argv[deleteArgIndex + 1]) : undefined
    const names = nameIndices.map(i => process.argv[i + 1])
    
    if (!session || start === null) {
      console.log('Error: session and start arguments are required')
      console.log('Usage: node cli.ts splice -s <session> -S <start> [-i <insert>] [-d <delete>] [-n <name>]... [--disjoint]')
      process.exit(1)
    }
    
    await splice({ session, start, insert, delete: delCount, names, disjoint })
  } else {
    console.log('tmux-opencode v1.0.0')
    console.log('\nUsage: node cli.ts <command>')
    console.log('\nCommands:')
    console.log('  find-opencode    Find all tmux sessions where opencode is the first window')
    console.log('  hsplit            Create horizontal split with opencode on top and window 1 on bottom')
    console.log('  vsplit            Create vertical split with opencode on left and window 1 on right')
    console.log('  splice            Delete and insert tmux windows at specific index')
    console.log('\nOptions:')
    console.log('  -h, --help       Display this help message')
    console.log('  -v, --version    Display version')
  }
}

export { findOpencodeCommand, hsplitCommand, vsplitCommand, spliceCommand }
