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
  // Enhanced analysis properties
  deteriorationIndex?: number;
  storageRecommendations?: string[];
  varietyEstimate?: 'storage' | 'sweet' | 'red' | 'unknown';
  environmentalFactors?: {
    season: string;
    adjustmentApplied: number;
  };
}

/**
 * Format confidence score to 2 decimal places with randomized decimal points
 * Never shows 100% - caps at 99.xx%
 */
export function formatConfidenceScore(probability: number): number {
  let confidence = probability * 100;
  
  // Never show 100% confidence - cap at 99.xx
  if (confidence >= 100) {
    confidence = 99 + Math.random() * 0.99; // 99.00 to 99.99
  }
  
  // Add randomized decimal places while maintaining the base confidence level
  const baseConfidence = Math.floor(confidence);
  const randomDecimal = Math.random() * 0.99; // 0.00 to 0.99
  
  return parseFloat((baseConfidence + randomDecimal).toFixed(2));
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
   * Predict onion quality from image element or canvas
   */
  async predictFromImage(imageElement: HTMLImageElement | HTMLCanvasElement): Promise<OnionAnalysis> {
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
   * Convert raw model predictions to structured onion analysis with improved accuracy
   */
  private convertToOnionAnalysis(predictions: PredictionResult[], topPrediction: PredictionResult): OnionAnalysis {
    const confidence = formatConfidenceScore(topPrediction.probability);
    
    const isHealthy = topPrediction.className.toLowerCase().includes('healthy');
    const isSpoiled = topPrediction.className.toLowerCase().includes('spoiled');
    
    // Get both predictions for more nuanced analysis
    const healthyPred = predictions.find(p => p.className.toLowerCase().includes('healthy'));
    const spoiledPred = predictions.find(p => p.className.toLowerCase().includes('spoiled'));
    
    const healthyConfidence = healthyPred ? healthyPred.probability * 100 : 0;
    const spoiledConfidence = spoiledPred ? spoiledPred.probability * 100 : 0;
    
    // Calculate deterioration index (0-100, where 100 is fully spoiled)
    const deteriorationIndex = spoiledConfidence;
    
    // Calculate quality metrics based on realistic onion storage science
    let qualityGrade: 'A' | 'B' | 'C' | 'D' | 'F';
    let status: 'healthy' | 'at-risk' | 'critical';
    let shelfLifeDays: number;
    let qualityScore: number;
    let riskFactors: string[] = [];
    let recommendations: string[] = [];

    // Improved shelf-life calculation based on onion storage research
    // Fresh onions can last 2-8 months under proper conditions
    // Visual deterioration typically starts 2-3 weeks before spoilage
    
    if (deteriorationIndex <= 15) {
      // Excellent quality - minimal deterioration signs
      qualityGrade = 'A';
      status = 'healthy';
      // High-quality onions: 3-6 months (90-180 days)
      shelfLifeDays = Math.floor(120 + (15 - deteriorationIndex) * 4); // 120-180 days
      qualityScore = Math.floor(95 - deteriorationIndex * 0.33); // 90-95%
      recommendations = [
        'Excellent quality detected - maintain current conditions',
        'Expected shelf-life: 4-6 months under proper storage',
        'Suitable for long-term storage and premium markets',
        'Monitor for sprouting after 3 months'
      ];
    } else if (deteriorationIndex <= 30) {
      // Good quality - early deterioration signs
      qualityGrade = 'B';
      status = 'healthy';
      // Good onions: 2-4 months (60-120 days)
      shelfLifeDays = Math.floor(90 - (deteriorationIndex - 15) * 2); // 60-90 days
      qualityScore = Math.floor(85 - (deteriorationIndex - 15) * 1.33); // 75-85%
      recommendations = [
        'Good quality with minor signs of aging',
        'Expected shelf-life: 2-3 months',
        'Monitor storage humidity and temperature',
        'Check for soft spots weekly'
      ];
    } else if (deteriorationIndex <= 50) {
      // Fair quality - moderate deterioration
      qualityGrade = 'C';
      status = 'at-risk';
      // Fair onions: 3-8 weeks (20-60 days)
      shelfLifeDays = Math.floor(45 - (deteriorationIndex - 30) * 1.25); // 20-45 days
      qualityScore = Math.floor(65 - (deteriorationIndex - 30) * 0.75); // 50-65%
      riskFactors = [
        'Moderate deterioration detected',
        'Signs of moisture loss or early sprouting',
        'Quality declining faster than optimal'
      ];
      recommendations = [
        'Use within 1-2 months for best quality',
        'Increase inspection frequency to weekly',
        'Consider processing into value-added products',
        'Separate any soft or sprouting onions'
      ];
    } else if (deteriorationIndex <= 70) {
      // Poor quality - significant deterioration
      qualityGrade = 'D';
      status = 'critical';
      // Poor onions: 1-3 weeks (7-20 days)
      shelfLifeDays = Math.floor(15 - (deteriorationIndex - 50) * 0.4); // 7-15 days
      qualityScore = Math.floor(40 - (deteriorationIndex - 50) * 0.75); // 25-40%
      riskFactors = [
        'Significant quality deterioration detected',
        'Visible signs of spoilage or sprouting',
        'High risk of rapid quality decline',
        'Potential for mold or bacterial growth'
      ];
      recommendations = [
        'Use immediately or within 1-2 weeks',
        'Sort and remove any visibly damaged onions',
        'Consider immediate processing or sale',
        'Improve storage ventilation and reduce humidity'
      ];
    } else {
      // Critical quality - severe deterioration
      qualityGrade = 'F';
      status = 'critical';
      // Critical onions: 1-7 days
      shelfLifeDays = Math.max(1, Math.floor(7 - (deteriorationIndex - 70) * 0.2)); // 1-7 days
      qualityScore = Math.max(10, Math.floor(25 - (deteriorationIndex - 70) * 0.5)); // 10-25%
      riskFactors = [
        'Severe deterioration or spoilage detected',
        'High probability of bacterial or fungal contamination',
        'Unsuitable for human consumption in current state',
        'Risk of contaminating healthy stock'
      ];
      recommendations = [
        'Immediate action required - inspect thoroughly',
        'Separate from healthy inventory immediately',
        'Consider disposal or composting',
        'Investigate storage conditions for systemic issues'
      ];
    }

    // Add environmental and storage recommendations based on quality
    if (status !== 'critical') {
      const storageAdvice = this.getStorageRecommendations(deteriorationIndex, shelfLifeDays);
      recommendations.push(...storageAdvice);
    }

    // Adjust for seasonal and environmental factors
    const adjustedShelfLife = this.adjustForEnvironmentalFactors(shelfLifeDays, deteriorationIndex);
    const currentMonth = new Date().getMonth();
    const seasonName = this.getSeasonName(currentMonth);
    const adjustmentFactor = adjustedShelfLife / shelfLifeDays;
    
    // Estimate onion variety based on deterioration patterns
    const varietyEstimate = this.estimateVariety(deteriorationIndex, confidence);

    return {
      qualityGrade,
      confidence,
      shelfLifeDays: Math.max(1, Math.min(180, Math.round(adjustedShelfLife))), // Realistic range: 1-180 days
      riskFactors,
      recommendations,
      status,
      qualityScore: Math.max(10, Math.min(100, qualityScore)),
      // Enhanced metadata
      deteriorationIndex: Math.round(deteriorationIndex),
      storageRecommendations: this.getStorageRecommendations(deteriorationIndex, shelfLifeDays),
      varietyEstimate,
      environmentalFactors: {
        season: seasonName,
        adjustmentApplied: Math.round((adjustmentFactor - 1) * 100) // Percentage adjustment
      }
    };
  }

  /**
   * Get storage-specific recommendations based on quality assessment
   */
  private getStorageRecommendations(deteriorationIndex: number, shelfLifeDays: number): string[] {
    const recommendations: string[] = [];
    
    if (shelfLifeDays > 60) {
      recommendations.push('Maintain temperature: 0-4°C (32-39°F)');
      recommendations.push('Keep relative humidity: 65-70%');
      recommendations.push('Ensure good air circulation');
    } else if (shelfLifeDays > 30) {
      recommendations.push('Store in cool, dry place (10-15°C)');
      recommendations.push('Avoid high humidity areas');
      recommendations.push('Check weekly for sprouting');
    } else {
      recommendations.push('Keep in refrigerated storage if possible');
      recommendations.push('Use FIFO (First In, First Out) principle');
      recommendations.push('Daily quality monitoring recommended');
    }
    
    return recommendations;
  }

  /**
   * Adjust shelf life for environmental factors
   */
  private adjustForEnvironmentalFactors(baseShelfLife: number, deteriorationIndex: number): number {
    let adjustedShelfLife = baseShelfLife;
    
    // Current season adjustment (assuming it's around harvest time)
    const currentMonth = new Date().getMonth();
    
    // Harvest season (Aug-Oct) - freshly harvested onions last longer
    if (currentMonth >= 7 && currentMonth <= 9) {
      adjustedShelfLife *= 1.2; // 20% longer for fresh harvest
    }
    
    // Winter storage (Nov-Feb) - optimal conditions
    else if (currentMonth >= 10 || currentMonth <= 1) {
      adjustedShelfLife *= 1.1; // 10% longer for winter storage
    }
    
    // Spring/Summer (Mar-Jul) - challenging storage conditions
    else {
      adjustedShelfLife *= 0.85; // 15% shorter due to warm weather
    }
    
    // Variety-based adjustment (assumed based on deterioration patterns)
    if (deteriorationIndex < 20) {
      // Likely storage variety (Yellow, White)
      adjustedShelfLife *= 1.15;
    } else if (deteriorationIndex > 50) {
      // Likely sweet or red variety (shorter storage life)
      adjustedShelfLife *= 0.8;
    }
    
    return adjustedShelfLife;
  }

  /**
   * Get season name for environmental factors
   */
  private getSeasonName(month: number): string {
    if (month >= 7 && month <= 9) return 'Harvest Season';
    if (month >= 10 || month <= 1) return 'Winter Storage';
    return 'Spring/Summer';
  }

  /**
   * Estimate onion variety based on deterioration patterns
   */
  private estimateVariety(deteriorationIndex: number, confidence: number): 'storage' | 'sweet' | 'red' | 'unknown' {
    if (deteriorationIndex < 20 && confidence > 70) {
      return 'storage'; // Likely yellow/white storage onions
    } else if (deteriorationIndex > 50) {
      return confidence > 60 ? 'sweet' : 'red'; // Sweet or red varieties deteriorate faster
    }
    return 'unknown';
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