
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Moon, Sun } from 'lucide-react';

const Profile = () => {
  const { user, isAuthenticated, updateUserProfile, isLoading } = useAuth();
  
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const [isSaving, setIsSaving] = useState(false);
  
  if (!isAuthenticated && !isLoading) {
    return <Navigate to="/login" />;
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUserProfile({ name });
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };
  
  const toggleTheme = () => {
    const newTheme = darkMode ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark');
    setDarkMode(!darkMode);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col dark:bg-gray-900 transition-colors duration-300">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto animate-slide-up dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Your Profile</CardTitle>
            <CardDescription className="dark:text-gray-300">
              View and manage your account information
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="dark:text-white">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div className="pt-2">
                  <Label className="dark:text-white">Email</Label>
                  <div className="text-muted-foreground mt-1 dark:text-gray-300">{user?.email}</div>
                  <div className="text-xs text-muted-foreground mt-1 dark:text-gray-400">Email cannot be changed</div>
                </div>
                
                <div className="flex space-x-2 pt-4">
                  <Button type="submit" disabled={isSaving} className="dark:bg-purple-600 dark:hover:bg-purple-700">
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setEditing(false);
                      setName(user?.name || '');
                    }}
                    className="dark:border-gray-600 dark:text-gray-300"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground dark:text-gray-400">Name</h3>
                  <div className="mt-1 text-lg dark:text-white">{user?.name || 'Not set'}</div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground dark:text-gray-400">Email</h3>
                  <div className="mt-1 text-lg dark:text-white">{user?.email}</div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground dark:text-gray-400">Member Since</h3>
                  <div className="mt-1 text-lg dark:text-white">
                    {user?.createdAt && new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground dark:text-gray-400 mb-2">Appearance</h3>
                  <div className="flex items-center space-x-2">
                    <Sun className="h-5 w-5 text-yellow-500" />
                    <Switch 
                      checked={darkMode}
                      onCheckedChange={toggleTheme}
                    />
                    <Moon className="h-5 w-5 text-blue-700 dark:text-blue-400" />
                    <span className="ml-2 text-sm dark:text-gray-300">
                      {darkMode ? 'Dark Mode' : 'Light Mode'}
                    </span>
                  </div>
                </div>
                
                <Button onClick={() => setEditing(true)} className="mt-4 dark:bg-purple-600 dark:hover:bg-purple-700">
                  Edit Profile
                </Button>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="border-t pt-6 flex justify-between dark:border-gray-700">
            <div className="text-sm text-muted-foreground dark:text-gray-400">
              ID: {user?.id.substring(0, 8)}...
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default Profile;
