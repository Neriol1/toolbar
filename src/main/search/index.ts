import { app } from 'electron'
import path from 'path'
import fs from 'fs'
import { installedApps, getInstalledApps } from './win'

type SearchResult = {
  type: 'app' | 'file'
  title: string
  icon?: string
  content?: string
  action: string
}

const searchApps = (searchTerm: string): SearchResult[] => {
  const results: SearchResult[] = []
  if (process.platform === 'win32') {
    const v = searchTerm.toLowerCase()
    const apps = installedApps.filter((app) => {
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
    // macOS 搜索应用的示例代码
    // const output = execSync(`mdfind -name '${searchTerm}' -onlyin /Applications`).toString()
    // const apps = output.split('\n').filter(Boolean).slice(0, 5)
    // for (const appPath of apps) {
    //   results.push({
    //     type: 'app',
    //     title: path.basename(appPath, '.app'),
    //     icon: appPath
    //   })
    // }
  }
  return results
}

const searchFiles = async (searchTerm: string): Promise<SearchResult[]> => {
  const directories = [
    'home', 'desktop', 'downloads', 'userData', 'documents'
  ].map(dir => app.getPath(dir as any))

  const allFiles = directories.flatMap(dir => fs.readdirSync(dir))
  const filterFiles = allFiles.filter(file => file.toLowerCase().includes(searchTerm.toLowerCase()))

  return Promise.all(filterFiles.map(async file => {
    const pathName = path.join(app.getPath('documents'), file)
    let icon = ''
    try {
      const iconObj = await app.getFileIcon(pathName)
      icon = iconObj.toDataURL()
    } catch (error) {
      console.error(`获取文件图标失败: ${file}`, error)
    }
    return {
      type: 'file',
      title: file,
      icon: icon || undefined,
      content: pathName,
      action: ''
    }
  }))
}

export const searchAppsAndFiles = async (searchTerm: string) => {
  console.log(`开始搜索: ${searchTerm}`)
  const [appResults, fileResults] = await Promise.all([
    searchApps(searchTerm),
    searchFiles(searchTerm)
  ])
  const results = [...appResults, ...fileResults]
  console.log(`搜索完成，找到 ${results.length} 个结果`)
  return results
}

export { getInstalledApps }