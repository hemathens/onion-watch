import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { BellRing, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";

const AlertsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState({
    critical: [
      {
        id: 1,
        title: "Batch ON-112: Quality score dropped to 25%",
        description: "Immediate action required. 30 mins ago",
        batchId: "ON-112",
        resolved: false
      }
    ],
    warning: [
      {
        id: 2,
        title: "Batch ON-089: Shelf-life prediction reduced",
        description: "Attention required. 1 day ago",
        batchId: "ON-089",
        read: false
      }
    ],
    info: [
      {
        id: 3,
        title: "New AI model update applied",
        description: "Prediction accuracy improved. 2 days ago",
        dismissed: false
      }
    ],
    resolved: [
      {
        id: 4,
        title: "Batch ON-095: Ventilation adjusted",
        description: "Resolved by User. 3 days ago",
        batchId: "ON-095"
      }
    ]
  });

  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsAlerts: false,
    pushNotifications: true,
    criticalThreshold: 30,
    warningThreshold: 50
  });

  const handleViewBatch = (batchId: string) => {
    navigate(`/dashboard/inventory/${batchId}`);
  };

  const handleResolveAlert = (alertId: number) => {
    setAlerts(prev => ({
      ...prev,
      critical: prev.critical.map(alert => 
        alert.id === alertId ? { ...alert, resolved: true } : alert
      ).filter(alert => !alert.resolved),
      resolved: [...prev.resolved, ...prev.critical.filter(alert => alert.id === alertId)]
    }));
    toast({
      title: "Alert Resolved",
      description: "The critical alert has been marked as resolved.",
    });
  };

  const handleMarkAsRead = (alertId: number) => {
    setAlerts(prev => ({
      ...prev,
      warning: prev.warning.map(alert => 
        alert.id === alertId ? { ...alert, read: true } : alert
      )
    }));
    toast({
      title: "Alert Read",
      description: "The warning alert has been marked as read.",
    });
  };

  const handleDismissInfo = (alertId: number) => {
    setAlerts(prev => ({
      ...prev,
      info: prev.info.map(alert => 
        alert.id === alertId ? { ...alert, dismissed: true } : alert
      ).filter(alert => !alert.dismissed)
    }));
    toast({
      title: "Alert Dismissed",
      description: "The information alert has been dismissed.",
    });
  };

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your notification preferences have been updated successfully.",
    });
  };
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Alerts Dashboard</CardTitle>
          <CardDescription>Manage and view alerts for your onion batches.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="critical">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="critical">Critical ({alerts.critical.length})</TabsTrigger>
              <TabsTrigger value="warning">Warning ({alerts.warning.length})</TabsTrigger>
              <TabsTrigger value="info">Info ({alerts.info.length})</TabsTrigger>
              <TabsTrigger value="resolved">Resolved ({alerts.resolved.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="critical" className="mt-4">
              {alerts.critical.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No critical alerts at this time.
                </div>
              ) : (
                alerts.critical.map(alert => (
                  <div key={alert.id} className="border rounded-lg p-4 flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <AlertTriangle className="h-6 w-6 text-destructive" />
                      <div>
                        <p className="font-semibold">{alert.title}</p>
                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewBatch(alert.batchId)}
                      >
                        View Batch
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleResolveAlert(alert.id)}
                      >
                        Resolve
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
            <TabsContent value="warning" className="mt-4">
              {alerts.warning.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No warning alerts at this time.
                </div>
              ) : (
                alerts.warning.map(alert => (
                  <div key={alert.id} className={`border rounded-lg p-4 flex items-center justify-between mb-4 ${alert.read ? 'opacity-60' : ''}`}>
                    <div className="flex items-center gap-4">
                      <BellRing className="h-6 w-6 text-warning" />
                      <div>
                        <p className="font-semibold">{alert.title}</p>
                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewBatch(alert.batchId)}
                      >
                        View Batch
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleMarkAsRead(alert.id)}
                        disabled={alert.read}
                      >
                        {alert.read ? 'Read' : 'Mark as Read'}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
            <TabsContent value="info" className="mt-4">
              {alerts.info.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No information alerts at this time.
                </div>
              ) : (
                alerts.info.map(alert => (
                  <div key={alert.id} className="border rounded-lg p-4 flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <Info className="h-6 w-6 text-blue-500" />
                      <div>
                        <p className="font-semibold">{alert.title}</p>
                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDismissInfo(alert.id)}
                    >
                      Dismiss
                    </Button>
                  </div>
                ))
              )}
            </TabsContent>
            <TabsContent value="resolved" className="mt-4">
              {alerts.resolved.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No resolved alerts yet.
                </div>
              ) : (
                alerts.resolved.map(alert => (
                  <div key={alert.id} className="border rounded-lg p-4 flex items-center justify-between opacity-60 mb-4">
                    <div className="flex items-center gap-4">
                      <CheckCircle className="h-6 w-6 text-muted-foreground" />
                      <div>
                        <p className="font-semibold">{alert.title}</p>
                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>Configure how you receive alerts.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications" className="flex flex-col gap-1">
                <span>Email Notifications</span>
                <span className="font-normal text-muted-foreground">Receive alerts via email.</span>
              </Label>
              <Switch 
                id="email-notifications" 
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailNotifications: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sms-alerts" className="flex flex-col gap-1">
                <span>SMS Alerts</span>
                <span className="font-normal text-muted-foreground">Receive critical alerts via SMS.</span>
              </Label>
              <Switch 
                id="sms-alerts" 
                checked={settings.smsAlerts}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, smsAlerts: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications" className="flex flex-col gap-1">
                <span>Push Notifications</span>
                <span className="font-normal text-muted-foreground">Receive push notifications on your devices.</span>
              </Label>
              <Switch 
                id="push-notifications" 
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, pushNotifications: checked }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="critical-threshold">Critical Alert Threshold</Label>
              <Input 
                id="critical-threshold" 
                type="number" 
                value={settings.criticalThreshold}
                onChange={(e) => setSettings(prev => ({ ...prev, criticalThreshold: parseInt(e.target.value) || 30 }))}
                placeholder="Quality score < 30%" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="warning-threshold">Warning Alert Threshold</Label>
              <Input 
                id="warning-threshold" 
                type="number" 
                value={settings.warningThreshold}
                onChange={(e) => setSettings(prev => ({ ...prev, warningThreshold: parseInt(e.target.value) || 50 }))}
                placeholder="Quality score < 50%" 
              />
            </div>
            <Button onClick={handleSaveSettings}>Save Settings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlertsPage;
