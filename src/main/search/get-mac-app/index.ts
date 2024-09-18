import getApps from './getApps'
import { getIconFile } from './app2png'
import { app } from 'electron'

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
  getApps: async () => {
    const res = (await new Promise((resolve, reject) => getApps(resolve, reject))) as Omit<
      MacAppType,
      'icon'
    >[]

    return Promise.all(
      res.map(async (v) => {
        let icon = ''
        try {
          // const iconObj = await app.getFileIcon(v.path)
          // icon = iconObj.toDataURL()
          icon = await getIconFile(v.path)
          // console.log(icon,'--icon')
        } catch (error) {}
        return { ...v, icon } as MacAppType
      })
    )
  },
  isInstalled: (appName) => {
    return new Promise((resolve, reject) => getApps(resolve, reject, appName))
  },
  // app2png
}
