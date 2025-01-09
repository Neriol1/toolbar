import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export type PageType = 'search' | 'chat' | 'settings'

interface NavigationState {
  pageStack: PageType[]
  currentPage: PageType
  pushPage: (page: PageType) => void
  popPage: () => PageType | null
  clearStack: () => void
}

export const useNavigationStore = create<NavigationState>()(
  devtools(
    (set, get) => ({
      pageStack: ['search'],
      currentPage: 'search',

      pushPage: (page) => 
        set(
          (state) => ({
            pageStack: [...state.pageStack, page],
            currentPage: page
          }),
          false,
          'pushPage'
        ),

      popPage: () => {
        const { pageStack } = get()
        if (pageStack.length <= 1) return null

        const newStack = [...pageStack]
        newStack.pop() // 移除当前页面
        const previousPage = newStack[newStack.length - 1]

        set(
          {
            pageStack: newStack,
            currentPage: previousPage
          },
          false,
          'popPage'
        )

        return previousPage
      },

      clearStack: () =>
        set(
          {
            pageStack: ['search'],
            currentPage: 'search'
          },
          false,
          'clearStack'
        )
    }),
    {
      name: 'Navigation Store'
    }
  )
) 