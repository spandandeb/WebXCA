import React, { useState } from 'react';
import { Brain, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { FormStep } from '../components/FormStep';
import { ProgressBar } from '../components/ProgressBar';
import { InputField } from '../components/InputField';
import type { FormData } from '../types';
import { useNavigate } from 'react-router-dom';

const initialFormData: FormData = {
  personalInfo: {
    name: '',
    age: 0,
    education: '',
    email: '',
  },
  skills: [],
  experience: [],
  interests: [],
  hobbies: [],
  strengths: [],
  preferences: {
    workEnvironment: '',
    workStyle: '',
    location: '',
    salary: '',
  },
};

export const Assessment: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);

  const totalSteps = 5;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Prepare data for API
    const apiData = {
      skills: formData.skills,
      interests: formData.interests,
      experienceLevel: formData.experience.length > 0 ? 'intermediate' : 'beginner'
    };
    
    // Navigate to results page with form data
    navigate('/results', { state: { formData: apiData } });
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      skills: e.target.value.split(',').map(skill => skill.trim()),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-center mb-8">
            <Brain className="w-10 h-10 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">AI Career Counselor</h1>
          </div>

          <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
          
          <form onSubmit={handleSubmit}>
            <FormStep title="Personal Information" currentStep={currentStep} stepNumber={1}>
              <InputField
                label="Full Name"
                value={formData.personalInfo.name}
                onChange={(value) => setFormData({
                  ...formData,
                  personalInfo: { ...formData.personalInfo, name: value }
                })}
                required
              />
              <InputField
                label="Age"
                type="number"
                value={formData.personalInfo.age}
                onChange={(value) => setFormData({
                  ...formData,
                  personalInfo: { ...formData.personalInfo, age: parseInt(value) }
                })}
                required
              />
              <InputField
                label="Education"
                value={formData.personalInfo.education}
                onChange={(value) => setFormData({
                  ...formData,
                  personalInfo: { ...formData.personalInfo, education: value }
                })}
                required
              />
              <InputField
                label="Email"
                type="email"
                value={formData.personalInfo.email}
                onChange={(value) => setFormData({
                  ...formData,
                  personalInfo: { ...formData.personalInfo, email: value }
                })}
                required
              />
            </FormStep>

            <FormStep title="Skills & Expertise" currentStep={currentStep} stepNumber={2}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Technical Skills
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                  value={formData.skills.join(', ')}
                  onChange={handleSkillsChange}
                  placeholder="Enter your skills (comma-separated)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  required
                />
              </div>
            </FormStep>

            <FormStep title="Interests & Hobbies" currentStep={currentStep} stepNumber={3}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Professional Interests
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                  value={formData.interests.join(', ')}
                  onChange={(e) => setFormData({
                    ...formData,
                    interests: e.target.value.split(',').map(interest => interest.trim()),
                  })}
                  placeholder="What professional fields interest you? (comma-separated)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hobbies
                </label>
                <textarea
                  value={formData.hobbies.join(', ')}
                  onChange={(e) => setFormData({
                    ...formData,
                    hobbies: e.target.value.split(',').map(hobby => hobby.trim()),
                  })}
                  placeholder="What do you enjoy doing in your free time? (comma-separated)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                />
              </div>
            </FormStep>

            <FormStep title="Work Preferences" currentStep={currentStep} stepNumber={4}>
              <InputField
                label="Preferred Work Environment"
                value={formData.preferences.workEnvironment}
                onChange={(value) => setFormData({
                  ...formData,
                  preferences: { ...formData.preferences, workEnvironment: value }
                })}
                placeholder="e.g., Office, Remote, Hybrid"
                required
              />
              <InputField
                label="Work Style"
                value={formData.preferences.workStyle}
                onChange={(value) => setFormData({
                  ...formData,
                  preferences: { ...formData.preferences, workStyle: value }
                })}
                placeholder="e.g., Independent, Team-based, Mixed"
                required
              />
              <InputField
                label="Preferred Location"
                value={formData.preferences.location}
                onChange={(value) => setFormData({
                  ...formData,
                  preferences: { ...formData.preferences, location: value }
                })}
                required
              />
              <InputField
                label="Expected Salary Range"
                value={formData.preferences.salary}
                onChange={(value) => setFormData({
                  ...formData,
                  preferences: { ...formData.preferences, salary: value }
                })}
                placeholder="e.g., $50,000 - $70,000"
                required
              />
            </FormStep>

            <FormStep title="Review & Submit" currentStep={currentStep} stepNumber={5}>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Summary of Your Information</h3>
                <div className="space-y-4">
                  <p><strong>Name:</strong> {formData.personalInfo.name}</p>
                  <p><strong>Education:</strong> {formData.personalInfo.education}</p>
                  <p><strong>Skills:</strong> {formData.skills.join(', ')}</p>
                  <p><strong>Interests:</strong> {formData.interests.join(', ')}</p>
                  <p><strong>Work Environment:</strong> {formData.preferences.workEnvironment}</p>
                </div>
              </div>
            </FormStep>

            <div className="mt-8 flex justify-between">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </button>
              )}
              
              {currentStep < totalSteps && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="ml-auto flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </button>
              )}
              
              {currentStep === totalSteps && (
                <button
                  type="submit"
                  className="ml-auto flex items-center px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span>Processing...</span>
                  ) : (
                    <>
                      Get Recommendation
                      <Send className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};