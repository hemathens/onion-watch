import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { UploadCloud, Bot, BarChart, FileText, AlertTriangle, X, Image } from 'lucide-react';
import { useState, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";

const PredictionsPage = () => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <div className="col-span-3 flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Image Upload</CardTitle>
            <CardDescription>Upload images of your onion batch for AI analysis.</CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
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
              <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">
                Drop onion images here or{' '}
                <Button variant="link" className="p-0" onClick={triggerFileInput}>
                  browse files
                </Button>
                .
              </p>
              <p className="text-xs text-muted-foreground mt-1">Supports: JPG, PNG. Max 5MB each.</p>
            </div>
            
            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <Label>Uploaded Images ({uploadedFiles.length})</Label>
                <div className="grid grid-cols-2 gap-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square border rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                        <Image className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      <p className="text-xs text-center mt-1 truncate">{file.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Batch Information</CardTitle>
            <CardDescription>Fill in the details for the new batch.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="batch-id">Batch ID</Label>
              <Input id="batch-id" defaultValue="ON-126" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Storage Location</Label>
              <Select>
                <SelectTrigger id="location">
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="loc-a">Cold Storage A</SelectItem>
                  <SelectItem value="loc-b">Natural Ventilation B</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quantity">Initial Quantity (kg)</Label>
              <Input id="quantity" type="number" placeholder="e.g., 1000" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea id="notes" placeholder="Any additional notes about this batch..." />
            </div>
            <Button 
              className="w-full" 
              onClick={() => {
                if (uploadedFiles.length === 0) {
                  toast({
                    title: "No Images Selected",
                    description: "Please upload at least one image before submitting for prediction.",
                    variant: "destructive"
                  });
                  return;
                }
                toast({
                  title: "Prediction Started",
                  description: `Analyzing ${uploadedFiles.length} image(s). Results will appear shortly.`,
                });
              }}
            >
              Submit for Prediction
            </Button>
          </CardContent>
        </Card>
      </div>
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5" /> AI Prediction Results</CardTitle>
          <CardDescription>Analysis of the uploaded onion batch images.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="text-center p-6 bg-muted rounded-lg">
            <div className="text-6xl font-bold text-primary">95%</div>
            <p className="text-muted-foreground">Confidence Score</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold">Estimated Shelf-Life</h3>
              <p className="text-2xl">45-50 days</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold">Quality Grade</h3>
              <p className="text-2xl text-green-500">A (Excellent)</p>
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-orange-500" /> Risk Factors Identified</h3>
            <p className="text-sm text-muted-foreground">No significant risk factors detected. Minor color variations are within acceptable limits.</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold">Actionable Recommendations</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Maintain current storage conditions.</li>
              <li>Schedule first quality check in 15 days.</li>
              <li>High market readiness. Suitable for premium markets.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PredictionsPage;
