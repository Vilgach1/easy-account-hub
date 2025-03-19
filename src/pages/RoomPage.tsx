import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import MediaPlayer from '@/components/MediaPlayer';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Copy, 
  Users, 
  Video, 
  Youtube, 
  LinkIcon, 
  Key,
  Lock,
  Unlock
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const videoSources = [
  { id: "sample1", name: "Sample Video 1", src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
  { id: "sample2", name: "Sample Video 2", src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" },
  { id: "sample3", name: "Sample Video 3", src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" },
];

const getYouTubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

type User = {
  id: string;
  name?: string;
  email: string;
};

type VideoSource = {
  id: string;
  name: string;
  src: string;
  type: 'direct' | 'youtube' | 'sample';
};

type Room = {
  id: string;
  name: string;
  videoId: string;
  users: User[];
  createdBy: string;
  createdAt: Date;
  isPrivate?: boolean;
  inviteCode?: string;
  customVideos?: VideoSource[];
};

const RoomPage = () => {
  const { roomId } = useParams();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string>('');
  const [customVideoUrl, setCustomVideoUrl] = useState('');
  const [customVideoName, setCustomVideoName] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoSourceType, setVideoSourceType] = useState<'direct' | 'youtube'>('direct');
  
  useEffect(() => {
    if (!roomId) return;
    
    const storedRoom = localStorage.getItem(`room-${roomId}`);
    
    if (storedRoom) {
      const parsedRoom = JSON.parse(storedRoom);
      setRoom(parsedRoom);
      
      if (parsedRoom.videoId) {
        setSelectedVideoId(parsedRoom.videoId);
      }
    } else {
      const defaultVideo = videoSources[0];
      const newRoom: Room = {
        id: roomId,
        name: `Viewing Room: ${roomId}`,
        videoId: defaultVideo.id,
        users: user ? [user] : [],
        createdBy: user?.id || 'anonymous',
        createdAt: new Date(),
        customVideos: []
      };
      
      setRoom(newRoom);
      setSelectedVideoId(defaultVideo.id);
      localStorage.setItem(`room-${roomId}`, JSON.stringify(newRoom));
    }
    
    if (user) {
      const intervalId = setInterval(() => {
        const presence = JSON.parse(localStorage.getItem(`room-${roomId}-presence`) || '[]');
        const now = new Date().getTime();
        
        const activeUsers = presence
          .filter((p: any) => now - p.lastSeen < 10000)
          .map((p: any) => p.user);
        
        setActiveUsers(activeUsers);
        
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
    if (room?.isPrivate && room?.inviteCode) {
      const hostname = window.location.origin;
      toast.success(
        <div>
          <p className="font-medium">Room invite code:</p>
          <div className="mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-between">
            <code className="text-sm">{room.inviteCode}</code>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                navigator.clipboard.writeText(room.inviteCode || '');
                toast.success('Invite code copied!');
              }}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
          <p className="mt-2 text-sm">Users can join with this code from the Rooms page.</p>
        </div>
      );
    } else {
      const link = `${window.location.origin}/room/${roomId}`;
      navigator.clipboard.writeText(link);
      toast.success('Invite link copied to clipboard');
    }
  };
  
  const toggleRoomPrivacy = () => {
    if (!room || !user || user.id !== room.createdBy) return;
    
    const updatedRoom = { ...room };
    
    updatedRoom.isPrivate = !updatedRoom.isPrivate;
    
    if (updatedRoom.isPrivate && !updatedRoom.inviteCode) {
      updatedRoom.inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      toast.success(`Room is now private. Invite code: ${updatedRoom.inviteCode}`);
    } else if (!updatedRoom.isPrivate) {
      toast.success('Room is now public');
    }
    
    setRoom(updatedRoom);
    localStorage.setItem(`room-${roomId}`, JSON.stringify(updatedRoom));
  };
  
  const addCustomVideo = () => {
    if (!room) return;
    
    let newVideo: VideoSource | null = null;
    
    if (videoSourceType === 'direct') {
      if (!customVideoUrl.trim() || !customVideoName.trim()) {
        toast.error('Please enter both video name and URL');
        return;
      }
      
      try {
        new URL(customVideoUrl);
        newVideo = {
          id: `custom-${Date.now()}`,
          name: customVideoName,
          src: customVideoUrl,
          type: 'direct'
        };
      } catch (e) {
        toast.error('Please enter a valid URL');
        return;
      }
    } else {
      if (!youtubeUrl.trim()) {
        toast.error('Please enter a YouTube URL');
        return;
      }
      
      const youtubeId = getYouTubeId(youtubeUrl);
      if (!youtubeId) {
        toast.error('Invalid YouTube URL');
        return;
      }
      
      newVideo = {
        id: `yt-${youtubeId}`,
        name: `YouTube Video: ${youtubeId}`,
        src: `https://www.youtube.com/embed/${youtubeId}`,
        type: 'youtube'
      };
    }
    
    if (newVideo) {
      const customVideos = room.customVideos || [];
      const updatedRoom = {
        ...room,
        customVideos: [...customVideos, newVideo]
      };
      
      setRoom(updatedRoom);
      localStorage.setItem(`room-${roomId}`, JSON.stringify(updatedRoom));
      
      setCustomVideoUrl('');
      setCustomVideoName('');
      setYoutubeUrl('');
      setIsVideoDialogOpen(false);
      
      toast.success('Video added successfully');
    }
  };
  
  const changeVideo = (videoId: string) => {
    if (!room) return;
    
    const updatedRoom = {
      ...room,
      videoId
    };
    
    setRoom(updatedRoom);
    setSelectedVideoId(videoId);
    localStorage.setItem(`room-${roomId}`, JSON.stringify(updatedRoom));
    
    localStorage.setItem(`room-${roomId}-videoChanged`, Date.now().toString());
    
    toast.success('Video changed successfully');
  };
  
  const getVideoSource = () => {
    if (!room) return videoSources[0].src;
    
    const sampleVideo = videoSources.find(v => v.id === room.videoId);
    if (sampleVideo) return sampleVideo.src;
    
    const customVideo = room.customVideos?.find(v => v.id === room.videoId);
    if (customVideo) {
      return customVideo.src;
    }
    
    return videoSources[0].src;
  };
  
  const isYouTubeVideo = () => {
    if (!room) return false;
    const customVideo = room.customVideos?.find(v => v.id === room.videoId);
    return customVideo?.type === 'youtube';
  };
  
  if (!isAuthenticated && !isLoading) {
    return <Navigate to="/login" />;
  }
  
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
                  <div className="flex items-center">
                    <CardTitle className="dark:text-white">{room.name}</CardTitle>
                    {room.isPrivate && (
                      <Lock className="h-4 w-4 text-purple-500 ml-2" title="Private Room" />
                    )}
                  </div>
                  <div className="flex space-x-2">
                    {user && user.id === room.createdBy && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={toggleRoomPrivacy}
                        className="dark:border-gray-600 dark:text-gray-200"
                      >
                        {room.isPrivate 
                          ? <><Unlock className="h-4 w-4 mr-1" /> Make Public</>
                          : <><Lock className="h-4 w-4 mr-1" /> Make Private</>
                        }
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      onClick={copyInviteLink} 
                      className="dark:border-gray-600 dark:text-gray-200"
                    >
                      {room.isPrivate 
                        ? <><Key className="h-4 w-4 mr-2" /> Share Code</>
                        : <><Copy className="h-4 w-4 mr-2" /> Share Link</>
                      }
                    </Button>
                  </div>
                </div>
                <CardDescription className="dark:text-gray-400">
                  Watch together in real-time with synchronization
                </CardDescription>
              </CardHeader>
            </Card>
            
            <div className="rounded-lg overflow-hidden">
              {isYouTubeVideo() ? (
                <div className="relative pt-[56.25%]">
                  <iframe 
                    className="absolute top-0 left-0 w-full h-full"
                    src={getVideoSource()}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <MediaPlayer 
                  roomId={roomId || 'default'} 
                  videoSrc={getVideoSource()} 
                  syncUsers={true} 
                />
              )}
            </div>
            
            <Card className="mt-4 dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg dark:text-white">Video Selection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {videoSources.map((video) => (
                    <Button
                      key={video.id}
                      variant={selectedVideoId === video.id ? "default" : "outline"}
                      className={`justify-start ${selectedVideoId === video.id ? 'dark:bg-purple-600' : 'dark:border-gray-600'}`}
                      onClick={() => changeVideo(video.id)}
                    >
                      <Video className="h-4 w-4 mr-2" />
                      {video.name}
                    </Button>
                  ))}
                  
                  {room.customVideos?.map((video) => (
                    <Button
                      key={video.id}
                      variant={selectedVideoId === video.id ? "default" : "outline"}
                      className={`justify-start ${selectedVideoId === video.id ? 'dark:bg-purple-600' : 'dark:border-gray-600'}`}
                      onClick={() => changeVideo(video.id)}
                    >
                      {video.type === 'youtube' ? (
                        <Youtube className="h-4 w-4 mr-2" />
                      ) : (
                        <LinkIcon className="h-4 w-4 mr-2" />
                      )}
                      {video.name}
                    </Button>
                  ))}
                </div>
                
                <Dialog open={isVideoDialogOpen} onOpenChange={setIsVideoDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full dark:bg-purple-600 dark:hover:bg-purple-700">
                      <Plus className="h-4 w-4 mr-2" /> Add Custom Video
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
                    <DialogHeader>
                      <DialogTitle className="dark:text-white">Add Custom Video</DialogTitle>
                      <DialogDescription className="dark:text-gray-400">
                        Add a direct video URL or YouTube video
                      </DialogDescription>
                    </DialogHeader>
                    
                    <Tabs defaultValue="direct" onValueChange={(value) => setVideoSourceType(value as 'direct' | 'youtube')}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="direct">Direct URL</TabsTrigger>
                        <TabsTrigger value="youtube">YouTube</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="direct" className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="videoName">Video Name</Label>
                          <Input
                            id="videoName"
                            value={customVideoName}
                            onChange={(e) => setCustomVideoName(e.target.value)}
                            placeholder="Enter a name for this video"
                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="videoUrl">Video URL</Label>
                          <Input
                            id="videoUrl"
                            value={customVideoUrl}
                            onChange={(e) => setCustomVideoUrl(e.target.value)}
                            placeholder="https://example.com/video.mp4"
                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                        <div className="bg-purple-100 dark:bg-purple-900/20 p-2 rounded-md">
                          <p className="text-xs dark:text-gray-300">
                            Supported formats: MP4, WebM, Ogg. Make sure the URL is directly playable.
                          </p>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="youtube" className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="youtubeUrl">YouTube URL</Label>
                          <Input
                            id="youtubeUrl"
                            value={youtubeUrl}
                            onChange={(e) => setYoutubeUrl(e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                        <div className="bg-purple-100 dark:bg-purple-900/20 p-2 rounded-md">
                          <p className="text-xs dark:text-gray-300">
                            Paste a YouTube URL from youtube.com or youtu.be
                          </p>
                        </div>
                      </TabsContent>
                    </Tabs>
                    
                    <DialogFooter>
                      <Button onClick={addCustomVideo} className="dark:bg-purple-600 dark:hover:bg-purple-700">
                        Add Video
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
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
