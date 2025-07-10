import React from 'react';
import { Message } from '../types/chat';

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isCurrentUser }) => {
  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-start max-w-xs lg:max-w-md ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
        <div className={`w-8 h-8 rounded-full ${message.user.avatar} flex items-center justify-center text-white font-semibold text-sm ${isCurrentUser ? 'ml-2' : 'mr-2'}`}>
          {message.user.username[0].toUpperCase()}
        </div>
        
        <div className={`rounded-2xl px-4 py-2 ${
          isCurrentUser 
            ? 'bg-blue-500 text-white rounded-tr-sm' 
            : 'bg-white text-gray-800 rounded-tl-sm shadow-sm'
        }`}>
          {!isCurrentUser && (
            <div className="text-xs font-semibold text-gray-500 mb-1">
              {message.user.username}
            </div>
          )}
          <div className="text-sm">{message.text}</div>
          <div className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-100' : 'text-gray-400'}`}>
            {formatTime(message.timestamp)}
          </div>
        </div>
      </div>
    </div>
  );
};