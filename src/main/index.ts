import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { exec, execSync } from 'child_process'
import { searchAppsAndFiles, getInstalledApps  } from './search'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    // width: 900,
    // height: 670,
    show: false,
    autoHideMenuBar: true,
    frame: false,
    transparent: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: true,
      contextIsolation: false
    }
  })
  mainWindow.webContents.openDevTools()
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')
  if (process.platform === 'win32') {
    getInstalledApps()
  }
  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

// Handle IPC requests from renderer
ipcMain.handle('open-path', async (_, url) => {
  return shell.openPath(url)
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


const execAction = async (command: string) => {
  return exec(command)
}

ipcMain.handle('exec-action', (_, command) => {
  execAction(command)
})