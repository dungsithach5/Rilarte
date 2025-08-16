'use client'

import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "../context/store"
import Link from 'next/link'
import { useSession } from "next-auth/react"
import DropdownUser from "../@/components/dropdown-user"
import { useRouter } from 'next/navigation'
import { setColor, setKeyword } from "../context/searchSlice";
import SearchInput from "../@/components/feature-search/search-input"

export function NavBar() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, avatar } = useSelector((state: RootState) => state.user)
  const { data: session } = useSession()
  const router = useRouter()

  const handleLogin = () => {
    router.push('/auth')
  }

  function isHexColor(str: string): boolean {
    const hexColorRegex = /^#([0-9A-Fa-f]{3}){1,2}$/;
    return hexColorRegex.test(str);
  }

  const handleSearch = (keyword: string) => {
    const trimmed = keyword.trim();
  
    if (isHexColor(trimmed)) {
      dispatch(setColor(trimmed));
    } else {
      dispatch(setKeyword(trimmed));
    }
  
    router.push("/");
  };

  return (
    <nav className="fixed z-50 bg-white w-full mx-auto flex items-center justify-between px-6 py-2 rounded-full">
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
