import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";
import Dashboard from "@/components/Dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn } from "lucide-react";
import heroImage from "@/assets/onion-storage-hero.jpg";

const Index = () => {
  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (isAuthenticated) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-screen overflow-hidden">
        <img 
          src={heroImage} 
          alt="Onion Storage Facility" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 to-primary/80 flex items-center">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6">
              Professional Onion Storage Management
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto">
              Monitor storage conditions, track inventory, and optimize your onion storage operations with real-time insights and intelligent alerts.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6"
                onClick={() => setShowAuthModal(true)}
              >
                <LogIn className="h-5 w-5 mr-2" />
                Get Started
              </Button>
            </div>

            {/* Features Preview */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="bg-background/10 border-primary-foreground/20">
                <CardHeader>
                  <CardTitle className="text-primary-foreground">Real-time Monitoring</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-primary-foreground/80">
                    Track temperature, humidity, and storage conditions in real-time
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-background/10 border-primary-foreground/20">
                <CardHeader>
                  <CardTitle className="text-primary-foreground">Inventory Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-primary-foreground/80">
                    Manage batches, track expiry dates, and prevent storage losses
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-background/10 border-primary-foreground/20">
                <CardHeader>
                  <CardTitle className="text-primary-foreground">Smart Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-primary-foreground/80">
                    Get notified about critical conditions and expiring stock
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
};

export default Index;
