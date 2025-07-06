"use client"

import { useState, useEffect } from "react";

export default function EditProfile() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

  return (
    <section>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Edit Profile</h2>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-600 mb-2">Avatar</label>
            <div className="flex items-center space-x-2">
                <img
                    src={previewUrl || "/img/user.png"}
                    alt="Avatar Preview"
                    className="h-20 w-20 rounded-full object-cover border"
                />

                <div className="mt-2 space-x-2">
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

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
          <input className="w-full rounded-xl border border-gray-200 p-2 focus:outline-none focus:ring-2 focus:ring-black" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Bio</label>
          <textarea className="w-full rounded-xl border border-gray-200 p-2 focus:outline-none focus:ring-2 focus:ring-black" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Username</label>
          <input className="w-full rounded-xl border border-gray-200 p-2 focus:outline-none focus:ring-2 focus:ring-black" />
        </div>
      </div>

      <button className="mt-6 bg-black text-white text-sm font-semibold py-2 px-4 rounded-full hover:bg-gray-800 transition cursor-pointer">
        Save Changes
      </button>
    </section>
  );
}
