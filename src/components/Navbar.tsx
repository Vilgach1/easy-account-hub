
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { LogIn, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="sticky top-0 z-50 w-full">
      <div className="glass animate-in px-8 py-4 mx-auto flex items-center justify-between border-b">
        <div className="flex items-center space-x-2">
          <Link to="/" className="text-xl font-semibold tracking-tight transition-colors">
            SimpleAuth
          </Link>
        </div>
        
        <div className="hidden md:flex items-center space-x-1">
          <Link to="/" className={`px-3 py-2 text-sm transition-colors hover:text-primary ${isActive('/') ? 'font-medium text-primary' : 'text-muted-foreground'}`}>
            Home
          </Link>
          
          {isAuthenticated ? (
            <Link to="/profile" className={`px-3 py-2 text-sm transition-colors hover:text-primary ${isActive('/profile') ? 'font-medium text-primary' : 'text-muted-foreground'}`}>
              Profile
            </Link>
          ) : (
            <>
              <Link to="/login" className={`px-3 py-2 text-sm transition-colors hover:text-primary ${isActive('/login') ? 'font-medium text-primary' : 'text-muted-foreground'}`}>
                Login
              </Link>
              <Link to="/register" className={`px-3 py-2 text-sm transition-colors hover:text-primary ${isActive('/register') ? 'font-medium text-primary' : 'text-muted-foreground'}`}>
                Register
              </Link>
            </>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <Button 
              onClick={logout} 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2 animate-fade-in"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          ) : (
            <div className="flex space-x-2 animate-fade-in">
              <Button asChild variant="outline" size="sm" className="flex items-center gap-2">
                <Link to="/login">
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">Login</span>
                </Link>
              </Button>
              
              <Button asChild size="sm" className="flex items-center gap-2">
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
