# AI Career Counselor

A web application that uses AI to provide personalized career recommendations based on user skills, interests, and experience level.

## Project Structure

This project consists of two main parts:
- **Backend**: Flask application with Google Gemini AI integration
- **Frontend**: React/TypeScript application with Tailwind CSS

## Setup and Installation

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd "e:\Career Counsellor webx\backend"
   ```

2. Create a virtual environment (optional but recommended):
   ```
   python -m venv venv
   venv\Scripts\activate
   ```

3. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Run the Flask application:
   ```
   python app.py
   ```
   The backend will run on http://localhost:5000

### Frontend Setup

1. Navigate to the project directory:
   ```
   cd "e:\Career Counsellor webx\project"
   ```

2. Install the required dependencies:
   ```
   npm install
   ```

3. Run the React application:
   ```
   npm run dev
   ```
   The frontend will run on http://localhost:5173 (or another port if 5173 is in use)

## API Endpoints

The backend provides the following API endpoints:

- `POST /api/assessment`: Submit user assessment data and get career recommendations
- `POST /api/resources`: Get learning resources for a specific career path

## Technologies Used

- **Backend**: Flask, Google Gemini AI
- **Frontend**: React, TypeScript, Tailwind CSS
- **State Management**: React Hooks
- **Styling**: Tailwind CSS

## Environment Variables

The backend requires the following environment variables (in a .env file):

- `SECRET_KEY`: Secret key for Flask session
- `GEMINI_API_KEY`: API key for Google Gemini AI
