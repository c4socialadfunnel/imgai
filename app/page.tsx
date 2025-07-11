'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Sparkles, 
  Zap, 
  Shield, 
  ArrowRight,
  Check,
  Star,
  Users,
  TrendingUp,
  Wand2,
  ImageIcon,
  Palette,
  UserCircle
} from 'lucide-react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const features = [
    {
      icon: Sparkles,
      title: 'AI Image Enhancement',
      description: 'Automatically improve image quality, resolution, and clarity using advanced AI algorithms.',
      color: 'from-blue-500 to-purple-600',
    },
    {
      icon: Wand2,
      title: 'Smart Object Removal',
      description: 'Remove unwanted objects, people, or backgrounds with precision AI technology.',
      color: 'from-red-500 to-pink-600',
    },
    {
      icon: Palette,
      title: 'Style Transfer',
      description: 'Apply artistic styles and filters to transform your images into masterpieces.',
      color: 'from-green-500 to-emerald-600',
    },
    {
      icon: ImageIcon,
      title: 'Text-to-Image',
      description: 'Generate stunning images from text descriptions using cutting-edge AI models.',
      color: 'from-yellow-500 to-orange-600',
    },
    {
      icon: UserCircle,
      title: 'AI Avatar Generator',
      description: 'Create professional avatars and portraits with customizable styles and poses.',
      color: 'from-purple-500 to-indigo-600',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your images are processed securely with enterprise-grade privacy protection.',
      color: 'from-gray-500 to-slate-600',
    },
  ];

  const pricing = [
    {
      name: 'Starter',
      price: 'Free',
      description: 'Perfect for trying out our AI tools',
      features: [
        '10 free credits',
        'Basic image enhancement',
        'Standard processing speed',
        'Community support',
      ],
      popular: false,
    },
    {
      name: 'Pro',
      price: '$19',
      description: 'Best for regular users and creators',
      features: [
        '500 credits/month',
        'All AI tools included',
        'Priority processing',
        'Advanced features',
        'Email support',
      ],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: '$99',
      description: 'For teams and heavy users',
      features: [
        '2500 credits/month',
        'All AI tools included',
        'Fastest processing',
        'API access',
        'Priority support',
        'Custom integrations',
      ],
      popular: false,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              IMGAI
            </span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-sm font-medium transition-colors hover:text-primary">
              Features
            </a>
            <a href="#pricing" className="text-sm font-medium transition-colors hover:text-primary">
              Pricing
            </a>
            <a href="#about" className="text-sm font-medium transition-colors hover:text-primary">
              About
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.push('/auth/signin')}>
              Sign In
            </Button>
            <Button onClick={() => router.push('/auth/signup')}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 lg:py-32">
        <div className="container text-center">
          <div className="mx-auto max-w-4xl">
            <Badge className="mb-4" variant="secondary">
              <Sparkles className="h-4 w-4 mr-2" />
              Powered by Advanced AI
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Transform Your Images with{' '}
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                AI Magic
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl">
              Professional image editing powered by cutting-edge AI. Enhance, transform, and create stunning visuals in seconds.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="lg" onClick={() => router.push('/auth/signup')}>
                Start Creating
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg">
                <Zap className="mr-2 h-5 w-5" />
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 lg:py-32">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Powerful AI Tools at Your Fingertips
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need to create, enhance, and transform images with AI
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 lg:py-32 bg-slate-50 dark:bg-slate-900">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Choose the plan that fits your needs. Start free, upgrade anytime.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {pricing.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      <Star className="h-4 w-4 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.price !== 'Free' && (
                      <span className="text-muted-foreground">/month</span>
                    )}
                  </div>
                  <CardDescription className="text-base">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-3" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${plan.popular ? '' : 'variant-outline'}`}
                    onClick={() => router.push('/auth/signup')}
                  >
                    {plan.price === 'Free' ? 'Start Free' : 'Get Started'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 lg:py-32">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">50K+</div>
              <div className="text-lg text-muted-foreground flex items-center justify-center">
                <Users className="h-5 w-5 mr-2" />
                Happy Users
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">1M+</div>
              <div className="text-lg text-muted-foreground flex items-center justify-center">
                <ImageIcon className="h-5 w-5 mr-2" />
                Images Processed
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-lg text-muted-foreground flex items-center justify-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Satisfaction Rate
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-slate-50 dark:bg-slate-900">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Brain className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">IMGAI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered image editing platform for creators and professionals.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-primary">Features</a></li>
                <li><a href="#pricing" className="hover:text-primary">Pricing</a></li>
                <li><a href="#" className="hover:text-primary">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">About</a></li>
                <li><a href="#" className="hover:text-primary">Blog</a></li>
                <li><a href="#" className="hover:text-primary">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Help Center</a></li>
                <li><a href="#" className="hover:text-primary">Contact</a></li>
                <li><a href="#" className="hover:text-primary">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2024 IMGAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}