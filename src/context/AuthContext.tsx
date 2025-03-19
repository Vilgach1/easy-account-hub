
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

// Add service admin account credentials
const SERVICE_ADMIN = {
  email: 'admin@vilgach.online',
  password: 'ServiceAdmin2024!',
  twoFactorEnabled: true,
  twoFactorCode: '9147'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Track user IP and data
  const collectUserData = () => {
    const userAgent = navigator.userAgent;
    return {
      userAgent,
      timestamp: new Date(),
    };
  };

  // Check for saved user on initial load
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse saved user', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  // Mock database of users
  const usersDb = () => {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
  };

  const saveUsersDb = (users: any[]) => {
    localStorage.setItem('users', JSON.stringify(users));
  };

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
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const users = usersDb();
    const roomKeys = Object.keys(localStorage).filter(key => key.startsWith('room-'));
    const rooms = roomKeys.map(key => {
      try {
        return JSON.parse(localStorage.getItem(key) || '');
      } catch (e) {
        return null;
      }
    }).filter(Boolean);
    
    return {
      totalUsers: users.length,
      totalRooms: rooms.length,
      users,
      rooms
    };
  };

  const login = async (email: string, password: string, twoFactorCode?: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check for service admin login
      if (email === SERVICE_ADMIN.email && password === SERVICE_ADMIN.password) {
        if (SERVICE_ADMIN.twoFactorEnabled) {
          if (!twoFactorCode) {
            setIsLoading(false);
            return toast.error('2FA code required for admin login');
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
      
      const users = usersDb();
      const foundUser = users.find((u: any) => 
        u.email === email && u.password === password
      );
      
      if (!foundUser) {
        throw new Error('Invalid email or password');
      }
      
      // Check if user is banned
      if (foundUser.isBanned) {
        if (foundUser.banExpiration && new Date(foundUser.banExpiration) < new Date()) {
          // Ban expired, remove ban
          const updatedUsers = users.map((u: any) => {
            if (u.id === foundUser.id) {
              const { isBanned, banExpiration, bannedBy, banReason, ...userWithoutBan } = u;
              return { ...userWithoutBan };
            }
            return u;
          });
          saveUsersDb(updatedUsers);
        } else {
          const expiry = foundUser.banExpiration 
            ? ` until ${new Date(foundUser.banExpiration).toLocaleDateString()}`
            : '';
          throw new Error(`This account has been banned${expiry}. Reason: ${foundUser.banReason || 'Violation of terms'}`);
        }
      }
      
      // Add login data
      const userData = collectUserData();
      const updatedUser = {
        ...foundUser,
        lastLogin: new Date(),
        ...userData
      };
      
      // Update in DB
      const updatedUsers = users.map((u: any) => {
        return u.id === foundUser.id ? updatedUser : u;
      });
      saveUsersDb(updatedUsers);
      
      // Remove password before storing in state
      const { password: _, ...userWithoutPassword } = updatedUser;
      setUser(userWithoutPassword);
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

  const register = async (email: string, password: string, name?: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const users = usersDb();
      
      if (users.some((u: any) => u.email === email)) {
        throw new Error('Email already exists');
      }
      
      const userData = collectUserData();
      
      const newUser = {
        id: crypto.randomUUID(),
        email,
        password, // In a real app, this would be hashed
        name,
        role: 'user', // Default role
        createdAt: new Date(),
        lastLogin: new Date(),
        ...userData
      };
      
      // Save to "database"
      saveUsersDb([...users, newUser]);
      
      // Login the user after registration
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
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
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const users = usersDb();
      const updatedUsers = users.map((u: any) => {
        if (u.id === user.id) {
          return { ...u, ...data };
        }
        return u;
      });
      
      saveUsersDb(updatedUsers);
      
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const banUser = async (userId: string, reason: string, temporary: boolean = false, expirationDate?: Date) => {
    if (!isModerator()) {
      throw new Error('Unauthorized action');
    }

    try {
      const users = usersDb();
      const targetUser = users.find((u: any) => u.id === userId);
      
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

      const updatedUsers = users.map((u: any) => {
        if (u.id === userId) {
          return { 
            ...u, 
            isBanned: true, 
            banReason: reason,
            bannedBy: user?.id,
            banExpiration: temporary && expirationDate ? expirationDate : undefined
          };
        }
        return u;
      });
      
      saveUsersDb(updatedUsers);
      toast.success(`User ${temporary ? 'temporarily ' : ''}banned successfully`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to ban user');
      throw error;
    }
  };

  const unbanUser = async (userId: string) => {
    if (!isModerator()) {
      throw new Error('Unauthorized action');
    }

    try {
      const users = usersDb();
      const targetUser = users.find((u: any) => u.id === userId);
      
      if (!targetUser) {
        throw new Error('User not found');
      }
      
      // Moderators can only unban users they've banned themselves, admins can unban anyone
      if (user?.role !== 'admin' && targetUser.bannedBy !== user?.id) {
        throw new Error('You can only unban users you have banned');
      }

      const updatedUsers = users.map((u: any) => {
        if (u.id === userId) {
          const { isBanned, banReason, bannedBy, banExpiration, ...userWithoutBan } = u;
          return userWithoutBan;
        }
        return u;
      });
      
      saveUsersDb(updatedUsers);
      toast.success('User unbanned successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to unban user');
      throw error;
    }
  };

  const setUserRole = async (userId: string, role: UserRole) => {
    if (!isAdmin()) {
      throw new Error('Only admins can change user roles');
    }

    try {
      const users = usersDb();
      const targetUser = users.find((u: any) => u.id === userId);
      
      if (!targetUser) {
        throw new Error('User not found');
      }
      
      // Cannot change role of another admin
      if (targetUser.role === 'admin' && targetUser.id !== user?.id) {
        throw new Error('Cannot change the role of another admin');
      }

      const updatedUsers = users.map((u: any) => {
        if (u.id === userId) {
          return { ...u, role };
        }
        return u;
      });
      
      saveUsersDb(updatedUsers);
      toast.success(`User role updated to ${role}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user role');
      throw error;
    }
  };

  const deleteRoom = async (roomId: string) => {
    if (!isAdmin()) {
      throw new Error('Only admins can delete rooms');
    }

    try {
      localStorage.removeItem(`room-${roomId}`);
      toast.success('Room deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete room');
      throw error;
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
