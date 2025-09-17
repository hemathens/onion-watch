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
  clearAllData: () => void;
  resetToDefaults: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys for localStorage
const STORAGE_KEYS = {
  USER_PROFILE: 'onionwatch-user-profile',
  USERS_DATA: 'onionwatch-users-data'
};

// Helper functions for localStorage
const loadUserProfile = (): User | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load user profile from localStorage:', error);
  }
  return null;
};

const saveUserProfile = (user: User | null) => {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    }
  } catch (error) {
    console.warn('Failed to save user profile to localStorage:', error);
  }
};

const loadUsersData = (): User[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USERS_DATA);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load users data from localStorage:', error);
  }
  return mockUsers;
};

const saveUsersData = (users: User[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS_DATA, JSON.stringify(users));
  } catch (error) {
    console.warn('Failed to save users data to localStorage:', error);
  }
};

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
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasSetInitialUser, setHasSetInitialUser] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadedUsers = loadUsersData();
    const storedUser = loadUserProfile();
    setUsers(loadedUsers);
    
    // Load stored user profile if it exists
    if (storedUser) {
      // For demo users (non-Firebase users), set immediately
      if (!storedUser.firebaseUser) {
        setUser(storedUser);
        setHasSetInitialUser(true);
        setIsLoading(false);
      }
      // For Firebase users, let the auth state listener handle it
    }
    
    setIsInitialized(true);
  }, []);

  // Save users data to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      saveUsersData(users);
    }
  }, [users, isInitialized]);

  // Save user profile to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      saveUserProfile(user);
    }
  }, [user, isInitialized]);

  // Listen to authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        // Create or update user profile for Firebase users
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
        setHasSetInitialUser(true);
      } else {
        // Only handle logout if we haven't already set a demo user
        if (!hasSetInitialUser) {
          const storedUser = loadUserProfile();
          if (storedUser && !storedUser.firebaseUser) {
            // Keep demo user logged in
            setUser(storedUser);
          } else {
            // No Firebase user and no valid demo user
            setUser(null);
          }
        }
      }
      
      // Only set loading to false if we haven't already set a user
      if (!hasSetInitialUser) {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [hasSetInitialUser]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // First try Firebase authentication
      try {
        await signInWithEmail(email, password);
        return true;
      } catch (firebaseError) {
        // If Firebase fails, try demo/mock user authentication
        console.log('Firebase login failed, trying demo accounts...');
        
        // Check if credentials match any mock user
        const mockUser = mockUsers.find(u => u.email === email);
        if (mockUser && password === 'password') {
          // Set the mock user as current user
          setUser(mockUser);
          return true;
        }
        
        // If neither Firebase nor demo login works, return false
        return false;
      }
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
      // Clear localStorage first
      saveUserProfile(null);
      setUser(null);
      
      // Try Firebase logout (if user was logged in via Firebase)
      if (auth.currentUser) {
        await signOutUser();
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if Firebase logout fails
      saveUserProfile(null);
      setUser(null);
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
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedUser = { ...user, ...userData, lastActivity: new Date().toISOString() };
      setUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
      
      // Force save to localStorage immediately
      saveUserProfile(updatedUser);
      
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
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
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64Data = event.target?.result as string;
          
          if (user) {
            const updatedUser = { ...user, avatar: base64Data, lastActivity: new Date().toISOString() };
            setUser(updatedUser);
            // Also update in users list if it exists
            setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
            
            // Force save to localStorage immediately
            saveUserProfile(updatedUser);
          }
          
          resolve(base64Data);
        } catch (error) {
          console.error('Error uploading avatar:', error);
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
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

  const clearAllData = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
      localStorage.removeItem(STORAGE_KEYS.USERS_DATA);
      setUser(null);
      setUsers([]);
    } catch (error) {
      console.warn('Failed to clear auth data from localStorage:', error);
    }
  };

  const resetToDefaults = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
      localStorage.removeItem(STORAGE_KEYS.USERS_DATA);
      setUser(null);
      setUsers(mockUsers);
    } catch (error) {
      console.warn('Failed to reset auth data:', error);
    }
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
    updateUserRole,
    clearAllData,
    resetToDefaults
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};