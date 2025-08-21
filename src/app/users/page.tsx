"use client"

import { useState, useEffect } from 'react';
import API from '../services/Api';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';

interface User {
  id: string; // Changed to string to match BigInt from database
  username: string;
  avatar_url?: string;
  image?: string;
  email?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, session } = useAuth(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await API.get('/users/public');
        if (response.data.success) {
          setUsers(response.data.users);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Discover Users</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {users.map((userItem) => {
          // Bỏ qua user hiện tại
          const currentUserId = user?.id || session?.user?.id;
          if (userItem.id.toString() === currentUserId?.toString()) {
            return null;
          }

          const avatarUrl = userItem.avatar_url || userItem.image || '/img/user.png';
          
          return (
            <div key={userItem.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden">
                  <img
                    src={avatarUrl}
                    alt={userItem.username}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <h3 className="text-lg font-semibold mb-2">{userItem.username}</h3>
                
                {userItem.email && (
                  <p className="text-gray-600 text-sm mb-4">{userItem.email}</p>
                )}
                
                <Link
                  href={`/profile/${userItem.id}`}
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  View Profile
                </Link>
              </div>
            </div>
          );
        })}
      </div>
      
      {users.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No users found</p>
        </div>
      )}
    </div>
  );
} 