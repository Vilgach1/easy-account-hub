
import React from 'react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container max-w-6xl mx-auto px-4 py-12 flex flex-col items-center justify-center">
        <div className="text-center space-y-6 animate-slide-up">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            <span className="inline-block">Your Simple Authentication</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A beautifully designed authentication system with a clean, minimalist interface.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
            {isAuthenticated ? (
              <Button asChild size="lg" className="animate-fade-in">
                <Link to="/profile">Go to Profile</Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" className="animate-fade-in">
                  <Link to="/register">Get Started</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="animate-fade-in delay-100">
                  <Link to="/login">Sign In</Link>
                </Button>
              </>
            )}
          </div>
        </div>
        
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          <div className="p-6 rounded-lg border bg-card hover:shadow-md transition-all duration-300 animate-slide-up delay-150">
            <h3 className="text-xl font-medium mb-2">Simple Sign-up</h3>
            <p className="text-muted-foreground">Create an account with just your email and password in seconds.</p>
          </div>
          <div className="p-6 rounded-lg border bg-card hover:shadow-md transition-all duration-300 animate-slide-up delay-200">
            <h3 className="text-xl font-medium mb-2">User Profiles</h3>
            <p className="text-muted-foreground">Manage your profile information with our intuitive interface.</p>
          </div>
          <div className="p-6 rounded-lg border bg-card hover:shadow-md transition-all duration-300 animate-slide-up delay-250">
            <h3 className="text-xl font-medium mb-2">Data Storage</h3>
            <p className="text-muted-foreground">Your information is securely stored and easily accessible when you need it.</p>
          </div>
        </div>
      </main>
      
      <footer className="py-6 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2023 SimpleAuth. Beautiful, minimal authentication.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
