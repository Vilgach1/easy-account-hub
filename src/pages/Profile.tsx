
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';

const Profile = () => {
  const { user, isAuthenticated, updateUserProfile, isLoading } = useAuth();
  
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto animate-slide-up">
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>
              View and manage your account information
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                
                <div className="pt-2">
                  <Label>Email</Label>
                  <div className="text-muted-foreground mt-1">{user?.email}</div>
                  <div className="text-xs text-muted-foreground mt-1">Email cannot be changed</div>
                </div>
                
                <div className="flex space-x-2 pt-4">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setEditing(false);
                      setName(user?.name || '');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                  <div className="mt-1 text-lg">{user?.name || 'Not set'}</div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                  <div className="mt-1 text-lg">{user?.email}</div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Member Since</h3>
                  <div className="mt-1 text-lg">
                    {user?.createdAt && new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                <Button onClick={() => setEditing(true)} className="mt-4">
                  Edit Profile
                </Button>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="border-t pt-6 flex justify-between">
            <div className="text-sm text-muted-foreground">
              ID: {user?.id.substring(0, 8)}...
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default Profile;
