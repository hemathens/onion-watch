import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);

  const handleSuccess = () => {
    onClose();
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        {isLogin ? (
          <LoginForm 
            onSuccess={handleSuccess}
            onToggleSignup={toggleMode}
          />
        ) : (
          <SignupForm 
            onSuccess={handleSuccess}
            onToggleLogin={toggleMode}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};