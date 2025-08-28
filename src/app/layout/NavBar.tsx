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
  const userState = useSelector((state: RootState) => state.user);

  // Destructure an toàn với giá trị mặc định
  const isAuthenticated = userState?.isAuthenticated ?? false;
  const avatar = userState?.avatar ?? "/img/user.png";
  const user = userState?.user ?? null;

  const { data: session } = useSession()
  const router = useRouter()

  // Lấy user ID từ Redux hoặc session
  const currentUserId = user?.id || session?.user?.id;

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
    <nav className="fixed z-50 bg-white w-full mx-auto flex items-center justify-between px-12 py-2 border-b">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-3xl text-black font-[Alkaline]">
          Rilarte
        </Link>

        <Link href="/explore" className="text-sm text-black font-semibold">
          Explore
        </Link>
      </div>

      <SearchInput onSearch={handleSearch} />

      {(session || isAuthenticated) ? (
        <div className="flex items-center gap-4">
          <DropdownUser
            avatar={
              <img
                src={avatar || session?.user?.image || "/img/user.png"}
                alt="avatar"
                className="w-8 h-8 rounded-full object-cover"
              />
            }
            userId={currentUserId}
            username={user?.username || session?.user?.name || "user"}
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
