import path from 'path'
import fs from 'fs'
import { exec } from 'child_process'
import * as icns from 'icns-lib'
// import {fileIconToBuffer, fileIconToFile} from 'file-icon';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const plist = require('simple-plist')
// const fileIcon = require('file-icon');

export const getIconFile = (fileIconToBuffer,appFileInput): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    // const plistPath = path.join(appFileInput, 'Contents', 'Info.plist');
    try {
      const buffer4 = await fileIconToBuffer(appFileInput)
      resolve(`data:image/png;base64,${buffer4.toString('base64')}`)
    } catch (error) {
      reject(error)
    }
    // plist.readFile(plistPath, (err, data) => {
    //   if (err || !data.CFBundleIconFile) {
    //     return resolve(
    //       '/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/GenericApplicationIcon.icns'
    //     );
    //   }
    //   const iconFile = path.join(
    //     appFileInput,
    //     'Contents',
    //     'Resources',
    //     data.CFBundleIconFile
    //   );
    //   const iconFiles = [iconFile, iconFile + '.icns', iconFile + '.tiff'];
    //   const existedIcon = iconFiles.find((iconFile) => {
    //     return fs.existsSync(iconFile);
    //   });
    //   const icon = existedIcon || '/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/GenericApplicationIcon.icns'

    //   // resolve(
    //   //   existedIcon ||
    //   //     '/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/GenericApplicationIcon.icns'
    //   // );
    //   fs.readFile(icon, async (err, pdata) => {
    //     if (err) {
    //       console.error(err)
    //       reject(err);
    //     } else {
    //       const icons = icns.parse(pdata);
    //       const iconsKeys = Object.keys(icons).filter((key) => /ic\d{2}/.test(key));
    //       const pngBuffer = icons[iconsKeys[0]];
    //       // console.log(pngBuffer,'--pngBuffer')
    //       // console.log(iconFile,'---iconFile')
    //       // console.log(data.CFBundleIconFile,'---data.CFBundleIconFile')
    //       // console.log(icon,'--icon')
    //       // console.log(icons,'--icons')
    //       resolve(`data:image/png;base64,${pngBuffer.toString('base64')}`);
    //     }
    //   });
    // });
  })
}

const tiffToPng = (iconFile, pngFileOutput) => {
  return new Promise((resolve, reject) => {
    exec(
      `sips -s format png '${iconFile}' --out '${pngFileOutput}' --resampleHeightWidth 64 64`,
      (error) => {
        error ? reject(error) : resolve(null)
      }
    )
  })
}

// const app2png = (appFileInput, pngFileOutput) => {
//   return getIconFile(appFileInput).then((iconFile) => {
//     return tiffToPng(iconFile, pngFileOutput);
//   });
// };

// export default app2png;
