import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Edit, 
  QrCode, 
  TrendingUp, 
  Thermometer, 
  Droplets, 
  Calendar, 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  MapPin,
  User,
  Scale,
  Eye,
  FileText,
  BarChart3
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useInventory } from '@/contexts/InventoryContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useMemo } from 'react';

const BatchDetailPage = () => {
  const navigate = useNavigate();
  const { batchId } = useParams<{ batchId: string }>();
  const { batches } = useInventory();
  const { t } = useTranslation();

  // Find the batch data
  const batch = useMemo(() => {
    return batches.find(b => b.id === batchId);
  }, [batches, batchId]);

  // If batch not found, show error
  if (!batch) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Package className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold">Batch Not Found</h2>
        <p className="text-muted-foreground">The batch {batchId} could not be found.</p>
        <Button onClick={() => navigate('/dashboard/inventory')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Inventory
        </Button>
      </div>
    );
  }

  // Calculate additional metrics
  const storageConditions = {
    temperature: batch.location.includes('Cold') ? '4°C' : '18°C',
    humidity: batch.status === 'critical' ? '85%' : batch.status === 'at-risk' ? '75%' : '65%',
    ventilation: batch.location.includes('Natural') ? 'Natural Airflow' : 'Controlled Environment'
  };

  const qualityMetrics = {
    firmness: batch.qualityScore > 80 ? 'Excellent' : batch.qualityScore > 60 ? 'Good' : batch.qualityScore > 40 ? 'Fair' : 'Poor',
    sprouting: batch.qualityScore < 50 ? 'Visible' : batch.qualityScore < 70 ? 'Early Signs' : 'None',
    skinCondition: batch.qualityScore > 75 ? 'Intact' : batch.qualityScore > 50 ? 'Minor Blemishes' : 'Deteriorating',
    odor: batch.qualityScore > 70 ? 'Fresh' : batch.qualityScore > 40 ? 'Mild' : 'Strong'
  };

  const predictions = {
    estimatedLoss: batch.qualityScore < 30 ? '15-20%' : batch.qualityScore < 60 ? '5-10%' : '1-3%',
    optimalSaleWindow: batch.daysUntilExpiry > 30 ? `${batch.daysUntilExpiry - 15} days` : `${Math.max(batch.daysUntilExpiry - 3, 1)} days`,
    priceRecommendation: batch.qualityScore > 80 ? 'Premium pricing' : batch.qualityScore > 60 ? 'Standard pricing' : 'Discounted pricing'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'at-risk': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'at-risk': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <CheckCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate('/dashboard/inventory')}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Batch {batch.id}
          </h1>
          <p className="text-muted-foreground">
            Detailed information and analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(batch.status)}
          <Badge 
            variant={batch.status === 'healthy' ? 'default' : batch.status === 'at-risk' ? 'secondary' : 'destructive'}
            className={getStatusColor(batch.status)}
          >
            {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
          </Badge>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="gap-2">
          <Edit className="h-4 w-4" />
          Edit Batch
        </Button>
        <Button variant="outline" size="sm" className="gap-2">
          <QrCode className="h-4 w-4" />
          Generate QR
        </Button>
        <Button variant="outline" size="sm" className="gap-2">
          <FileText className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Alert for Critical Status */}
      {batch.status === 'critical' && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Urgent Action Required:</strong> This batch requires immediate attention. Quality is deteriorating rapidly. Consider immediate sale or disposal.
          </AlertDescription>
        </Alert>
      )}

      {batch.status === 'at-risk' && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            <strong>Monitor Closely:</strong> This batch is showing early signs of quality decline. Increase monitoring frequency and consider priority sale.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="quality">Quality Analysis</TabsTrigger>
          <TabsTrigger value="storage">Storage Conditions</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Batch Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Batch ID</p>
                    <p className="font-semibold">{batch.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Current Quantity</p>
                    <p className="font-semibold">{batch.quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Supplier</p>
                    <p className="font-semibold">{batch.supplier || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Received Date</p>
                    <p className="font-semibold">{batch.receivedDate || 'Unknown'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Storage Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Storage Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Location</p>
                  <p className="font-semibold">{batch.location}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Storage Method</p>
                  <p className="font-semibold">{storageConditions.ventilation}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                  <p className="font-semibold">{batch.lastUpdated}</p>
                </div>
              </CardContent>
            </Card>

            {/* Quality Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Quality Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium">Quality Score</p>
                    <p className="text-2xl font-bold">{batch.qualityScore}%</p>
                  </div>
                  <Progress value={batch.qualityScore} className="h-3" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Days Until Expiry</p>
                  <p className="text-lg font-semibold">{batch.daysUntilExpiry} days</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notes Section */}
          {batch.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{batch.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        {/* Quality Analysis Tab */}
        <TabsContent value="quality" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Visual Quality Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Firmness</p>
                    <p className="font-semibold">{qualityMetrics.firmness}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Sprouting</p>
                    <p className="font-semibold">{qualityMetrics.sprouting}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Skin Condition</p>
                    <p className="font-semibold">{qualityMetrics.skinCondition}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Odor</p>
                    <p className="font-semibold">{qualityMetrics.odor}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quality Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Initial Quality</span>
                    <span className="font-semibold">100%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Current Quality</span>
                    <span className="font-semibold">{batch.qualityScore}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Quality Loss</span>
                    <span className="font-semibold text-red-600">{100 - batch.qualityScore}%</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Storage Duration</span>
                    <span className="font-semibold">{Math.floor(Math.random() * 20) + 5} days</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Storage Conditions Tab */}
        <TabsContent value="storage" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5" />
                  Temperature
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{storageConditions.temperature}</p>
                <p className="text-sm text-muted-foreground">
                  {batch.location.includes('Cold') ? 'Cold Storage Range' : 'Ambient Temperature'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-5 w-5" />
                  Humidity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{storageConditions.humidity}</p>
                <p className="text-sm text-muted-foreground">
                  {batch.status === 'critical' ? 'High (Risk)' : batch.status === 'at-risk' ? 'Elevated' : 'Optimal'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ventilation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold">{storageConditions.ventilation}</p>
                <p className="text-sm text-muted-foreground">
                  {batch.location.includes('Natural') ? 'Fresh air circulation' : 'Climate controlled'}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Storage Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {batch.status === 'critical' && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="font-semibold text-red-800">Critical Actions:</p>
                    <ul className="text-sm text-red-700 mt-1 space-y-1">
                      <li>• Increase ventilation immediately</li>
                      <li>• Check for sprouting and remove affected onions</li>
                      <li>• Consider emergency sale or processing</li>
                      <li>• Monitor temperature and humidity every 2 hours</li>
                    </ul>
                  </div>
                )}
                {batch.status === 'at-risk' && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="font-semibold text-yellow-800">Preventive Actions:</p>
                    <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                      <li>• Monitor daily for sprouting signs</li>
                      <li>• Ensure proper air circulation</li>
                      <li>• Plan for sale within optimal window</li>
                      <li>• Check storage conditions twice daily</li>
                    </ul>
                  </div>
                )}
                {batch.status === 'healthy' && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="font-semibold text-green-800">Maintenance Actions:</p>
                    <ul className="text-sm text-green-700 mt-1 space-y-1">
                      <li>• Continue current storage conditions</li>
                      <li>• Regular weekly quality checks</li>
                      <li>• Maintain optimal temperature and humidity</li>
                      <li>• Prepare for market timing optimization</li>
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Market Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Optimal Sale Window</p>
                  <p className="text-lg font-semibold">{predictions.optimalSaleWindow}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Price Recommendation</p>
                  <p className="font-semibold">{predictions.priceRecommendation}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Estimated Loss</p>
                  <p className="font-semibold">{predictions.estimatedLoss}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Impact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Value</p>
                  <p className="text-lg font-semibold">₹{(parseInt(batch.quantity) * 25 * (batch.qualityScore / 100)).toFixed(0)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Potential Loss</p>
                  <p className="font-semibold text-red-600">₹{(parseInt(batch.quantity) * 25 * (0.2)).toFixed(0)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Storage Cost/Day</p>
                  <p className="font-semibold">₹{batch.location.includes('Cold') ? '150' : '75'}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Action Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Immediate (Next 3 days)</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• {batch.status === 'critical' ? 'Emergency quality assessment' : 'Routine quality check'}</li>
                    <li>• {batch.status === 'critical' ? 'Arrange immediate sale' : 'Monitor storage conditions'}</li>
                    <li>• Update inventory records</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Short Term (1-2 weeks)</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Plan market placement strategy</li>
                    <li>• Optimize storage conditions</li>
                    <li>• Consider processing options if quality declines</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BatchDetailPage;
