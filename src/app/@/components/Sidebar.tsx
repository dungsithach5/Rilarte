import { Home, MessageSquare, User, Search, Settings, Bell, Plus } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="fixed top-0 left-0 h-screen w-20 bg-[#101315] flex flex-col items-center py-4 gap-6 text-white border-r border-[#2C343A]">
      <div className="" />
      <NavIcon icon={<Home size={24} />} />
      <NavIcon icon={<MessageSquare size={24} />} />
      <NavIcon icon={<User size={24} />} />
      <NavIcon icon={<Search size={24} />} />
      <NavIcon icon={<Bell size={24} />} />
      <NavIcon icon={<Plus size={24} />} />
      <div className="mt-auto">
        <NavIcon icon={<Settings size={24} />} />
      </div>
    </aside>
  );
}

function NavIcon({ icon }: { icon: React.ReactNode }) {
  return (
    <div className="w-10 h-10 flex items-center justify-center rounded hover:bg-zinc-700 cursor-pointer transition">
      {icon}
    </div>
  );
}
