'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { ChatRoom, RoomStats } from '../../../types';


const fetchRooms = async (): Promise<ChatRoom[]> => {
  
  
  return [
    {
      id: 'general',
      name: 'General Discussion',
      description: 'A place for general conversation and getting to know each other',
      createdAt: '2024-01-01T00:00:00.000Z',
      messageCount: 1247
    },
    {
      id: 'tech',
      name: 'Tech Talk',
      description: 'Discuss the latest in technology, programming, and innovation',
      createdAt: '2024-01-15T10:30:00.000Z',
      messageCount: 892
    },
    {
      id: 'gaming',
      name: 'Gaming Zone',
      description: 'Share your gaming experiences, tips, and find gaming partners',
      createdAt: '2024-02-01T14:20:00.000Z',
      messageCount: 634
    },
    {
      id: 'music',
      name: 'Music Lounge',
      description: 'Discover new music, share your favorites, and discuss artists',
      createdAt: '2024-02-14T09:15:00.000Z',
      messageCount: 456
    },
    {
      id: 'books',
      name: 'Book Club',
      description: 'Discuss books, share recommendations, and join reading challenges',
      createdAt: '2024-03-01T16:45:00.000Z',
      messageCount: 298
    },
    {
      id: 'fitness',
      name: 'Fitness & Health',
      description: 'Share workout tips, healthy recipes, and motivate each other',
      createdAt: '2024-03-10T08:00:00.000Z',
      messageCount: 187
    }
  ];
};

const fetchRoomStats = async (roomId: string): Promise<RoomStats> => {

  return {
    totalMessages: Math.floor(Math.random() * 1000) + 100,
    activeUsers: Math.floor(Math.random() * 20) + 1,
    lastActivity: new Date(Date.now() - Math.random() * 3600000).toISOString()
  };
};

export default function RoomsPage() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [roomStats, setRoomStats] = useState<Record<string, RoomStats>>({});
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const roomsData = await fetchRooms();
        setRooms(roomsData);

        // Fetch stats for each room
        const stats: Record<string, RoomStats> = {};
        for (const room of roomsData) {
          stats[room.id] = await fetchRoomStats(room.id);
        }
        setRoomStats(stats);
      } catch (error) {
        console.error('Failed to load rooms:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const then = new Date(dateString);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <div className="px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading chat rooms...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Chat Rooms
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose a room to join the conversation. Each room has its own theme and community.
          </p>
        </div>

        {/* Room Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {rooms.length}
            </div>
            <div className="text-gray-600">Total Rooms</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {Object.values(roomStats).reduce((sum, stats) => sum + stats.activeUsers, 0)}
            </div>
            <div className="text-gray-600">Active Users</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {Object.values(roomStats).reduce((sum, stats) => sum + stats.totalMessages, 0)}
            </div>
            <div className="text-gray-600">Total Messages</div>
          </div>
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => {
            const stats = roomStats[room.id];
            return (
              <div
                key={room.id}
                className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border-2 ${
                  selectedRoom === room.id ? 'border-blue-500' : 'border-transparent'
                }`}
                onMouseEnter={() => setSelectedRoom(room.id)}
                onMouseLeave={() => setSelectedRoom(null)}
              >
                <div className="p-6">
                  {/* Room Header */}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {room.name}
                    </h3>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      #{room.id}
                    </span>
                  </div>

                  {/* Room Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {room.description}
                  </p>

                  {/* Room Stats */}
                  {stats && (
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Active Users:</span>
                        <span className="font-medium text-green-600">
                          {stats.activeUsers} online
                        </span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Messages:</span>
                        <span className="font-medium">{stats.totalMessages.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Last Activity:</span>
                        <span className="font-medium text-blue-600">
                          {getTimeAgo(stats.lastActivity)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Room Meta */}
                  <div className="text-xs text-gray-400 mb-4">
                    Created {formatDate(room.createdAt)}
                  </div>

                  {/* Join Button */}
                  <Link 
                    href={`/chat/${room.id}?username=Guest${Math.floor(Math.random() * 1000)}`}
                    className="block w-full"
                  >
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                      Join Room
                    </button>
                  </Link>
                </div>

                {/* Room Activity Indicator */}
                <div className="h-1 bg-gray-100 rounded-b-lg">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-b-lg transition-all duration-500"
                    style={{ 
                      width: stats ? `${Math.min((stats.activeUsers / 20) * 100, 100)}%` : '0%' 
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Create Room CTA */}
        <div className="text-center py-12">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Want to create your own room?
            </h2>
            <p className="text-gray-600 mb-4">
              Custom rooms are coming soon! For now, enjoy our curated selection.
            </p>
            <button
              disabled
              className="bg-gray-300 text-gray-500 px-6 py-2 rounded-md cursor-not-allowed"
            >
              Create Room (Coming Soon)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}