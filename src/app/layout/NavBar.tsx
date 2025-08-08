'use client'

import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "../context/store"
import Link from 'next/link'
import { useSession } from "next-auth/react"
import DropdownUser from "../@/components/dropdown-user"
import { useRouter } from 'next/navigation'
import { setKeyword } from "../context/searchSlice";
import SearchInput from "../@/components/feature-search/search-input";

export function NavBar() {
  const dispatch = useDispatch<AppDispatch>();
  const keyword = useSelector((state: RootState) => state.search.keyword);
  const { isAuthenticated, avatar } = useSelector((state: RootState) => state.user)
  const { data: session } = useSession()
  // const [inputValue, setInputValue] = useState(keyword);
  const router = useRouter()

  const handleLogin = () => {
    router.push('/auth')
  }

  // useEffect(() => {
  //   setInputValue(keyword);
  // }, [keyword]);

  const handleSearch = (keyword: string) => {
    dispatch(setKeyword(keyword.trim()));
    if (typeof window !== "undefined") {
      router.push("/");
    }
  };

  return (
    <nav className="w-full mx-auto flex items-center justify-between px-6 py-2 rounded-full">
      <Link href="/" className="text-xl font-bold text-black">
        Elarte
      </Link>

      <SearchInput onSearch={handleSearch} />

      {(session || isAuthenticated) ? (
        <div className="flex items-center gap-4">
          <DropdownUser
            avatar={
              <img
                src={avatar || session?.user?.image || "/img/user.png"}
                alt="avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
            }
          />
        </div>
      ) : (
        <button
          onClick={handleLogin}
          className="px-5 py-2 font-semibold text-sm text-white bg-black rounded-full hover:bg-gray-800 cursor-pointer"
        >
          Login
        </button>
      )}
    </nav>
  )
}
