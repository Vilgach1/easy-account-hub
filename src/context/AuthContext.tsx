
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

type UserRole = 'user' | 'moderator' | 'admin';

type User = {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  createdAt: Date;
  lastLogin?: Date;
  ipAddress?: string;
  userAgent?: string;
  isBanned?: boolean;
  banExpiration?: Date;
  bannedBy?: string;
  banReason?: string;
};

export type AdminData = {
  totalUsers: number;
  totalRooms: number;
  users: Array<User>;
  rooms: Array<any>;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, twoFactorCode?: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  banUser: (userId: string, reason: string, temporary?: boolean, expirationDate?: Date) => Promise<void>;
  unbanUser: (userId: string) => Promise<void>;
  setUserRole: (userId: string, role: UserRole) => Promise<void>;
  getAdminData: () => Promise<AdminData>;
  deleteRoom: (roomId: string) => Promise<void>;
  isAdmin: () => boolean;
  isModerator: () => boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock API endpoints
const API_URL = 'https://api.vilgach.online';

// Add service admin account credentials
const SERVICE_ADMIN = {
  email: 'admin@vilgach.online',
  password: 'ServiceAdmin2024!',
  twoFactorEnabled: true,
  twoFactorCode: '9147'
};

// Mock database - this would be replaced with actual API calls in production
class MockDatabase {
  private users: any[] = [];
  private rooms: Record<string, any> = {};
  private static instance: MockDatabase;

  private constructor() {
    // Load initial data from localStorage for development/demo purposes
    try {
      const savedUsers = localStorage.getItem('users');
      if (savedUsers) {
        this.users = JSON.parse(savedUsers);
      }
      
      const roomKeys = Object.keys(localStorage).filter(key => key.startsWith('room-'));
      roomKeys.forEach(key => {
        const roomData = localStorage.getItem(key);
        if (roomData) {
          this.rooms[key.replace('room-', '')] = JSON.parse(roomData);
        }
      });
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
    const newUser = { ...userData, id: crypto.randomUUID() };
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
    return Object.values(this.rooms);
  }

  public async getRoomById(roomId: string): Promise<any | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.rooms[roomId] || null;
  }

  public async createRoom(roomData: any): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const roomId = roomData.id || `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newRoom = { ...roomData, id: roomId };
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
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const db = MockDatabase.getInstance();

  // Track user IP and data
  const collectUserData = () => {
    const userAgent = navigator.userAgent;
    
    // In a real app, we would get the IP from the server
    // For this demo, we'll simulate an IP address
    const simulatedIpAddress = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    
    return {
      userAgent,
      ipAddress: simulatedIpAddress,
      timestamp: new Date(),
    };
  };

  // Check for saved user on initial load
  useEffect(() => {
    const loadUser = async () => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          
          // Verify the user still exists in the database
          const dbUser = await db.getUserById(parsedUser.id);
          if (dbUser) {
            // Check if user is banned
            if (dbUser.isBanned) {
              if (dbUser.banExpiration && new Date(dbUser.banExpiration) < new Date()) {
                // Ban expired, remove ban
                await db.updateUser(dbUser.id, {
                  isBanned: undefined,
                  banExpiration: undefined,
                  bannedBy: undefined,
                  banReason: undefined
                });
                setUser({ ...parsedUser, isBanned: false });
              } else {
                // User is still banned, log them out
                localStorage.removeItem('user');
                setUser(null);
                toast.error(`Your account is banned. Reason: ${dbUser.banReason || 'Violation of terms'}`);
              }
            } else {
              setUser(parsedUser);
            }
          } else {
            // User no longer exists in database
            localStorage.removeItem('user');
            setUser(null);
          }
        } catch (error) {
          console.error('Failed to parse saved user', error);
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };
    
    loadUser();
  }, []);

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const isModerator = () => {
    return user?.role === 'moderator' || user?.role === 'admin';
  };

  const getAdminData = async (): Promise<AdminData> => {
    if (!isAdmin()) {
      throw new Error('Unauthorized access');
    }
    
    setIsLoading(true);
    try {
      const users = await db.getUsers();
      const rooms = await db.getRooms();
      
      setIsLoading(false);
      return {
        totalUsers: users.length,
        totalRooms: rooms.length,
        users,
        rooms
      };
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const login = async (email: string, password: string, twoFactorCode?: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Check for service admin login
      if (email === SERVICE_ADMIN.email && password === SERVICE_ADMIN.password) {
        if (SERVICE_ADMIN.twoFactorEnabled) {
          if (!twoFactorCode) {
            setIsLoading(false);
            toast.error('2FA code required for admin login');
            return;
          }
          
          if (twoFactorCode !== SERVICE_ADMIN.twoFactorCode) {
            throw new Error('Invalid 2FA code');
          }
        }
        
        // Admin login successful
        const adminUser: User = {
          id: 'service-admin',
          email: SERVICE_ADMIN.email,
          name: 'Service Admin',
          role: 'admin',
          createdAt: new Date(),
          lastLogin: new Date(),
          ...collectUserData()
        };
        
        setUser(adminUser);
        localStorage.setItem('user', JSON.stringify(adminUser));
        
        toast.success('Admin login successful');
        navigate('/admin');
        setIsLoading(false);
        return;
      }
      
      // Regular user login
      const foundUser = await db.getUserByEmail(email);
      
      if (!foundUser || foundUser.password !== password) {
        throw new Error('Invalid email or password');
      }
      
      // Check if user is banned
      if (foundUser.isBanned) {
        if (foundUser.banExpiration && new Date(foundUser.banExpiration) < new Date()) {
          // Ban expired, remove ban
          await db.updateUser(foundUser.id, {
            isBanned: undefined,
            banExpiration: undefined,
            bannedBy: undefined,
            banReason: undefined
          });
        } else {
          const expiry = foundUser.banExpiration 
            ? ` until ${new Date(foundUser.banExpiration).toLocaleDateString()}`
            : '';
          throw new Error(`This account has been banned${expiry}. Reason: ${foundUser.banReason || 'Violation of terms'}`);
        }
      }
      
      // Add login data
      const userData = collectUserData();
      const updatedUser = await db.updateUser(foundUser.id, {
        lastLogin: new Date(),
        ...userData
      });
      
      // Remove password before storing in state
      const { password: _, ...userWithoutPassword } = updatedUser;
      setUser(userWithoutPassword as User);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      
      toast.success('Login successful');
      navigate('/profile');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name?: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Check if user already exists
      const existingUser = await db.getUserByEmail(email);
      if (existingUser) {
        throw new Error('Email already exists');
      }
      
      const userData = collectUserData();
      
      // Create new user
      const newUser = await db.createUser({
        email,
        password, // In a real app, this would be hashed
        name,
        role: 'user' as UserRole,
        createdAt: new Date(),
        lastLogin: new Date(),
        ...userData
      });
      
      // Login the user after registration
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword as User);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      
      toast.success('Registration successful');
      navigate('/profile');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/');
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const updatedUser = await db.updateUser(user.id, data);
      
      if (updatedUser) {
        setUser({ ...user, ...data });
        localStorage.setItem('user', JSON.stringify({ ...user, ...data }));
        toast.success('Profile updated successfully');
      } else {
        throw new Error('User not found');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const banUser = async (userId: string, reason: string, temporary: boolean = false, expirationDate?: Date) => {
    if (!isModerator()) {
      throw new Error('Unauthorized action');
    }

    setIsLoading(true);
    try {
      const targetUser = await db.getUserById(userId);
      
      if (!targetUser) {
        throw new Error('User not found');
      }
      
      // Admin users cannot be banned
      if (targetUser.role === 'admin') {
        throw new Error('Admins cannot be banned');
      }
      
      // Moderators can only be banned by admins
      if (targetUser.role === 'moderator' && user?.role !== 'admin') {
        throw new Error('Only admins can ban moderators');
      }

      await db.updateUser(userId, { 
        isBanned: true, 
        banReason: reason,
        bannedBy: user?.id,
        banExpiration: temporary && expirationDate ? expirationDate : undefined
      });
      
      toast.success(`User ${temporary ? 'temporarily ' : ''}banned successfully`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to ban user');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const unbanUser = async (userId: string) => {
    if (!isModerator()) {
      throw new Error('Unauthorized action');
    }

    setIsLoading(true);
    try {
      const targetUser = await db.getUserById(userId);
      
      if (!targetUser) {
        throw new Error('User not found');
      }
      
      // Moderators can only unban users they've banned themselves, admins can unban anyone
      if (user?.role !== 'admin' && targetUser.bannedBy !== user?.id) {
        throw new Error('You can only unban users you have banned');
      }

      await db.updateUser(userId, {
        isBanned: undefined,
        banReason: undefined,
        bannedBy: undefined,
        banExpiration: undefined
      });
      
      toast.success('User unbanned successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to unban user');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const setUserRole = async (userId: string, role: UserRole) => {
    if (!isAdmin()) {
      throw new Error('Only admins can change user roles');
    }

    setIsLoading(true);
    try {
      const targetUser = await db.getUserById(userId);
      
      if (!targetUser) {
        throw new Error('User not found');
      }
      
      // Cannot change role of another admin
      if (targetUser.role === 'admin' && targetUser.id !== user?.id) {
        throw new Error('Cannot change the role of another admin');
      }

      await db.updateUser(userId, { role });
      toast.success(`User role updated to ${role}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user role');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRoom = async (roomId: string) => {
    if (!isAdmin()) {
      throw new Error('Only admins can delete rooms');
    }

    setIsLoading(true);
    try {
      const success = await db.deleteRoom(roomId);
      if (success) {
        toast.success('Room deleted successfully');
      } else {
        throw new Error('Room not found');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete room');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading, 
      login, 
      register, 
      logout,
      updateUserProfile,
      banUser,
      unbanUser,
      setUserRole,
      getAdminData,
      deleteRoom,
      isAdmin,
      isModerator
    }}>
      {children}
    </AuthContext.Provider>
  );
};
