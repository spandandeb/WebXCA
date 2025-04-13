import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, ArrowRight, Sparkles, Target, Users } from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <Brain className="h-16 w-16 text-blue-600" />
                </div>
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Discover Your</span>
                  <span className="block text-blue-600">Perfect Career Path</span>
                </h1>
                <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                  Let our AI-powered career counselor guide you towards a fulfilling professional journey tailored to your skills, interests, and aspirations.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center">
                  <div className="rounded-md shadow">
                    <button
                      onClick={() => navigate('/assessment')}
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                    >
                      Start Career Assessment
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">How It Works</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Your Path to Career Clarity
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
                  <Target className="h-6 w-6" />
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Personalized Assessment</h3>
                <p className="mt-2 text-base text-gray-500">
                  Complete our comprehensive assessment to help us understand your unique profile.
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">AI Analysis</h3>
                <p className="mt-2 text-base text-gray-500">
                  Our AI analyzes your profile to identify the best career matches for you.
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Expert Recommendations</h3>
                <p className="mt-2 text-base text-gray-500">
                  Receive detailed career recommendations tailored to your profile.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};