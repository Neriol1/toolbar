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

export const getInstalledApps = async ()=>{
  if(process.platform === 'win32'){
    installedApps = getWinInstalledApps()
  }else{
    installedApps =  await getMacInstalledApps() as MacAppType[]
  }
}

const searchApps = (searchTerm: string): SearchResult[] => {
  const results: SearchResult[] = []
  const v = searchTerm.toLowerCase()
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
    const list = installedApps as MacAppType[]
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
        content: v.obtained_from === 'unknown' ? v.path : '',
        action:`open -a ${v.path}`
      })) as SearchResult[])
    )
  }
  return results
}



const searchFiles = async (searchTerm: string): Promise<SearchResult[]> => {
  const directories = [
    'home', 'desktop', 'downloads', 'userData', 'documents'
  ].map(dir => app.getPath(dir as any))
  const allFiles = directories.reduce((pre,cur)=>{
    const p = fs.readdirSync(cur)
    return pre.concat(p.map(v=>({filename:v,path:path.join(cur,v)})))
  }, [] as {filename:string,path:string}[])

  const filterFiles = allFiles.filter(file => file.filename.toLowerCase().includes(searchTerm.toLowerCase()))

  return Promise.all(filterFiles.map(async file => {
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
  console.log(installedApps,'--installedApps');
  
  const [appResults, fileResults] = await Promise.all([
    searchApps(searchTerm),
    searchFiles(searchTerm)
  ])
  const results = [...appResults, ...fileResults]
  console.log(`搜索完成，找到 ${results.length} 个结果`)
  return results
}
