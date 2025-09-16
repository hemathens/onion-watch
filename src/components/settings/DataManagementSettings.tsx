import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, RotateCcw, Database, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useInventory } from '@/contexts/InventoryContext';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';

export const DataManagementSettings = () => {
  const { clearAllData: clearAuthData, resetToDefaults: resetAuthData } = useAuth();
  const { clearAllData: clearInventoryData, resetToDefaults: resetInventoryData } = useInventory();
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleClearAllData = () => {
    if (window.confirm(t('settings.confirmClearAll'))) {
      try {
        clearAuthData();
        clearInventoryData();
        
        toast({
          title: t('settings.dataCleared'),
          description: t('settings.dataClearedDesc'),
        });
      } catch (error) {
        toast({
          title: t('message.error'),
          description: t('settings.errorClearingData'),
          variant: "destructive"
        });
      }
    }
  };

  const handleResetToDefaults = () => {
    if (window.confirm(t('settings.confirmResetAll'))) {
      try {
        resetAuthData();
        resetInventoryData();
        
        toast({
          title: t('settings.dataReset'),
          description: t('settings.dataResetDesc'),
        });
      } catch (error) {
        toast({
          title: t('message.error'), 
          description: t('settings.errorResettingData'),
          variant: "destructive"
        });
      }
    }
  };

  const handleClearInventoryOnly = () => {
    if (window.confirm(t('settings.confirmClearInventory'))) {
      try {
        clearInventoryData();
        
        toast({
          title: t('settings.inventoryCleared'),
          description: t('settings.inventoryClearedDesc'),
        });
      } catch (error) {
        toast({
          title: t('message.error'),
          description: t('settings.errorClearingInventory'),
          variant: "destructive"
        });
      }
    }
  };

  const handleResetInventoryOnly = () => {
    if (window.confirm(t('settings.confirmResetInventory'))) {
      try {
        resetInventoryData();
        
        toast({
          title: t('settings.inventoryReset'),
          description: t('settings.inventoryResetDesc'),
        });
      } catch (error) {
        toast({
          title: t('message.error'),
          description: t('settings.errorResettingInventory'),
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            {t('settings.dataManagement')}
          </CardTitle>
          <CardDescription>
            {t('settings.dataManagementDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {t('settings.dataPersistInfo')}
            </AlertDescription>
          </Alert>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-semibold">{t('settings.inventoryData')}</h4>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  onClick={handleClearInventoryOnly}
                  className="w-full justify-start"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('settings.clearInventoryData')}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleResetInventoryOnly}
                  className="w-full justify-start"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {t('settings.resetToSampleData')}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">{t('settings.allAppData')}</h4>
              <div className="space-y-2">
                <Button 
                  variant="destructive" 
                  onClick={handleClearAllData}
                  className="w-full justify-start"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('settings.clearAllData')}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleResetToDefaults}
                  className="w-full justify-start"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {t('settings.resetAllToDefaults')}
                </Button>
              </div>
            </div>
          </div>

          <Alert>
            <AlertDescription>
              <strong>Note:</strong> {t('settings.dataStorageNote')}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataManagementSettings;