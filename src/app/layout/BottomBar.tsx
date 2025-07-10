import Link from "next/link";
import {
  Plus,
} from "lucide-react";
import {
  HomeIcon as HomeOutline,
  Cog6ToothIcon as CogOutline,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeSolid,
  Cog6ToothIcon as CogSolid,
} from "@heroicons/react/24/solid";
import { useState } from "react";
import DrawerChat from "../@/components/message/DrawerChat";
import DrawerNotification from "../@/components/notification/DrawerNotification";

export default function BottomBar() {
  const [activeIcon, setActiveIcon] = useState<string>("home");

  return (
    <aside className="bg-white fixed bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-[#2C343A] px-4 py-2 flex flex-row items-center gap-4 shadow-md">
      <NavIcon
        onClick={() => setActiveIcon("home")}
        icon={
          <Link href="/">
            {activeIcon === "home" ? (
              <HomeSolid className="w-7 h-7" />
            ) : (
              <HomeOutline className="w-7 h-7" />
            )}
          </Link>
        }
      />
      <NavIcon icon={<DrawerChat />} />
      <NavIcon icon={
        <Link href="/post">
          <Plus size={28} />
        </Link>
      } />
      <NavIcon icon={<DrawerNotification />} />
      <NavIcon
        onClick={() => setActiveIcon("settings")}
        icon={
          <Link href="/settings">
            {activeIcon === "settings" ? (
              <CogSolid className="w-7 h-7" />
            ) : (
              <CogOutline className="w-7 h-7" />
            )}
          </Link>
        }
      />
    </aside>
  );
}

function NavIcon({
  icon,
  onClick,
}: {
  icon: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <div
      className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-200 cursor-pointer transition"
      onClick={onClick}
    >
      {icon}
    </div>
  );
}
