import { mockContent } from '@renderer/mock/content'
import testsvg from '@renderer/assets/electron.svg'

export const Content = () => {
  return (
    <main className="p-3 bg-gray-200">
      {mockContent.map((item) => (
        <section key={item.id} className="h-12 py-0 flex gap-2 items-center">
          <img src={testsvg} className='w-7 h-7 bg-contain' />
          <div className='flex flex-col '>
            <span className='text-base leading-6'>{item.title}</span>
            {item?.content?.trim() !== '' && <span className='text-sm leading-3 text-stone-500'>{item.content}</span>} 
          </div>
        </section>
      ))}
    </main>
  )
}
