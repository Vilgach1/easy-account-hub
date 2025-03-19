
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { LogIn, LogOut, User, Play, Film, Moon, Sun } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();
  const [darkMode, setDarkMode] = React.useState(localStorage.getItem('theme') === 'dark');

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleTheme = () => {
    const newTheme = darkMode ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark');
    setDarkMode(!darkMode);
  };

  return (
    <nav className="sticky top-0 z-50 w-full">
      <div className="glass animate-in px-8 py-4 mx-auto flex items-center justify-between border-b dark:bg-gray-900/80 dark:border-gray-800">
        <div className="flex items-center space-x-2">
          <Link to="/" className="text-xl font-semibold tracking-tight transition-colors dark:text-white">
            SyncWatch
          </Link>
        </div>
        
        <div className="hidden md:flex items-center space-x-1">
          <Link to="/" className={`px-3 py-2 text-sm transition-colors hover:text-primary ${isActive('/') ? 'font-medium text-primary dark:text-purple-400' : 'text-muted-foreground dark:text-gray-300'}`}>
            Home
          </Link>
          
          <Link to="/rooms" className={`px-3 py-2 text-sm transition-colors hover:text-primary ${isActive('/rooms') || location.pathname.includes('/room/') ? 'font-medium text-primary dark:text-purple-400' : 'text-muted-foreground dark:text-gray-300'}`}>
            <Film className="h-4 w-4 inline mr-1 align-text-top" /> Rooms
          </Link>
          
          {isAuthenticated && (
            <Link to="/profile" className={`px-3 py-2 text-sm transition-colors hover:text-primary ${isActive('/profile') ? 'font-medium text-primary dark:text-purple-400' : 'text-muted-foreground dark:text-gray-300'}`}>
              Profile
            </Link>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="mr-2 dark:text-gray-300"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block">
                <span className="text-sm text-muted-foreground dark:text-gray-300">
                  {user?.name || 'User'}
                </span>
              </div>
              
              <Button 
                onClick={logout} 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2 animate-fade-in dark:border-gray-600 dark:text-gray-300"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <div className="flex space-x-2 animate-fade-in">
              <Button asChild variant="outline" size="sm" className="flex items-center gap-2 dark:border-gray-600 dark:text-gray-300">
                <Link to="/login">
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">Login</span>
                </Link>
              </Button>
              
              <Button asChild size="sm" className="flex items-center gap-2 dark:bg-purple-600 dark:hover:bg-purple-700">
                <Link to="/register">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Register</span>
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
