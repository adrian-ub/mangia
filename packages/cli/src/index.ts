#!/usr/bin/env node

import { defineCommand, runMain } from 'citty'
import { consola } from 'consola'
import dev from './commands/dev'
import build from './commands/build'
import prepare from './commands/prepare'
import preview from './commands/preview'

const main = defineCommand({
  meta: {
    name: 'mangia',
    version: '0.0.1',
    description: 'Mangia — Angular + Nitro metaframework',
  },

  subCommands: {
    dev,
    build,
    prepare,
    preview,
  },

  async run() {
    consola.info('Use `mangia dev`, `mangia build`, `mangia prepare`, or `mangia preview`')
  },
})

runMain(main)
