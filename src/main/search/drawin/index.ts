import { getApps } from './getApps'

export type MacAppType = {
  _name: string
  arch_kind: 'arch_arm_i64' | 'arch_ios' | 'arch_arm'
  lastModified: Date
  obtained_from: 'unknown' | 'apple' | 'mac_app_store' | 'identified_developer'
  path: string
  version: string
  icon: string
}

export const getInstalledApps = async () => {
  return await new Promise(getApps)
}
