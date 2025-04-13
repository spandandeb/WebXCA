import React from 'react';

interface FormStepProps {
  title: string;
  currentStep: number;
  stepNumber: number;
  children: React.ReactNode;
}

export const FormStep: React.FC<FormStepProps> = ({
  title,
  currentStep,
  stepNumber,
  children,
}) => {
  if (currentStep !== stepNumber) return null;

  return (
    <div className="animate-fadeIn">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">{title}</h2>
      {children}
    </div>
  );
};