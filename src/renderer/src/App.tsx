import { useState } from 'react'
import { Content } from './components/Content'
import { Search } from './components/Search'

function App(): JSX.Element {
  const [searchText, setSearchText] = useState('')
  return (
    <div className="drag rounded-lg overflow-hidden">
      <Search searchText={searchText} setSearchText={setSearchText} />
      <Content searchText={searchText} />
    </div>
  )
}

export default App