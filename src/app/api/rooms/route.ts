// src/app/api/rooms/route.ts
import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse, ChatRoom } from '../../../../types';


const mockRooms: ChatRoom[] = [
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


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const sort = searchParams.get('sort') || 'name';

    let rooms = [...mockRooms];


    switch (sort) {
      case 'messages':
        rooms.sort((a, b) => b.messageCount - a.messageCount);
        break;
      case 'created':
        rooms.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'name':
      default:
        rooms.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    if (limit) {
      const limitNum = parseInt(limit, 10);
      if (!isNaN(limitNum) && limitNum > 0) {
        rooms = rooms.slice(0, limitNum);
      }
    }

    const response: ApiResponse<ChatRoom[]> = {
      success: true,
      data: rooms,
      message: `Retrieved ${rooms.length} chat rooms`
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch chat rooms'
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// Create a new chat room
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;


    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      const response: ApiResponse = {
        success: false,
        error: 'Room name is required and must be a non-empty string'
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (name.trim().length > 50) {
      const response: ApiResponse = {
        success: false,
        error: 'Room name must be 50 characters or less'
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (description && (typeof description !== 'string' || description.length > 200)) {
      const response: ApiResponse = {
        success: false,
        error: 'Room description must be a string of 200 characters or less'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Generate room ID from name
    const roomId = name.trim().toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 30);

   
    const existingRoom = mockRooms.find(room => room.id === roomId);
    if (existingRoom) {
      const response: ApiResponse = {
        success: false,
        error: 'A room with this name already exists'
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Create new room
    const newRoom: ChatRoom = {
      id: roomId,
      name: name.trim(),
      description: description?.trim() || '',
      createdAt: new Date().toISOString(),
      messageCount: 0
    };

  
    mockRooms.push(newRoom);

    const response: ApiResponse<ChatRoom> = {
      success: true,
      data: newRoom,
      message: 'Chat room created successfully'
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating room:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to create chat room'
    };

    return NextResponse.json(response, { status: 500 });
  }
}