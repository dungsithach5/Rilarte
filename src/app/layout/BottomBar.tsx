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

export default function BottomBar() {
  return (
    <aside className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-2xl border border-[#2C343A] px-4 py-2 flex flex-row items-center gap-4 shadow-md">
      <NavIcon icon={<Home size={24} />} />
      <NavIcon icon={<DrawerChat />} />
      <NavIcon icon={<Plus size={24} />} />
      <NavIcon icon={<Bell size={24} />} />
      <NavIcon icon={
        <Link href="/auth">
          <User size={24} />
        </Link>
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
