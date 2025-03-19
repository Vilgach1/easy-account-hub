
import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import MediaPlayer from '@/components/MediaPlayer';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Copy, Users } from 'lucide-react';
import { toast } from 'sonner';

const videoSources = [
  { id: "sample1", name: "Sample Video 1", src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
  { id: "sample2", name: "Sample Video 2", src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" },
  { id: "sample3", name: "Sample Video 3", src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" },
];

type User = {
  id: string;
  name?: string;
  email: string;
};

type Room = {
  id: string;
  name: string;
  videoId: string;
  users: User[];
  createdBy: string;
  createdAt: Date;
};

const RoomPage = () => {
  const { roomId } = useParams();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  
  // Simulation of fetching room data
  useEffect(() => {
    if (!roomId) return;
    
    // Check if room exists in localStorage
    const storedRoom = localStorage.getItem(`room-${roomId}`);
    
    if (storedRoom) {
      setRoom(JSON.parse(storedRoom));
    } else {
      // Create new room if it doesn't exist
      const defaultVideo = videoSources[0];
      const newRoom: Room = {
        id: roomId,
        name: `Viewing Room: ${roomId}`,
        videoId: defaultVideo.id,
        users: user ? [user] : [],
        createdBy: user?.id || 'anonymous',
        createdAt: new Date()
      };
      
      setRoom(newRoom);
      localStorage.setItem(`room-${roomId}`, JSON.stringify(newRoom));
    }
    
    // Add current user to room if authenticated
    if (user) {
      const intervalId = setInterval(() => {
        // Update user presence
        const presence = JSON.parse(localStorage.getItem(`room-${roomId}-presence`) || '[]');
        const now = new Date().getTime();
        
        // Remove users who haven't updated in 10 seconds
        const activeUsers = presence
          .filter((p: any) => now - p.lastSeen < 10000)
          .map((p: any) => p.user);
        
        setActiveUsers(activeUsers);
        
        // Update our presence
        const userPresence = {
          user,
          lastSeen: now
        };
        
        const updatedPresence = [
          ...presence.filter((p: any) => p.user.id !== user.id),
          userPresence
        ];
        
        localStorage.setItem(`room-${roomId}-presence`, JSON.stringify(updatedPresence));
      }, 2000);
      
      return () => clearInterval(intervalId);
    }
  }, [roomId, user]);
  
  const copyInviteLink = () => {
    const link = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(link);
    toast.success('Invite link copied to clipboard');
  };
  
  const getVideoSource = () => {
    if (!room) return videoSources[0].src;
    return videoSources.find(v => v.id === room.videoId)?.src || videoSources[0].src;
  };
  
  // Redirect to login if not authenticated
  if (!isAuthenticated && !isLoading) {
    return <Navigate to="/login" />;
  }
  
  // Loading state
  if (isLoading || !room) {
    return (
      <div className="min-h-screen flex flex-col dark:bg-gray-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse dark:text-white">Loading room...</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col dark:bg-gray-900 transition-colors duration-300">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-3/4">
            <Card className="mb-4 dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="dark:text-white">{room.name}</CardTitle>
                  <Button variant="outline" onClick={copyInviteLink} className="dark:border-gray-600 dark:text-gray-200">
                    <Copy className="h-4 w-4 mr-2" /> Share
                  </Button>
                </div>
                <CardDescription className="dark:text-gray-400">
                  Watch together in real-time with synchronization
                </CardDescription>
              </CardHeader>
            </Card>
            
            <div className="rounded-lg overflow-hidden">
              <MediaPlayer 
                roomId={roomId || 'default'} 
                videoSrc={getVideoSource()} 
                syncUsers={true} 
              />
            </div>
          </div>
          
          <div className="lg:w-1/4">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg dark:text-white">
                    <Users className="h-4 w-4 inline mr-2" />
                    Active Viewers ({activeUsers.length})
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeUsers.length > 0 ? (
                    activeUsers.map((viewer) => (
                      <div key={viewer.id} className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${viewer.name || viewer.email}`} />
                          <AvatarFallback className="bg-purple-600 text-white">
                            {(viewer.name?.[0] || viewer.email?.[0] || '?').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium dark:text-white">{viewer.name || 'Anonymous User'}</p>
                          <p className="text-xs text-muted-foreground dark:text-gray-400">{viewer.email}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground dark:text-gray-400">
                      No other viewers currently in this room
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <footer className="border-t py-4 dark:border-gray-800">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground dark:text-gray-400">
          <p>Designed by vilgach.dev</p>
        </div>
      </footer>
    </div>
  );
};

export default RoomPage;
