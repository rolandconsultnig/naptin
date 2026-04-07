import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, BarChart3, Wrench, Shield } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header with Hero Image */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <img 
              src="/images/logo.svg" 
              alt="EAM Logo" 
              className="h-16 w-16 mr-4"
            />
            <h1 className="text-5xl font-bold text-gray-900">
              Enterprise Asset Management
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
            Streamline your asset lifecycle, optimize maintenance schedules, and maximize operational efficiency 
            with our comprehensive EAM solution.
          </p>
          
          {/* Hero Illustration */}
          <div className="flex justify-center mb-8">
            <div className="relative animate-float">
              <img 
                src="/images/hero-illustration.svg" 
                alt="Enterprise Asset Management Illustration" 
                className="w-full max-w-2xl h-auto drop-shadow-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-50/20 to-transparent rounded-lg"></div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Real-time Analytics</CardTitle>
              <CardDescription>
                Monitor asset performance and maintenance costs with comprehensive dashboards and reporting
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Wrench className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Smart Maintenance</CardTitle>
              <CardDescription>
                Preventive and predictive maintenance scheduling to minimize downtime and extend asset life
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Enterprise Security</CardTitle>
              <CardDescription>
                Role-based access control and audit trails to ensure data security and compliance
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Ready to Get Started?</CardTitle>
            <CardDescription className="text-lg">
              Sign in to access your Enterprise Asset Management dashboard and start optimizing your operations.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/login">
              <Button 
                size="lg" 
                className="text-lg px-8 py-4"
              >
                Sign In to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Key Benefits */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">99.5%</div>
            <div className="text-gray-600">System Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">30%</div>
            <div className="text-gray-600">Cost Reduction</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">50%</div>
            <div className="text-gray-600">Faster Response</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">24/7</div>
            <div className="text-gray-600">Support Available</div>
          </div>
        </div>
      </div>
    </div>
  );
}
