import { app } from 'electron'
import path from 'path'
import fs from 'fs'
import { FileListItem, getInstalledApps as getWinInstalledApps } from './win'
import  { MacAppType, getInstalledApps as getMacInstalledApps } from './drawin'

type SearchResult = {
  type: 'app' | 'file'
  title: string
  icon?: string
  content?: string
  action: string
}

let installedApps: FileListItem[] | MacAppType[] = []

export const getInstalledApps = async () => {
    if (process.platform === 'win32') {
      installedApps = getWinInstalledApps()
    } else {
      installedApps = await getMacInstalledApps() as unknown as MacAppType[]
    }
  return installedApps
}

const searchApps = async (searchTerm: string): Promise<SearchResult[]> => {
  const results: SearchResult[] = []
  const v = searchTerm.toLowerCase()
  
  // 每次搜索前先更新应用列表
  const newApps = await getInstalledApps()
  
  if (process.platform === 'win32') {
    const list = installedApps as FileListItem[]
    const apps = list.filter((app) => {
      return (
        app.names.some((name) => name.toLowerCase().includes(v)) ||
        app.name.toLowerCase().includes(v)
      )
    })
    results.push(
      ...(apps.map((v) => ({
        type: 'app',
        title: v.name,
        icon: v.icon,
        content: v.desc,
        action:v.action
      })) as SearchResult[])
    )
  } else if (process.platform === 'darwin') {
    const list = newApps as MacAppType[]
    const apps = list.filter((app) => {
      return (
        app._name.toLowerCase().includes(v)
      )
    })
    results.push(
      ...(apps.map((v) => ({
        type: 'app',
        title: v._name,
        icon: v.icon,
        content: v.path,
        action:`open -a ${v.path}`
      })) as SearchResult[])
    )
  }
  return results
}

const NOT_READ_DIRS = ['node_modules','Pictures']
const homePath = app.getPath('home')

const reduceSearchFiles = async (
  currentPath: string,
  searchTerm: string,
  results: Array<{filename: string, path: string}>
): Promise<Array<{filename: string, path: string}>> => {
  try {
    
    const entries = await fs.promises.readdir(currentPath, { withFileTypes: true });
    const searchTermLower = searchTerm.toLowerCase();
    
    const processEntry = async (entry: fs.Dirent) => {
      const fullPath = path.join(currentPath, entry.name);
      const entryNameLower = entry.name.toLowerCase();
      
      if(entry.parentPath === homePath && (entry.name.startsWith('.') || entry.name === 'Library')){
        return
      }

      if(NOT_READ_DIRS.includes(entry.name) && entry.isDirectory()){
        return
      }

      // 先检查当前条目是否匹配
      const isMatch = entryNameLower.includes(searchTermLower)

      if (entry.isDirectory()) {
        // 目录匹配时直接添加并停止递归
        if (isMatch) {
          results.push({ filename: entry.name, path: fullPath });
          return;
        }
        // 未匹配时继续递归搜索
        return reduceSearchFiles(fullPath, searchTerm, results);
      } else if (entry.isFile() && isMatch) {
        results.push({ filename: entry.name, path: fullPath });
      }
    };

    await Promise.all(entries.map(processEntry));
    return results;
  } catch (error) {
    console.error(`遍历目录失败: ${currentPath}`, error);
    return results;
  }
};

const searchFiles = async (searchTerm: string): Promise<SearchResult[]> => {
  //  'desktop','downloads', 'userData', 'documents'
  const directories = [
      'home',
  ].map(dir => app.getPath(dir as any))
  const allFiles = [] as any[]
  
  for(const dir of directories){
    await reduceSearchFiles(dir, searchTerm,allFiles)
  }

  return Promise.all(allFiles.map(async file => {
    let icon = ''
    try {
      const iconObj = await app.getFileIcon(file.path)
      icon = iconObj.toDataURL()
    } catch (error) {
      console.error(`获取文件图标失败: ${file}`, error)
    }
    return {
      type: 'file',
      title: file.filename,
      icon: icon || undefined,
      content: file.path,
      action: file.path
    }
  }))
}

export const searchAppsAndFiles = async (searchTerm: string) => {
  console.log(`开始搜索: ${searchTerm}`)
  console.log(installedApps);
  
  const [appResults, fileResults] = await Promise.all([
    searchApps(searchTerm),
    searchFiles(searchTerm)
  ])
  const results = [...appResults, ...fileResults]
  console.log(`搜索完成，找到 ${results.length} 个结果`)
  console.log(results);
  
  return results
}

export const refreshInstalledApps = async () => {
  return getInstalledApps()
}
