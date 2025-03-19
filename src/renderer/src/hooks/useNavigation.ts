import { useLocation, useNavigate } from 'react-router-dom'

export const useNavigation = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const back = () => {
    const currentPath = location.pathname
    if (currentPath === '/') {
      window.api.hideWindow()
    } else {
      navigate(-1)
    }
  }

  return { back, navigate, location }
} 