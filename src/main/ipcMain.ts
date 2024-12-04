import { execSync, exec } from "child_process"
import { ipcMain, shell, app, BrowserWindow, globalShortcut } from "electron"
import { searchAppsAndFiles } from "./search"

// Handle IPC requests from renderer
ipcMain.handle('search-on-browser', async (_, url) => {
  if (process.platform === 'win32') {
    return shell.openPath(url)
  } else {
    return shell.openExternal(url)
  }
})

ipcMain.handle('get-default-browser-icon', async () => {
  try {
    let browserPath = ''
    if (process.platform === 'win32') {
      // 在 Windows 上使用注册表获取默认浏览器路径
      const output = execSync(
        'reg query HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\Shell\\Associations\\UrlAssociations\\http\\UserChoice /v ProgId'
      ).toString()
      const progId = output.match(/ProgId\s+REG_SZ\s+(.*)/)![1].trim()
      const command = execSync(
        `reg query HKEY_CLASSES_ROOT\\${progId}\\shell\\open\\command /ve`
      ).toString()
      browserPath = command.match(/REG_SZ\s+(".*?"|[^"\s]+)/)![1].replace(/"/g, '')
    } else if (process.platform === 'darwin') {
      // 在 macOS 上获取默认浏览器路径
      browserPath = execSync(
        "defaults read com.apple.LaunchServices/com.apple.launchservices.secure LSHandlers | grep \"LSHandlerRoleAll = http;\" -A 2 | grep LSHandlerURLScheme | awk -F'\"' '{print $4}'"
      )
        .toString()
        .trim()
    } else {
      // 在 Linux 上，可能需要其他方法
      console.log('暂不支持 Linux 系统获取默认浏览器图标')
      return null
    }

    console.log('默认浏览器路径:', browserPath)

    if (browserPath) {
      const iconPath = await app.getFileIcon(browserPath, { size: 'large' })
      return iconPath.toDataURL()
    }
    return null
  } catch (error) {
    console.error('获取默认浏览器图标失败:', error)
    return null
  }
})

// 添加 search
ipcMain.handle('search-apps-and-files', async (_, searchTerm) => {
  return await searchAppsAndFiles(searchTerm)
})

ipcMain.handle('open-by-path',async (_,url)=>{
  if(process.platform === 'win32'){
    return shell.openPath(url)
  }else{
    return shell.openExternal(url)
  }
})

const execAction = async (command: string) => {
  return exec(command)
}

ipcMain.handle('exec-action', (_, command) => {
  execAction(command)
})

ipcMain.handle('hide-window', () => {
  const mainWindow = BrowserWindow.getFocusedWindow()
  if (mainWindow) {
    mainWindow.hide()
  }
})

let currentShortcut = 'Option+Space'
let shortcutEnabled = true

// 切换窗口显示状态的函数
const toggleWindow = () => {
  const mainWindow = BrowserWindow.getFocusedWindow()
  console.log(1111)
  if (mainWindow) {
    if (mainWindow.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow.show()
    }
  }
}

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