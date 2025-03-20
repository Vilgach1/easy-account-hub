
// Mock database service to simulate server-side database

export class MockDatabase {
  private users: any[] = [];
  private rooms: Record<string, any> = {};
  private static instance: MockDatabase;

  private constructor() {
    // Load initial data from localStorage for development/demo purposes
    try {
      const savedUsers = localStorage.getItem('users');
      if (savedUsers) {
        this.users = JSON.parse(savedUsers);
      } else {
        // Add demo users if none exist
        this.users = [
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
        localStorage.setItem('users', JSON.stringify(this.users));
      }
      
      const roomKeys = Object.keys(localStorage).filter(key => key.startsWith('room-'));
      roomKeys.forEach(key => {
        const roomData = localStorage.getItem(key);
        if (roomData) {
          this.rooms[key.replace('room-', '')] = JSON.parse(roomData);
        }
      });
      
      // Add a demo room if none exist
      if (Object.keys(this.rooms).length === 0) {
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
        
        this.rooms['demo-room-1'] = demoRoom;
        localStorage.setItem('room-demo-room-1', JSON.stringify(demoRoom));
      }
    } catch (error) {
      console.error('Error loading mock database:', error);
    }
  }

  public static getInstance(): MockDatabase {
    if (!MockDatabase.instance) {
      MockDatabase.instance = new MockDatabase();
    }
    return MockDatabase.instance;
  }

  // User methods
  public async getUsers(): Promise<any[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.users];
  }

  public async saveUsers(users: any[]): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    this.users = [...users];
    
    // Save to localStorage for demo purposes
    localStorage.setItem('users', JSON.stringify(this.users));
  }

  public async getUserById(userId: string): Promise<any | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.users.find(u => u.id === userId) || null;
  }

  public async getUserByEmail(email: string): Promise<any | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.users.find(u => u.email === email) || null;
  }

  public async createUser(userData: any): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newUser = { 
      ...userData, 
      id: userData.id || crypto.randomUUID(),
      createdAt: new Date(),
      lastLogin: new Date() 
    };
    this.users.push(newUser);
    localStorage.setItem('users', JSON.stringify(this.users));
    return newUser;
  }

  public async updateUser(userId: string, userData: any): Promise<any | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = this.users.findIndex(u => u.id === userId);
    if (index === -1) return null;
    
    this.users[index] = { ...this.users[index], ...userData };
    localStorage.setItem('users', JSON.stringify(this.users));
    return this.users[index];
  }

  // Room methods
  public async getRooms(): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log("Getting rooms:", Object.values(this.rooms));
    return Object.values(this.rooms);
  }

  public async getRoomById(roomId: string): Promise<any | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    console.log("Getting room by ID:", roomId, "Room exists:", !!this.rooms[roomId]);
    return this.rooms[roomId] || null;
  }

  public async createRoom(roomData: any): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const roomId = roomData.id || `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newRoom = { 
      ...roomData, 
      id: roomId,
      createdAt: new Date(),
      users: roomData.users || []
    };
    this.rooms[roomId] = newRoom;
    localStorage.setItem(`room-${roomId}`, JSON.stringify(newRoom));
    return newRoom;
  }

  public async updateRoom(roomId: string, roomData: any): Promise<any | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (!this.rooms[roomId]) return null;
    
    this.rooms[roomId] = { ...this.rooms[roomId], ...roomData };
    localStorage.setItem(`room-${roomId}`, JSON.stringify(this.rooms[roomId]));
    return this.rooms[roomId];
  }

  public async deleteRoom(roomId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (!this.rooms[roomId]) return false;
    
    delete this.rooms[roomId];
    localStorage.removeItem(`room-${roomId}`);
    return true;
  }
  
  public async getRoomByInviteCode(inviteCode: string): Promise<any | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const roomValues = Object.values(this.rooms);
    return roomValues.find((room: any) => 
      room.inviteCode && room.inviteCode.toLowerCase() === inviteCode.toLowerCase()
    ) || null;
  }
  
  public async addUserToRoom(roomId: string, userData: any): Promise<any | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (!this.rooms[roomId]) {
      console.error("Room not found:", roomId);
      return null;
    }
    
    const room = this.rooms[roomId];
    
    // If room doesn't have users array, create it
    if (!Array.isArray(room.users)) {
      room.users = [];
    }
    
    // Check if user is already in the room
    if (!room.users.some((u: any) => u.id === userData.id)) {
      room.users.push(userData);
      this.rooms[roomId] = room;
      localStorage.setItem(`room-${roomId}`, JSON.stringify(room));
      console.log("User added to room:", userData.id);
    } else {
      console.log("User already in room:", userData.id);
    }
    
    return room;
  }
}
