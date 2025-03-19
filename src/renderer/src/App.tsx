import { Content } from './components/Content'
import { Search } from './components/Search'
import { Outlet } from 'react-router-dom'
import { useNavigation } from './hooks/useNavigation'
import { useInputStore } from './stores/inputStore'

function AppContent(): JSX.Element {
  const { location } = useNavigation()
  const { text } = useInputStore()

  return (
    <div className="drag rounded-lg overflow-hidden">
      <Outlet />
      
      <Search/>

      {location.pathname === '/' && text !== '' && (
        <Content />
      )}
    </div>
  )
}

function App(): JSX.Element {
  return (
      <AppContent />
  )
}

export default App
