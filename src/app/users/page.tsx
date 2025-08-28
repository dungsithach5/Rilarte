"use client"

import { useState, useEffect } from 'react';
import API from '../services/Api';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';

interface User {
  id: number;
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
        
        if (response.data.success && response.data.users) {
          setUsers(response.data.users);
        } else {
          console.error('Invalid response format:', response.data);
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
      <div className="flex justify-center items-center min-h-screen bg-gray-100 text-black">
        <div className="text-xl">Loading users...</div>
      </div>
    );
  }

  // Lọc ra người dùng hiện tại
  const filteredUsers = users.filter(userItem => {
    const currentUserId = user?.id || session?.user?.id;
    return userItem.id !== currentUserId;
  });

  return (
    <div className="flex flex-col items-center min-h-screen text-black py-8 mb-12">
      <h1 className="text-xl text-left font-medium mb-8 mt-12">Discover Users</h1>
      
      <div className="w-full max-w-4xl space-y-3 grid grid-cols-2 gap-2">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((userItem) => {
            const avatarUrl = userItem.avatar_url || userItem.image || '/img/user.png';
            
            return (
              <Link
                key={userItem.id}
                href={`/profile/${userItem.id}/${userItem.username}`}
                className="block"
              >
                <div className="flex items-center space-x-3 bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:border-black transition-colors duration-200">
                  <div className="w-12 h-12 flex-shrink-0 rounded-full overflow-hidden">
                    <img
                      src={avatarUrl}
                      alt={userItem.username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-sm font-semibold">{userItem.username}</h3>
                    {userItem.email && (
                      <p className="text-xs text-gray-600">{userItem.email}</p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No users found</p>
          </div>
        )}
      </div>
    </div>
  );
}