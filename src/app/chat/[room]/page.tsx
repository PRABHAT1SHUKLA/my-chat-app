// src/app/chat/[room]/page.tsx
'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SocketProvider } from '../../../components/SocketProvider';
import ChatRoom from '../../../components/ChatRoom';

export default function ChatPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  const room = params.room as string;
  const username = searchParams.get('username');

  useEffect(() => {
  
    if (!username) {
      
      const storedUser = sessionStorage.getItem('chatUser');
      if (!storedUser) {
      
        router.push('/');
        return;
      }
    }
    setIsLoading(false);
  }, [username, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!username && !sessionStorage.getItem('chatUser')) {
    return null; 
  }

  const actualUsername = username || JSON.parse(sessionStorage.getItem('chatUser') || '{}').username;

  return (
    <div className="px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Chat Room: #{room}
              </h1>
              <p className="text-gray-600">
                Welcome, <span className="font-medium">{actualUsername}</span>!
              </p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              Leave Room
            </button>
          </div>
        </div>

        {/* Chat Component */}
        <SocketProvider>
          <ChatRoom room={room} username={actualUsername} />
        </SocketProvider>
      </div>
    </div>
  );
}