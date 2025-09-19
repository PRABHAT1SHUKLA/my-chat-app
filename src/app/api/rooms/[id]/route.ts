import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse, ChatRoom, RoomStats } from '../../../../../types';


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
  }
];


export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      const response: ApiResponse = {
        success: false,
        error: 'Room ID is required'
      };
      return NextResponse.json(response, { status: 400 });
    }

    const room = mockRooms.find(r => r.id === id);

    if (!room) {
      const response: ApiResponse = {
        success: false,
        error: 'Room not found'
      };
      return NextResponse.json(response, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('stats') === 'true';

    let responseData: ChatRoom | (ChatRoom & { stats?: RoomStats }) = room;

    if (includeStats) {
      // Simulate real-time stats
      const stats: RoomStats = {
        totalMessages: room.messageCount + Math.floor(Math.random() * 100),
        activeUsers: Math.floor(Math.random() * 20) + 1,
        lastActivity: new Date(Date.now() - Math.random() * 3600000).toISOString()
      };

      responseData = { ...room, stats };
    }

    const response: ApiResponse = {
      success: true,
      data: responseData,
      message: `Retrieved room: ${room.name}`
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching room:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch room details'
    };

    return NextResponse.json(response, { status: 500 });
  }
}


export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, description } = body;

    if (!id) {
      const response: ApiResponse = {
        success: false,
        error: 'Room ID is required'
      };
      return NextResponse.json(response, { status: 400 });
    }

    const roomIndex = mockRooms.findIndex(r => r.id === id);

    if (roomIndex === -1) {
      const response: ApiResponse = {
        success: false,
        error: 'Room not found'
      };
      return NextResponse.json(response, { status: 404 });
    }


    if (name && (typeof name !== 'string' || name.trim().length === 0 || name.trim().length > 50)) {
      const response: ApiResponse = {
        success: false,
        error: 'Room name must be a non-empty string of 50 characters or less'
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

    // Update room
    const updatedRoom: ChatRoom = {
      ...mockRooms[roomIndex],
      ...(name && { name: name.trim() }),
      ...(description !== undefined && { description: description.trim() })
    };

 
    mockRooms[roomIndex] = updatedRoom;

    const response: ApiResponse<ChatRoom> = {
      success: true,
      data: updatedRoom,
      message: 'Room updated successfully'
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error updating room:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to update room'
    };

    return NextResponse.json(response, { status: 500 });
  }
}


export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      const response: ApiResponse = {
        success: false,
        error: 'Room ID is required'
      };
      return NextResponse.json(response, { status: 400 });
    }

    const roomIndex = mockRooms.findIndex(r => r.id === id);

    if (roomIndex === -1) {
      const response: ApiResponse = {
        success: false,
        error: 'Room not found'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Prevent deletion of default rooms
    const protectedRooms = ['general', 'tech', 'gaming', 'music'];
    if (protectedRooms.includes(id)) {
      const response: ApiResponse = {
        success: false,
        error: 'Cannot delete default rooms'
      };
      return NextResponse.json(response, { status: 403 });
    }

    // Remove room from array (in a real app, delete from database)
    const deletedRoom = mockRooms.splice(roomIndex, 1)[0];

    const response: ApiResponse = {
      success: true,
      message: `Room "${deletedRoom.name}" deleted successfully`
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error deleting room:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to delete room'
    };

    return NextResponse.json(response, { status: 500 });
  }
}