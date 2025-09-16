import DashboardCard from "@/components/DashboardCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, ArrowUp, ArrowDown, Thermometer, Droplets, Clock, UploadCloud, X, Image } from 'lucide-react';
import { useState, useRef } from 'react';

const DashboardPage = () => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const validFiles = Array.from(files).filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return isValidType && isValidSize;
    });
    
    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard title="Total Batches" value="128" icon={<Package className="h-4 w-4 text-muted-foreground" />} trend="+5 since last week" trendDirection="up" />
        <DashboardCard title="Healthy Stock" value="92.5%" icon={<ArrowUp className="h-4 w-4 text-green-500" />} />
        <DashboardCard title="At Risk Batches" value="7" icon={<ArrowDown className="h-4 w-4 text-red-500" />} />
        <DashboardCard title="Predicted Savings" value="$2,450" icon={<ArrowUp className="h-4 w-4 text-green-500" />} trend="+15% this month" trendDirection="up" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Central Monitoring Panel</CardTitle>
            <CardDescription>Real-time overview of your storage conditions and batch health.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Real-time Storage Conditions</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Thermometer className="h-5 w-5 text-blue-500" /> Temperature: 12°C</div>
                <div className="text-sm text-green-500">Optimal</div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2"><Droplets className="h-5 w-5 text-cyan-500" /> Humidity: 65%</div>
                <div className="text-sm text-green-500">Optimal</div>
              </div>
              <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><Clock className="h-3 w-3" /> Last updated: 2 mins ago</div>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Batch Status Overview</h3>
              <p className="text-sm text-muted-foreground">Pie chart showing batch health distribution will be here.</p>
            </div>
            <div className="p-4 border rounded-lg col-span-2">
              <h3 className="font-semibold mb-2">Recent Activity Feed</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>- Batch #ON-124 image uploaded. Prediction: 95% healthy.</li>
                <li>- Alert: Batch #ON-089 requires attention.</li>
                <li>- New batch #ON-125 added to Cold Storage A.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
        <div className="col-span-3 flex flex-col gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                    <div 
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileSelect(e.target.files)}
                      />
                      <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">
                        Drag & drop onion images here or{' '}
                        <Button variant="link" className="p-0" onClick={triggerFileInput}>
                          browse files
                        </Button>
                        .
                      </p>
                    </div>
                    
                    {uploadedFiles.length > 0 && (
                      <div className="mt-2 space-y-2">
                        <p className="text-sm font-medium">Uploaded Images ({uploadedFiles.length})</p>
                        <div className="grid grid-cols-3 gap-2">
                          {uploadedFiles.map((file, index) => (
                            <div key={index} className="relative group">
                              <div className="aspect-square border rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                                <Image className="h-6 w-6 text-muted-foreground" />
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeFile(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                              <p className="text-xs text-center mt-1 truncate">{file.name}</p>
                            </div>
                          ))}
                        </div>
                        <Button className="w-full mt-2" size="sm">
                          Quick Analyze
                        </Button>
                      </div>
                    )}
                </CardContent>
            </Card>
            <Card className="border-orange-500">
                <CardHeader>
                    <CardTitle className="text-orange-500">Urgent Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">- Batch #ON-089 in Location B shows signs of early sprouting.</p>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
