import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, CheckCircle, BarChart3, Shield, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

const LandingPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  const handleLogin = async () => {
    // Basic validation
    if (!loginData.email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive"
      });
      return;
    }

    if (!loginData.password.trim()) {
      toast({
        title: "Password Required",
        description: "Please enter your password.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(loginData.email, loginData.password);
      if (success) {
        toast({
          title: "Login Successful",
          description: "Welcome to OnionWatch!",
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during login. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = () => {
    toast({
      title: "Login Successful",
      description: "Welcome to OnionWatch!",
    });
    navigate('/dashboard');
  };

  const handleGoogleError = (error: string) => {
    toast({
      title: "Google Sign-In Failed",
      description: error,
      variant: "destructive"
    });
  };

  const features = [
    {
      icon: <BarChart3 className="h-8 w-8 text-yellow-600" />,
      title: "AI-Powered Analysis",
      description: "Advanced machine learning algorithms analyze your onion batches for quality assessment and shelf-life prediction."
    },
    {
      icon: <Shield className="h-8 w-8 text-yellow-600" />,
      title: "Quality Monitoring",
      description: "Real-time monitoring of storage conditions and batch quality with automated alerts for potential issues."
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-600" />,
      title: "Smart Inventory",
      description: "Intelligent inventory management with priority-based sorting and comprehensive batch tracking."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">OW</span>
              </div>
              <span className="text-xl font-bold text-gray-900">OnionWatch</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Information */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Smart Onion Storage & Quality Management
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Revolutionize your onion storage with AI-powered quality analysis, predictive monitoring, and intelligent inventory management.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Benefits */}
            <div className="bg-yellow-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Why Choose OnionWatch?</h3>
              <div className="space-y-2">
                {[
                  "Reduce storage losses by up to 40%",
                  "Predict shelf-life with 95% accuracy",
                  "Real-time quality monitoring",
                  "Automated alert system",
                  "Comprehensive reporting tools"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right side - Login Form */}
          <div className="flex justify-center">
            <Card className="w-full max-w-md shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Welcome Back</CardTitle>
                <CardDescription>
                  Sign in to access your OnionWatch dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button 
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                  onClick={handleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <GoogleSignInButton
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  disabled={isLoading}
                  className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-300"
                />
                <div className="text-center">
                  <Button variant="link" className="text-sm text-gray-600">
                    Forgot your password?
                  </Button>
                </div>
                
                {/* Demo credentials */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2 font-medium">Demo Credentials:</p>
                  <p className="text-xs text-gray-500">Email: admin@onionstorage.com</p>
                  <p className="text-xs text-gray-500">Password: password</p>
                  <p className="text-xs text-gray-500 mt-2 text-blue-600">Or use Google Sign-In above</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-gray-50 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 OnionWatch. All rights reserved.</p>
            <p className="text-sm mt-2">Revolutionizing onion storage with smart technology.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
