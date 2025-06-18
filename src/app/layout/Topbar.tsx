import Image from "next/image";

export default function Topbar() {
  return (
    <header className="fixed top-0 left-20 right-0 h-16 bg-[#101315] flex items-center justify-between text-white shadow z-10 px-6 border-b border-[#2C343A]">
  <div className="flex items-center">
   
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
      src="/user.jpg"
      alt="Profile"
      width={32}
      height={32}
      className="rounded-full"
    />
  </div>
</header>

  );
}
