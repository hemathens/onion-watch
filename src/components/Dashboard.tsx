import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Bell,
  User,
  LogOut,
  Users
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useInventory } from "@/contexts/InventoryContext";
import { useTranslation } from "@/hooks/useTranslation";
import { UserProfile } from "@/components/profile/UserProfile";
import { UserManagement } from "@/components/admin/UserManagement";
import heroImage from "@/assets/onion-storage-hero.jpg";

const Dashboard = () => {
  const { user, logout, hasPermission } = useAuth();
  const { batches } = useInventory();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Calculate dynamic metrics from actual batch data
  const metrics = useMemo(() => {
    const totalBatches = batches.length;
    const criticalBatches = batches.filter(b => b.status === 'critical').length;
    const atRiskBatches = batches.filter(b => b.status === 'at-risk').length;
    const expiringBatches = batches.filter(b => b.daysUntilExpiry <= 7).length;
    
    // Calculate total inventory weight
    const totalWeight = batches.reduce((total, batch) => {
      const weight = parseInt(batch.quantity.replace(/[^0-9]/g, '')) || 0;
      return total + weight;
    }, 0);
    
    // Calculate average quality score for health status
    const avgQuality = batches.length > 0 
      ? batches.reduce((sum, batch) => sum + batch.qualityScore, 0) / batches.length 
      : 100;
    
    return {
      temperature: { 
        value: 22, 
        status: avgQuality > 80 ? "optimal" : avgQuality > 60 ? "warning" : "critical", 
        unit: "°C" 
      },
      humidity: { 
        value: 68, 
        status: criticalBatches > 0 ? "critical" : atRiskBatches > 0 ? "warning" : "optimal", 
        unit: "%" 
      },
      totalBatches,
      expiringBatches,
      totalInventory: `${totalWeight.toLocaleString()} kg`,
      healthyPercentage: batches.length > 0 ? Math.round((batches.filter(b => b.status === 'healthy').length / batches.length) * 100) : 100
    };
  }, [batches]);

  // Get recent batches (latest 3)
  const recentBatches = useMemo(() => {
    return batches
      .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
      .slice(0, 3)
      .map(batch => ({
        id: batch.id,
        quantity: batch.quantity,
        entryDate: batch.receivedDate || 'Unknown',
        shelfLife: `${batch.daysUntilExpiry} days`,
        status: batch.status === 'healthy' ? 'good' : batch.status === 'at-risk' ? 'warning' : 'critical'
      }));
  }, [batches]);

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
          <div className="container mx-auto px-4 flex justify-between items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
                {t('dashboard.title')}
              </h1>
              <p className="text-primary-foreground/90 text-lg">
                {t('dashboard.subtitle')}
              </p>
            </div>
            
            {user && (
              <div className="flex items-center space-x-4">
                <div className="text-right hidden sm:block">
                  <p className="text-primary-foreground font-medium">{user.name}</p>
                  <p className="text-primary-foreground/70 text-sm">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </p>
                </div>
                <Avatar className="h-12 w-12 border-2 border-primary-foreground/20">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-primary-foreground text-primary">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  variant="destructive" 
                  size="icon"
                  onClick={logout}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  title="Sign Out"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full mb-6 ${hasPermission('manage_users') ? 'grid-cols-6' : 'grid-cols-5'}`}>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              {t('nav.dashboard')}
            </TabsTrigger>
            {hasPermission('view_inventory') && (
              <TabsTrigger value="inventory" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                {t('nav.inventory')}
              </TabsTrigger>
            )}
            {hasPermission('view_analytics') && (
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                {t('nav.analytics')}
              </TabsTrigger>
            )}
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {t('nav.profile')}
            </TabsTrigger>
            {hasPermission('manage_users') && (
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {t('nav.users')}
              </TabsTrigger>
            )}
            {hasPermission('manage_settings') && (
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                {t('nav.settings')}
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="shadow-lg border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('dashboard.temperature')}</CardTitle>
                  <Thermometer className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <div className="text-2xl font-bold">{metrics.temperature.value}{metrics.temperature.unit}</div>
                    <StatusIcon status={metrics.temperature.status} />
                  </div>
                  <Badge variant={getStatusBadge(metrics.temperature.status)} className="mt-2">
                    {t(`status.${metrics.temperature.status}`)}
                  </Badge>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('dashboard.humidity')}</CardTitle>
                  <Droplets className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <div className="text-2xl font-bold">{metrics.humidity.value}{metrics.humidity.unit}</div>
                    <StatusIcon status={metrics.humidity.status} />
                  </div>
                  <Badge variant={getStatusBadge(metrics.humidity.status)} className="mt-2">
                    {t(`status.${metrics.humidity.status}`)}
                  </Badge>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('dashboard.totalBatches')}</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.totalBatches}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {t('dashboard.totalInventory', { amount: metrics.totalInventory })}
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('dashboard.expiringBatches')}</CardTitle>
                  <Bell className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-warning">{metrics.expiringBatches}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {t('dashboard.requiresAttention', { days: '7' })}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Batches */}
            <Card className="shadow-lg border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  {t('dashboard.recentBatches')}
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
                            {t(`status.${batch.status}`)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {batch.quantity} • {t('dashboard.entryDate', { date: batch.entryDate })}
                        </p>
                        <p className="text-sm font-medium">
                          {t('dashboard.shelfLife', { time: batch.shelfLife })}
                        </p>
                      </div>
                      <StatusIcon status={batch.status} />
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4" variant="outline">
                  {t('dashboard.viewAllBatches')}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {hasPermission('view_inventory') && (
            <TabsContent value="inventory" className="space-y-6">
              <Card className="shadow-lg border-border/50">
                <CardHeader>
                  <CardTitle>{t('inventory.management')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{t('inventory.managementDesc')}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {hasPermission('manage_inventory') && (
                      <Button variant="outline" className="h-20 flex-col">
                        <Package className="h-6 w-6 mb-2" />
                        {t('inventory.addNewBatch')}
                      </Button>
                    )}
                    {hasPermission('export_reports') && (
                      <Button variant="outline" className="h-20 flex-col">
                        <TrendingUp className="h-6 w-6 mb-2" />
                        {t('inventory.exportReport')}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {hasPermission('view_analytics') && (
            <TabsContent value="analytics" className="space-y-6">
              <Card className="shadow-lg border-border/50">
                <CardHeader>
                  <CardTitle>{t('analytics.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{t('analytics.description')}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline" className="h-20 flex-col">
                      <BarChart3 className="h-6 w-6 mb-2" />
                      {t('analytics.lossAnalysis')}
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <TrendingUp className="h-6 w-6 mb-2" />
                      {t('analytics.usageTrends')}
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <Package className="h-6 w-6 mb-2" />
                      {t('analytics.storageEfficiency')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="profile" className="space-y-6">
            <UserProfile />
          </TabsContent>

          {hasPermission('manage_users') && (
            <TabsContent value="users" className="space-y-6">
              <UserManagement />
            </TabsContent>
          )}

          {hasPermission('manage_settings') && (
            <TabsContent value="settings" className="space-y-6">
              <Card className="shadow-lg border-border/50">
                <CardHeader>
                  <CardTitle>{t('settings.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{t('settings.description')}</p>
                  <div className="space-y-4">
                    <Button variant="outline" className="w-full justify-start">
                      <Bell className="h-4 w-4 mr-2" />
                      {t('settings.notifications')}
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      {t('settings.storageParameters')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;