import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wifi, Thermometer, Droplets, Wind } from 'lucide-react';

const IotPage = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>IoT Sensor Status</CardTitle>
          <CardDescription>Live status of your connected IoT devices.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-2"><Thermometer className="h-5 w-5" /> Temperature Sensor 1</div>
            <div className="flex items-center gap-2 text-green-500"><Wifi className="h-4 w-4" /> Connected</div>
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-2"><Droplets className="h-5 w-5" /> Humidity Monitor A</div>
            <div className="flex items-center gap-2 text-green-500"><Wifi className="h-4 w-4" /> Connected</div>
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-2"><Wind className="h-5 w-5" /> Ethylene Gas Sensor</div>
            <div className="flex items-center gap-2 text-red-500"><Wifi className="h-4 w-4" /> Disconnected</div>
          </div>
        </CardContent>
      </Card>
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Real-time Environmental Data</CardTitle>
          <CardDescription>Live readings from your IoT sensors.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Historical data graphs and live sensor readings will be displayed here in a future update.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default IotPage;
