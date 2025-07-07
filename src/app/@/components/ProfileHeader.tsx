import { useAuth } from "../../hooks/useAuth"

export default function ProfileHeader() {
  const { session, status } = useAuth(true)

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session) {
    return null
  }

  return (
    <section className="w-full">      
      <img
        src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Z3JhZGllbnR8ZW58MHx8MHx8fDA%3D"
        alt=""
        className="w-full h-[300px] object-cover"
      />

      <div className="absolute top-60 left-1/2 transform -translate-x-1/2 w-48 h-48 rounded-full overflow-hidden">
        {session.user?.image && (
          <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" />
        )}
      </div>
      <div className="mt-24 text-center">
        <h2 className="text-xl font-semibold">{session.user?.name}</h2>
        <p className="text-gray-400">{session.user?.email}</p>
      </div>

      <div className="flex justify-center gap-4 mt-4 text-center">
        <button className="border px-4 py-2 rounded-full cursor-pointer hover:text-white hover:bg-black">Follow</button>
        <button className="border px-4 py-2 rounded-full cursor-pointer hover:text-white hover:bg-black">Message</button>
      </div>
    </section>
  );
}
  