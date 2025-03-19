
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

const WelcomeModal = () => {
  const [open, setOpen] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  useEffect(() => {
    // Check if user has already seen the welcome message
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setOpen(true);
    }
  }, []);
  
  const handleAccept = () => {
    if (acceptedTerms) {
      localStorage.setItem('hasSeenWelcome', 'true');
      setOpen(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-3xl dark:bg-gray-800 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-2xl dark:text-white">Welcome to SyncWatch</DialogTitle>
          <DialogDescription className="dark:text-gray-400">
            Your collaborative media watching platform
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <h3 className="text-lg font-semibold mb-2 dark:text-white">About SyncWatch</h3>
          <p className="text-muted-foreground mb-4 dark:text-gray-300">
            SyncWatch is a platform that lets you watch videos together with friends in perfect synchronization.
            Create a room, invite your friends, and enjoy a shared viewing experience!
          </p>
          
          <h3 className="text-lg font-semibold mb-2 dark:text-white">Terms of Service</h3>
          <ScrollArea className="h-48 p-4 border rounded-md dark:border-gray-700 dark:bg-gray-900">
            <div className="space-y-4 text-sm dark:text-gray-300">
              <p>
                <strong>1. Acceptance of Terms</strong><br />
                By accessing or using SyncWatch, you agree to be bound by these Terms of Service.
              </p>
              
              <p>
                <strong>2. User Accounts</strong><br />
                You are responsible for safeguarding your account information and for all activity that occurs under your account.
              </p>
              
              <p>
                <strong>3. User Conduct</strong><br />
                You agree not to use SyncWatch to:
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Violate any laws or regulations</li>
                  <li>Infringe on the rights of others</li>
                  <li>Share illegal or inappropriate content</li>
                  <li>Harass, abuse, or harm another person</li>
                  <li>Interfere with the proper functioning of SyncWatch</li>
                </ul>
              </p>
              
              <p>
                <strong>4. Content</strong><br />
                SyncWatch does not claim ownership of any content that you share. You are solely responsible for the content you share.
              </p>
              
              <p>
                <strong>5. Privacy</strong><br />
                We collect and process personal data as described in our Privacy Policy.
              </p>
              
              <p>
                <strong>6. Termination</strong><br />
                We reserve the right to terminate or suspend your account at our discretion, without notice.
              </p>
              
              <p>
                <strong>7. Disclaimer of Warranties</strong><br />
                SyncWatch is provided "as is" without warranties of any kind.
              </p>
              
              <p>
                <strong>8. Limitation of Liability</strong><br />
                In no event shall SyncWatch be liable for any damages arising out of the use or inability to use the service.
              </p>
              
              <p>
                <strong>9. Changes to Terms</strong><br />
                We may modify these terms at any time. Your continued use of SyncWatch after such changes constitutes acceptance of the new terms.
              </p>
            </div>
          </ScrollArea>
          
          <div className="flex items-start space-x-2 mt-4">
            <Checkbox
              id="terms"
              checked={acceptedTerms}
              onCheckedChange={(checked) => setAcceptedTerms(!!checked)}
              className="mt-1 dark:border-gray-500"
            />
            <Label 
              htmlFor="terms" 
              className="text-sm leading-tight dark:text-gray-300"
            >
              I have read and agree to the Terms of Service and Privacy Policy
            </Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            onClick={handleAccept}
            disabled={!acceptedTerms}
            className="dark:bg-purple-600 dark:hover:bg-purple-700 disabled:dark:bg-gray-700"
          >
            Get Started
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;
