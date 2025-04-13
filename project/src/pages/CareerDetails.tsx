import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Brain, ArrowLeft, Loader2 } from 'lucide-react';

interface CareerDetailsProps {}

export const CareerDetails: React.FC<CareerDetailsProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [resources, setResources] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const career = location.state?.career || '';

  useEffect(() => {
    if (!career) {
      navigate('/results');
      return;
    }

    // Fetch learning resources from API
    setIsLoading(true);
    fetch('http://localhost:5000/api/resources', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ career }),
    })
      .then(response => response.json())
      .then(data => {
        setIsLoading(false);
        if (data.success) {
          setResources(data.resources);
        } else {
          setError(data.error || 'Failed to get learning resources');
        }
      })
      .catch(err => {
        setIsLoading(false);
        setError('An error occurred while fetching resources');
        console.error('Error:', err);
      });
  }, [career, navigate]);

  const handleBackClick = () => {
    navigate('/results');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Brain className="w-10 h-10 text-blue-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Learning Resources</h1>
            </div>
            <button 
              onClick={handleBackClick}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              Back to Recommendations
            </button>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">{career}</h2>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <span className="ml-2 text-gray-600">Fetching learning resources...</span>
              </div>
            ) : error ? (
              <div className="p-4 bg-red-50 text-red-700 rounded-lg">
                <p>{error}</p>
                <p className="mt-2">Please try again or contact support if the issue persists.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {resources.split(/(?=\d+\.\s+)/).filter(section => section.trim()).map((resourceSection, index) => {
                  // Skip empty sections
                  if (!resourceSection.trim()) return null;
                  
                  // Extract title and content
                  const lines = resourceSection.split('\n');
                  const title = lines[0].replace(/\*/g, '').trim();
                  const content = lines.slice(1).join('\n').replace(/\*/g, '');
                  
                  // Extract sections
                  const whyGreatMatch = content.match(/Why it's great:(.*?)(?=Specific Relevant Courses:|$)/s);
                  const coursesMatch = content.match(/Specific Relevant Courses:(.*?)(?=$)/s);
                  
                  const whyGreat = whyGreatMatch ? whyGreatMatch[1].trim() : '';
                  const courses = coursesMatch ? coursesMatch[1].trim() : '';
                  
                  return (
                    <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="bg-blue-600 text-white p-4">
                        <h2 className="text-xl font-bold">{title}</h2>
                      </div>
                      
                      <div className="p-6 space-y-6">
                        {whyGreat && (
                          <div>
                            <h3 className="text-lg font-semibold text-blue-800 mb-2 border-l-4 border-blue-500 pl-3">Why It's Great</h3>
                            <p className="text-gray-700">{whyGreat}</p>
                          </div>
                        )}
                        
                        {courses && (
                          <div>
                            <h3 className="text-lg font-semibold text-green-800 mb-2 border-l-4 border-green-500 pl-3">Specific Relevant Courses</h3>
                            <p className="text-gray-700">{courses}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <button 
              onClick={handleBackClick}
              className="px-6 py-2 bg-gray-300 text-gray-700 font-medium rounded-lg shadow-md hover:bg-gray-400 transition duration-150"
            >
              Back to Recommendations
            </button>
            <button 
              onClick={() => navigate('/assessment')}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 transition duration-150"
            >
              Start New Assessment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
