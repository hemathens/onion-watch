import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Thermometer, 
  Droplets, 
  Package, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Settings,
  Bell
} from "lucide-react";
import heroImage from "@/assets/onion-storage-hero.jpg";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  // Mock data for demonstration
  const metrics = {
    temperature: { value: 22, status: "optimal", unit: "°C" },
    humidity: { value: 68, status: "warning", unit: "%" },
    totalBatches: 24,
    expiringBatches: 3,
    totalInventory: "12,450 kg"
  };

  const recentBatches = [
    { id: "B001", quantity: "850 kg", entryDate: "2024-01-15", shelfLife: "45 days", status: "good", image: "/api/placeholder/80/80" },
    { id: "B002", quantity: "720 kg", entryDate: "2024-01-10", shelfLife: "12 days", status: "warning", image: "/api/placeholder/80/80" },
    { id: "B003", quantity: "960 kg", entryDate: "2024-01-08", shelfLife: "8 days", status: "critical", image: "/api/placeholder/80/80" }
  ];

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === "optimal" || status === "good") return <CheckCircle className="h-4 w-4 text-success" />;
    if (status === "warning") return <Clock className="h-4 w-4 text-warning" />;
    return <AlertTriangle className="h-4 w-4 text-destructive" />;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      optimal: "default",
      good: "default", 
      warning: "secondary",
      critical: "destructive"
    } as const;
    
    return variants[status as keyof typeof variants] || "default";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={heroImage} 
          alt="Onion Storage Facility" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70 flex items-center">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
              Onion Storage Monitor
            </h1>
            <p className="text-primary-foreground/90 text-lg">
              Professional inventory management for optimal storage conditions
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="shadow-lg border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Temperature</CardTitle>
                  <Thermometer className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <div className="text-2xl font-bold">{metrics.temperature.value}{metrics.temperature.unit}</div>
                    <StatusIcon status={metrics.temperature.status} />
                  </div>
                  <Badge variant={getStatusBadge(metrics.temperature.status)} className="mt-2">
                    {metrics.temperature.status.charAt(0).toUpperCase() + metrics.temperature.status.slice(1)}
                  </Badge>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Humidity</CardTitle>
                  <Droplets className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <div className="text-2xl font-bold">{metrics.humidity.value}{metrics.humidity.unit}</div>
                    <StatusIcon status={metrics.humidity.status} />
                  </div>
                  <Badge variant={getStatusBadge(metrics.humidity.status)} className="mt-2">
                    {metrics.humidity.status.charAt(0).toUpperCase() + metrics.humidity.status.slice(1)}
                  </Badge>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.totalBatches}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {metrics.totalInventory} total inventory
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                  <Bell className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-warning">{metrics.expiringBatches}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Require attention within 7 days
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Batches */}
            <Card className="shadow-lg border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Recent Batches Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentBatches.map((batch) => (
                    <div key={batch.id} className="flex items-center space-x-4 p-4 bg-secondary/30 rounded-lg">
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold">{batch.id}</h3>
                          <Badge variant={getStatusBadge(batch.status)}>
                            {batch.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {batch.quantity} • Entry: {batch.entryDate}
                        </p>
                        <p className="text-sm font-medium">
                          Shelf life: {batch.shelfLife}
                        </p>
                      </div>
                      <StatusIcon status={batch.status} />
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4" variant="outline">
                  View All Batches
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <Card className="shadow-lg border-border/50">
              <CardHeader>
                <CardTitle>Inventory Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Complete inventory management system coming soon.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-20 flex-col">
                    <Package className="h-6 w-6 mb-2" />
                    Add New Batch
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <TrendingUp className="h-6 w-6 mb-2" />
                    Export Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="shadow-lg border-border/50">
              <CardHeader>
                <CardTitle>Analytics & Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Advanced analytics and reporting features coming soon.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-20 flex-col">
                    <BarChart3 className="h-6 w-6 mb-2" />
                    Loss Analysis
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <TrendingUp className="h-6 w-6 mb-2" />
                    Usage Trends
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Package className="h-6 w-6 mb-2" />
                    Storage Efficiency
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="shadow-lg border-border/50">
              <CardHeader>
                <CardTitle>Settings & Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">System settings and user management.</p>
                <div className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <Bell className="h-4 w-4 mr-2" />
                    Notification Settings
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Storage Parameters
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Package className="h-4 w-4 mr-2" />
                    User Management
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;