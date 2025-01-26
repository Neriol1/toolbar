import { getAllMacApps, MacApp } from './getAllMacApps'

export type MacAppType = MacApp

export const getInstalledApps =  () => {
  return getAllMacApps()
}
