import { nativeImage } from 'electron';

const iconCache = new Map<string, string>();

export const getAppIcon = async (appPath: string,fileIconToBuffer:any): Promise<string> => {
  if (iconCache.has(appPath)) {
    return iconCache.get(appPath)!;
  }

  try {
    // 动态导入ES模块
    const buffer = await fileIconToBuffer(appPath, { size: 64 });
    const dataURL = `data:image/png;base64,${buffer.toString('base64')}`;
    iconCache.set(appPath, dataURL);
    return dataURL;
  } catch (error) {
    console.log(fileIconToBuffer);
    
    console.error('图标获取失败:', appPath, error);
    return '';
  }
}; 