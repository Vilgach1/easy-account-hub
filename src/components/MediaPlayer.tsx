
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';

interface MediaPlayerProps {
  roomId?: string;
  videoSrc?: string;
  videoId?: string;
  syncUsers?: boolean;
  isPlaying?: boolean;
  volume?: number;
  currentTime?: number;
  onTimeUpdate?: (time: number) => void;
  onDurationChange?: (newDuration: number) => void;
}

const MediaPlayer: React.FC<MediaPlayerProps> = ({ 
  roomId = '', 
  videoSrc = '', 
  videoId = '',
  syncUsers = true,
  isPlaying: externalIsPlaying,
  volume: externalVolume,
  currentTime: externalCurrentTime,
  onTimeUpdate,
  onDurationChange
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(externalIsPlaying || false);
  const [currentTime, setCurrentTime] = useState(externalCurrentTime || 0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(typeof externalVolume === 'number' ? externalVolume : 1);
  const [isMuted, setIsMuted] = useState(externalVolume === 0);
  const [messages, setMessages] = useState<{user: string, text: string, time: Date}[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const { user } = useAuth();
  
  // Determine video source from either videoSrc or videoId
  const finalVideoSrc = videoSrc || (videoId ? `/videos/${videoId}.mp4` : '');
  
  // Update from external props when they change
  useEffect(() => {
    if (typeof externalIsPlaying === 'boolean' && externalIsPlaying !== isPlaying) {
      setIsPlaying(externalIsPlaying);
      if (videoRef.current) {
        if (externalIsPlaying) {
          videoRef.current.play().catch(e => console.error("Couldn't play:", e));
        } else {
          videoRef.current.pause();
        }
      }
    }
  }, [externalIsPlaying]);
  
  useEffect(() => {
    if (typeof externalCurrentTime === 'number' && 
        Math.abs(externalCurrentTime - currentTime) > 1 && 
        videoRef.current) {
      videoRef.current.currentTime = externalCurrentTime;
      setCurrentTime(externalCurrentTime);
    }
  }, [externalCurrentTime]);
  
  useEffect(() => {
    if (typeof externalVolume === 'number' && videoRef.current) {
      setVolume(externalVolume);
      videoRef.current.volume = externalVolume;
      setIsMuted(externalVolume === 0);
    }
  }, [externalVolume]);
  
  // Update duration when video is loaded
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      if (onDurationChange) {
        onDurationChange(video.duration);
      }
    };
    
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [videoRef, onDurationChange]);
  
  // Update current time as video plays
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      
      if (onTimeUpdate) {
        onTimeUpdate(video.currentTime);
      }
      
      // If in sync mode, broadcast current time to room (simulated)
      if (syncUsers && roomId) {
        localStorage.setItem(`room-${roomId}-time`, video.currentTime.toString());
        localStorage.setItem(`room-${roomId}-playing`, isPlaying.toString());
      }
    };
    
    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [videoRef, isPlaying, syncUsers, roomId, onTimeUpdate]);
  
  // Listen for sync updates from other users
  useEffect(() => {
    if (!syncUsers || !roomId) return;
    
    const syncInterval = setInterval(() => {
      const storedTime = localStorage.getItem(`room-${roomId}-time`);
      const storedPlaying = localStorage.getItem(`room-${roomId}-playing`);
      
      if (storedTime && videoRef.current) {
        const parsedTime = parseFloat(storedTime);
        // Only sync if time difference is more than 1 second
        if (Math.abs(parsedTime - videoRef.current.currentTime) > 1) {
          videoRef.current.currentTime = parsedTime;
        }
      }
      
      if (storedPlaying && videoRef.current) {
        const shouldPlay = storedPlaying === 'true';
        if (shouldPlay && videoRef.current.paused) {
          videoRef.current.play().catch(e => console.error("Couldn't play:", e));
          setIsPlaying(true);
        } else if (!shouldPlay && !videoRef.current.paused) {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      }
    }, 2000); // Sync every 2 seconds
    
    return () => clearInterval(syncInterval);
  }, [syncUsers, roomId]);
  
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(e => console.error("Couldn't play:", e));
      }
      setIsPlaying(!isPlaying);
      
      if (syncUsers && roomId) {
        localStorage.setItem(`room-${roomId}-playing`, (!isPlaying).toString());
      }
    }
  };
  
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };
  
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      if (!isMuted) {
        setVolume(0);
        videoRef.current.volume = 0;
      } else {
        setVolume(1);
        videoRef.current.volume = 1;
      }
    }
  };
  
  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
      
      if (syncUsers && roomId) {
        localStorage.setItem(`room-${roomId}-time`, value[0].toString());
      }
    }
  };
  
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !roomId) return;
    
    const message = {
      user: user.name || user.email,
      text: newMessage,
      time: new Date()
    };
    
    setMessages([...messages, message]);
    
    // In a real app, this would send the message to a server
    const roomMessages = JSON.parse(localStorage.getItem(`room-${roomId}-messages`) || '[]');
    roomMessages.push(message);
    localStorage.setItem(`room-${roomId}-messages`, JSON.stringify(roomMessages));
    
    setNewMessage('');
  };
  
  useEffect(() => {
    // Load chat messages from localStorage (simulating server)
    if (!roomId) return;
    
    const storedMessages = localStorage.getItem(`room-${roomId}-messages`);
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }
    
    // Poll for new messages
    const messageInterval = setInterval(() => {
      const currentMessages = localStorage.getItem(`room-${roomId}-messages`);
      if (currentMessages) {
        const parsedMessages = JSON.parse(currentMessages);
        if (parsedMessages.length !== messages.length) {
          setMessages(parsedMessages);
        }
      }
    }, 1000);
    
    return () => clearInterval(messageInterval);
  }, [roomId, messages.length]);
  
  return (
    <div className="relative w-full rounded-lg overflow-hidden shadow-lg bg-black dark:bg-gray-900 transition-all">
      <video
        ref={videoRef}
        className="w-full h-auto"
        src={finalVideoSrc}
        onClick={togglePlay}
        playsInline
      />
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {!isPlaying && (
          <Button 
            variant="outline" 
            size="icon" 
            className="h-16 w-16 rounded-full bg-black/30 border-white pointer-events-auto"
            onClick={togglePlay}
          >
            <Play className="h-8 w-8 text-white" />
          </Button>
        )}
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="flex items-center mb-2">
          <Slider 
            value={[currentTime]} 
            min={0} 
            max={duration || 100}
            step={0.01}
            onValueChange={handleSeek}
            className="flex-1 mr-2"
          />
          <span className="text-white text-xs">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={togglePlay}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            
            <div className="flex items-center space-x-2 max-w-[140px]">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={toggleMute}
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
              <Slider 
                value={[volume]} 
                min={0} 
                max={1} 
                step={0.01}
                onValueChange={handleVolumeChange}
                className="w-20"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {syncUsers && roomId && (
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 relative"
                onClick={() => setShowChat(!showChat)}
              >
                <MessageSquare className="h-5 w-5" />
                {messages.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {messages.length}
                  </span>
                )}
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={toggleFullscreen}
            >
              <Maximize className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      
      {showChat && roomId && (
        <div className="absolute right-0 top-0 bottom-16 w-64 bg-black/80 backdrop-blur-sm p-4 overflow-y-auto transition-all border-l border-white/20">
          <h3 className="text-white font-medium mb-4">Room Chat</h3>
          
          <div className="space-y-4 mb-4 h-[calc(100%-80px)] overflow-y-auto">
            {messages.map((msg, i) => (
              <div key={i} className="bg-white/10 p-2 rounded">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium text-sm">{msg.user}</span>
                  <span className="text-gray-400 text-xs">
                    {new Date(msg.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                <p className="text-white text-sm mt-1">{msg.text}</p>
              </div>
            ))}
            {messages.length === 0 && (
              <p className="text-gray-400 text-sm">No messages yet. Be the first to say hello!</p>
            )}
          </div>
          
          <form onSubmit={handleSendMessage} className="absolute bottom-4 left-4 right-4">
            <div className="flex space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="bg-white/10 border-white/20 text-white"
              />
              <Button type="submit" size="sm" className="shrink-0">Send</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default MediaPlayer;
