import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../hooks/useSocket';
import { User, Message } from '../types/chat';
import { ChatMessage } from './ChatMessage';
import { MessageInput } from './MessageInput';
import { UserList } from './UserList';
import { TypingIndicator } from './TypingIndicator';
import { MessageCircle } from 'lucide-react';

interface ChatRoomProps {
  user: User;
  onLogout: () => void;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({ user, onLogout }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socket = useSocket('http://localhost:3001');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (socket) {
      // Join the chat
      socket.emit('user_join', user);

      // Listen for message history
      socket.on('message_history', (history: Message[]) => {
        setMessages(history);
      });

      // Listen for new messages
      socket.on('new_message', (message: Message) => {
        setMessages(prev => [...prev, message]);
        
        // Show notification if not current user
        if (message.user.id !== socket.id && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification(`New message from ${message.user.username}`, {
              body: message.text,
              icon: '/vite.svg'
            });
          }
        }
      });

      // Listen for users updates
      socket.on('users_update', (userList: User[]) => {
        setUsers(userList);
      });

      // Listen for typing indicators
      socket.on('user_typing', ({ user: typingUser, typing }) => {
        setTypingUsers(prev => {
          if (typing) {
            return prev.includes(typingUser.username) 
              ? prev 
              : [...prev, typingUser.username];
          } else {
            return prev.filter(username => username !== typingUser.username);
          }
        });
      });

      // Listen for user joined/left
      socket.on('user_joined', (newUser: User) => {
        const systemMessage: Message = {
          id: Date.now(),
          text: `${newUser.username} joined the chat`,
          user: newUser,
          timestamp: new Date(),
          type: 'system'
        };
        setMessages(prev => [...prev, systemMessage]);
      });

      socket.on('user_left', (leftUser: User) => {
        const systemMessage: Message = {
          id: Date.now(),
          text: `${leftUser.username} left the chat`,
          user: leftUser,
          timestamp: new Date(),
          type: 'system'
        };
        setMessages(prev => [...prev, systemMessage]);
      });

      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }

      return () => {
        socket.off('message_history');
        socket.off('new_message');
        socket.off('users_update');
        socket.off('user_typing');
        socket.off('user_joined');
        socket.off('user_left');
      };
    }
  }, [socket, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (text: string) => {
    if (socket) {
      socket.emit('send_message', { text });
    }
  };

  const handleTypingStart = () => {
    if (socket) {
      socket.emit('typing_start');
    }
  };

  const handleTypingStop = () => {
    if (socket) {
      socket.emit('typing_stop');
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      <UserList users={users} currentUserId={socket?.id || ''} />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-full">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Chat Room</h1>
                <p className="text-sm text-gray-600">
                  Welcome, {user.username}!
                </p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isCurrentUser={message.user.id === socket?.id}
            />
          ))}
          <TypingIndicator typingUsers={typingUsers} />
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <MessageInput
          onSendMessage={handleSendMessage}
          onTypingStart={handleTypingStart}
          onTypingStop={handleTypingStop}
        />
      </div>
    </div>
  );
};