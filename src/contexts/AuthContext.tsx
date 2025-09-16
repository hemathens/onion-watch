import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  auth, 
  signInWithGoogle, 
  signInWithEmail, 
  createUserWithEmail, 
  signOutUser, 
  onAuthStateChange 
} from '@/lib/firebase';

export type UserRole = 'admin' | 'merchant' | 'staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  businessName?: string;
  contactNumber?: string;
  address?: string;
  joinedDate: string;
  lastActivity: string;
  isActive: boolean;
  firebaseUser?: FirebaseUser;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
  signup: (userData: Partial<User> & { password: string }) => Promise<boolean>;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  uploadAvatar: (file: File) => Promise<string>;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  users: User[];
  updateUserRole: (userId: string, role: UserRole) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock users for demonstration
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@onionstorage.com',
    role: 'admin',
    businessName: 'OnionStorage Solutions',
    contactNumber: '+1234567890',
    address: '123 Storage St, Farm City, FC 12345',
    joinedDate: '2024-01-01',
    lastActivity: '2024-01-15 10:30',
    isActive: true,
    avatar: '/api/placeholder/100/100'
  },
  {
    id: '2', 
    name: 'John Merchant',
    email: 'merchant@example.com',
    role: 'merchant',
    businessName: 'Fresh Onion Co.',
    contactNumber: '+1234567891',
    address: '456 Market Ave, Trade Town, TT 54321',
    joinedDate: '2024-01-05',
    lastActivity: '2024-01-15 09:15',
    isActive: true
  },
  {
    id: '3',
    name: 'Staff Member',
    email: 'staff@example.com', 
    role: 'staff',
    contactNumber: '+1234567892',
    joinedDate: '2024-01-10',
    lastActivity: '2024-01-15 08:45',
    isActive: true
  }
];

// Role permissions
const rolePermissions = {
  admin: ['view_dashboard', 'manage_inventory', 'view_analytics', 'manage_users', 'manage_settings', 'export_reports'],
  merchant: ['view_dashboard', 'manage_inventory', 'view_analytics', 'export_reports'],
  staff: ['view_dashboard', 'view_inventory', 'update_batch_status']
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [isLoading, setIsLoading] = useState(true);

  // Listen to authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        // Create or update user profile
        const userData: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email || '',
          role: 'merchant', // Default role, you can implement role assignment logic
          avatar: firebaseUser.photoURL || undefined,
          joinedDate: firebaseUser.metadata.creationTime || new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          isActive: true,
          firebaseUser
        };
        setUser(userData);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      await signInWithEmail(email, password);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      return true;
    } catch (error) {
      console.error('Google login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOutUser();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const signup = async (userData: Partial<User> & { password: string }): Promise<boolean> => {
    try {
      setIsLoading(true);
      const userCredential = await createUserWithEmail(userData.email || '', userData.password);
      
      // The onAuthStateChange listener will handle setting the user state
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    if (!user) return false;
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
    return true;
  };

  const changePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock password validation
    if (oldPassword === 'password') {
      return true;
    }
    return false;
  };

  const uploadAvatar = async (file: File): Promise<string> => {
    // Simulate file upload
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock avatar URL
    const avatarUrl = `/api/placeholder/100/100`;
    
    if (user) {
      await updateProfile({ avatar: avatarUrl });
    }
    
    return avatarUrl;
  };

  const updateUserRole = async (userId: string, role: UserRole): Promise<boolean> => {
    if (!user || user.role !== 'admin') return false;
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
    return true;
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return rolePermissions[user.role].includes(permission);
  };

  const value: AuthContextType = {
    user,
    login,
    loginWithGoogle,
    logout,
    signup,
    updateProfile,
    changePassword,
    uploadAvatar,
    isAuthenticated: !!user,
    isLoading,
    hasPermission,
    users,
    updateUserRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};