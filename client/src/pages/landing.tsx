import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Code, 
  Palette, 
  BarChart3, 
  PenTool, 
  Search, 
  Users, 
  CheckCircle,
  Globe,
  Shield,
  TrendingUp,
  Clock,
  DollarSign,
  Star,
  ArrowRight
} from "lucide-react";

export default function Landing() {
  const [userType, setUserType] = useState<"freelancer" | "client" | null>(null);

  const handleSignUp = (type: "freelancer" | "client") => {
    setUserType(type);
    // In a real app, this would handle the registration flow
    // For now, redirect to login
    window.location.href = "/api/login";
  };

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-upwork-green">FreelanceConnect</h1>
              </div>
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-4">
                  <button className="text-gray-900 hover:text-upwork-green px-3 py-2 rounded-md text-sm font-medium">
                    Find Work
                  </button>
                  <button className="text-gray-500 hover:text-upwork-green px-3 py-2 rounded-md text-sm font-medium">
                    Find Talent
                  </button>
                  <button className="text-gray-500 hover:text-upwork-green px-3 py-2 rounded-md text-sm font-medium">
                    Why FreelanceConnect
                  </button>
                </div>
              </div>
            </div>
            
            <div className="hidden md:block">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" onClick={handleLogin} className="text-gray-500 hover:text-upwork-green">
                  Log In
                </Button>
                <Button onClick={handleLogin} className="bg-upwork-green hover:bg-upwork-dark text-white">
                  Sign Up
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-upwork-green to-upwork-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Find the perfect freelance services for your business
              </h1>
              <p className="text-xl mb-8 text-green-100">
                Work with talented freelancers from around the world to grow your business
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleLogin}
                  className="bg-white text-upwork-green hover:bg-gray-100 px-8 py-3 text-lg"
                >
                  Get Started
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleLogin}
                  className="border-2 border-white text-white hover:bg-white hover:text-upwork-green px-8 py-3 text-lg"
                >
                  Find Talent
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Business professionals collaborating" 
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-upwork-green mb-2">10M+</div>
              <div className="text-gray-600">Freelancers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-upwork-green mb-2">5M+</div>
              <div className="text-gray-600">Clients</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-upwork-green mb-2">95%</div>
              <div className="text-gray-600">Satisfaction Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-upwork-green mb-2">$1B+</div>
              <div className="text-gray-600">Paid to Freelancers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Services */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <Code className="w-8 h-8 text-upwork-green mb-4" />
                <h3 className="font-semibold mb-2">Web Development</h3>
                <p className="text-gray-600 text-sm">Build websites and web applications</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <Palette className="w-8 h-8 text-upwork-green mb-4" />
                <h3 className="font-semibold mb-2">Graphic Design</h3>
                <p className="text-gray-600 text-sm">Create stunning visual designs</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <BarChart3 className="w-8 h-8 text-upwork-green mb-4" />
                <h3 className="font-semibold mb-2">Digital Marketing</h3>
                <p className="text-gray-600 text-sm">Grow your online presence</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <PenTool className="w-8 h-8 text-upwork-green mb-4" />
                <h3 className="font-semibold mb-2">Content Writing</h3>
                <p className="text-gray-600 text-sm">Professional copywriting services</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How FreelanceConnect Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-upwork-light rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-upwork-green" />
              </div>
              <h3 className="text-xl font-semibold mb-4">1. Post a Job</h3>
              <p className="text-gray-600">Tell us what you need done and we'll send you qualified freelancer proposals.</p>
            </div>
            <div className="text-center">
              <div className="bg-upwork-light rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-upwork-green" />
              </div>
              <h3 className="text-xl font-semibold mb-4">2. Hire the Right Freelancer</h3>
              <p className="text-gray-600">Compare proposals and select the best freelancer for your project.</p>
            </div>
            <div className="text-center">
              <div className="bg-upwork-light rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-upwork-green" />
              </div>
              <h3 className="text-xl font-semibold mb-4">3. Work Together</h3>
              <p className="text-gray-600">Collaborate safely through our platform and get your project completed.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sign Up Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Join FreelanceConnect</h2>
            <p className="text-xl text-gray-600">Choose how you want to get started</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Freelancer Signup */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <img 
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" 
                    alt="Freelancer working" 
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-xl font-semibold text-gray-900">I'm a Freelancer</h3>
                  <p className="text-gray-600">I want to offer my services</p>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <Globe className="w-5 h-5 text-upwork-green mt-0.5" />
                    <div>
                      <p className="font-medium">Work From Anywhere</p>
                      <p className="text-sm text-gray-600">Find remote opportunities worldwide</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-upwork-green mt-0.5" />
                    <div>
                      <p className="font-medium">Secure Payments</p>
                      <p className="text-sm text-gray-600">Get paid safely and on time</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <TrendingUp className="w-5 h-5 text-upwork-green mt-0.5" />
                    <div>
                      <p className="font-medium">Grow Your Career</p>
                      <p className="text-sm text-gray-600">Build reputation and increase earnings</p>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => handleSignUp("freelancer")}
                  className="w-full bg-upwork-green hover:bg-upwork-dark text-white"
                >
                  Join as Freelancer
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Client Signup */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" 
                    alt="Business professional" 
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-xl font-semibold text-gray-900">I'm a Client</h3>
                  <p className="text-gray-600">I want to hire freelancers</p>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Access Top Talent</p>
                      <p className="text-sm text-gray-600">Find skilled professionals with proven records</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Fast Delivery</p>
                      <p className="text-sm text-gray-600">Get projects completed quickly</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <DollarSign className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Cost-Effective</p>
                      <p className="text-sm text-gray-600">Save on overhead costs</p>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => handleSignUp("client")}
                  className="w-full bg-upwork-blue hover:bg-blue-700 text-white"
                >
                  Hire Freelancers
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Success Stories */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Success Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <img 
                    src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100" 
                    alt="Maria Rodriguez" 
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-semibold">Maria Rodriguez</h4>
                    <p className="text-sm text-gray-600">Web Developer</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  "FreelanceConnect transformed my career. I went from struggling to find clients to earning six figures annually within two years. The platform's tools and client base are incredible."
                </p>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100" 
                    alt="David Chen" 
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-semibold">David Chen</h4>
                    <p className="text-sm text-gray-600">Startup Founder</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  "We've built our entire product using freelancers from FreelanceConnect. The quality of work and speed of delivery helped us launch 3 months ahead of schedule."
                </p>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">FreelanceConnect</h3>
              <p className="text-gray-300 text-sm">The world's largest freelancing platform connecting businesses with skilled professionals.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Freelancers</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white">How to Find Work</a></li>
                <li><a href="#" className="hover:text-white">Create Profile</a></li>
                <li><a href="#" className="hover:text-white">Success Stories</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Clients</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white">How to Hire</a></li>
                <li><a href="#" className="hover:text-white">Post a Job</a></li>
                <li><a href="#" className="hover:text-white">Find Talent</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-300">
            <p>&copy; 2024 FreelanceConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
