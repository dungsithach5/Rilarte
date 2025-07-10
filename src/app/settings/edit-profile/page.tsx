"use client"

import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";

export default function EditProfile() {
  const { session, status } = useAuth(true);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    console.log({
      name,
      bio,
      username,
      avatar: selectedFile,
    });
    alert("Profile updated!");
  };

  if (status === "loading") return <div>Loading...</div>;
  if (!session) return null;

  return (
    <section className="max-w-xl mx-auto">
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800">Edit Profile</h2>

        {/* Avatar */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-600">Avatar</label>
          <div className="flex items-center gap-4">
            <img
              src={previewUrl || session.user?.image || "/img/user.png"}
              alt="Avatar Preview"
              className="h-20 w-20 rounded-full object-cover border"
            />
            <div>
              <label
                htmlFor="avatar-upload"
                className="inline-block bg-gray-100 text-sm text-gray-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-200 transition"
              >
                Change Avatar
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-gray-200 p-2 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full rounded-xl border border-gray-200 p-2 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-xl border border-gray-200 p-2 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="mt-4 bg-black text-white text-sm font-semibold py-2 px-4 rounded-full hover:bg-gray-800 transition cursor-pointer"
        >
          Save Changes
        </button>
      </div>
    </section>
  );
}
