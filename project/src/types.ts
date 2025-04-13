export interface FormData {
  personalInfo: {
    name: string;
    age: number;
    education: string;
    email: string;
  };
  skills: string[];
  experience: {
    title: string;
    company: string;
    duration: string;
    description: string;
  }[];
  interests: string[];
  hobbies: string[];
  strengths: string[];
  preferences: {
    workEnvironment: string;
    workStyle: string;
    location: string;
    salary: string;
  };
}