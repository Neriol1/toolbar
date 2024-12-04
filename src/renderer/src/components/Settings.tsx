import { motion } from 'framer-motion'
import { ShortcutSetting } from './ShortcutSetting'

export const Settings = () => {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 400 }}
      className="bg-white w-full pt-4 overflow-hidden no-drag"
    >
      <div className='container h-full overflow-scroll px-3'>
        <h2 className="text-lg font-medium mb-4">设置</h2>
        
        <div className="space-y-4">
          <ShortcutSetting />

          <section>
            <h3 className="text-base font-medium mb-2">主题设置</h3>
            <select className="w-full p-2 border rounded">
              <option value="light">浅色主题</option>
              <option value="dark">深色主题</option>
            </select>
          </section>
        </div>
      </div>
    </motion.div>
  )
}