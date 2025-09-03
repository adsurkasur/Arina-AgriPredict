"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { ArrowRight, TrendingUp, Database, MessageSquare } from 'lucide-react';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleGetStarted = () => {
    router.push('/data');
  };

  return (
    <>
      {isLoading && (
        <LoadingScreen
          isLoading={isLoading}
          message="Loading AgriPredict"
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 dark:from-green-950 dark:via-gray-900 dark:to-green-950">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            {/* Logo */}
            <div className="flex justify-center">
              <Image
                src="/logo.svg"
                alt="AgriPredict Logo"
                width={150}
                height={150}
                className="drop-shadow-lg"
              />
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-green-600 to-green-800 dark:from-green-400 dark:to-green-600 bg-clip-text text-transparent">
                AgriPredict
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 font-light">
                Advanced Agricultural Demand Forecasting Platform
              </p>
              <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                Harness the power of AI to predict crop demand, optimize your farming decisions, and maximize your agricultural productivity.
              </p>
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="text-lg px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto">
                  <Database className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Data Management</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Efficiently manage your sales data and agricultural records with our intuitive interface.
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">AI Forecasting</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Leverage advanced AI algorithms to predict demand and optimize your crop planning.
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto">
                  <MessageSquare className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">AI Assistant</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Get intelligent insights and recommendations powered by our AI assistant.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="mt-20 text-center">
            <div className="flex items-center justify-center space-x-2 text-gray-500 dark:text-gray-400">
              <Image
                src="/logo.svg"
                alt="AgriPredict Logo"
                width={16}
                height={16}
                className="opacity-60"
              />
              <span className="text-sm">© 2025 AgriPredict. Empowering farmers with data-driven insights.</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
