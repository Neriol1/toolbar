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


app.whenReady().then(() => {
  globalShortcut.register('Option+Space', () => {
    const mainWindow = BrowserWindow.getFocusedWindow()
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide()
      } else {
        mainWindow.show()
      }
    }
  })
})