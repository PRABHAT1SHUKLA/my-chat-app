'use client';

import { useState, useEffect, useRef } from 'react';
import { useSocket } from './SocketProvider';
import type { Message, User, TypingUser } from '../../types';

interface ChatRoomProps {
  room: string;
  username: string;
}

export default function ChatRoom({ room, username }: ChatRoomProps) {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [connectedUsers, setConnectedUsers] = useState<User[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>(null);

 
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };


  useEffect(() => {
    if (socket && isConnected) {
      socket.emit('join', { username, room });
    }
  }, [socket, isConnected, username, room]);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message: Message) => {
      setMessages(prev => [...prev, message]);
    };

    const handleUserJoined = (data: { username: string; message: string }) => {
      const systemMessage: Message = {
        id: Date.now().toString(),
        username: 'System',
        content: data.message,
        timestamp: new Date().toISOString(),
        room: room
      };
      setMessages(prev => [...prev, systemMessage]);
    };

    const handleUserLeft = (data: { username: string; message: string }) => {
      const systemMessage: Message = {
        id: Date.now().toString(),
        username: 'System',
        content: data.message,
        timestamp: new Date().toISOString(),
        room: room
      };
      setMessages(prev => [...prev, systemMessage]);
    };

    const handleRoomUsers = (users: User[]) => {
      setConnectedUsers(users);
    };

    const handleUserTyping = (data: TypingUser) => {
      setTypingUsers(prev => {
        if (!prev.includes(data.username)) {
          return [...prev, data.username];
        }
        return prev;
      });
    };

    const handleUserStopTyping = (data: TypingUser) => {
      setTypingUsers(prev => prev.filter(user => user !== data.username));
    };

    // Register event listeners
    socket.on('receive-message', handleReceiveMessage);
    socket.on('user-joined', handleUserJoined);
    socket.on('user-left', handleUserLeft);
    socket.on('room-users', handleRoomUsers);
    socket.on('user-typing', handleUserTyping);
    socket.on('user-stop-typing', handleUserStopTyping);

    // Cleanup
    return () => {
      socket.off('receive-message', handleReceiveMessage);
      socket.off('user-joined', handleUserJoined);
      socket.off('user-left', handleUserLeft);
      socket.off('room-users', handleRoomUsers);
      socket.off('user-typing', handleUserTyping);
      socket.off('user-stop-typing', handleUserStopTyping);
    };
  }, [socket, room]);


  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  const handleTyping = () => {
    if (!socket || !isConnected) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing');
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

   
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('stop-typing');
    }, 1000);
  };

 
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !isConnected) return;

    socket.emit('send-message', { content: newMessage.trim() });
    setNewMessage('');
    
   
    if (isTyping) {
      setIsTyping(false);
      socket.emit('stop-typing');
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

 
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg h-[600px] flex">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
       
        <div className={`px-4 py-2 text-sm ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex ${message.username === username ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.username === 'System' 
                    ? 'bg-gray-100 text-gray-600 text-center text-sm italic mx-auto'
                    : message.username === username
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}>
                  {message.username !== 'System' && message.username !== username && (
                    <div className="text-xs font-semibold mb-1">
                      {message.username}
                    </div>
                  )}
                  <div>{message.content}</div>
                  <div className={`text-xs mt-1 ${
                    message.username === 'System' ? 'hidden' :
                    message.username === username ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))
          )}
          
        
          {typingUsers.length > 0 && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm italic">
                {typingUsers.length === 1 
                  ? `${typingUsers[0]} is typing...`
                  : `${typingUsers.join(', ')} are typing...`
                }
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="border-t p-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={500}
              disabled={!isConnected}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || !isConnected}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </div>
        </form>
      </div>

      {/* Sidebar - Connected Users */}
      <div className="w-64 border-l bg-gray-50">
        <div className="p-4 border-b bg-gray-100">
          <h3 className="font-semibold text-gray-900">
            Online Users ({connectedUsers.length})
          </h3>
        </div>
        <div className="p-4 space-y-2">
          {connectedUsers.length === 0 ? (
            <p className="text-gray-500 text-sm">Loading users...</p>
          ) : (
            connectedUsers.map((user) => (
              <div key={user.id} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className={`text-sm ${user.username === username ? 'font-semibold text-blue-600' : 'text-gray-700'}`}>
                  {user.username}
                  {user.username === username && ' (You)'}
                </span>
              </div>
            ))
          )}
        </div>

   
        <div className="absolute bottom-0 w-64 p-4 border-t bg-white">
          <div className="text-xs text-gray-500">
            <p>Room: #{room}</p>
            <p>Messages: {messages.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}