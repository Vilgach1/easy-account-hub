
// Database service with both real API and local storage fallback

class DatabaseService {
  private static instance: DatabaseService;
  private API_URL: string = 'https://api.example.com'; // Replace with your real API URL when deployed
  private useLocalStorage: boolean = true; // Set to false when real backend is available

  private constructor() {
    // Check if we're in a real deployment environment
    this.useLocalStorage = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
    
    // Initialize local storage data if needed
    if (this.useLocalStorage) {
      this.initializeLocalData();
    }
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private initializeLocalData(): void {
    try {
      // Only initialize if data doesn't exist
      if (!localStorage.getItem('users')) {
        // Add demo users if none exist
        const demoUsers = [
          {
            id: '1',
            email: 'admin@example.com',
            name: 'Admin User',
            role: 'admin',
            password: 'admin123', // Note: In a real app, never store plain passwords
            createdAt: new Date(),
            lastLogin: new Date()
          },
          {
            id: '2',
            email: 'user@example.com',
            name: 'Test User',
            role: 'user',
            password: 'user123', // Note: In a real app, never store plain passwords
            createdAt: new Date(),
            lastLogin: new Date()
          }
        ];
        localStorage.setItem('users', JSON.stringify(demoUsers));
      }
      
      // Add a demo room if none exist
      const roomKeys = Object.keys(localStorage).filter(key => key.startsWith('room-'));
      if (roomKeys.length === 0) {
        const demoRoom = {
          id: 'demo-room-1',
          name: 'Demo Room',
          videoId: 'sample', // placeholder, in a real app this would reference a video file
          users: [
            {
              id: '1',
              name: 'Admin User',
              role: 'host'
            }
          ],
          createdBy: '1',
          isPrivate: false,
          inviteCode: 'DEMOROOM',
          createdAt: new Date()
        };
        
        localStorage.setItem('room-demo-room-1', JSON.stringify(demoRoom));
      }
    } catch (error) {
      console.error('Error initializing local data:', error);
    }
  }

  // USERS API
  public async getUsers(): Promise<any[]> {
    if (this.useLocalStorage) {
      await this.simulateNetworkDelay();
      const usersJson = localStorage.getItem('users');
      return usersJson ? JSON.parse(usersJson) : [];
    } else {
      const response = await fetch(`${this.API_URL}/users`);
      if (!response.ok) throw new Error('Failed to fetch users');
      return await response.json();
    }
  }

  public async getUserById(userId: string): Promise<any | null> {
    if (this.useLocalStorage) {
      await this.simulateNetworkDelay();
      const usersJson = localStorage.getItem('users');
      const users = usersJson ? JSON.parse(usersJson) : [];
      return users.find((u: any) => u.id === userId) || null;
    } else {
      const response = await fetch(`${this.API_URL}/users/${userId}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch user');
      }
      return await response.json();
    }
  }

  public async getUserByEmail(email: string): Promise<any | null> {
    if (this.useLocalStorage) {
      await this.simulateNetworkDelay();
      const usersJson = localStorage.getItem('users');
      const users = usersJson ? JSON.parse(usersJson) : [];
      return users.find((u: any) => u.email === email) || null;
    } else {
      const response = await fetch(`${this.API_URL}/users/email/${encodeURIComponent(email)}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch user by email');
      }
      return await response.json();
    }
  }

  public async createUser(userData: any): Promise<any> {
    if (this.useLocalStorage) {
      await this.simulateNetworkDelay();
      
      const newUser = { 
        ...userData, 
        id: userData.id || crypto.randomUUID(),
        createdAt: new Date(),
        lastLogin: new Date() 
      };
      
      const usersJson = localStorage.getItem('users');
      const users = usersJson ? JSON.parse(usersJson) : [];
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      return newUser;
    } else {
      const response = await fetch(`${this.API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) throw new Error('Failed to create user');
      return await response.json();
    }
  }

  public async updateUser(userId: string, userData: any): Promise<any | null> {
    if (this.useLocalStorage) {
      await this.simulateNetworkDelay();
      
      const usersJson = localStorage.getItem('users');
      const users = usersJson ? JSON.parse(usersJson) : [];
      const index = users.findIndex((u: any) => u.id === userId);
      
      if (index === -1) return null;
      
      users[index] = { ...users[index], ...userData };
      localStorage.setItem('users', JSON.stringify(users));
      
      return users[index];
    } else {
      const response = await fetch(`${this.API_URL}/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to update user');
      }
      
      return await response.json();
    }
  }

  // ROOMS API
  public async getRooms(): Promise<any[]> {
    if (this.useLocalStorage) {
      await this.simulateNetworkDelay();
      
      const roomKeys = Object.keys(localStorage).filter(key => key.startsWith('room-'));
      const rooms = roomKeys.map(key => {
        const roomJson = localStorage.getItem(key);
        return roomJson ? JSON.parse(roomJson) : null;
      }).filter(Boolean);
      
      console.log("Getting rooms:", rooms);
      return rooms;
    } else {
      const response = await fetch(`${this.API_URL}/rooms`);
      if (!response.ok) throw new Error('Failed to fetch rooms');
      return await response.json();
    }
  }

  public async getRoomById(roomId: string): Promise<any | null> {
    if (this.useLocalStorage) {
      await this.simulateNetworkDelay();
      
      const roomJson = localStorage.getItem(`room-${roomId}`);
      console.log("Getting room by ID:", roomId, "Room exists:", !!roomJson);
      return roomJson ? JSON.parse(roomJson) : null;
    } else {
      const response = await fetch(`${this.API_URL}/rooms/${roomId}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch room');
      }
      return await response.json();
    }
  }

  public async createRoom(roomData: any): Promise<any> {
    if (this.useLocalStorage) {
      await this.simulateNetworkDelay();
      
      const roomId = roomData.id || `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newRoom = { 
        ...roomData, 
        id: roomId,
        createdAt: new Date(),
        users: roomData.users || []
      };
      
      localStorage.setItem(`room-${roomId}`, JSON.stringify(newRoom));
      console.log("Room created:", newRoom);
      return newRoom;
    } else {
      const response = await fetch(`${this.API_URL}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomData)
      });
      
      if (!response.ok) throw new Error('Failed to create room');
      return await response.json();
    }
  }

  public async updateRoom(roomId: string, roomData: any): Promise<any | null> {
    if (this.useLocalStorage) {
      await this.simulateNetworkDelay();
      
      const roomJson = localStorage.getItem(`room-${roomId}`);
      if (!roomJson) return null;
      
      const room = JSON.parse(roomJson);
      const updatedRoom = { ...room, ...roomData };
      
      localStorage.setItem(`room-${roomId}`, JSON.stringify(updatedRoom));
      return updatedRoom;
    } else {
      const response = await fetch(`${this.API_URL}/rooms/${roomId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomData)
      });
      
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to update room');
      }
      
      return await response.json();
    }
  }

