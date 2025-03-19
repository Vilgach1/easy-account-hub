
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, AdminData } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  UserCog,
  Shield,
  Ban,
  Calendar,
  Trash2,
  RefreshCw,
  UserCheck,
  Search,
  Lock,
  Film,
  User,
  Clock,
  BarChart4,
  Users
} from 'lucide-react';

const AdminPage = () => {
  const { user, isAdmin, getAdminData, banUser, unbanUser, setUserRole, deleteRoom } = useAuth();
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState('permanent');
  const [banDays, setBanDays] = useState(7);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<'user' | 'moderator' | 'admin'>('user');
  const [selectedTab, setSelectedTab] = useState('overview');
  
  // Check if user is authorized
  if (!user || !isAdmin()) {
    return <Navigate to="/login" replace />;
  }
  
  // Load admin data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await getAdminData();
        setAdminData(data);
      } catch (error) {
        toast.error('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [getAdminData]);
  
  // Refresh data
  const refreshData = async () => {
    try {
      setLoading(true);
      const data = await getAdminData();
      setAdminData(data);
      toast.success('Data refreshed');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle ban user
  const handleBanUser = async (userId: string) => {
    try {
      setLoading(true);
      
      if (banDuration === 'temporary') {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + banDays);
        await banUser(userId, banReason, true, expirationDate);
      } else {
        await banUser(userId, banReason);
      }
      
      // Refresh data
      const data = await getAdminData();
      setAdminData(data);
    } catch (error) {
      console.error('Ban error:', error);
    } finally {
      setLoading(false);
      setBanReason('');
      setBanDuration('permanent');
      setBanDays(7);
    }
  };
  
  // Handle unban user
  const handleUnbanUser = async (userId: string) => {
    try {
      setLoading(true);
      await unbanUser(userId);
      
      // Refresh data
      const data = await getAdminData();
      setAdminData(data);
    } catch (error) {
      console.error('Unban error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle change user role
  const handleChangeRole = async (userId: string) => {
    try {
      setLoading(true);
      await setUserRole(userId, selectedRole);
      
      // Refresh data
      const data = await getAdminData();
      setAdminData(data);
    } catch (error) {
      console.error('Change role error:', error);
    } finally {
      setLoading(false);
      setSelectedRole('user');
    }
  };
  
  // Handle delete room
  const handleDeleteRoom = async (roomId: string) => {
    try {
      setLoading(true);
      await deleteRoom(roomId);
      
      // Refresh data
      const data = await getAdminData();
      setAdminData(data);
    } catch (error) {
      console.error('Delete room error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Filter users
  const filteredUsers = adminData?.users.filter(user => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      user.email.toLowerCase().includes(query) ||
      (user.name?.toLowerCase().includes(query)) ||
      user.id.toLowerCase().includes(query)
    );
  });
  
  // Filter rooms
  const filteredRooms = adminData?.rooms.filter(room => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      room.name.toLowerCase().includes(query) ||
      room.id.toLowerCase().includes(query)
    );
  });
  
  return (
    <div className="min-h-screen flex flex-col dark:bg-gray-900 transition-colors duration-300">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 dark:text-white">Admin Dashboard</h1>
            <p className="text-muted-foreground dark:text-gray-400">
              Manage users, rooms, and system settings
            </p>
          </div>
          
          <Button onClick={refreshData} variant="outline" disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh Data
          </Button>
        </div>
        
        <Tabs defaultValue="overview" value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">
              <BarChart4 className="h-4 w-4 mr-2" /> Overview
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" /> User Management
            </TabsTrigger>
            <TabsTrigger value="rooms">
              <Film className="h-4 w-4 mr-2" /> Room Management
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-500" />
                    Total Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{adminData?.totalUsers || 0}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Film className="h-5 w-5 mr-2 text-purple-500" />
                    Total Rooms
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{adminData?.totalRooms || 0}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Ban className="h-5 w-5 mr-2 text-red-500" />
                    Banned Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {adminData?.users.filter(u => u.isBanned).length || 0}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Admin Access</CardTitle>
                <CardDescription>
                  Service administrator account credentials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Admin Email</Label>
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded mt-1">
                      admin@vilgach.online
                    </div>
                  </div>
                  
                  <div>
                    <Label>Admin Password</Label>
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded mt-1">
                      ServiceAdmin2024!
                    </div>
                  </div>
                  
                  <div>
                    <Label>2FA Code</Label>
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded mt-1">
                      9147
                    </div>
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    <strong>Important:</strong> Keep these credentials secure and only share with authorized personnel.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  View and manage all registered users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users by name, email, or ID..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            <div className="flex justify-center">
                              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredUsers && filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="font-medium">{user.name || 'Anonymous'}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                              <div className="text-xs text-muted-foreground">{user.id}</div>
                            </TableCell>
                            <TableCell>
                              <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                user.role === 'admin' 
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' 
                                  : user.role === 'moderator'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                              }`}>
                                {user.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                                {user.role}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                                <span className="text-sm">
                                  {new Date(user.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {user.isBanned ? (
                                <div className="flex items-center text-red-600 dark:text-red-400">
                                  <Ban className="h-4 w-4 mr-1" />
                                  <span>Banned</span>
                                  {user.banExpiration && (
                                    <span className="text-xs ml-1">
                                      (until {new Date(user.banExpiration).toLocaleDateString()})
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <div className="flex items-center text-green-600 dark:text-green-400">
                                  <UserCheck className="h-4 w-4 mr-1" />
                                  <span>Active</span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                {!user.isBanned ? (
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        className="text-red-600 dark:text-red-400"
                                        onClick={() => setSelectedUserId(user.id)}
                                      >
                                        <Ban className="h-3 w-3 mr-1" />
                                        Ban
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Ban User</DialogTitle>
                                        <DialogDescription>
                                          Ban user {user.email}. This will prevent them from logging in.
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                          <Label htmlFor="ban-reason">Ban Reason</Label>
                                          <Input
                                            id="ban-reason"
                                            placeholder="Enter reason for ban"
                                            value={banReason}
                                            onChange={(e) => setBanReason(e.target.value)}
                                          />
                                        </div>
                                        
                                        <div className="space-y-2">
                                          <Label htmlFor="ban-duration">Ban Duration</Label>
                                          <Select 
                                            value={banDuration} 
                                            onValueChange={(value: string) => setBanDuration(value as 'permanent' | 'temporary')}
                                          >
                                            <SelectTrigger id="ban-duration">
                                              <SelectValue placeholder="Select duration" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="permanent">Permanent</SelectItem>
                                              <SelectItem value="temporary">Temporary</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        
                                        {banDuration === 'temporary' && (
                                          <div className="space-y-2">
                                            <Label htmlFor="ban-days">Number of Days</Label>
                                            <Input
                                              id="ban-days"
                                              type="number"
                                              min={1}
                                              max={365}
                                              value={banDays}
                                              onChange={(e) => setBanDays(parseInt(e.target.value) || 7)}
                                            />
                                          </div>
                                        )}
                                      </div>
                                      <DialogFooter>
                                        <Button 
                                          variant="destructive" 
                                          onClick={() => handleBanUser(selectedUserId || user.id)}
                                        >
                                          Ban User
                                        </Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>
                                ) : (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="text-green-600 dark:text-green-400"
                                    onClick={() => handleUnbanUser(user.id)}
                                  >
                                    <UserCheck className="h-3 w-3 mr-1" />
                                    Unban
                                  </Button>
                                )}
                                
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => {
                                        setSelectedUserId(user.id);
                                        setSelectedRole(user.role);
                                      }}
                                    >
                                      <UserCog className="h-3 w-3 mr-1" />
                                      Role
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Change User Role</DialogTitle>
                                      <DialogDescription>
                                        Change role for user {user.email}
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                      <div className="space-y-2">
                                        <Label htmlFor="user-role">User Role</Label>
                                        <Select 
                                          value={selectedRole} 
                                          onValueChange={(value: string) => setSelectedRole(value as 'user' | 'moderator' | 'admin')}
                                        >
                                          <SelectTrigger id="user-role">
                                            <SelectValue placeholder="Select role" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="user">User</SelectItem>
                                            <SelectItem value="moderator">Moderator</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      
                                      <div className="p-3 bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300 rounded">
                                        {selectedRole === 'admin' ? (
                                          <p className="text-sm flex items-center">
                                            <Shield className="h-4 w-4 mr-2" />
                                            Admin users have full access to all features including the admin panel
                                          </p>
                                        ) : selectedRole === 'moderator' ? (
                                          <p className="text-sm flex items-center">
                                            <UserCog className="h-4 w-4 mr-2" />
                                            Moderators can ban users but cannot access the admin panel
                                          </p>
                                        ) : (
                                          <p className="text-sm flex items-center">
                                            <User className="h-4 w-4 mr-2" />
                                            Regular users have standard access to the platform
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button 
                                        onClick={() => handleChangeRole(selectedUserId || user.id)}
                                      >
                                        Update Role
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No users found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>User Details</CardTitle>
                <CardDescription>
                  Additional information about users
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredUsers && filteredUsers.length > 0 ? (
                  <div className="space-y-6">
                    {filteredUsers.map((user) => (
                      <div key={`details-${user.id}`} className="rounded-md border p-4">
                        <h3 className="text-lg font-medium mb-2">{user.name || user.email}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">User Agent</h4>
                            <p className="text-xs break-all bg-gray-50 dark:bg-gray-800 p-2 rounded">
                              {user.userAgent || 'Not available'}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Last Login</h4>
                            <p>
                              {user.lastLogin 
                                ? new Date(user.lastLogin).toLocaleString() 
                                : 'Never logged in'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No user details available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="rooms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Room Management</CardTitle>
                <CardDescription>
                  View and manage all viewing rooms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search rooms by name or ID..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Room Name</TableHead>
                        <TableHead>Created By</TableHead>
                        <TableHead>Visibility</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            <div className="flex justify-center">
                              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredRooms && filteredRooms.length > 0 ? (
                        filteredRooms.map((room) => (
                          <TableRow key={room.id}>
                            <TableCell>
                              <div className="font-medium">{room.name}</div>
                              <div className="text-xs text-muted-foreground">{room.id}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{room.createdBy}</div>
                            </TableCell>
                            <TableCell>
                              {room.isPrivate ? (
                                <div className="flex items-center">
                                  <Lock className="h-3 w-3 mr-1 text-amber-600 dark:text-amber-400" />
                                  <span>Private</span>
                                  {room.inviteCode && (
                                    <span className="text-xs ml-1 text-muted-foreground">
                                      (Code: {room.inviteCode})
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <div className="flex items-center">
                                  <span>Public</span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                                <span className="text-sm">
                                  {new Date(room.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-red-600 dark:text-red-400"
                                onClick={() => handleDeleteRoom(room.id)}
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No rooms found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="border-t py-4 dark:border-gray-800">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground dark:text-gray-400">
          <p>Admin Dashboard • vilgach.online</p>
        </div>
      </footer>
    </div>
  );
};

export default AdminPage;
