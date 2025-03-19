import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from 'zustand/middleware/immer'

interface InputState {
  text: string
  setText: (text: string) => void
}

export const useInputStore = create<InputState>()(
  devtools(
    immer(
      (set, get) => ({
        text: '',
        setText: (text) => set({ text }),
      })
    ),
    {
      name: 'InputStore',
    }
  )
)