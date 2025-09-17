import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UploadCloud, Bot, BarChart, FileText, AlertTriangle, X, Image, Loader2, CheckCircle, Clock, Camera, CameraOff } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useInventory } from "@/contexts/InventoryContext";
import aiPredictionService, { type OnionAnalysis, formatConfidenceScore } from "@/services/aiPredictionService";
import notificationService, { getAlertRecipientEmail } from "@/services/notificationService";
import { useAuth } from "@/contexts/AuthContext";

const PredictionsPage = () => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [uploadAnalyses, setUploadAnalyses] = useState<(OnionAnalysis | null)[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<OnionAnalysis[]>([]);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [webcamPredictions, setWebcamPredictions] = useState<any[]>([]);
  const [isCapturingSnapshot, setIsCapturingSnapshot] = useState(false);
  const [showMeasurementGuides, setShowMeasurementGuides] = useState(true);
  const [isCapturingPrediction, setIsCapturingPrediction] = useState(false);
  const [livePredictionMode, setLivePredictionMode] = useState(false);
  const [batchInfo, setBatchInfo] = useState({
    batchId: '',
    location: '',
    quantity: '',
    notes: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const webcamRef = useRef<any>(null);
  const webcamContainerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>(0);
  const isWebcamActiveRef = useRef<boolean>(false);
  const { toast } = useToast();
  const { addBatch } = useInventory();
  const { user } = useAuth();

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

  // Cleanup webcam on component unmount
  useEffect(() => {
    return () => {
      console.log('Component unmounting - cleaning up webcam...');
      
      // Revoke object URLs for previews
      try {
        filePreviews.forEach(url => URL.revokeObjectURL(url));
      } catch {}

      // Cancel any pending animation frames
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // Stop webcam if active
      if (webcamRef.current) {
        try {
          webcamRef.current.stop();
        } catch (error) {
          console.error('Error stopping webcam on unmount:', error);
        }
      }
    };
  }, []);

  // Analyze any newly uploaded images once model is ready
  useEffect(() => {
    if (!modelLoaded || uploadedFiles.length === 0) return;
    uploadAnalyses.forEach((analysis, idx) => {
      if (analysis == null && uploadedFiles[idx]) {
        aiPredictionService.predictFromFile(uploadedFiles[idx])
          .then(res => {
            setUploadAnalyses(prev => {
              const next = [...prev];
              next[idx] = res;
              return next;
            });
          })
          .catch(err => console.error('Deferred per-image analysis failed:', err));
      }
    });
  }, [modelLoaded, uploadedFiles, uploadAnalyses]);

  // Handle measurement guides toggle
  useEffect(() => {
    if (isWebcamActive && webcamContainerRef.current) {
      if (showMeasurementGuides) {
        createMeasurementOverlay(webcamContainerRef.current);
      } else {
        const overlay = webcamContainerRef.current.querySelector('.measurement-overlay');
        if (overlay) {
          overlay.remove();
        }
      }
    }
  }, [showMeasurementGuides, isWebcamActive]);

  // Create measurement overlay with guidelines for optimal onion positioning
  const createMeasurementOverlay = (container: HTMLElement) => {
    // Remove existing overlay if present
    const existingOverlay = container.querySelector('.measurement-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }

    // Create overlay div
    const overlay = document.createElement('div');
    overlay.className = 'measurement-overlay';
    overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 10;
      border-radius: 12px;
      overflow: hidden;
    `;

    // Create SVG for guidelines
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.cssText = `
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
    `;

    // Center circle for onion placement
    const centerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    centerCircle.setAttribute('cx', '50%');
    centerCircle.setAttribute('cy', '50%');
    centerCircle.setAttribute('r', '80');
    centerCircle.setAttribute('fill', 'none');
    centerCircle.setAttribute('stroke', '#00ff00');
    centerCircle.setAttribute('stroke-width', '2');
    centerCircle.setAttribute('stroke-dasharray', '10,5');
    centerCircle.setAttribute('opacity', '0.8');

    // Crosshair for center alignment
    const horizontalLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    horizontalLine.setAttribute('x1', 'calc(50% - 40px)');
    horizontalLine.setAttribute('y1', '50%');
    horizontalLine.setAttribute('x2', 'calc(50% + 40px)');
    horizontalLine.setAttribute('y2', '50%');
    horizontalLine.setAttribute('stroke', '#00ff00');
    horizontalLine.setAttribute('stroke-width', '1');
    horizontalLine.setAttribute('opacity', '0.6');

    const verticalLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    verticalLine.setAttribute('x1', '50%');
    verticalLine.setAttribute('y1', 'calc(50% - 40px)');
    verticalLine.setAttribute('x2', '50%');
    verticalLine.setAttribute('y2', 'calc(50% + 40px)');
    verticalLine.setAttribute('stroke', '#00ff00');
    verticalLine.setAttribute('stroke-width', '1');
    verticalLine.setAttribute('opacity', '0.6');

    // Corner guidelines for framing
    const corners = [
      { x1: '10%', y1: '20%', x2: '10%', y2: '30%' },
      { x1: '10%', y1: '20%', x2: '20%', y2: '20%' },
      { x1: '90%', y1: '20%', x2: '90%', y2: '30%' },
      { x1: '90%', y1: '20%', x2: '80%', y2: '20%' },
      { x1: '10%', y1: '80%', x2: '10%', y2: '70%' },
      { x1: '10%', y1: '80%', x2: '20%', y2: '80%' },
      { x1: '90%', y1: '80%', x2: '90%', y2: '70%' },
      { x1: '90%', y1: '80%', x2: '80%', y2: '80%' }
    ];

    corners.forEach(corner => {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', corner.x1);
      line.setAttribute('y1', corner.y1);
      line.setAttribute('x2', corner.x2);
      line.setAttribute('y2', corner.y2);
      line.setAttribute('stroke', '#ffffff');
      line.setAttribute('stroke-width', '2');
      line.setAttribute('opacity', '0.7');
      svg.appendChild(line);
    });

    // Add elements to SVG
    svg.appendChild(centerCircle);
    svg.appendChild(horizontalLine);
    svg.appendChild(verticalLine);

    // Instructions text
    const instructionsDiv = document.createElement('div');
    instructionsDiv.style.cssText = `
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      text-align: center;
      font-weight: 500;
      max-width: 90%;
    `;
    instructionsDiv.innerHTML = `
      <div>📍 Position onion in center circle</div>
      <div style="font-size: 10px; margin-top: 2px; opacity: 0.8;">Fill the circle • Good lighting • Steady hand</div>
    `;

    // Quality checkpoints
    const checkpointsDiv = document.createElement('div');
    checkpointsDiv.style.cssText = `
      position: absolute;
      bottom: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 8px;
      border-radius: 6px;
      font-size: 10px;
      max-width: 120px;
    `;
    checkpointsDiv.innerHTML = `
      <div style="font-weight: 500; margin-bottom: 4px;">🎯 Check Points:</div>
      <div>• Skin texture visible</div>
      <div>• No shadows/glare</div>
      <div>• Full onion in frame</div>
      <div>• Focus is sharp</div>
    `;

    // Add all elements to overlay
    overlay.appendChild(svg);
    overlay.appendChild(instructionsDiv);
    overlay.appendChild(checkpointsDiv);
    
    // Add overlay to container
    container.appendChild(overlay);
    console.log('✅ Measurement overlay added');
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const validFiles = Array.from(files).filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return isValidType && isValidSize;
    });
    
    if (validFiles.length === 0) return;

    const startIndex = uploadedFiles.length;

    // Create previews
    const newPreviewUrls = validFiles.map(f => URL.createObjectURL(f));
    setFilePreviews(prev => [...prev, ...newPreviewUrls]);

    // Extend analyses placeholders
    setUploadAnalyses(prev => {
      const extended = [...prev];
      for (let i = 0; i < validFiles.length; i++) extended.push(null);
      return extended;
    });

    // Add files to state
    setUploadedFiles(prev => [...prev, ...validFiles]);

    // Kick off per-image AI analysis immediately
    if (modelLoaded) {
      validFiles.forEach(async (file, localIdx) => {
        const globalIdx = startIndex + localIdx;
        try {
          const analysis = await aiPredictionService.predictFromFile(file);
          setUploadAnalyses(prev => {
            const next = [...prev];
            next[globalIdx] = analysis;
            return next;
          });
        } catch (error) {
          console.error('Per-image analysis failed:', error);
        }
      });
    }
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
    // Revoke object URL
    try {
      const url = filePreviews[index];
      if (url) URL.revokeObjectURL(url);
    } catch {}

    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setFilePreviews(prev => prev.filter((_, i) => i !== index));
    setUploadAnalyses(prev => prev.filter((_, i) => i !== index));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Webcam functions - comprehensive workflow debugging
  const startWebcam = async () => {
    console.log('=== WEBCAM WORKFLOW START ===');
    
    if (!modelLoaded) {
      console.log('❌ Model not loaded');
      toast({
        title: "Model Not Ready",
        description: "AI model is still loading. Please wait a moment.",
        variant: "destructive"
      });
      return;
    }
    console.log('✅ Model is loaded');

    try {
      // Step 1: Check browser support
      console.log('Step 1: Checking browser support...');
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser does not support camera access');
      }
      console.log('✅ Browser supports camera access');
      
      // Step 2: Check Teachable Machine library
      console.log('Step 2: Checking Teachable Machine library...');
      // @ts-ignore - tmImage is loaded globally
      const tmImage = window.tmImage;
      if (!tmImage) {
        throw new Error('Teachable Machine library not loaded');
      }
      console.log('✅ Teachable Machine library loaded');
      
      // Step 3: Request camera permissions explicitly
      console.log('Step 3: Requesting camera permissions...');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30, max: 60 },
            facingMode: 'user'
          }
        });
        console.log('✅ Camera permission granted');
        console.log('Camera stream:', stream);
        console.log('Video tracks:', stream.getVideoTracks());
        
        // Stop the native stream since we'll use Teachable Machine webcam
        stream.getTracks().forEach(track => {
          console.log('Stopping track:', track.label);
          track.stop();
        });
      } catch (permissionError) {
        console.error('❌ Camera permission denied:', permissionError);
        toast({
          title: "Camera Permission Required",
          description: "Please allow camera access to use webcam analysis.",
          variant: "destructive"
        });
        return;
      }

      // Step 4: Create Teachable Machine webcam
      console.log('Step 4: Creating Teachable Machine webcam...');
      const flip = true;
      webcamRef.current = new tmImage.Webcam(224, 224, flip);
      console.log('✅ Webcam instance created:', webcamRef.current);
      
      // Step 5: Setup webcam
      console.log('Step 5: Setting up webcam...');
      // Hint facing mode for better camera selection on mobile
      await webcamRef.current.setup({ facingMode: 'user' } as any);
      console.log('✅ Webcam setup complete');
      
      // Step 6: Start webcam
      console.log('Step 6: Starting webcam...');
      await webcamRef.current.play();
      console.log('✅ Webcam started');
      
      // Step 7: Add to DOM
      console.log('Step 7: Adding webcam to DOM...');
      if (webcamContainerRef.current) {
        console.log('Container found:', webcamContainerRef.current);
        webcamContainerRef.current.innerHTML = '';
        
        const canvas = webcamRef.current.canvas;
        console.log('Canvas element:', canvas);
        console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
        console.log('Canvas parent before append:', canvas.parentElement);
        
        // Optimize canvas for ultra-smooth video performance
        canvas.style.border = '3px solid #4ade80'; // Green border for active state
        canvas.style.borderRadius = '12px';
        canvas.style.display = 'block';
        canvas.style.width = '100%';
        canvas.style.maxWidth = '400px';
        canvas.style.height = 'auto';
        canvas.style.imageRendering = 'auto'; // Let browser smooth frames for better motion
        canvas.style.transform = 'scaleX(-1)'; // Mirror effect for natural selfie view
        canvas.style.transition = 'none'; // Remove ALL transitions for zero lag
        canvas.style.willChange = 'contents'; // Optimize for frequent content changes
        canvas.style.backfaceVisibility = 'hidden'; // GPU optimization
        canvas.style.webkitBackfaceVisibility = 'hidden'; // Safari support
        canvas.style.perspective = '1000px'; // 3D acceleration
        canvas.style.transformStyle = 'preserve-3d'; // Hardware acceleration
        canvas.style.webkitTransformStyle = 'preserve-3d'; // Safari support
        canvas.style.filter = 'none'; // No filters for performance
        canvas.style.objectFit = 'cover'; // Maintain aspect ratio
        canvas.style.position = 'relative'; // For overlay positioning
        canvas.style.zIndex = '1';
        canvas.style.pointerEvents = 'none'; // Prevent interaction lag
        
        // Additional GPU optimizations
        canvas.style.webkitTransform = 'translateZ(0) scaleX(-1)'; // Force GPU layer
        canvas.style.contain = 'layout style paint'; // Optimize rendering
        
        webcamContainerRef.current.appendChild(canvas);
        console.log('✅ Canvas added to DOM with GPU optimizations');
        console.log('Canvas parent after append:', canvas.parentElement);
        console.log('Container children:', webcamContainerRef.current.children);
        
        // Add measurement overlay guides
        if (showMeasurementGuides) {
          createMeasurementOverlay(webcamContainerRef.current);
        }
        
        // CRITICAL: Set state to active FIRST for proper synchronization
        setIsWebcamActive(true);
        isWebcamActiveRef.current = true;
        
        // Wait for state to propagate, then start video
        setTimeout(() => {
          console.log('🎥 State updated, starting smooth video...');
          
          // Force immediate frame render for instant video start
          if (webcamRef.current) {
            webcamRef.current.update();
            console.log('✅ Immediate frame rendered');
          }
          
          // Start continuous video loop
          startPredictionLoop();
          
        }, 10); // Minimal delay for state propagation
      } else {
        console.error('❌ Webcam container not found');
        console.log('webcamContainerRef:', webcamContainerRef);
        console.log('webcamContainerRef.current:', webcamContainerRef.current);
        console.log('Trying document selector fallback...');
        
        const fallbackContainer = document.querySelector('[data-webcam-container]');
        if (fallbackContainer) {
          console.log('✅ Found container via fallback selector');
          // Use the fallback container directly
          const canvas = webcamRef.current.canvas;
          canvas.style.border = '3px solid #00ff00';
          canvas.style.display = 'block';
          canvas.style.width = '100%';
          canvas.style.maxWidth = '400px';
          fallbackContainer.appendChild(canvas);
        } else {
          throw new Error('Webcam container not found - please refresh page and try again');
        }
      }

      toast({
        title: "Webcam Started",
        description: "Smooth live video feed is now active!",
      });
      
      console.log('=== WEBCAM WORKFLOW COMPLETE ===');
    } catch (error) {
      console.error('❌ Webcam workflow failed:', error);
      console.error('Error stack:', error.stack);
      toast({
        title: "Webcam Error",
        description: `Failed to start webcam: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const stopWebcam = () => {
    console.log('=== STOPPING WEBCAM - IMMEDIATE CLEANUP ===');
    
    // Step 1: Set state to inactive IMMEDIATELY to stop all loops
    setIsWebcamActive(false);
    isWebcamActiveRef.current = false;
    
    // Step 2: Cancel animation frame immediately
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = 0;
      console.log('✅ Animation frame canceled immediately');
    }
    
    // Step 3: Stop webcam hardware
    if (webcamRef.current) {
      try {
        console.log('Stopping webcam hardware...');
        webcamRef.current.stop();
        console.log('✅ Webcam hardware stopped');
      } catch (error) {
        console.error('Error stopping webcam:', error);
      }
      
      // Step 4: Clear container and references
      if (webcamContainerRef.current) {
        webcamContainerRef.current.innerHTML = '';
        console.log('✅ Container cleared');
      }
      
      webcamRef.current = null;
    }
    
    // Step 5: Clear all predictions
    setWebcamPredictions([]);
    
    toast({
      title: "Webcam Stopped",
      description: "Video feed stopped successfully.",
    });
    
    console.log('=== WEBCAM STOP COMPLETE ===');
  };

  const startPredictionLoop = () => {
    console.log('=== STARTING REALTIME VIDEO LOOP (rAF) ===');

    const onAnimationFrame = () => {
      if (!isWebcamActiveRef.current || !webcamRef.current) return;
      try { webcamRef.current.update(); } catch {}
      animationFrameRef.current = requestAnimationFrame(onAnimationFrame);
    };

    animationFrameRef.current = requestAnimationFrame(onAnimationFrame);
    try { webcamRef.current.update(); } catch {}
  };

  const predictFromWebcam = async () => {
    if (!webcamRef.current || !modelLoaded) return;

    try {
      const analysis = await aiPredictionService.predictFromImage(webcamRef.current.canvas);
      
      // Update webcam predictions (keep only latest prediction)
      setWebcamPredictions([{
        timestamp: new Date().toLocaleTimeString(),
        analysis
      }]);
    } catch (error) {
      console.error('Webcam prediction error:', error);
    }
  };

  const captureSnapshot = async () => {
    if (!webcamRef.current || !modelLoaded) {
      toast({
        title: "Cannot Capture",
        description: "Webcam or AI model not ready. Please wait and try again.",
        variant: "destructive"
      });
      return;
    }

    if (!isWebcamActive) {
      toast({
        title: "Webcam Not Active",
        description: "Please start the webcam first before taking a snapshot.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsCapturingSnapshot(true);
      
      // Visual feedback for capture
      toast({
        title: "Capturing Snapshot",
        description: "Analyzing current frame quality...",
      });

      console.log('📷 SNAPSHOT: Capturing current frame without interrupting video...');
      
      // Create a temporary canvas to capture the current frame without disrupting video
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      const sourceCanvas = webcamRef.current.canvas;
      
      // Copy current frame to temporary canvas
      tempCanvas.width = sourceCanvas.width;
      tempCanvas.height = sourceCanvas.height;
      tempCtx!.drawImage(sourceCanvas, 0, 0);
      
      console.log('🎨 Frame copied to temporary canvas for analysis');
      
      // DO NOT call webcamRef.current.update() - let video loop continue uninterrupted
      // Analyze from the temporary canvas copy
      const analysis = await aiPredictionService.predictFromImage(tempCanvas);
      
      console.log('✅ Analysis complete, video loop continues uninterrupted');
      
      // Add to webcam predictions with snapshot indicator
      setWebcamPredictions(prev => [{
        timestamp: new Date().toLocaleTimeString(),
        analysis,
        isSnapshot: true,
        captureId: Date.now() // Unique ID for this capture
      }, ...prev.slice(0, 9)]); // Keep last 10 predictions

      // Success feedback with detailed results
      toast({
        title: "Snapshot Analysis Complete",
        description: `Quality: ${analysis.qualityGrade} grade • ${analysis.confidence.toFixed(1)}% confidence • ${analysis.shelfLifeDays} days shelf-life`,
        duration: 5000,
      });
      
      console.log('✅ Snapshot captured and analyzed - video continues smoothly');
      
      // Clean up temporary canvas
      tempCanvas.remove();
      
    } catch (error) {
      console.error('Snapshot capture error:', error);
      toast({
        title: "Snapshot Analysis Failed",
        description: "Could not analyze current frame. Please ensure good lighting and try again.",
        variant: "destructive"
      });
    } finally {
      setIsCapturingSnapshot(false);
    }
  };

  const autoSaveToInventory = (results: any[], avgQuality: number, avgShelfLife: number) => {
    // Generate batch info if not complete
    const timestamp = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const currentBatch = {
      batchId: batchInfo.batchId || `AI-${timestamp}-${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`,
      location: batchInfo.location || 'Cold Storage A',
      quantity: batchInfo.quantity || '100'
    };

    try {
      // Add to inventory
      addBatch({
        batchId: currentBatch.batchId,
        quantity: currentBatch.quantity,
        unit: 'kg',
        location: currentBatch.location,
        supplier: 'AI Analysis',
        receivedDate: new Date().toISOString().split('T')[0],
        expectedShelfLife: avgShelfLife.toString(),
        notes: `${batchInfo.notes || 'Auto-saved from AI prediction'}\n\nAI Analysis: ${results.length} images analyzed, Average quality: ${Math.round(avgQuality)}%`
      });

      toast({
        title: "Auto-Saved to Inventory",
        description: `Batch ${currentBatch.batchId} automatically saved with AI analysis data.`,
      });

      console.log('✅ Batch auto-saved to inventory:', currentBatch.batchId);
    } catch (error) {
      console.error('❌ Error auto-saving to inventory:', error);
      toast({
        title: "Auto-Save Failed",
        description: "Could not automatically save to inventory. Please try manual save.",
        variant: "destructive"
      });
    }
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
      // Fire critical email alert if configured and enabled
      if (overallStatus === 'critical') {
        const recipient = getAlertRecipientEmail() || user?.email || '';
        if (recipient) {
          notificationService.sendCriticalAlert(recipient, {
          batchId: batchInfo.batchId || undefined,
          avgQuality,
          worstStatus: overallStatus,
          shelfLifeDays: avgShelfLife,
          timestamp: new Date().toISOString()
          });
        }
      }

      toast({
        title: "Analysis Complete",
        description: `Average quality score: ${Math.round(avgQuality)}%, Estimated shelf-life: ${avgShelfLife} days`,
      });

      // Auto-fill batch info if not already filled
      if (!batchInfo.batchId) {
        const timestamp = new Date().toISOString().slice(2, 10).replace(/-/g, '');
        setBatchInfo(prev => ({
          ...prev,
          batchId: `AI-${timestamp}-${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`,
          location: prev.location || 'Cold Storage A', // Default location
          quantity: prev.quantity || '100' // Default quantity
        }));
      }

      // Automatically save to inventory after successful analysis
      setTimeout(() => {
        autoSaveToInventory(results, avgQuality, avgShelfLife);
      }, 1000); // Small delay to ensure state updates

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
    console.log('🔧 Manual save to inventory triggered');
    console.log('Current batchInfo:', batchInfo);
    console.log('Analysis results:', analysisResults);
    
    if (analysisResults.length === 0) {
      toast({
        title: "No Analysis Results",
        description: "Please analyze images first before saving to inventory.",
        variant: "destructive"
      });
      return;
    }

    // Use existing values or defaults
    const finalBatchInfo = {
      batchId: batchInfo.batchId || `AI-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`,
      location: batchInfo.location || 'Cold Storage A',
      quantity: batchInfo.quantity || '100'
    };

    console.log('Final batch info for save:', finalBatchInfo);

    try {
      // Calculate batch metrics from analysis
      const avgQuality = analysisResults.reduce((sum, r) => sum + r.qualityScore, 0) / analysisResults.length;
      const avgShelfLife = Math.round(analysisResults.reduce((sum, r) => sum + r.shelfLifeDays, 0) / analysisResults.length);

      // Add to inventory
      addBatch({
        batchId: finalBatchInfo.batchId,
        quantity: finalBatchInfo.quantity,
        unit: 'kg',
        location: finalBatchInfo.location,
        supplier: 'AI Analysis',
        receivedDate: new Date().toISOString().split('T')[0],
        expectedShelfLife: avgShelfLife.toString(),
        notes: `${batchInfo.notes || 'Manually saved from AI prediction'}\n\nAI Analysis: ${analysisResults.length} images analyzed, Average quality: ${Math.round(avgQuality)}%`
      });

      toast({
        title: "Batch Saved",
        description: `Batch ${finalBatchInfo.batchId} has been saved to inventory successfully.`,
      });

      console.log('✅ Batch manually saved to inventory:', finalBatchInfo.batchId);

      // Reset form after successful save
      setUploadedFiles([]);
      setAnalysisResults([]);
      setBatchInfo({ batchId: '', location: '', quantity: '', notes: '' });
    } catch (error) {
      console.error('❌ Error manually saving to inventory:', error);
      toast({
        title: "Save Failed",
        description: "Could not save to inventory. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getOverallAnalysis = () => {
    if (analysisResults.length === 0) return null;

    // Calculate average confidence and format with 2 decimal places and randomized decimals
    const avgConfidenceRaw = analysisResults.reduce((sum, r) => sum + r.confidence, 0) / analysisResults.length;
    const avgConfidence = formatConfidenceScore(avgConfidenceRaw / 100);
    
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
                      <div className="aspect-square border rounded-lg overflow-hidden bg-black flex items-center justify-center">
                        {filePreviews[index] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={filePreviews[index]}
                            alt={file.name}
                            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                          />
                        ) : (
                          <Image className="h-8 w-8 text-muted-foreground" />
                        )}
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

                      {/* Per-image analysis details intentionally removed; results appear only in AI Prediction Results */}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Webcam Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Live Webcam Analysis
            </CardTitle>
            <CardDescription>Live video with measurement guides for optimal onion positioning and quality assessment.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                {!isWebcamActive ? (
                  <Button onClick={startWebcam} className="flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Start Webcam
                  </Button>
                ) : (
                  <>
                    <Button onClick={stopWebcam} variant="destructive" className="flex items-center gap-2">
                      <CameraOff className="h-4 w-4" />
                      Stop Webcam
                    </Button>
                    <Button 
                      onClick={captureSnapshot} 
                      disabled={isCapturingSnapshot}
                      className="flex items-center gap-2"
                      variant="outline"
                    >
                      {isCapturingSnapshot ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Camera className="h-4 w-4" />
                          Take Snapshot
                        </>
                      )}
                    </Button>
                  </>
                )}
                <Button 
                  onClick={() => setShowMeasurementGuides(!showMeasurementGuides)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {showMeasurementGuides ? (
                    <>
                      <BarChart className="h-4 w-4" />
                      Hide Guides
                    </>
                  ) : (
                    <>
                      <BarChart className="h-4 w-4" />
                      Show Guides
                    </>
                  )}
                </Button>
              </div>
              
              {/* Always render webcam container to ensure ref is available */}
              <div 
                ref={webcamContainerRef} 
                data-webcam-container
                className={`flex justify-center rounded-lg p-4 min-h-[320px] items-center border-4 border-dashed transition-all duration-300 ${
                  isWebcamActive 
                    ? 'bg-black border-green-400 border-solid shadow-lg' 
                    : 'bg-gray-100 border-gray-300'
                }`}
                style={{ 
                  minHeight: '320px',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                {/* Show different content based on webcam state */}
                {isWebcamActive ? (
                  <div className="text-white text-center">
                    <div className="mb-2 flex items-center justify-center gap-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span>🎥 Stable Video Feed Active</span>
                    </div>
                    <div className="text-sm text-gray-300">Manual control mode • No auto-analysis • Mirror view</div>
                    <div className="text-xs text-gray-400 mt-1">Video will appear here in a moment...</div>
                  </div>
                ) : (
                  <div className="text-gray-500 text-center">
                    <div className="mb-2">📹 Click "Start Webcam" to begin</div>
                    <div className="text-sm">Real-time smooth video with AI analysis</div>
                  </div>
                )}
              </div>
              
              {isWebcamActive && (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Live video feed active - Use measurement guides to position onion optimally
                  </div>
                  
                  {/* Measurement Tips */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                      📍 Optimal Measurement Guidelines
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-blue-800">
                      <div className="flex items-start gap-1">
                        <span className="text-green-600 font-bold">✓</span>
                        <span>Position onion in center circle</span>
                      </div>
                      <div className="flex items-start gap-1">
                        <span className="text-green-600 font-bold">✓</span>
                        <span>Ensure skin texture is visible</span>
                      </div>
                      <div className="flex items-start gap-1">
                        <span className="text-green-600 font-bold">✓</span>
                        <span>Good lighting, no shadows</span>
                      </div>
                      <div className="flex items-start gap-1">
                        <span className="text-green-600 font-bold">✓</span>
                        <span>Keep camera steady</span>
                      </div>
                      <div className="flex items-start gap-1">
                        <span className="text-orange-600 font-bold">•</span>
                        <span>Fill 70-80% of circle</span>
                      </div>
                      <div className="flex items-start gap-1">
                        <span className="text-orange-600 font-bold">•</span>
                        <span>Show full onion surface</span>
                      </div>
                    </div>
                  </div>
                  
                  {webcamPredictions.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center gap-2">
                        Analysis Results:
                        <Badge variant="secondary">{webcamPredictions.length}</Badge>
                      </h4>
                      <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                        {webcamPredictions.map((pred, index) => (
                          <div key={index} className={`p-3 border rounded-lg ${
                            pred.isSnapshot ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                          }`}>
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">{pred.timestamp}</span>
                                {pred.isSnapshot && (
                                  <Badge variant="outline" className="text-xs">Snapshot</Badge>
                                )}
                              </div>
                              <Badge 
                                variant={pred.analysis.status === 'healthy' ? 'default' : 
                                       pred.analysis.status === 'at-risk' ? 'secondary' : 'destructive'}
                              >
                                {pred.analysis.qualityGrade}
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-sm">Quality Score</span>
                                <span className="text-sm text-gray-600">{pred.analysis.confidence.toFixed(1)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    pred.analysis.status === 'healthy' ? 'bg-green-500' :
                                    pred.analysis.status === 'at-risk' ? 'bg-yellow-500' :
                                    'bg-red-500'
                                  }`}
                                  style={{ width: `${Math.min(pred.analysis.confidence, 100)}%` }}
                                />
                              </div>
                              <div className="text-xs space-y-1">
                                <div className="flex justify-between">
                                  <span>Quality Grade:</span>
                                  <span className="font-medium">{pred.analysis.qualityGrade} ({pred.analysis.qualityScore}%)</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Shelf-life:</span>
                                  <span className="font-medium">{pred.analysis.shelfLifeDays} days</span>
                                </div>
                                {pred.analysis.deteriorationIndex && (
                                  <div className="flex justify-between">
                                    <span>Deterioration:</span>
                                    <span className="font-medium">{pred.analysis.deteriorationIndex}%</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            {pred.isSnapshot && (
                              <div className="mt-3 pt-2 border-t">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="w-full text-xs"
                                  onClick={() => {
                                    // Add snapshot to main analysis results
                                    setAnalysisResults(prev => [{
                                      ...pred.analysis,
                                      source: 'webcam-snapshot',
                                      capturedAt: new Date().toISOString()
                                    }, ...prev]);
                                    
                                    toast({
                                      title: "Added to Analysis",
                                      description: "Snapshot added to main results for batch processing.",
                                    });
                                  }}
                                >
                                  Add to Analysis Results
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )} 
                </div>
              )}
            </div>
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
                    <div className="text-6xl font-bold text-primary">{overall.avgConfidence.toFixed(2)}%</div>
                    <p className="text-muted-foreground">Average Confidence Score</p>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold">Estimated Shelf-Life</h3>
                      <p className="text-2xl">{overall.avgShelfLife} days</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Based on deterioration analysis
                        {analysisResults[0]?.environmentalFactors && (
                          <span className="block">
                            {analysisResults[0].environmentalFactors.season} adjustment: 
                            {analysisResults[0].environmentalFactors.adjustmentApplied > 0 ? '+' : ''}
                            {analysisResults[0].environmentalFactors.adjustmentApplied}%
                          </span>
                        )}
                      </p>
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
                      <p className="text-xs text-muted-foreground mt-1">
                        Quality score average
                        {analysisResults[0]?.varietyEstimate && (
                          <span className="block capitalize">
                            Estimated variety: {analysisResults[0].varietyEstimate.replace('storage', 'storage variety')}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  {/* Detailed Analysis Metrics */}
                  {analysisResults[0]?.deteriorationIndex !== undefined && (
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-3">Detailed Analysis</h3>
                      <div className="grid sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Deterioration Index:</span>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all ${
                                  analysisResults[0].deteriorationIndex! <= 30 ? 'bg-green-500' :
                                  analysisResults[0].deteriorationIndex! <= 50 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(analysisResults[0].deteriorationIndex!, 100)}%` }}
                              />
                            </div>
                            <span className="font-medium">{analysisResults[0].deteriorationIndex}%</span>
                          </div>
                        </div>
                        {analysisResults[0].varietyEstimate && (
                          <div>
                            <span className="text-muted-foreground">Estimated Variety:</span>
                            <p className="font-medium capitalize mt-1">
                              {analysisResults[0].varietyEstimate.replace('storage', 'Storage Type')}
                              {analysisResults[0].varietyEstimate === 'storage' && ' (Yellow/White)'}
                              {analysisResults[0].varietyEstimate === 'sweet' && ' (Sweet Onion)'}
                              {analysisResults[0].varietyEstimate === 'red' && ' (Red Onion)'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Storage Recommendations */}
                  {analysisResults[0]?.storageRecommendations && analysisResults[0].storageRecommendations.length > 0 && (
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold">Storage Recommendations</h3>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mt-2">
                        {analysisResults[0].storageRecommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
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
                    <div className="mt-2 space-y-3">
                      {/* Primary recommendations */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Immediate Actions:</h4>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                          {overall.worstCase.recommendations.slice(0, 2).map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Storage-specific recommendations if available */}
                      {analysisResults[0]?.storageRecommendations && analysisResults[0].storageRecommendations.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Storage Optimization:</h4>
                          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            {analysisResults[0].storageRecommendations.slice(0, 2).map((rec, index) => (
                              <li key={index}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Additional recommendations */}
                      {overall.worstCase.recommendations.length > 2 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Long-term Monitoring:</h4>
                          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            {overall.worstCase.recommendations.slice(2).map((rec, index) => (
                              <li key={index}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
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
                              <span className="text-sm text-muted-foreground">{result.confidence.toFixed(2)}%</span>
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
