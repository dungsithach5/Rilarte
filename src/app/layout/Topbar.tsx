"use client"

import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../context/store";
import { logout } from "../context/userSlice";

export default function Topbar() {
  const { isAuthenticated, avatar } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
  };

  return (
    <header className="fixed top-0 left-20 right-0 h-16 bg-[#101315] flex items-center justify-between text-white shadow z-10 px-6 border-b border-[#2C343A]">
      <div className="flex items-center">
        {/* Logo hoặc các thành phần khác nếu cần */}
      </div>

      <div className="absolute left-1/2 transform -translate-x-1/2 w-1/3">
        <input
          type="text"
          placeholder="Search"
          className="bg-[#20262A] text-sm px-4 py-2 w-full rounded-full outline-none"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="bg-zinc-700 px-4 py-2 rounded-md">+ Create</button>
        <Image
          src={
            isAuthenticated
              ? avatar || "/default-avatar.png"
              : "/default-icon.png"
          }
          alt="Profile"
          width={32}
          height={32}
          className="rounded-full"
        />
        {isAuthenticated && (
          <button
            onClick={handleLogout}
            className="ml-2 px-2 py-1 bg-red-500 text-white rounded"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
}
