"use client"

import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useSession } from "next-auth/react";
import { useSelector } from "react-redux";
import Cookies from "js-cookie";

export default function AccountSettings() {
  const { session, status } = useAuth(true);
  const { update } = useSession();
  const reduxUser = useSelector((state: any) => state.user.user);
  
  const [formData, setFormData] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
    gender: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    // Ưu tiên Redux user, fallback về NextAuth session
    const currentUser = reduxUser || session?.user;
    
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        email: currentUser.email || "",
        gender: (currentUser as any).gender || "",
      }));
    }
  }, [session, reduxUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // Validate passwords match
      if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
        setMessage({ type: "error", text: "Passwords do not match!" });
        return;
      }

      // Validate password strength
      if (formData.newPassword) {
        if (formData.newPassword.length < 6) {
          setMessage({ type: "error", text: "Password must be at least 6 characters!" });
          return;
        }
        
        // Check if password contains both letters and numbers
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
        if (!passwordRegex.test(formData.newPassword)) {
          setMessage({ type: "error", text: "Password must contain both letters and numbers!" });
          return;
        }
      }

      // Get token for authentication
      const token = Cookies.get('token') || localStorage.getItem('token');
      console.log('Token for update:', token ? 'Token exists' : 'No token found');
      
      if (!token) {
        setMessage({ type: "error", text: "Authentication required. Please login again." });
        return;
      }

      // Get user ID from database by email
      const userEmail = formData.email;
      console.log('Getting user ID for email:', userEmail);
      
      // First, get user ID from database
      const userResponse = await fetch(`http://localhost:5001/api/users/email/${userEmail}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!userResponse.ok) {
        throw new Error('Failed to get user data');
      }
      
      const userData = await userResponse.json();
      const userId = userData.user.id;
      
      console.log('Updating user with ID:', userId);
      console.log('Update data:', { gender: formData.gender, hasPassword: !!formData.newPassword });
      
      const response = await fetch(`http://localhost:5001/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          gender: formData.gender,
          ...(formData.newPassword && { password: formData.newPassword })
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Update API error:', response.status, errorText);
        throw new Error(`Failed to update settings: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setMessage({ type: "success", text: "Settings updated successfully!" });
        
        // Update session with new data
        await update({
          ...session,
          user: {
            ...(session?.user || reduxUser),
            gender: formData.gender,
          }
        });
        
        // Clear password fields
        setFormData(prev => ({ ...prev, newPassword: "", confirmPassword: "" }));
      } else {
        throw new Error(result.message || 'Failed to update settings');
      }
      
    } catch (error) {
      console.error('Error updating settings:', error);
      setMessage({ type: "error", text: "Failed to update settings!" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      setLoading(true);
      setMessage({ type: "", text: "" });

      try {
        const token = Cookies.get('token') || localStorage.getItem('token');
        console.log('Token for delete:', token ? 'Token exists' : 'No token found');
        
        if (!token) {
          setMessage({ type: "error", text: "Authentication required. Please login again." });
          return;
        }

        // Get user ID from database by email
        const userEmail = formData.email;
        const userResponse = await fetch(`http://localhost:5001/api/users/email/${userEmail}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!userResponse.ok) {
          throw new Error('Failed to get user data');
        }
        
        const userData = await userResponse.json();
        const userId = userData.user.id;
        
        const response = await fetch(`http://localhost:5001/api/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setMessage({ type: "success", text: "Account deleted successfully!" });
          // Redirect to logout after 2 seconds
          setTimeout(() => {
            window.location.href = '/auth';
          }, 2000);
        } else {
          const errorText = await response.text();
          console.error('Delete API error:', response.status, errorText);
          throw new Error(`Failed to delete account: ${response.status}`);
        }
      } catch (error) {
        console.error('Error deleting account:', error);
        setMessage({ type: "error", text: "Failed to delete account!" });
      } finally {
        setLoading(false);
      }
    }
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

        {/* Account Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                  disabled
                />
                <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h2>
            
            <div className="space-y-4">


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Gender</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { 
                      value: "male", 
                      label: "Male",
                      color: "blue",
                      icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )
                    },
                    { 
                      value: "female", 
                      label: "Female",
                      color: "pink",
                      icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )
                    }
                  ].map((option) => (
                    <label 
                      key={option.value} 
                      className={`relative flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        formData.gender === option.value
                          ? option.color === 'blue' 
                            ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-500/20'
                            : 'border-pink-500 bg-pink-50 shadow-md shadow-pink-500/20'
                          : option.color === 'blue'
                            ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                            : 'border-gray-200 hover:border-pink-300 hover:bg-pink-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="gender"
                        value={option.value}
                        checked={formData.gender === option.value}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      
                      {/* Icon */}
                      <div className={`flex-shrink-0 p-2 rounded-lg transition-colors duration-200 ${
                        formData.gender === option.value
                          ? option.color === 'blue'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-pink-100 text-pink-600'
                          : option.color === 'blue'
                            ? 'bg-blue-50 text-blue-500'
                            : 'bg-pink-50 text-pink-500'
                      }`}>
                        {option.icon}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1">
                        <div className={`font-medium transition-colors duration-200 ${
                          formData.gender === option.value
                            ? option.color === 'blue'
                              ? 'text-blue-900'
                              : 'text-pink-900'
                            : 'text-gray-700'
                        }`}>
                          {option.label}
                        </div>
                      </div>
                      
                      {/* Check indicator */}
                      {formData.gender === option.value && (
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                          option.color === 'blue' ? 'bg-blue-500' : 'bg-pink-500'
                        }`}>
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>


            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 rounded-xl border border-red-200 p-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-red-800">Delete Account</h2>
              <p className="text-sm text-red-600 mt-1">
                Deleting your account is irreversible. All your data will be permanently removed.
              </p>
            </div>
            <button 
              onClick={handleDeleteAccount}
              disabled={loading}
              className="bg-red-600 text-white text-sm font-semibold py-3 px-6 rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {loading ? "Deleting..." : "Delete Account"}
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSaveChanges}
            disabled={loading}
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
