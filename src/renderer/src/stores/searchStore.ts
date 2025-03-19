import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from 'zustand/middleware/immer'
interface SearchState {
  selectedIndex: number;
  searchResults: SearchResult[];
  setSelectedIndex: (index: number) => void;
  setSearchResults: (results: SearchResult[]) => void;
  selectNextItem: () => void;
  selectPreviousItem: () => void;
  handleKeyDown: (
    e: React.KeyboardEvent<HTMLInputElement>,
    options: {
      executeAction: () => void;
      back: () => void;
    }
  ) => void;
}

// 创建搜索模块处理器
export const useSearchStore = create<SearchState>()(
  devtools(
    immer(
      (set, get) => ({
        selectedIndex: 0,
        searchResults: [],
        
        setSelectedIndex: (index) => set({ selectedIndex: index }),
        setSearchResults: (results) => set({ searchResults: results }),
        
        
        // 选择下一个项目
        selectNextItem: () => {
          const { searchResults, selectedIndex } = get();
          set({ 
            selectedIndex: selectedIndex < searchResults.length - 1 
              ? selectedIndex + 1 
              : 0 
          });
        },
        
        // 选择上一个项目
        selectPreviousItem: () => {
          const { searchResults, selectedIndex } = get();
          set({ 
            selectedIndex: selectedIndex > 0 
              ? selectedIndex - 1 
              : searchResults.length - 1 
          });
        },
        
        // 处理键盘事件
        handleKeyDown: (e, { executeAction, back }) => {
          const { selectNextItem, selectPreviousItem } = get();
          
          switch (e.key) {
            case 'ArrowUp':
              e.preventDefault();
              selectPreviousItem();
              break;
            case 'ArrowDown':
              e.preventDefault();
              selectNextItem();
              break;
            case 'Enter':
              executeAction();
              break;
            case 'Escape':
              back();
              break;
          }
        },
      })
    ),
    {
      name: 'SearchStore',
    }
  )
);