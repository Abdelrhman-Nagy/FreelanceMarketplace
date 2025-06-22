import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { Search, Users, Shield, Star, ArrowRight, Briefcase, Code, Palette, Writing } from 'lucide-react';

const HomePage: React.FC = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: <Search className="h-6 w-6" />,
      title: "Find Perfect Projects",
      description: "Browse thousands of projects across various industries and skill levels."
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Connect with Talent",
      description: "Access a global network of skilled freelancers and trusted clients."
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure Payments",
      description: "Protected transactions with milestone-based payments and dispute resolution."
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: "Quality Assurance",
      description: "Rating system and verified profiles ensure quality work and reliable partnerships."
    }
  ];

  const categories = [
    { name: "Web Development", icon: <Code className="h-8 w-8" />, jobs: 1240 },
    { name: "Graphic Design", icon: <Design className="h-8 w-8" />, jobs: 856 },
    { name: "Content Writing", icon: <Writing className="h-8 w-8" />, jobs: 634 },
    { name: "Digital Marketing", icon: <Briefcase className="h-8 w-8" />, jobs: 421 }
  ];

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="text-center space-y-8 py-12">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Find Your Perfect
            <span className="text-primary"> Freelancing</span>
            <br />
            Opportunity
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with top clients, showcase your skills, and build a successful freelance career. 
            Join thousands of professionals already growing their business.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {user ? (
            <Button size="lg" asChild>
              <Link to="/dashboard">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <>
              <Button size="lg" asChild>
                <Link to="/register">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/jobs">Browse Jobs</Link>
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>10,000+ Active Users</span>
          </div>
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            <span>5,000+ Projects Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            <span>4.9 Average Rating</span>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tight">Popular Categories</h2>
          <p className="text-lg text-muted-foreground">
            Explore opportunities across various industries
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="mx-auto mb-2 p-3 bg-primary/10 rounded-full w-fit">
                  {category.icon}
                </div>
                <CardTitle className="text-lg">{category.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">{category.jobs.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Active Jobs</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tight">Why Choose FreelanceHub?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We provide everything you need to succeed in the freelance economy
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <div className="mx-auto mb-2 p-3 bg-primary/10 rounded-full w-fit">
                  {feature.icon}
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 rounded-lg p-12 text-center space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Ready to Get Started?</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Join thousands of freelancers and clients who trust FreelanceHub for their projects
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link to="/register">Create Your Account</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/jobs">Explore Opportunities</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;