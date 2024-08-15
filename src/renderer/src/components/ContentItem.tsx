type ContentItemProps = {
  title: string
  content?: string
  icon?: string
  onClick?: () => void
  isSelected?: boolean
}

export const ContentItem = ({ icon, title, content, onClick, isSelected = false }: ContentItemProps) => {
  return (
    <section 
      className={`w-full h-14 overflow-hidden py-0 flex gap-2 items-center cursor-pointer no-drag ${isSelected ? 'bg-gray-400' : ''}`} 
      onClick={onClick}
    >
      <img src={icon} className="w-7 h-7 bg-contain" />
      <div className="flex-1 flex gap-1 flex-col overflow-hidden">
        <span className={`text-base leading-6 truncate ${isSelected ? 'text-white' : ''}`}>{title}</span>
        {content?.trim() !== '' && (
          <span className={`text-sm leading-3 truncate ${isSelected ? 'text-white' : 'text-stone-500'}`}>{content}</span>
        )}
      </div>
    </section>
  )
}