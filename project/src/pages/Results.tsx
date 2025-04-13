import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Brain, ArrowLeft, Loader2 } from 'lucide-react';

interface ResultsProps {}

export const Results: React.FC<ResultsProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [careerCategories, setCareerCategories] = useState<Record<string, string[]>>({});

  useEffect(() => {
    // Get form data from location state
    const formData = location.state?.formData;
    
    if (!formData) {
      navigate('/assessment');
      return;
    }

    // Fetch career categories
    fetch('http://localhost:5000/api/career-categories')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setCareerCategories(data.categories);
        }
      })
      .catch(err => {
        console.error('Error fetching career categories:', err);
      });

    // Fetch recommendations from API
    setIsLoading(true);
    fetch('http://localhost:5000/api/assessment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        skills: formData.skills,
        interests: formData.interests,
        experienceLevel: formData.experienceLevel || 'beginner'
      }),
    })
      .then(response => response.json())
      .then(data => {
        setIsLoading(false);
        if (data.success) {
          setRecommendations(data.recommendations);
        } else {
          setError(data.error || 'Failed to get recommendations');
        }
      })
      .catch(err => {
        setIsLoading(false);
        setError('An error occurred while fetching recommendations');
        console.error('Error:', err);
      });
  }, [location.state, navigate]);

  const handleBackClick = () => {
    navigate('/assessment');
  };

  const handleCareerClick = (career: string) => {
    navigate('/career-details', { state: { career } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Brain className="w-10 h-10 text-blue-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Your Career Recommendations</h1>
            </div>
            <button 
              onClick={handleBackClick}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              Back
            </button>
          </div>

          {location.state?.formData && (
            <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Profile</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Skills:</p>
                  <p className="font-medium">{Array.isArray(location.state.formData.skills) 
                    ? location.state.formData.skills.join(', ') 
                    : location.state.formData.skills}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Interests:</p>
                  <p className="font-medium">{Array.isArray(location.state.formData.interests) 
                    ? location.state.formData.interests.join(', ') 
                    : location.state.formData.interests}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Experience Level:</p>
                  <p className="font-medium capitalize">{location.state.formData.experienceLevel || 'Beginner'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Assessment Date:</p>
                  <p className="font-medium">{new Date().toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">AI-Generated Recommendations</h2>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <span className="ml-2 text-gray-600">Generating recommendations...</span>
              </div>
            ) : error ? (
              <div className="p-4 bg-red-50 text-red-700 rounded-lg">
                <p>{error}</p>
                <p className="mt-2">Please try again or contact support if the issue persists.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {recommendations.split(/(?=\d+\.\s+)/).filter(section => section.trim()).map((careerSection, index) => {
                  // Skip empty sections
                  if (!careerSection.trim()) return null;
                  
                  // Extract title and content
                  const lines = careerSection.split('\n');
                  const title = lines[0].replace(/\*/g, '').trim();
                  const content = lines.slice(1).join('\n').replace(/\*/g, '');
                  
                  // Extract sections
                  const descriptionMatch = content.match(/Description:(.*?)(?=Why it fits:|$)/s);
                  const whyItFitsMatch = content.match(/Why it fits:(.*?)(?=How to prepare:|$)/s);
                  const howToPrepareMatch = content.match(/How to prepare:(.*?)(?=$)/s);
                  
                  const description = descriptionMatch ? descriptionMatch[1].trim() : '';
                  const whyItFits = whyItFitsMatch ? whyItFitsMatch[1].trim() : '';
                  const howToPrepare = howToPrepareMatch ? howToPrepareMatch[1].trim() : '';
                  
                  return (
                    <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="bg-blue-600 text-white p-4">
                        <h2 className="text-xl font-bold">{title}</h2>
                      </div>
                      
                      <div className="p-6 space-y-6">
                        {description && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2 border-l-4 border-blue-500 pl-3">Description</h3>
                            <p className="text-gray-700">{description}</p>
                          </div>
                        )}
                        
                        {whyItFits && (
                          <div>
                            <h3 className="text-lg font-semibold text-blue-800 mb-2 border-l-4 border-blue-500 pl-3">Why It Fits</h3>
                            <p className="text-gray-700">{whyItFits}</p>
                          </div>
                        )}
                        
                        {howToPrepare && (
                          <div>
                            <h3 className="text-lg font-semibold text-green-800 mb-2 border-l-4 border-green-500 pl-3">How to Prepare</h3>
                            <p className="text-gray-700">{howToPrepare}</p>
                          </div>
                        )}
                        
                        <button 
                          onClick={() => handleCareerClick(title)}
                          className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition duration-150 inline-flex items-center"
                        >
                          View Learning Resources
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {Object.keys(careerCategories).length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Explore Career Categories</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(careerCategories).map(([category, careers]) => (
                  <div key={category} className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 capitalize mb-3">{category}</h3>
                    <ul className="space-y-2">
                      {careers.map(career => (
                        <li key={career}>
                          <button 
                            onClick={() => handleCareerClick(career)}
                            className="text-blue-600 hover:underline"
                          >
                            {career}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <button 
              onClick={handleBackClick}
              className="px-6 py-2 bg-gray-300 text-gray-700 font-medium rounded-lg shadow-md hover:bg-gray-400 transition duration-150"
            >
              Start New Assessment
            </button>
            <button 
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 transition duration-150"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
