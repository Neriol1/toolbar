import { exec } from 'child_process'
import { ipcMain, shell } from 'electron'

// Handle IPC requests from renderer
ipcMain.handle('open-by-path', async (_, url) => {
  if (process.platform === 'win32') {
    return shell.openPath(url)
  } else {
    return shell.openExternal(url)
  }
})

const execAction = async (command: string) => {
  return exec(command)
}

ipcMain.handle('exec-action', (_, command) => {
  execAction(command)
})

import './search/ipc'

import './shortCuts/ipc'

import './langchain/ipc'
