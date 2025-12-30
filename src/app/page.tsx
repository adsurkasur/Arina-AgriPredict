"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { useNavigation } from '@/hooks/useNavigation';
import { useGlobalLoading } from '@/hooks/useGlobalLoading';
import { ArrowRight, TrendingUp, Database, MessageSquare, Route } from 'lucide-react';

export default function HomePage() {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const { navigateTo } = useNavigation();
  const { isLoading: isGlobalLoading, loadingMessage } = useGlobalLoading();

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleGetStarted = () => {
    navigateTo('/data');
  };

  return (
    <>
      {(isInitialLoading || isGlobalLoading) && (
        <LoadingScreen
          isLoading={isInitialLoading || isGlobalLoading}
          message={isInitialLoading ? "Loading AgriPredict..." : loadingMessage}
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
          <div className="mt-20 grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <Card className="border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300 cursor-pointer group" onClick={() => navigateTo('/data')}>
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Database className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Data Management</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Efficiently manage your sales data and agricultural records with our intuitive interface.
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300 cursor-pointer group" onClick={() => navigateTo('/forecast')}>
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">AI Forecasting</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Leverage advanced AI algorithms to predict demand and optimize your crop planning.
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300 cursor-pointer group" onClick={() => navigateTo('/assistant')}>
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <MessageSquare className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">AI Assistant</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Get intelligent insights and recommendations powered by our AI assistant.
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300 cursor-pointer group" onClick={() => navigateTo('/tracking')}>
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Route className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Route Optimization</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Track deliveries and optimize distribution routes for maximum efficiency.
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
              <span className="text-sm">© 2025 AgriPredict - Developed by Ade Surya Ananda</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
