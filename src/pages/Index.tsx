
import React from 'react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import WelcomeModal from '@/components/WelcomeModal';
import { Play, Users, Video, Lock } from 'lucide-react';

const Index = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col dark:bg-gray-900 transition-colors duration-300">
      <Navbar />
      <WelcomeModal />
      
      <main className="flex-1 container max-w-6xl mx-auto px-4 py-12 flex flex-col items-center justify-center">
        <div className="text-center space-y-6 animate-slide-up">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight dark:text-white">
            <span className="inline-block">SyncWatch</span>
          </h1>
          
          <p className="text-xl text-muted-foreground dark:text-gray-300 max-w-2xl mx-auto">
            Watch videos together with friends in perfect synchronization, no matter where you are.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
            {isAuthenticated ? (
              <Button asChild size="lg" className="animate-fade-in dark:bg-purple-600 dark:hover:bg-purple-700">
                <Link to="/rooms"><Play className="h-5 w-5 mr-2" /> Start Watching</Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" className="animate-fade-in dark:bg-purple-600 dark:hover:bg-purple-700">
                  <Link to="/register"><Lock className="h-5 w-5 mr-2" /> Get Started</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="animate-fade-in delay-100 dark:border-gray-600 dark:text-gray-300">
                  <Link to="/login">Sign In</Link>
                </Button>
              </>
            )}
          </div>
        </div>
        
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          <div className="p-6 rounded-lg border bg-card hover:shadow-md transition-all duration-300 animate-slide-up delay-150 dark:bg-gray-800 dark:border-gray-700">
            <Video className="h-8 w-8 mb-4 text-purple-500" />
            <h3 className="text-xl font-medium mb-2 dark:text-white">Synchronized Playback</h3>
            <p className="text-muted-foreground dark:text-gray-400">Watch videos in perfect sync with your friends no matter where they are.</p>
          </div>
          <div className="p-6 rounded-lg border bg-card hover:shadow-md transition-all duration-300 animate-slide-up delay-200 dark:bg-gray-800 dark:border-gray-700">
            <Users className="h-8 w-8 mb-4 text-purple-500" />
            <h3 className="text-xl font-medium mb-2 dark:text-white">Watch Parties</h3>
            <p className="text-muted-foreground dark:text-gray-400">Create rooms, invite friends, and chat while enjoying videos together.</p>
          </div>
          <div className="p-6 rounded-lg border bg-card hover:shadow-md transition-all duration-300 animate-slide-up delay-250 dark:bg-gray-800 dark:border-gray-700">
            <Lock className="h-8 w-8 mb-4 text-purple-500" />
            <h3 className="text-xl font-medium mb-2 dark:text-white">User Accounts</h3>
            <p className="text-muted-foreground dark:text-gray-400">Create your personalized profile and keep track of your watching history.</p>
          </div>
        </div>
      </main>
      
      <footer className="py-6 border-t dark:border-gray-800">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground dark:text-gray-400">
          <p>© 2023 SyncWatch. Designed by vilgach.dev</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
