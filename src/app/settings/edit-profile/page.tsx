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
    <section className="max-w-md sm:max-w-lg lg:max-w-xl mx-auto px-4 sm:px-6 py-6 bg-white ">
    <div className="space-y-6">
      {/* Title */}
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Edit Profile</h2>
  
      {/* Avatar */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Avatar</label>
        <div className="flex items-center gap-4">
          <img
            src={previewUrl || session.user?.image || "/img/user.png"}
            alt="Avatar Preview"
            className="h-16 w-16 sm:h-20 sm:w-20 rounded-full object-cover ring-2 ring-gray-200"
          />
          <div>
            <label
              htmlFor="avatar-upload"
              className="inline-block bg-gray-100 text-sm text-gray-800 px-3 py-1 sm:px-4 sm:py-2 rounded-lg cursor-pointer hover:bg-gray-200 transition"
            >
              Change
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
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-black transition"
        />
      </div>
  
      {/* Bio */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Short description about you"
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-black transition resize-none"
        />
      </div>
  
      {/* Username */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="e.g. johndoe"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-black transition"
        />
      </div>
  
      {/* Save */}
      <div>
        <button
          onClick={handleSubmit}
          className="w-full bg-black text-white text-sm sm:text-base font-semibold py-2 sm:py-3 rounded-full hover:bg-gray-800 transition"
        >
          Save Changes
        </button>
      </div>
    </div>
  </section>  

  );
}
