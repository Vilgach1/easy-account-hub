
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import MediaPlayer from '@/components/MediaPlayer';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  Users, 
  MessageSquare,
  Share,
  Settings,
  Plus,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';
import { MockDatabase } from '@/services/database';

type RoomUser = {
  id: string;
  name?: string;
  role?: string;
};

type ChatMessage = {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: Date;
};

type Room = {
  id: string;
  name: string;
  videoId: string;
  users: RoomUser[];
  createdBy: string;
  isPrivate: boolean;
  inviteCode?: string;
};

const RoomPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const db = MockDatabase.getInstance();
  
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8); // Changed to 0.8 (scale 0-1) from 80
  const [isMuted, setIsMuted] = useState(false);
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  useEffect(() => {
    console.log("RoomPage mounting with roomId:", roomId);
    const loadRoom = async () => {
      if (!roomId) {
        setError('Room ID is missing');
        setLoading(false);
        return;
      }
      
      try {
        console.log("Fetching room data for roomId:", roomId);
        const roomData = await db.getRoomById(roomId);
        console.log("Room data received:", roomData);
        
        if (!roomData) {
          setError('Room not found');
          setLoading(false);
          return;
        }
        
        if (roomData.isPrivate && (!user || (user.id !== roomData.createdBy))) {
          if (!isAuthenticated) {
            setError('This is a private room. Please log in to join.');
            setLoading(false);
            return;
          }
        }
        
        if (user && !roomData.users.some((u: RoomUser) => u.id === user.id)) {
          const userToAdd = { 
            id: user.id, 
            name: user.name || user.email.split('@')[0],
            role: user.id === roomData.createdBy ? 'host' : 'viewer'
          };
          
          console.log("Adding user to room:", userToAdd);
          await db.addUserToRoom(roomId, userToAdd);
          roomData.users.push(userToAdd);
        }
        
        setRoom(roomData);
        
        const sampleMessages: ChatMessage[] = [
          {
            id: '1',
            userId: 'system',
            userName: 'System',
            text: `Welcome to ${roomData.name}!`,
            timestamp: new Date(Date.now() - 1000 * 60 * 5)
          }
        ];
        
        if (user) {
          sampleMessages.push({
            id: '2',
            userId: 'system',
            userName: 'System',
            text: `${user.name || user.email.split('@')[0]} has joined the room`,
            timestamp: new Date()
          });
        }
        
        setChatMessages(sampleMessages);
        setLoading(false);
      } catch (error) {
        console.error('Error loading room:', error);
        setError('Error loading room data');
        setLoading(false);
      }
    };
    
    loadRoom();
  }, [roomId, user, isAuthenticated]);
  
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    toast.info(isPlaying ? 'Video paused' : 'Video playing');
  };
  
  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };
  
  const handleDurationChange = (newDuration: number) => {
    setDuration(newDuration);
  };
  
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };
  
  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };
  
  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
  };
  
  const sendChatMessage = () => {
    if (!newMessage.trim() || !user) {
      return;
    }
    
    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name || user.email.split('@')[0],
      text: newMessage.trim(),
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
  };
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  const shareRoom = () => {
    if (!room) return;
    
    const url = window.location.href;
    navigator.clipboard.writeText(url)
      .then(() => {
        toast.success('Room link copied to clipboard');
      })
      .catch(() => {
        toast.error('Failed to copy link');
      });
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col dark:bg-gray-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-xl dark:text-gray-300">Loading room...</div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col dark:bg-gray-900">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="text-xl text-red-500 dark:text-red-400">{error}</div>
          <Button 
            onClick={() => navigate('/rooms')}
            variant="outline"
            className="dark:border-purple-500 dark:text-purple-400"
          >
            Back to Rooms
          </Button>
        </div>
      </div>
    );
  }
  
  if (!room) {
    return (
      <div className="min-h-screen flex flex-col dark:bg-gray-900">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="text-xl text-red-500 dark:text-red-400">Room data could not be loaded</div>
          <Button 
            onClick={() => navigate('/rooms')}
            variant="outline"
            className="dark:border-purple-500 dark:text-purple-400"
          >
            Back to Rooms
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col dark:bg-gray-900">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1 dark:text-white flex items-center gap-2">
              {room.name}
              {room.isPrivate && (
                <Lock 
                  className="h-4 w-4 text-purple-500" 
                  aria-label="Private room"
                />
              )}
            </h1>
            <p className="text-muted-foreground dark:text-gray-400">
              Room ID: {roomId}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={shareRoom}
              className="dark:border-purple-500 dark:text-purple-400"
            >
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className="dark:border-purple-500 dark:text-purple-400"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="mb-4 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-0">
                <div className="aspect-video bg-black relative">
                  {room && (
                    <MediaPlayer
                      videoId={room.videoId}
                      isPlaying={isPlaying}
                      volume={isMuted ? 0 : volume}
                      currentTime={currentTime}
                      onTimeUpdate={handleTimeUpdate}
                      onDurationChange={handleDurationChange}
                    />
                  )}
                </div>
              </CardContent>
              
              <div className="p-4 border-t dark:border-gray-700">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground dark:text-gray-400">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleMuteToggle}
                        className="h-8 w-8 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        {isMuted ? (
                          <VolumeX className="h-4 w-4" />
                        ) : (
                          <Volume2 className="h-4 w-4" />
                        )}
                      </Button>
                      
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                        className="w-24"
                      />
                    </div>
                  </div>
                  
                  <div className="relative w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="absolute h-full bg-purple-500 dark:bg-purple-600"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    ></div>
                    <input
                      type="range"
                      min="0"
                      max={duration || 100}
                      value={currentTime}
                      onChange={(e) => handleSeek(parseFloat(e.target.value))}
                      className="absolute w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  
                  <div className="flex justify-center items-center gap-2 mt-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSeek(Math.max(0, currentTime - 10))}
                      className="h-8 w-8 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <SkipBack className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="default"
                      size="icon"
                      onClick={handlePlayPause}
                      className="h-10 w-10 rounded-full dark:bg-purple-600 dark:hover:bg-purple-700"
                    >
                      {isPlaying ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5" />
                      )}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSeek(Math.min(duration, currentTime + 10))}
                      className="h-8 w-8 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <SkipForward className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
          
          <div>
            <Tabs defaultValue="chat" className="dark:text-gray-300">
              <TabsList className="w-full grid grid-cols-2 mb-4">
                <TabsTrigger value="chat">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="users">
                  <Users className="h-4 w-4 mr-2" />
                  Users
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="chat" className="mt-0">
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Room Chat</CardTitle>
                    <CardDescription>
                      Chat with others in this room
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="h-72 overflow-y-auto flex flex-col-reverse px-3">
                    <div className="space-y-4">
                      {chatMessages.map((message) => (
                        <div key={message.id} className="flex flex-col">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm dark:text-gray-300">
                              {message.userName}
                            </span>
                            <span className="text-xs text-muted-foreground dark:text-gray-500">
                              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-sm dark:text-gray-400">
                            {message.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="border-t pt-4 dark:border-gray-700">
                    <div className="w-full flex gap-2">
                      <Textarea
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="min-h-12 resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendChatMessage();
                          }
                        }}
                      />
                      <Button 
                        onClick={sendChatMessage}
                        className="dark:bg-purple-600 dark:hover:bg-purple-700"
                      >
                        Send
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="users" className="mt-0">
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">
                      Users ({room.users.length})
                    </CardTitle>
                    <CardDescription>
                      People in this room
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="h-72 overflow-y-auto px-3">
                    <div className="space-y-4">
                      {room.users.map((roomUser) => (
                        <div key={roomUser.id} className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-3">
                            <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 h-8 w-8 rounded-full flex items-center justify-center">
                              {roomUser.name ? roomUser.name[0].toUpperCase() : 'U'}
                            </div>
                            <div>
                              <p className="font-medium dark:text-gray-300">{roomUser.name}</p>
                              <p className="text-xs text-muted-foreground dark:text-gray-400">
                                {roomUser.role === 'host' ? 'Host' : 'Viewer'}
                              </p>
                            </div>
                          </div>
                          
                          {roomUser.id === user?.id && (
                            <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-1 rounded-full">
                              You
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  
                  {user && user.id === room.createdBy && (
                    <CardFooter className="border-t pt-4 dark:border-gray-700">
                      <Button variant="outline" className="w-full dark:border-purple-500 dark:text-purple-400">
                        <Plus className="h-4 w-4 mr-2" />
                        Invite Users
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RoomPage;
