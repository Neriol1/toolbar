import { app } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { getAppIcon } from './getIconUtils';
import chokidar from 'chokidar';

export type MacApp = {
  _name: string;
  lastModified: Date;
  path: string;
  icon: string;
};

const scanApplications = async () => {
  const applicationsDirs = ['/Applications' ,'/System/Applications' ];
  return Promise.all(applicationsDirs.map(listInstalledAppsFromDir)).then((results) => {
    return results.flat();
  });
}

// 递归扫描子目录
const listInstalledAppsFromDir =  async (dirPath:string) => {
  const apps = [] as string[];
  try {
    const files = await fs.readdir(dirPath);
    for (let file of files) {
      const filePath = path.join(dirPath, file);
      const stats = await fs.stat(filePath);

      if (filePath.endsWith('.app')) {
        // 如果是 .app 文件夹，添加到应用列表
        apps.push(filePath);
      } else if (stats.isDirectory()) {
        // 如果是目录，则递归扫描该目录
        const nestedApps = await listInstalledAppsFromDir(filePath);
        apps.push(...nestedApps);
      }
    }
  } catch (err) {
    console.error(`无法读取目录 ${dirPath}:`, err);
  }

  return apps;
}

// 修改后的解析函数
const parseAppInfo = async (appPath: string,fileIconToBuffer:any): Promise<MacApp | null> => {
  try {
    const stat = await fs.stat(appPath);
    const baseName = path.basename(appPath, '.app');

    return {
      _name: baseName,
      lastModified: stat.mtime,
      path: appPath,
      icon: await getAppIcon(appPath,fileIconToBuffer)
    };
  } catch (error) {
    console.error('应用解析失败:', appPath, error);
    return null;
  }
};

const AppsMap = new Map<string, MacApp>();
let isWatching = false;

const updateAppInMap = async (appPath: string) => {
  try {
    const { fileIconToBuffer } = await import('file-icon');
    const appInfo = await parseAppInfo(appPath,fileIconToBuffer);
    if (appInfo) {
      AppsMap.set(appPath, appInfo);
    }
  } catch (error) {
    console.error('更新应用失败:', appPath, error);
  }
};

const removeAppFromMap = (appPath: string) => {
  AppsMap.delete(appPath);
};

const watchAppsChange = () => {
  if (isWatching) return;
  
  const watcher = chokidar.watch([
    '/Applications',
    '/System/Applications'
  ], {
    ignored: /(^|[/\\])\../, // 忽略隐藏文件
    persistent: true,
    ignoreInitial: true,
    depth: 0,
    awaitWriteFinish: {
      stabilityThreshold: 2000,
      pollInterval: 100
    }
  });

  watcher
    .on('addDir', (path) => updateAppInMap(path))
    .on('unlinkDir', (path) => removeAppFromMap(path))
    .on('change', (path) => updateAppInMap(path))
    .on('error', error => console.error('监听错误:', error));
  
  isWatching = true;

  app.on('will-quit', () => watcher?.close()) 
};

// 修改后的主函数
export const getAllMacApps = async (): Promise<MacApp[]> => {
  // 首次调用时初始化监听
  if (!isWatching) {
    watchAppsChange();
    const { fileIconToBuffer } = await import('file-icon');
    // 初始化缓存
    const initialApps = await scanApplications();
    const results = await Promise.all(initialApps.map(v=>parseAppInfo(v,fileIconToBuffer)));
    results.filter(Boolean).forEach(app => AppsMap.set(app!.path, app!));
  }
  return Array.from(AppsMap.values());
};
