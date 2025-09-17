import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UploadCloud, Bot, BarChart, FileText, AlertTriangle, X, Image, Loader2, CheckCircle, Clock } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useInventory } from "@/contexts/InventoryContext";
import aiPredictionService, { type OnionAnalysis } from "@/services/aiPredictionService";

const PredictionsPage = () => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<OnionAnalysis[]>([]);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [batchInfo, setBatchInfo] = useState({
    batchId: '',
    location: '',
    quantity: '',
    notes: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { addBatch } = useInventory();

  // Load AI model on component mount
  useEffect(() => {
    const loadModel = async () => {
      try {
        setModelLoading(true);
        await aiPredictionService.loadModel();
        setModelLoaded(true);
        toast({
          title: "AI Model Loaded",
          description: "Ready for onion quality analysis!",
        });
      } catch (error) {
        console.error('Failed to load AI model:', error);
        toast({
          title: "Model Loading Failed",
          description: "Using fallback analysis. Some features may be limited.",
          variant: "destructive",
        });
      } finally {
        setModelLoading(false);
      }
    };

    loadModel();
  }, [toast]);

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

  const analyzeImages = async () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "No Images Selected",
        description: "Please upload at least one image before submitting for prediction.",
        variant: "destructive"
      });
      return;
    }

    if (!modelLoaded) {
      toast({
        title: "Model Not Ready",
        description: "AI model is still loading. Please wait a moment.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      toast({
        title: "Analysis Started",
        description: `Analyzing ${uploadedFiles.length} image(s) with AI model...`,
      });

      // Analyze all uploaded images
      const results = await aiPredictionService.analyzeBatch(uploadedFiles);
      setAnalysisResults(results);

      // Calculate overall batch metrics
      const avgQuality = results.reduce((sum, r) => sum + r.qualityScore, 0) / results.length;
      const avgShelfLife = Math.round(results.reduce((sum, r) => sum + r.shelfLifeDays, 0) / results.length);
      const overallStatus = avgQuality >= 80 ? 'healthy' : avgQuality >= 60 ? 'at-risk' : 'critical';

      toast({
        title: "Analysis Complete",
        description: `Average quality score: ${Math.round(avgQuality)}%, Estimated shelf-life: ${avgShelfLife} days`,
      });

      // Auto-fill batch info if not already filled
      if (!batchInfo.batchId) {
        const timestamp = new Date().toISOString().slice(2, 10).replace(/-/g, '');
        setBatchInfo(prev => ({
          ...prev,
          batchId: `AI-${timestamp}-${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`
        }));
      }

    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze images. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveToInventory = () => {
    if (!batchInfo.batchId || !batchInfo.location || !batchInfo.quantity) {
      toast({
        title: "Missing Information",
        description: "Please fill in batch ID, location, and quantity before saving.",
        variant: "destructive"
      });
      return;
    }

    if (analysisResults.length === 0) {
      toast({
        title: "No Analysis Results",
        description: "Please analyze images first before saving to inventory.",
        variant: "destructive"
      });
      return;
    }

    // Calculate batch metrics from analysis
    const avgQuality = analysisResults.reduce((sum, r) => sum + r.qualityScore, 0) / analysisResults.length;
    const avgShelfLife = Math.round(analysisResults.reduce((sum, r) => sum + r.shelfLifeDays, 0) / analysisResults.length);
    const overallStatus = avgQuality >= 80 ? 'healthy' : avgQuality >= 60 ? 'at-risk' : 'critical';

    // Add to inventory
    addBatch({
      batchId: batchInfo.batchId,
      quantity: batchInfo.quantity,
      unit: 'kg',
      location: batchInfo.location,
      supplier: 'AI Analysis',
      receivedDate: new Date().toISOString().split('T')[0],
      expectedShelfLife: avgShelfLife.toString(),
      notes: `${batchInfo.notes}\n\nAI Analysis: ${analysisResults.length} images analyzed, Average quality: ${Math.round(avgQuality)}%`
    });

    toast({
      title: "Batch Saved",
      description: `Batch ${batchInfo.batchId} has been added to inventory with AI analysis data.`,
    });

    // Reset form
    setUploadedFiles([]);
    setAnalysisResults([]);
    setBatchInfo({ batchId: '', location: '', quantity: '', notes: '' });
  };

  const getOverallAnalysis = () => {
    if (analysisResults.length === 0) return null;

    const avgConfidence = Math.round(analysisResults.reduce((sum, r) => sum + r.confidence, 0) / analysisResults.length);
    const avgQuality = Math.round(analysisResults.reduce((sum, r) => sum + r.qualityScore, 0) / analysisResults.length);
    const avgShelfLife = Math.round(analysisResults.reduce((sum, r) => sum + r.shelfLifeDays, 0) / analysisResults.length);
    const worstCase = analysisResults.reduce((worst, current) => 
      current.qualityScore < worst.qualityScore ? current : worst
    );
    const bestGrade = analysisResults.reduce((best, current) => 
      current.qualityGrade < best.qualityGrade ? current : best
    ).qualityGrade;

    return { avgConfidence, avgQuality, avgShelfLife, worstCase, bestGrade };
  };

  const overall = getOverallAnalysis();
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
              <Input 
                id="batch-id" 
                value={batchInfo.batchId}
                onChange={(e) => setBatchInfo(prev => ({ ...prev, batchId: e.target.value }))}
                placeholder="Will be auto-generated"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Storage Location</Label>
              <Select value={batchInfo.location} onValueChange={(value) => setBatchInfo(prev => ({ ...prev, location: value }))}>
                <SelectTrigger id="location">
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cold Storage A">Cold Storage A</SelectItem>
                  <SelectItem value="Natural Ventilation B">Natural Ventilation B</SelectItem>
                  <SelectItem value="Cold Storage C">Cold Storage C</SelectItem>
                  <SelectItem value="Warehouse D">Warehouse D</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quantity">Initial Quantity (kg)</Label>
              <Input 
                id="quantity" 
                type="number" 
                placeholder="e.g., 1000"
                value={batchInfo.quantity}
                onChange={(e) => setBatchInfo(prev => ({ ...prev, quantity: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea 
                id="notes" 
                placeholder="Any additional notes about this batch..."
                value={batchInfo.notes}
                onChange={(e) => setBatchInfo(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Button 
                className="w-full" 
                onClick={analyzeImages}
                disabled={isAnalyzing || modelLoading || uploadedFiles.length === 0}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Images...
                  </>
                ) : modelLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading AI Model...
                  </>
                ) : (
                  'Analyze with AI'
                )}
              </Button>
              
              {analysisResults.length > 0 && (
                <Button 
                  variant="outline"
                  className="w-full" 
                  onClick={saveToInventory}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Save to Inventory
                </Button>
              )}
            </div>
            
            {/* Model Status */}
            <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-2">
              <span>AI Model Status:</span>
              <div className="flex items-center gap-1">
                {modelLoading ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : modelLoaded ? (
                  <>
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span className="text-green-600">Ready</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-3 w-3 text-red-500" />
                    <span className="text-red-600">Failed</span>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" /> 
            AI Prediction Results
            {isAnalyzing && <Loader2 className="h-4 w-4 animate-spin" />}
          </CardTitle>
          <CardDescription>
            {analysisResults.length > 0 
              ? `Analysis of ${analysisResults.length} onion batch image(s)` 
              : "Upload and analyze images to see AI predictions"}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {analysisResults.length === 0 ? (
            <div className="text-center p-8 bg-muted rounded-lg">
              <Bot className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">No analysis results yet</p>
              <p className="text-sm text-muted-foreground">Upload onion images and click "Analyze with AI" to get started</p>
            </div>
          ) : (
            <>
              {/* Overall Results */}
              {overall && (
                <>
                  <div className="text-center p-6 bg-muted rounded-lg">
                    <div className="text-6xl font-bold text-primary">{overall.avgConfidence}%</div>
                    <p className="text-muted-foreground">Average Confidence Score</p>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold">Estimated Shelf-Life</h3>
                      <p className="text-2xl">{overall.avgShelfLife} days</p>
                      <p className="text-xs text-muted-foreground mt-1">Based on current condition</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold">Quality Grade</h3>
                      <p className={`text-2xl ${
                        overall.bestGrade === 'A' ? 'text-green-500' :
                        overall.bestGrade === 'B' ? 'text-blue-500' :
                        overall.bestGrade === 'C' ? 'text-yellow-500' :
                        'text-red-500'
                      }`}>
                        {overall.bestGrade} ({overall.avgQuality}%)
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Quality score average</p>
                    </div>
                  </div>
                  
                  {/* Risk Factors */}
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold flex items-center gap-2">
                      <AlertTriangle className={`h-4 w-4 ${
                        overall.worstCase.status === 'critical' ? 'text-red-500' :
                        overall.worstCase.status === 'at-risk' ? 'text-orange-500' :
                        'text-green-500'
                      }`} />
                      Risk Assessment
                    </h3>
                    <div className="mt-2 space-y-1">
                      {overall.worstCase.riskFactors.length > 0 ? (
                        overall.worstCase.riskFactors.map((risk, index) => (
                          <div key={index} className="text-sm text-muted-foreground flex items-start gap-1">
                            <span className="text-orange-500 mt-0.5">•</span>
                            <span>{risk}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-green-600">No significant risk factors detected</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Recommendations */}
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold">AI Recommendations</h3>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mt-2">
                      {overall.worstCase.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Individual Image Results */}
                  {analysisResults.length > 1 && (
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-3">Individual Image Analysis</h3>
                      <div className="grid gap-2">
                        {analysisResults.map((result, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                            <span className="text-sm font-medium">Image {index + 1}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant={result.status === 'healthy' ? 'default' : result.status === 'at-risk' ? 'secondary' : 'destructive'}>
                                {result.qualityGrade}
                              </Badge>
                              <span className="text-sm text-muted-foreground">{result.confidence}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PredictionsPage;
