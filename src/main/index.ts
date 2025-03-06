import { app, shell, BrowserWindow, ipcMain, session } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { getInstalledApps } from './search'
import './ipcMain'
import { setMainWindow } from './shortCuts/ipc'
import installExtension, { REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } from 'electron-devtools-installer'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 680,
    // height: 670,
    show: false,
    autoHideMenuBar: true,
    frame: false,
    transparent: true,
    useContentSize: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  // 监听渲染进程内容大小变化
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.executeJavaScript(`
      new ResizeObserver(() => {
        const height = document.documentElement.offsetHeight;
        window.electron.ipcRenderer.send('update-window-size', height);
      }).observe(document.documentElement);
    `);
  });

  // 处理渲染进程发来的大小更新请求
  ipcMain.on('update-window-size', (_, height) => {
    const [width] = mainWindow.getSize();
    mainWindow.setSize(width, height);
  });

  mainWindow.on('ready-to-show', () => {
    setMainWindow(mainWindow)
    mainWindow.show()
  })
  mainWindow.on('show', () => {
    if (is.dev) {
      mainWindow.webContents.openDevTools()
    }
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
app.whenReady().then(async () => {
  // 在开发模式下加载开发工具扩展
  if (is.dev) {
    try {
      const reactDevTools = await installExtension(REACT_DEVELOPER_TOOLS)
      console.log(`React DevTools 安装成功: ${reactDevTools}`)
      
      const reduxDevTools = await installExtension(REDUX_DEVTOOLS)
      console.log(`Redux DevTools 安装成功: ${reduxDevTools}`)
    } catch (e) {
      console.error('DevTools 扩展安装失败:', e)
    }
  }

  electronApp.setAppUserModelId('com.electron')
  getInstalledApps()
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