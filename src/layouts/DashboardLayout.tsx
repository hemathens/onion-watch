import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Bell, Home, BarChart, Settings, User, Package, Upload, FileText, Bot, Wifi, LogOut } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useInventory } from "@/contexts/InventoryContext";
import { LanguageSelector } from "@/components/ui/language-selector";
import { useTranslation } from "@/hooks/useTranslation";
import { AddBatchDialog, BatchFormData } from "@/components/inventory/AddBatchDialog";
import { useState } from "react";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logout } = useAuth();
  const { addBatch } = useInventory();
  const { t } = useTranslation();
  const [isAddBatchDialogOpen, setIsAddBatchDialogOpen] = useState(false);

  const handleAddBatch = (batchData: BatchFormData) => {
    // Add the batch to inventory context
    addBatch(batchData);
    
    // Navigate to inventory page to see the new batch
    navigate('/dashboard/inventory');
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: t('message.loggedOut'),
        description: t('message.loggedOutDescription'),
      });
      navigate('/');
    } catch (error) {
      toast({
        title: t('message.error'),
        description: t('message.failedLogout'),
        variant: "destructive"
      });
    }
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <a href="/" className="flex items-center gap-2 font-semibold">
              <Package className="h-6 w-6 text-primary" />
              <span className="">OnioTech</span>
            </a>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <NavLink to="/dashboard" className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${isActive ? 'bg-muted text-primary' : ''}`}>
                <Home className="h-4 w-4" />
                {t('nav.dashboard')}
              </NavLink>
              <NavLink to="/dashboard/inventory" className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${isActive ? 'bg-muted text-primary' : ''}`}>
                <Package className="h-4 w-4" />
                {t('nav.inventory')}
              </NavLink>
              <NavLink to="/dashboard/predictions" className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${isActive ? 'bg-muted text-primary' : ''}`}>
                <Bot className="h-4 w-4" />
                {t('nav.aiPredictions')}
              </NavLink>
              <NavLink to="/dashboard/alerts" className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${isActive ? 'bg-muted text-primary' : ''}`}>
                <Bell className="h-4 w-4" />
                {t('nav.alerts')}
              </NavLink>
              <NavLink to="/dashboard/reports" className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${isActive ? 'bg-muted text-primary' : ''}`}>
                <BarChart className="h-4 w-4" />
                {t('nav.reports')}
              </NavLink>
              <NavLink to="/dashboard/settings" className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${isActive ? 'bg-muted text-primary' : ''}`}>
                <Settings className="h-4 w-4" />
                {t('nav.settings')}
              </NavLink>
              <NavLink to="/dashboard/iot" className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${isActive ? 'bg-muted text-primary' : ''}`}>
                <Wifi className="h-4 w-4" />
                {t('nav.iotIntegration')}
              </NavLink>
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-gradient-to-r from-yellow-100 to-white px-4 lg:h-[60px] lg:px-6">
          <div className="w-full flex-1">
            <h1 className="text-lg font-semibold md:text-2xl">{t('nav.dashboard')}</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1"
              onClick={() => setIsAddBatchDialogOpen(true)}
            >
              <Package className="h-4 w-4" />
              {t('button.addNewBatch')}
            </Button>
            
            {/* Language Selector */}
            <LanguageSelector variant="outline" size="sm" />
            
            {/* Red Sign Out Button */}
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white gap-2"
            >
              <LogOut className="h-4 w-4" />
              {t('auth.signOut')}
            </Button>
          </div>
          <Link to="/dashboard/alerts">
            <Button variant="outline" size="icon" className="relative h-8 w-8 rounded-full">
              <Bell className="h-4 w-4" />
              <span className="absolute top-0 right-0 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t('account.myAccount')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/dashboard/settings">{t('button.settings')}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/dashboard/support">{t('button.support')}</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>{t('button.logout')}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <Outlet />
        </main>
      </div>
      
      {/* Add Batch Dialog */}
      <AddBatchDialog
        isOpen={isAddBatchDialogOpen}
        onClose={() => setIsAddBatchDialogOpen(false)}
        onSubmit={handleAddBatch}
      />
    </div>
  );
};

export default DashboardLayout;
