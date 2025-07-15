"use client"

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Session } from "next-auth";
import { useRouter } from "next/navigation";


declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      gender?: string; 
    };
  }
}

export default function AccountSettings() {
  
  const { data: session, status } = useSession({ required: true });
  const router = useRouter();

  const [gender, setGender] = useState("");
  const [saving, setSaving] = useState(false);
  

  useEffect(() => {
    if (session?.user?.gender) {
      setGender(session.user.gender);
    }
  }, [session]);

  const handleGenderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGender(e.target.value);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/users/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session?.user?.id, gender }),
      });
      router.refresh(); 
      alert("Changes saved successfully!");
    } catch (err) {
      console.error("Failed to update profile", err);
      alert("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading") return <div>Loading...</div>;

  return (
    <section className="max-w-2xl mx-auto px-4 py-8 space-y-8">
  {/* Account Information */}
  <div className="space-y-6">
    <h2 className="text-lg font-semibold text-gray-800">Account Information</h2>

    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-600">Email</label>
        <input
          type="email"
          value={session?.user?.email || ""}
          readOnly
          className="w-full bg-transparent border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-900"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600">New Password</label>
          <input
            type="password"
            disabled
            placeholder="Coming soon..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-400"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600">Confirm Password</label>
          <input
            type="password"
            disabled
            placeholder="Coming soon..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-400"
          />
        </div>
      </div>
    </div>
  </div>

  {/* Personal Info */}
  <div className="space-y-5">
    <h2 className="text-lg font-semibold text-gray-800">Personal Info</h2>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-600">Date of Birth</label>
        <input
          type="date"
          disabled
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-400"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-600">Gender</label>
        <div className="flex flex-wrap gap-3">
          {["male", "female", "other"].map((value) => (
            <label
              key={value}
              className={`px-4 py-2 text-sm font-medium border rounded-full cursor-pointer transition ${
                gender === value
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              <input
                type="radio"
                name="gender"
                value={value}
                className="hidden"
                checked={gender === value}
                onChange={handleGenderChange}
              />
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </label>
          ))}
        </div>
      </div>
    </div>
  </div>

  {/* Danger Zone */}
  <div className="space-y-4">
    <h2 className="text-lg font-semibold text-red-600">Delete Account</h2>
    <p className="text-sm text-gray-500">
      This will permanently delete your account and all associated data.
    </p>
    <button
      disabled
      className="text-sm text-red-600 font-medium underline underline-offset-4 cursor-not-allowed"
    >
      Delete My Account
    </button>
  </div>

  {/* Save Button */}
  <div className="pt-6 flex justify-end">
    <button
      onClick={handleSave}
      disabled={saving}
      className="px-6 py-3 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-900 transition disabled:opacity-50"
    >
      {saving ? "Saving..." : "Save Changes"}
    </button>
  </div>
</section>

   
  )}