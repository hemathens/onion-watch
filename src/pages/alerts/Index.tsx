import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { BellRing, AlertTriangle, Info, CheckCircle } from 'lucide-react';

const AlertsPage = () => {
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
              <TabsTrigger value="critical">Critical</TabsTrigger>
              <TabsTrigger value="warning">Warning</TabsTrigger>
              <TabsTrigger value="info">Info</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
            </TabsList>
            <TabsContent value="critical" className="mt-4">
              <div className="border rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                  <div>
                    <p className="font-semibold">Batch ON-112: Quality score dropped to 25%.</p>
                    <p className="text-sm text-muted-foreground">Immediate action required. 30 mins ago.</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">View Batch</Button>
                  <Button size="sm">Resolve</Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="warning" className="mt-4">
                <div className="border rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <BellRing className="h-6 w-6 text-warning" />
                        <div>
                            <p className="font-semibold">Batch ON-089: Shelf-life prediction reduced.</p>
                            <p className="text-sm text-muted-foreground">Attention required. 1 day ago.</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">View Batch</Button>
                        <Button size="sm">Mark as Read</Button>
                    </div>
                </div>
            </TabsContent>
            <TabsContent value="info" className="mt-4">
                <div className="border rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Info className="h-6 w-6 text-blue-500" />
                        <div>
                            <p className="font-semibold">New AI model update applied.</p>
                            <p className="text-sm text-muted-foreground">Prediction accuracy improved. 2 days ago.</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm">Dismiss</Button>
                </div>
            </TabsContent>
            <TabsContent value="resolved" className="mt-4">
                <div className="border rounded-lg p-4 flex items-center justify-between opacity-60">
                    <div className="flex items-center gap-4">
                        <CheckCircle className="h-6 w-6 text-muted-foreground" />
                        <div>
                            <p className="font-semibold">Batch ON-095: Ventilation adjusted.</p>
                            <p className="text-sm text-muted-foreground">Resolved by User. 3 days ago.</p>
                        </div>
                    </div>
                </div>
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
              <Switch id="email-notifications" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sms-alerts" className="flex flex-col gap-1">
                <span>SMS Alerts</span>
                <span className="font-normal text-muted-foreground">Receive critical alerts via SMS.</span>
              </Label>
              <Switch id="sms-alerts" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications" className="flex flex-col gap-1">
                <span>Push Notifications</span>
                <span className="font-normal text-muted-foreground">Receive push notifications on your devices.</span>
              </Label>
              <Switch id="push-notifications" defaultChecked />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="critical-threshold">Critical Alert Threshold</Label>
              <Input id="critical-threshold" type="number" defaultValue="30" placeholder="Quality score < 30%" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="warning-threshold">Warning Alert Threshold</Label>
              <Input id="warning-threshold" type="number" defaultValue="50" placeholder="Quality score < 50%" />
            </div>
            <Button>Save Settings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlertsPage;
