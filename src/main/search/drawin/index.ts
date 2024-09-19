import { getApps } from './getApps'
import { getIconFile } from './getIconFile'

export type MacAppType = {
  _name: string
  arch_kind: 'arch_arm_i64' | 'arch_ios' | 'arch_arm'
  lastModified: Date
  obtained_from: 'unknown' | 'apple' | 'mac_app_store' | 'identified_developer'
  path: string
  version: string
  icon: string
}

export default {
  getApps: () => {
    // const { fileIconToBuffer } = await import('file-icon') // 动态导入
    // const res = (await new Promise((resolve, reject) => getApps(resolve, reject))) as Omit<
    //   MacAppType,
    //   'icon'
    // >[]

    // return Promise.all(
    //   res.map(async (v) => {
    //     let icon = ''
    //     try {
    //       icon = await getIconFile(fileIconToBuffer, v.path)
    //     } catch (error) {}
    //     return { ...v, icon } as MacAppType
    //   })
    // )
    const result = []
    getApps(result)
    return result
  }
}
