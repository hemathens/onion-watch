import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CalendarIcon, Package, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';

export interface BatchFormData {
  batchId: string;
  quantity: string;
  unit: string;
  location: string;
  supplier: string;
  receivedDate: string;
  expectedShelfLife: string;
  notes: string;
}

interface AddBatchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (batchData: BatchFormData) => void;
}

export const AddBatchDialog: React.FC<AddBatchDialogProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit 
}) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<BatchFormData>({
    batchId: '',
    quantity: '',
    unit: 'kg',
    location: '',
    supplier: '',
    receivedDate: new Date().toISOString().split('T')[0],
    expectedShelfLife: '',
    notes: ''
  });

  // Generate batch ID automatically
  const generateBatchId = () => {
    const prefix = 'ON-';
    const timestamp = Date.now().toString().slice(-6);
    return prefix + timestamp;
  };

  // Initialize with auto-generated batch ID when dialog opens
  React.useEffect(() => {
    if (isOpen && !formData.batchId) {
      setFormData(prev => ({
        ...prev,
        batchId: generateBatchId()
      }));
    }
  }, [isOpen, formData.batchId]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.batchId.trim()) {
      newErrors.batchId = 'Batch ID is required';
    }
    if (!formData.quantity.trim()) {
      newErrors.quantity = 'Quantity is required';
    } else if (isNaN(Number(formData.quantity)) || Number(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be a positive number';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Storage location is required';
    }
    if (!formData.supplier.trim()) {
      newErrors.supplier = 'Supplier name is required';
    }
    if (!formData.receivedDate) {
      newErrors.receivedDate = 'Received date is required';
    }
    if (!formData.expectedShelfLife.trim()) {
      newErrors.expectedShelfLife = 'Expected shelf life is required';
    } else if (isNaN(Number(formData.expectedShelfLife)) || Number(formData.expectedShelfLife) <= 0) {
      newErrors.expectedShelfLife = 'Expected shelf life must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Call onSubmit if provided
      onSubmit?.(formData);
      
      toast({
        title: "Batch Added Successfully",
        description: `Batch ${formData.batchId} has been added to inventory.`,
      });

      // Reset form and close dialog
      setFormData({
        batchId: '',
        quantity: '',
        unit: 'kg',
        location: '',
        supplier: '',
        receivedDate: new Date().toISOString().split('T')[0],
        expectedShelfLife: '',
        notes: ''
      });
      setErrors({});
      onClose();
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add batch. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof BatchFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setErrors({});
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {t('button.addNewBatch')}
          </DialogTitle>
          <DialogDescription>
            Add a new onion batch to your inventory. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Batch ID */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="batchId" className="text-right">
              Batch ID *
            </Label>
            <div className="col-span-3 space-y-1">
              <Input
                id="batchId"
                value={formData.batchId}
                onChange={(e) => handleInputChange('batchId', e.target.value)}
                disabled={isLoading}
                placeholder="ON-XXXXXX"
              />
              {errors.batchId && (
                <p className="text-sm text-red-600">{errors.batchId}</p>
              )}
            </div>
          </div>

          {/* Quantity and Unit */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">
              Quantity *
            </Label>
            <div className="col-span-3 flex gap-2">
              <div className="flex-1 space-y-1">
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  disabled={isLoading}
                  placeholder="Enter quantity"
                  min="0"
                  step="0.1"
                />
                {errors.quantity && (
                  <p className="text-sm text-red-600">{errors.quantity}</p>
                )}
              </div>
              <Select value={formData.unit} onValueChange={(value) => handleInputChange('unit', value)}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="tons">tons</SelectItem>
                  <SelectItem value="lbs">lbs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Storage Location */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right">
              Storage Location *
            </Label>
            <div className="col-span-3 space-y-1">
              <Select value={formData.location} onValueChange={(value) => handleInputChange('location', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select storage location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cold Storage A">Cold Storage A</SelectItem>
                  <SelectItem value="Cold Storage B">Cold Storage B</SelectItem>
                  <SelectItem value="Natural Ventilation A">Natural Ventilation A</SelectItem>
                  <SelectItem value="Natural Ventilation B">Natural Ventilation B</SelectItem>
                  <SelectItem value="Warehouse 1">Warehouse 1</SelectItem>
                  <SelectItem value="Warehouse 2">Warehouse 2</SelectItem>
                </SelectContent>
              </Select>
              {errors.location && (
                <p className="text-sm text-red-600">{errors.location}</p>
              )}
            </div>
          </div>

          {/* Supplier */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="supplier" className="text-right">
              Supplier *
            </Label>
            <div className="col-span-3 space-y-1">
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => handleInputChange('supplier', e.target.value)}
                disabled={isLoading}
                placeholder="Enter supplier name"
              />
              {errors.supplier && (
                <p className="text-sm text-red-600">{errors.supplier}</p>
              )}
            </div>
          </div>

          {/* Received Date */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="receivedDate" className="text-right">
              Received Date *
            </Label>
            <div className="col-span-3 space-y-1">
              <Input
                id="receivedDate"
                type="date"
                value={formData.receivedDate}
                onChange={(e) => handleInputChange('receivedDate', e.target.value)}
                disabled={isLoading}
              />
              {errors.receivedDate && (
                <p className="text-sm text-red-600">{errors.receivedDate}</p>
              )}
            </div>
          </div>

          {/* Expected Shelf Life */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="expectedShelfLife" className="text-right">
              Expected Shelf Life *
            </Label>
            <div className="col-span-3 space-y-1 flex gap-2 items-center">
              <Input
                id="expectedShelfLife"
                type="number"
                value={formData.expectedShelfLife}
                onChange={(e) => handleInputChange('expectedShelfLife', e.target.value)}
                disabled={isLoading}
                placeholder="Enter days"
                min="1"
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground">days</span>
              {errors.expectedShelfLife && (
                <p className="text-sm text-red-600 absolute mt-6">{errors.expectedShelfLife}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="notes" className="text-right pt-2">
              Notes
            </Label>
            <div className="col-span-3">
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                disabled={isLoading}
                placeholder="Additional notes (optional)"
                rows={3}
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              {t('button.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Batch...
                </>
              ) : (
                <>
                  <Package className="mr-2 h-4 w-4" />
                  {t('button.addNewBatch')}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};