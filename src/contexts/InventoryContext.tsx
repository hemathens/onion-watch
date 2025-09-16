import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BatchFormData } from '@/components/inventory/AddBatchDialog';

export interface Batch {
  id: string;
  quantity: string;
  qualityScore: number;
  daysUntilExpiry: number;
  location: string;
  lastUpdated: string;
  status: 'healthy' | 'at-risk' | 'critical';
  priority: number;
  supplier?: string;
  receivedDate?: string;
  notes?: string;
  unit?: string;
}

interface InventoryContextType {
  batches: Batch[];
  addBatch: (batchData: BatchFormData) => void;
  updateBatch: (id: string, updatedBatch: Partial<Batch>) => void;
  deleteBatch: (id: string) => void;
  clearAllData: () => void;
  resetToDefaults: () => void;
  isLoaded: boolean;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};

// Storage keys for localStorage
const STORAGE_KEYS = {
  BATCHES: 'onionwatch-inventory-batches',
  LAST_BATCH_ID: 'onionwatch-last-batch-id'
};

// Helper functions for localStorage
const loadBatchesFromStorage = (): Batch[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.BATCHES);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load batches from localStorage:', error);
  }
  return initialBatches;
};

const saveBatchesToStorage = (batches: Batch[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(batches));
  } catch (error) {
    console.warn('Failed to save batches to localStorage:', error);
  }
};

const generateBatchId = (): string => {
  try {
    const lastId = localStorage.getItem(STORAGE_KEYS.LAST_BATCH_ID);
    let nextNumber = 127; // Start after the sample data
    
    if (lastId) {
      const match = lastId.match(/ON-(\d+)/);
      if (match) {
        nextNumber = Math.max(parseInt(match[1]) + 1, 127);
      }
    }
    
    const newId = `ON-${nextNumber.toString().padStart(3, '0')}`;
    localStorage.setItem(STORAGE_KEYS.LAST_BATCH_ID, newId);
    return newId;
  } catch (error) {
    console.warn('Failed to generate batch ID:', error);
    return `ON-${Date.now().toString().slice(-3)}`;
  }
};

// Initialize the last batch ID based on existing sample data
const initializeLastBatchId = () => {
  try {
    const existingId = localStorage.getItem(STORAGE_KEYS.LAST_BATCH_ID);
    if (!existingId) {
      // Set to the highest ID from sample data
      localStorage.setItem(STORAGE_KEYS.LAST_BATCH_ID, 'ON-126');
    }
  } catch (error) {
    console.warn('Failed to initialize batch ID:', error);
  }
};

// Initial sample batch data
const initialBatches: Batch[] = [
  {
    id: "ON-124",
    quantity: "500 kg",
    qualityScore: 95,
    daysUntilExpiry: 45,
    location: "Cold Storage A",
    lastUpdated: "2 hours ago",
    status: "healthy",
    priority: 1,
    supplier: "Fresh Farms Ltd",
    receivedDate: "2024-01-01",
    notes: "Premium quality onions"
  },
  {
    id: "ON-089",
    quantity: "1200 kg",
    qualityScore: 48,
    daysUntilExpiry: 12,
    location: "Natural Ventilation B",
    lastUpdated: "1 day ago",
    status: "at-risk",
    priority: 2,
    supplier: "Valley Harvest Co",
    receivedDate: "2024-01-05"
  },
  {
    id: "ON-112",
    quantity: "750 kg",
    qualityScore: 25,
    daysUntilExpiry: 5,
    location: "Cold Storage A",
    lastUpdated: "30 mins ago",
    status: "critical",
    priority: 3,
    supplier: "Mountain Produce",
    receivedDate: "2024-01-10"
  },
  {
    id: "ON-126",
    quantity: "800 kg",
    qualityScore: 88,
    daysUntilExpiry: 38,
    location: "Cold Storage A",
    lastUpdated: "4 hours ago",
    status: "healthy",
    priority: 1,
    supplier: "Green Fields Farm",
    receivedDate: "2024-01-03"
  },
  {
    id: "ON-101",
    quantity: "600 kg",
    qualityScore: 72,
    daysUntilExpiry: 22,
    location: "Natural Ventilation B",
    lastUpdated: "6 hours ago",
    status: "healthy",
    priority: 1,
    supplier: "Sunny Acres",
    receivedDate: "2024-01-08"
  }
];

interface InventoryProviderProps {
  children: ReactNode;
}

export const InventoryProvider: React.FC<InventoryProviderProps> = ({ children }) => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load batches from localStorage on component mount
  useEffect(() => {
    initializeLastBatchId();
    const loadedBatches = loadBatchesFromStorage();
    setBatches(loadedBatches);
    setIsLoaded(true);
  }, []);

  // Save batches to localStorage whenever batches change
  useEffect(() => {
    if (isLoaded) {
      saveBatchesToStorage(batches);
    }
  }, [batches, isLoaded]);

  const addBatch = (batchData: BatchFormData) => {
    // Generate a unique batch ID if not provided
    const batchId = batchData.batchId || generateBatchId();
    
    const newBatch: Batch = {
      id: batchId,
      quantity: `${batchData.quantity} ${batchData.unit}`,
      qualityScore: 100, // New batches start with high quality
      daysUntilExpiry: parseInt(batchData.expectedShelfLife),
      location: batchData.location,
      lastUpdated: "Just now",
      status: "healthy",
      priority: 1,
      supplier: batchData.supplier,
      receivedDate: batchData.receivedDate,
      notes: batchData.notes,
      unit: batchData.unit
    };

    setBatches(prev => {
      const updated = [newBatch, ...prev];
      return updated;
    });
  };

  const updateBatch = (id: string, updatedBatch: Partial<Batch>) => {
    setBatches(prev => {
      const updated = prev.map(batch => 
        batch.id === id ? { ...batch, ...updatedBatch, lastUpdated: "Just now" } : batch
      );
      return updated;
    });
  };

  const deleteBatch = (id: string) => {
    setBatches(prev => {
      const updated = prev.filter(batch => batch.id !== id);
      return updated;
    });
  };

  const clearAllData = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.BATCHES);
      localStorage.removeItem(STORAGE_KEYS.LAST_BATCH_ID);
      setBatches([]);
    } catch (error) {
      console.warn('Failed to clear data from localStorage:', error);
    }
  };

  const resetToDefaults = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.BATCHES);
      localStorage.removeItem(STORAGE_KEYS.LAST_BATCH_ID);
      setBatches(initialBatches);
    } catch (error) {
      console.warn('Failed to reset data:', error);
    }
  };

  const value: InventoryContextType = {
    batches,
    addBatch,
    updateBatch,
    deleteBatch,
    clearAllData,
    resetToDefaults,
    isLoaded
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};