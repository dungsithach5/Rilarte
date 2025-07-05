import { useSelector } from "react-redux";
import type { RootState } from "../context/store";
import Link from "next/link";
import {
  Home,
  MessageSquare,
  User,
  Search,
  Settings,
  Bell,
  Plus,
} from "lucide-react";
import DrawerChat from "../@/components/message/DrawerChat";
import DrawerNotification from "../@/components/notification/DrawerNotification";
import DropdownUser from "../@/components/dropdown-user";

export default function BottomBar() {
    const { isAuthenticated, avatar } = useSelector((state: RootState) => state.user);

  return (
    <aside className="bg-white fixed bottom-4 left-1/2 -translate-x-1/2 rounded-2xl border border-[#2C343A] px-4 py-2 flex flex-row items-center gap-4 shadow-md">
      <NavIcon icon={
        <Link href="/">
          <Home size={24} />
        </Link>
      } />
      <NavIcon icon={<DrawerChat />} />
      <NavIcon icon={
        <Link href="/post">
          <Plus size={24} />
        </Link>
      } />
      <NavIcon icon={<Bell size={24} />} />
      <NavIcon icon={<DrawerNotification />} />
      <NavIcon icon={
        isAuthenticated ? (
          <DropdownUser
            avatar={
              <img
                src={avatar || "/img/user.png"}
                alt="avatar"
                className="rounded-full object-cover"
              />
            }
          />
        ) : (
          <Link href="/auth">
            <User size={24} />
          </Link>
        )
      } />
    </aside>
  );
}

function NavIcon({ icon }: { icon: React.ReactNode }) {
  return (
    <div className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-200 cursor-pointer transition">
      {icon}
    </div>
  );
}
