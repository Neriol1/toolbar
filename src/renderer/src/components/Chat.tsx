import { motion } from 'framer-motion'

export const Chat = ()=>{
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 400 }}
      className="bg-white w-full pt-4 overflow-hidden no-drag"
    ></motion.div>
  )
}