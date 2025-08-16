"use client"
import { createContext, useContext, useState } from "react"

interface SearchContextType {
  keyword: string
  setKeyword: (value: string) => void
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [keyword, setKeyword] = useState("")
  return (
    <SearchContext.Provider value={{ keyword, setKeyword }}>
      {children}
    </SearchContext.Provider>
  )
}

export function useSearch() {
  const ctx = useContext(SearchContext)
  if (!ctx) throw new Error("useSearch must be used inside SearchProvider")
  return ctx
}