
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
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
  Film,
  Plus, 
  User, 
  Clock, 
  ArrowRight 
} from 'lucide-react';
import { toast } from 'sonner';

type Room = {
  id: string;
  name: string;
  videoId: string;
  users: any[];
  createdBy: string;
  createdAt: Date;
};

const RoomsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();
  
  // Load rooms from localStorage (simulating a database)
  useEffect(() => {
    const roomKeys = Object.keys(localStorage).filter(key => key.startsWith('room-'));
    const loadedRooms = roomKeys.map(key => {
      try {
        return JSON.parse(localStorage.getItem(key) || '');
      } catch (e) {
        return null;
      }
    }).filter(Boolean);
    
    setRooms(loadedRooms);
  }, []);
  
  const createRoom = () => {
    if (!newRoomName.trim()) {
      toast.error('Please enter a room name');
      return;
    }
    
    if (!isAuthenticated) {
      toast.error('You must be logged in to create a room');
      return;
    }
    
    const roomId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newRoom: Room = {
      id: roomId,
      name: newRoomName,
      videoId: 'sample1',
      users: user ? [user] : [],
      createdBy: user?.id || 'anonymous',
      createdAt: new Date()
    };
    
    localStorage.setItem(`room-${roomId}`, JSON.stringify(newRoom));
    setRooms([...rooms, newRoom]);
    setNewRoomName('');
    setIsDialogOpen(false);
    
    toast.success('Room created successfully');
    navigate(`/room/${roomId}`);
  };
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col dark:bg-gray-900 transition-colors duration-300">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 dark:text-white">Viewing Rooms</h1>
            <p className="text-muted-foreground dark:text-gray-400">
              Join or create a room to watch videos together in real-time
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="dark:bg-purple-600 dark:hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" /> Create Room
              </Button>
            </DialogTrigger>
            <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
              <DialogHeader>
                <DialogTitle className="dark:text-white">Create a New Room</DialogTitle>
                <DialogDescription className="dark:text-gray-400">
                  Create a room and invite friends to watch together
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="dark:text-white">Room Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter room name"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={createRoom}
                  className="dark:bg-purple-600 dark:hover:bg-purple-700"
                >
                  Create Room
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {rooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <Card key={room.id} className="flex flex-col h-full dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="dark:text-white">
                    <div className="flex justify-between items-center">
                      <span className="truncate">{room.name}</span>
                      <Film className="h-5 w-5 text-muted-foreground dark:text-gray-400 shrink-0 ml-2" />
                    </div>
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Room ID: {room.id.substring(0, 8)}...
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="flex-1">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-muted-foreground dark:text-gray-400">
                      <User className="h-4 w-4 mr-2" />
                      <span>Created by: {room.createdBy === user?.id ? 'You' : 'Another user'}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground dark:text-gray-400">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Created: {formatDate(room.createdAt)}</span>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="pt-4 border-t dark:border-gray-700">
                  <Button asChild className="w-full dark:bg-purple-600 dark:hover:bg-purple-700">
                    <Link to={`/room/${room.id}`}>
                      Join Room <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-block p-6 rounded-full bg-secondary dark:bg-gray-800 mb-4">
              <Film className="h-12 w-12 text-muted-foreground dark:text-gray-400" />
            </div>
            <h2 className="text-xl font-medium mb-2 dark:text-white">No Rooms Available</h2>
            <p className="text-muted-foreground dark:text-gray-400 max-w-md mx-auto mb-6">
              Create your first viewing room to watch videos with friends in real-time
            </p>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="dark:bg-purple-600 dark:hover:bg-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" /> Create Your First Room
            </Button>
          </div>
        )}
      </main>
      
      <footer className="border-t py-4 dark:border-gray-800">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground dark:text-gray-400">
          <p>Designed by vilgach.dev</p>
        </div>
      </footer>
    </div>
  );
};

export default RoomsPage;
