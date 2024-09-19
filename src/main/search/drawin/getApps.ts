import { spawn } from 'child_process';
import plist from 'plist';
import { getIconFile } from './getIconFile';

// export default function getApps(resolve, reject) {
export const getApps = async (result) =>{

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let resultBuffer = new Buffer.from([]);
  const { fileIconToBuffer } = await import('file-icon') // 动态导入

  const profileInstalledApps = spawn('/usr/sbin/system_profiler', [
    '-xml',
    '-detailLevel',
    'mini',
    'SPApplicationsDataType',
  ]);

  profileInstalledApps.stdout.on('data', (chunckBuffer) => {
    resultBuffer = Buffer.concat([resultBuffer, chunckBuffer]);
  });

  profileInstalledApps.on('exit', (exitCode) => {
    if (exitCode !== 0) {
      // reject([]);
      return;
    }

    try {
      const [installedApps] = plist.parse(resultBuffer.toString());

      const arr = installedApps._items.filter((apps) => apps.path.startsWith('/Applications'))
      arr.forEach(v=>{
        v.icon = getIconFile(fileIconToBuffer,v.path)
      })
      result = arr
      // return arr
      // return resolve(arr);
    } catch (err) {
      // reject(err);
    }
  });

  profileInstalledApps.on('error', (err) => {
    // reject(err);
  });
}
