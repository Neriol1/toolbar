import { app, BrowserWindow, globalShortcut, ipcMain } from "electron"

let currentShortcut = 'Option+Space'
let shortcutEnabled = true
let mainWindow: BrowserWindow | null = null

// 设置主窗口的引用
export const setMainWindow = (window: BrowserWindow) => {
  mainWindow = window
}

// 修改切换窗口显示状态的函数
const toggleWindow = () => {
  if (mainWindow) {
    if (mainWindow.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow.show()
      mainWindow.focus()
    }
  }
}

ipcMain.handle('hide-window', () => {
  if (mainWindow) {
    mainWindow.hide()
  }
})

// 注册快捷键
const registerShortcut = (shortcut: string) => {
  try {
    if (shortcutEnabled) {
      // // 保留 + 号，只移除多余空格
      const formattedShortcut = shortcut.replace(/\s+\+\s+/g, '+')
      console.log('注册快捷键:', formattedShortcut)
      const success = globalShortcut.register(formattedShortcut, toggleWindow)
      if (success) {
        currentShortcut = shortcut
        return true
      }
    }
    return false
  } catch (error) {
    registerShortcut(currentShortcut)
    // console.error('注册快捷键失败:', error)
    return false
  }
}

// 初始注册默认快捷键
app.whenReady().then(() => {
  registerShortcut(currentShortcut)
})

// 获取当前快捷键
ipcMain.handle('get-current-shortcut', () => {
  return currentShortcut
})

// 设置新快捷键
ipcMain.handle('set-shortcut', (_, shortcut) => {
  // 先注销旧的快捷键
  globalShortcut.unregister(currentShortcut.replace(/\s+/g, ''))
  // 注册新的快捷键
  return registerShortcut(shortcut)
})

// 程序退出时注销所有快捷键
app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

ipcMain.handle('set-shortcut-enabled', (_, enabled) => {
  shortcutEnabled = enabled
  if (!enabled) {
    globalShortcut.unregister(currentShortcut.replace(/\s+/g, ''))
  } else {
    registerShortcut(currentShortcut)
  }
})