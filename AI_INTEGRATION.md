# Onion Quality AI Prediction Integration

This document explains how the Teachable Machine onion quality model is integrated with the OnionWatch application.

## Overview

The AI Predictions page now uses a real Teachable Machine model trained to classify onions as \"Healthy\" or \"Spoiled\". The model provides quality analysis, shelf-life predictions, and actionable recommendations.

## Features

### Real AI Model Integration
- **Teachable Machine Model**: Uses a pre-trained model with \"Healthy\" and \"Spoiled\" classifications
- **Base64 Image Processing**: Handles image uploads and processes them for AI analysis
- **Batch Analysis**: Can analyze multiple images simultaneously
- **Real-time Results**: Provides immediate feedback on onion quality

### Quality Assessment
- **Quality Grades**: A, B, C, D, F based on AI confidence and classification
- **Shelf-life Prediction**: Estimates storage duration based on quality assessment
- **Risk Factor Identification**: Highlights potential issues with onion batches
- **Actionable Recommendations**: Provides specific advice for storage and handling

### Integration with Inventory
- **Auto-save to Inventory**: Analysis results automatically populate inventory data
- **Quality Scoring**: Converts AI predictions to quality scores (10-100)
- **Status Classification**: Maps to healthy/at-risk/critical status
- **Batch Metadata**: Includes AI analysis details in batch notes

## Technical Implementation

### AI Service (`src/services/aiPredictionService.ts`)
```typescript
// Key methods:
- loadModel(): Loads the Teachable Machine model
- predictFromFile(file): Analyzes a single image file
- analyzeBatch(files): Processes multiple images
- convertToOnionAnalysis(): Converts raw predictions to structured analysis
```

### Model Files
- **Location**: `public/onion-model-main/my_model/`
- **Files**: 
  - `model.json`: Model architecture
  - `metadata.json`: Model metadata and labels
  - `weights.bin`: Trained model weights

### Integration Points
1. **HTML Head**: Includes TensorFlow.js and Teachable Machine libraries
2. **Predictions Page**: Uses the AI service for real-time analysis
3. **Inventory Context**: Receives analyzed batch data with AI metrics
4. **Dashboard**: Displays AI-generated quality scores and status

## Model Training Details

### Classification Labels
- **Healthy**: Good quality onions suitable for storage
- **Spoiled**: Poor quality onions requiring immediate attention

### Model Specifications
- **Input Size**: 224x224 pixels
- **Model Type**: Image classification
- **Framework**: TensorFlow.js with Teachable Machine
- **Version**: Compatible with TensorFlow.js 1.3.1+

## Quality Mapping Algorithm

### Confidence-Based Grading
```typescript
if (isHealthy && confidence >= 80%) → Grade A (45-55 days shelf-life)
if (isHealthy && confidence >= 60%) → Grade B (30-45 days shelf-life)
if (isHealthy && confidence >= 40%) → Grade C (15-30 days shelf-life)
if (isSpoiled || confidence < 40%) → Grade D/F (1-7 days shelf-life)
```

### Status Classification
- **Healthy**: Quality score ≥ 80
- **At-Risk**: Quality score 60-79
- **Critical**: Quality score < 60

## Usage Workflow

1. **Upload Images**: Drag & drop or select onion batch photos
2. **AI Analysis**: Click \"Analyze with AI\" to process images
3. **Review Results**: See quality grades, confidence scores, and recommendations
4. **Save to Inventory**: Add analyzed batch to inventory with AI metadata
5. **Monitor Dashboard**: Track AI-analyzed batches in main dashboard

## Error Handling

### Model Loading Failures
- Falls back to manual analysis mode
- Shows clear error messages to users
- Provides alternative workflow options

### Image Processing Errors
- Validates file types and sizes
- Handles corrupted or invalid images
- Reports specific error messages

### Network Issues
- Graceful degradation when model files unavailable
- Offline-capable once model is loaded
- Clear status indicators for model state

## Performance Optimization

### Model Loading
- Loads once on component mount
- Caches model in memory for subsequent predictions
- Shows loading states and progress indicators

### Image Processing
- Resizes images to optimal model input size (224x224)
- Processes images in batches efficiently
- Uses canvas for client-side image manipulation

### User Experience
- Real-time feedback during analysis
- Progress indicators for long operations
- Clear success/error states

## Future Enhancements

### Model Improvements
- Train with larger onion dataset
- Add more classification categories (varieties, diseases)
- Implement confidence thresholds tuning

### Feature Additions
- Real-time webcam analysis
- Historical analysis trends
- Batch comparison tools
- Export analysis reports

### Integration Expansions
- IoT sensor data fusion
- Automated alert triggers
- Market price correlation
- Supply chain integration

## Troubleshooting

### Common Issues
1. **Model not loading**: Check network connection and model files
2. **Low accuracy**: Ensure good lighting and clear onion images
3. **Slow processing**: Large images may take longer to process
4. **Browser compatibility**: Requires modern browser with WebGL support

### Development Tips
- Test with various onion images for best results
- Monitor browser console for detailed error messages
- Use development tools to debug model loading issues
- Verify model files are accessible via HTTP (not file://)

This integration provides a complete AI-powered onion quality assessment system that enhances the inventory management capabilities of OnionWatch.