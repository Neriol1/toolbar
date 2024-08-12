type ContentItemProps = {
  title: string
  content?: string
  icon?: string
  onClick?: () => void
}

export const ContentItem = ({ icon, title, content, onClick }: ContentItemProps) => {
  return (
    <section className="h-12 py-0 flex gap-2 items-center cursor-pointer no-drag" onClick={onClick}>
      <img src={icon} className="w-7 h-7 bg-contain" />
      <div className="flex flex-col">
        <span className="text-base leading-6">{title}</span>
        {content?.trim() !== '' && (
          <span className="text-sm leading-3 text-stone-500">{content}</span>
        )}
      </div>
    </section>
  )
}
