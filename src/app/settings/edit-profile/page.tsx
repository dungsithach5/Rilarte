"use client"

import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useSession } from "next-auth/react";
import { useSelector } from "react-redux";

export default function EditProfile() {
  const { user, session, status } = useAuth(true);
  const { update } = useSession();
  const reduxUser = useSelector((state: any) => state.user.user);

  // Debug log
  console.log('=== EDIT PROFILE DEBUG ===');
  console.log('useAuth user:', user);
  console.log('useAuth session:', session);
  console.log('useAuth status:', status);
  console.log('Redux user:', reduxUser);
  console.log('Redux state:', useSelector((state: any) => state.user));
  console.log('Redux user details:', reduxUser ? {
    id: reduxUser.id,
    email: reduxUser.email,
    username: reduxUser.username,
    name: reduxUser.name,
    bio: reduxUser.bio,
    avatar: reduxUser.avatar
  } : 'No redux user');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    username: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    // Ưu tiên Redux user, fallback về NextAuth session
    const currentUser = reduxUser || session?.user;
    
    if (currentUser) {
      setFormData({
        name: currentUser.name || currentUser.username || "",
        bio: (currentUser as any).bio || "",
        username: (currentUser as any).username || currentUser.name || "",
      });
      setPreviewUrl(currentUser.image || currentUser.avatar || null);
    }
  }, [session, reduxUser]);

  useEffect(() => {
    if (!selectedFile) {
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage({ type: "error", text: "Please select an image file!" });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: "error", text: "Image size must be less than 5MB!" });
        return;
      }

      setSelectedFile(file);
      setMessage({ type: "", text: "" });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        setMessage({ type: "error", text: "Name is required!" });
        return;
      }

      if (!formData.username.trim()) {
        setMessage({ type: "error", text: "Username is required!" });
        return;
      }

      // TODO: Upload image if selected
      if (selectedFile) {
        setUploading(true);
        // Simulate image upload
        await new Promise(resolve => setTimeout(resolve, 2000));
        setUploading(false);
      }

      // TODO: Call API to update profile
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setMessage({ type: "success", text: "Profile updated successfully!" });
      
      // Update session
      await update();
      
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update profile!" });
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setPreviewUrl(reduxUser?.image || session?.user?.image || null);
  };

  if (status === "loading" && !reduxUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!reduxUser && !session) return null;

  return (
    <div className="p-6">
      <div className="space-y-8">

        {/* Message */}
        {message.text && (
          <div className={`p-4 rounded-lg ${
            message.type === "success" 
              ? "bg-green-50 text-green-800 border border-green-200" 
              : "bg-red-50 text-red-800 border border-red-200"
          }`}>
            {message.text}
          </div>
        )}

        {/* Profile Form */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          {/* Avatar Section */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
            
            <div className="flex items-center gap-6">
              {/* Avatar Preview */}
              <div className="relative">
                <img
                  src={previewUrl || "/img/user.png"}
                  alt="Avatar Preview"
                  className="h-24 w-24 rounded-full object-cover border-4 border-gray-200 shadow-lg"
                />
                {uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="avatar-upload"
                    className="inline-block bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors duration-200"
                  >
                    {uploading ? "Uploading..." : "Change Picture"}
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={uploading}
                  />
                </div>
                
                {previewUrl && previewUrl !== (reduxUser?.image || session?.user?.image) && (
                  <button
                    onClick={removeImage}
                    className="text-red-600 text-sm hover:text-red-700 transition-colors duration-200"
                  >
                    Remove
                  </button>
                )}
                
                <p className="text-xs text-gray-500">
                  JPG, PNG or GIF. Max size 5MB.
                </p>
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter your display name"
              maxLength={50}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.name.length}/50 characters
            </p>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter your username"
              maxLength={30}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.username.length}/30 characters. Only letters, numbers, and underscores.
            </p>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder="Tell us about yourself..."
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.bio.length}/200 characters
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={loading || uploading}
            className="bg-blue-600 text-white text-sm font-semibold py-3 px-8 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
