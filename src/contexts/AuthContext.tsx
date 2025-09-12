import React, { createContext, useContext, useState, ReactNode } from 'react';

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
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (userData: Partial<User> & { password: string }) => Promise<boolean>;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  uploadAvatar: (file: File) => Promise<string>;
  isAuthenticated: boolean;
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

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser && password === 'password') { // Mock password check
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const signup = async (userData: Partial<User> & { password: string }): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name || '',
      email: userData.email || '',
      role: userData.role || 'merchant',
      businessName: userData.businessName,
      contactNumber: userData.contactNumber,
      address: userData.address,
      joinedDate: new Date().toISOString().split('T')[0],
      lastActivity: new Date().toISOString(),
      isActive: true
    };
    
    setUsers(prev => [...prev, newUser]);
    setUser(newUser);
    return true;
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
    logout,
    signup,
    updateProfile,
    changePassword,
    uploadAvatar,
    isAuthenticated: !!user,
    hasPermission,
    users,
    updateUserRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};