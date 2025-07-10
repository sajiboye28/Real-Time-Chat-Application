import React from 'react';
import { Users } from 'lucide-react';
import { User } from '../types/chat';

interface UserListProps {
  users: User[];
  currentUserId: string;
}

export const UserList: React.FC<UserListProps> = ({ users, currentUserId }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm border-r border-gray-200 w-64 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-blue-500" />
          <h2 className="font-semibold text-gray-800">Online Users</h2>
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
            {users.length}
          </span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className={`flex items-center space-x-3 p-2 rounded-lg transition-all duration-200 ${
                user.id === currentUserId 
                  ? 'bg-blue-50 border border-blue-200' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="relative">
                <div className={`w-10 h-10 rounded-full ${user.avatar} flex items-center justify-center text-white font-semibold`}>
                  {user.username[0].toUpperCase()}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-800 truncate">
                    {user.username}
                  </span>
                  {user.id === currentUserId && (
                    <span className="text-xs text-blue-500 font-medium">(You)</span>
                  )}
                </div>
                <div className="text-xs text-green-600">Online</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};