  public async deleteRoom(roomId: string): Promise<boolean> {
    if (this.useLocalStorage) {
      await this.simulateNetworkDelay();
      
      const roomJson = localStorage.getItem(`room-${roomId}`);
      if (!roomJson) return false;
      
      localStorage.removeItem(`room-${roomId}`);
      return true;
    } else {
      const response = await fetch(`${this.API_URL}/rooms/${roomId}`, {
        method: 'DELETE'
      });
      
      return response.ok;
    }
  }
  
  public async getRoomByInviteCode(inviteCode: string): Promise<any | null> {
    if (this.useLocalStorage) {
      await this.simulateNetworkDelay();
      
      const roomKeys = Object.keys(localStorage).filter(key => key.startsWith('room-'));
      
      for (const key of roomKeys) {
        const roomJson = localStorage.getItem(key);
        if (!roomJson) continue;
        
        const room = JSON.parse(roomJson);
        if (room.inviteCode && room.inviteCode.toLowerCase() === inviteCode.toLowerCase()) {
          return room;
        }
      }
      
      return null;
    } else {
      const response = await fetch(`${this.API_URL}/rooms/invite/${encodeURIComponent(inviteCode)}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch room by invite code');
      }
      return await response.json();
    }
  }
  
  public async addUserToRoom(roomId: string, userData: any): Promise<any | null> {
    if (this.useLocalStorage) {
      await this.simulateNetworkDelay();
      
      const roomJson = localStorage.getItem(`room-${roomId}`);
      if (!roomJson) {
        console.error("Room not found:", roomId);
        return null;
      }
      
      const room = JSON.parse(roomJson);
      
      // If room doesn't have users array, create it
      if (!Array.isArray(room.users)) {
        room.users = [];
      }
      
      // Check if user is already in the room
      if (!room.users.some((u: any) => u.id === userData.id)) {
        room.users.push(userData);
        localStorage.setItem(`room-${roomId}`, JSON.stringify(room));
        console.log("User added to room:", userData.id);
      } else {
        console.log("User already in room:", userData.id);
      }
      
      return room;
    } else {
      const response = await fetch(`${this.API_URL}/rooms/${roomId}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to add user to room');
      }
      
      return await response.json();
    }
  }

  private async simulateNetworkDelay(): Promise<void> {
    // Simulate network latency for more realistic development experience
    const delay = Math.floor(Math.random() * 300) + 100; // 100-400ms
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

// Export the service as default and with legacy name for backward compatibility
export default DatabaseService;
export { DatabaseService as MockDatabase };
