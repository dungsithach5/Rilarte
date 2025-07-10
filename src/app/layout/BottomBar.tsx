import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Plus,
  ArrowUp,
} from "lucide-react";
import {
  HomeIcon as HomeOutline,
  Cog6ToothIcon as CogOutline,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeSolid,
  Cog6ToothIcon as CogSolid,
} from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import DrawerChat from "../@/components/message/DrawerChat";
import DrawerNotification from "../@/components/notification/DrawerNotification";

export default function BottomBar() {
  const [activeIcon, setActiveIcon] = useState<string>("home");
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <aside className="bg-white fixed bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-[#2C343A] px-4 py-2 flex flex-row items-center gap-4 shadow-md z-50">
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
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            onClick={scrollToTop}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-5 left-[59%] bg-white border border-[#2C343A] p-4 rounded-full hover:bg-gray-100 z-50 cursor-pointer"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
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
