interface SearchProps {
  searchText: string
  setSearchText: (term: string) => void
}

export const Search = ({ searchText, setSearchText }: SearchProps) => {
  return (
    <section className="p-3 bg-gray-200 border-b border-solid border-zinc-400">
      <input
        type="text"
        className="w-full h-8 outline-none bg-gray-200 no-drag"
        placeholder="input search term"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />
    </section>
  )
}