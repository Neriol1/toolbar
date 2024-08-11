import { Content } from './components/Content'
import { Search } from './components/Search'

function App(): JSX.Element {
  return (
    <div className="drag rounded-lg overflow-hidden">
      <Search></Search>
      <Content></Content>
    </div>
  )
}

export default App