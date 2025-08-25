"use client";

import { useEffect, useState } from "react";
import { searchUsers } from "../../../services/Api/users";

interface User {
  id: number;
  username: string;
  avatar_url?: string;
}

interface Props {
  keyword: string;
  onSelect?: (user: User) => void;
}

export default function UserSearchResults({ keyword, onSelect }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!keyword) {
      setUsers([]);
      return;
    }

    setLoading(true);
    searchUsers(keyword)
      .then((data) => setUsers(data))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [keyword]);

  if (!keyword) return null;

  return (
    <div className="absolute top-14 w-full max-w-md z-20">
      {users.length > 0 && (
        <ul className="bg-white max-w-md border rounded-lg shadow-lg p-3">
          {users.map((user) => (
            <li
              key={user.id}
              className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer"
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect?.(user);
              }}
            >
              <img
                src={user.avatar_url || "/default-avatar.png"}
                alt={user.username}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex flex-col">
                <span className="font-medium">{user.username}</span>
                <span className="text-sm text-gray-400">@{user.username}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
