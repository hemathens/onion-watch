/**
 * AI Prediction Service for Onion Quality Analysis
 * Integrates with Teachable Machine model for real-time predictions
 */

// @ts-ignore - Teachable Machine library loaded globally
declare global {
  interface Window {
    tmImage: any;
  }
}

export interface PredictionResult {
  className: string;
  probability: number;
}

export interface OnionAnalysis {
  qualityGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  confidence: number;
  shelfLifeDays: number;
  riskFactors: string[];
  recommendations: string[];
  status: 'healthy' | 'at-risk' | 'critical';
  qualityScore: number;
}

class AIPredictionService {
  private model: any = null;
  private maxPredictions = 0;
  private isLoading = false;
  
  // Model configuration
  private readonly MODEL_URL = "/onion-model-main/my_model/";
  
  /**
   * Load the Teachable Machine model
   */
  async loadModel(): Promise<boolean> {
    if (this.isLoading) {
      console.log('Model is already loading...');
      return false;
    }

    if (this.model) {
      console.log('Model already loaded');
      return true;
    }

    try {
      this.isLoading = true;
      console.log('Loading AI model from:', this.MODEL_URL);

      // Check if Teachable Machine library is available
      if (!window.tmImage) {
        throw new Error('Teachable Machine library not loaded. Please include the script in your HTML.');
      }

      const modelURL = this.MODEL_URL + "model.json";
      const metadataURL = this.MODEL_URL + "metadata.json";

      // Check if model files exist
      try {
        const modelResponse = await fetch(modelURL);
        const metadataResponse = await fetch(metadataURL);
        
        if (!modelResponse.ok) {
          throw new Error(`Model file not found: ${modelURL} (Status: ${modelResponse.status})`);
        }
        if (!metadataResponse.ok) {
          throw new Error(`Metadata file not found: ${metadataURL} (Status: ${metadataResponse.status})`);
        }
      } catch (fetchError) {
        console.error('Model file check failed:', fetchError);
        throw new Error(`Model files not accessible: ${fetchError}`);
      }

      // Load the model
      this.model = await window.tmImage.load(modelURL, metadataURL);
      this.maxPredictions = this.model.getTotalClasses();
      
      console.log(`Model loaded successfully! Classes: ${this.maxPredictions}`);
      return true;

    } catch (error) {
      console.error('Error loading model:', error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Predict onion quality from image file
   */
  async predictFromFile(file: File): Promise<OnionAnalysis> {
    if (!this.model) {
      await this.loadModel();
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = async () => {
        try {
          const analysis = await this.predictFromImage(img);
          resolve(analysis);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Predict onion quality from image element
   */
  async predictFromImage(imageElement: HTMLImageElement): Promise<OnionAnalysis> {
    if (!this.model) {
      throw new Error('Model not loaded. Call loadModel() first.');
    }

    try {
      // Resize image to model input size (224x224)
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 224;
      canvas.height = 224;
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      ctx.drawImage(imageElement, 0, 0, 224, 224);

      // Get predictions from model
      const predictions: PredictionResult[] = await this.model.predict(canvas);
      
      if (!predictions || predictions.length === 0) {
        throw new Error('Model returned no predictions');
      }

      // Find the prediction with highest confidence
      const topPrediction = predictions.reduce((prev, current) => 
        (prev.probability > current.probability) ? prev : current
      );

      // Convert model prediction to onion analysis
      return this.convertToOnionAnalysis(predictions, topPrediction);

    } catch (error) {
      console.error('Prediction error:', error);
      throw new Error(`Prediction failed: ${error}`);
    }
  }

  /**
   * Convert raw model predictions to structured onion analysis
   */
  private convertToOnionAnalysis(predictions: PredictionResult[], topPrediction: PredictionResult): OnionAnalysis {
    const confidence = Math.round(topPrediction.probability * 100);
    const isHealthy = topPrediction.className.toLowerCase().includes('healthy');
    const isSpoiled = topPrediction.className.toLowerCase().includes('spoiled');
    
    // Calculate quality metrics based on predictions
    let qualityGrade: 'A' | 'B' | 'C' | 'D' | 'F';
    let status: 'healthy' | 'at-risk' | 'critical';
    let shelfLifeDays: number;
    let qualityScore: number;
    let riskFactors: string[] = [];
    let recommendations: string[] = [];

    if (isHealthy && confidence >= 80) {
      qualityGrade = 'A';
      status = 'healthy';
      shelfLifeDays = Math.floor(45 + (confidence - 80) * 0.5); // 45-55 days
      qualityScore = 90 + Math.floor(confidence / 10);
      recommendations = [
        'Maintain current storage conditions',
        'Schedule quality check in 20 days',
        'Suitable for premium markets',
        'Optimal harvest timing detected'
      ];
    } else if (isHealthy && confidence >= 60) {
      qualityGrade = 'B';
      status = 'healthy';
      shelfLifeDays = Math.floor(30 + (confidence - 60) * 0.75); // 30-45 days
      qualityScore = 75 + Math.floor(confidence / 5);
      recommendations = [
        'Monitor storage conditions closely',
        'Schedule quality check in 15 days',
        'Good for standard markets',
        'Consider early sale if conditions decline'
      ];
    } else if (isHealthy && confidence >= 40) {
      qualityGrade = 'C';
      status = 'at-risk';
      shelfLifeDays = Math.floor(15 + (confidence - 40) * 0.75); // 15-30 days
      qualityScore = 50 + Math.floor(confidence / 2);
      riskFactors = ['Lower confidence in quality assessment', 'Potential early deterioration signs'];
      recommendations = [
        'Increase monitoring frequency',
        'Check storage temperature and humidity',
        'Consider early market sale',
        'Inspect for physical damage'
      ];
    } else if (isSpoiled || confidence < 40) {
      qualityGrade = confidence < 20 ? 'F' : 'D';
      status = 'critical';
      shelfLifeDays = Math.max(1, Math.floor(confidence / 10)); // 1-7 days
      qualityScore = Math.max(10, confidence / 2);
      riskFactors = [
        'High spoilage probability detected',
        'Immediate attention required',
        'Quality deterioration in progress'
      ];
      recommendations = [
        'Immediate inspection required',
        'Separate from healthy stock',
        'Consider immediate processing or disposal',
        'Check storage environment for issues'
      ];
    } else {
      // Fallback for edge cases
      qualityGrade = 'C';
      status = 'at-risk';
      shelfLifeDays = 20;
      qualityScore = 60;
      riskFactors = ['Uncertain quality assessment'];
      recommendations = ['Manual inspection recommended'];
    }

    return {
      qualityGrade,
      confidence,
      shelfLifeDays: Math.max(1, Math.min(60, shelfLifeDays)), // Clamp between 1-60 days
      riskFactors,
      recommendations,
      status,
      qualityScore: Math.max(10, Math.min(100, qualityScore)) // Clamp between 10-100
    };
  }

  /**
   * Batch analysis for multiple images
   */
  async analyzeBatch(files: File[]): Promise<OnionAnalysis[]> {
    const results: OnionAnalysis[] = [];
    
    for (const file of files) {
      try {
        const analysis = await this.predictFromFile(file);
        results.push(analysis);
      } catch (error) {
        console.error(`Failed to analyze file ${file.name}:`, error);
        // Add a failed analysis result
        results.push({
          qualityGrade: 'F',
          confidence: 0,
          shelfLifeDays: 1,
          riskFactors: [`Analysis failed: ${error}`],
          recommendations: ['Manual inspection required'],
          status: 'critical',
          qualityScore: 10
        });
      }
    }
    
    return results;
  }

  /**
   * Get model status
   */
  getModelStatus(): { loaded: boolean; loading: boolean; maxPredictions: number } {
    return {
      loaded: !!this.model,
      loading: this.isLoading,
      maxPredictions: this.maxPredictions
    };
  }
}

// Export singleton instance
export const aiPredictionService = new AIPredictionService();
export default aiPredictionService;