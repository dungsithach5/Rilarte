"use client"

export default function AccountSettings() {
  return (
    <section>
      <div className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Your Account</h2>

            <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                <input
                type="email"
                className="w-full rounded-xl border border-gray-200 p-2"
                placeholder="you@example.com"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">New Password</label>
                <input
                type="password"
                className="w-full rounded-xl border border-gray-200 p-2"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Confirm Password</label>
                <input
                type="password"
                className="w-full rounded-xl border border-gray-200 p-2"
                />
            </div>
            </div>

            <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>

            <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Date of Birth</label>
                <input
                type="date"
                className="w-full rounded-xl border border-gray-200 p-2"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Gender</label>
                <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                    type="radio"
                    name="gender"
                    value="male"
                    className="accent-black"
                    />
                    Male
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                    type="radio"
                    name="gender"
                    value="female"
                    className="accent-black"
                    />
                    Female
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                    type="radio"
                    name="gender"
                    value="other"
                    className="accent-black"
                    />
                    Other
                </label>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Country</label>
                <input
                type="text"
                className="w-full rounded-xl border border-gray-200 p-2"
                placeholder="e.g., Vietnam"
                />
            </div>
            </div>
        </div>

        <div className="mt-4 space-y-4">
            <div className="flex flex-col">
                <h2 className="text-lg">Delete data and your account</h2>
                <p className="text-sm text-gray-600">Deleting your account is irreversible. All your data will be permanently removed.</p>
            </div>
            <button className="text-red-600 border border-red-400 text-sm font-semibold py-2 px-4 rounded-full hover:bg-red-50 transition cursor-pointer">
            Delete Account
            </button>
        </div>
        <div className="mt-6">
            <button className="bg-black text-white text-sm font-semibold py-2 px-4 rounded-full hover:bg-gray-800 transition cursor-pointer">
            Save Changes
            </button>
        </div>
    </section>
  );
}
