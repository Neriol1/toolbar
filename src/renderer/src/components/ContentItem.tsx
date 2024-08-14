type ContentItemProps = {
  title: string
  content?: string
  icon?: string
  onClick?: () => void
}

export const ContentItem = ({ icon, title, content, onClick }: ContentItemProps) => {
  return (
    <section className="w-full h-14 overflow-hidden py-0 flex gap-2 items-center cursor-pointer no-drag" onClick={onClick}>
      <img src={icon} className="w-7 h-7 bg-contain" />
      <div className="flex-1 flex gap-1 flex-col overflow-hidden">
        <span className="text-base leading-6 truncate">{title}</span>
        {content?.trim() !== '' && (
          <span className="text-sm leading-3 text-stone-500 truncate">{content}</span>
        )}
      </div>
    </section>
  )
}
