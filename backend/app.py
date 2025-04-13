from flask import Flask, request, jsonify
import os
import datetime
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai
from flask_pymongo import PyMongo
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure app
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "your-secret-key")
app.config["MONGO_URI"] = os.getenv("MONGO_URI").replace('<db_password>', 'password123')
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")

# Initialize extensions
mongo = PyMongo(app)

# Create the users collection if it doesn't exist
with app.app_context():
    try:
        mongo.db.users
    except:
        print("Creating users collection...")
        mongo.db.create_collection('users')

bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

# Authentication routes
@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.json
        # Check if required fields are present
        if not all(k in data for k in ["username", "email", "password"]):
            return jsonify({"success": False, "error": "Missing required fields"}), 400
        
        # Check if user already exists
        existing_user = mongo.db.users.find_one({"email": data["email"]})
        if existing_user:
            return jsonify({"success": False, "error": "Email already registered"}), 400
        
        # Hash password
        hashed_password = bcrypt.generate_password_hash(data["password"]).decode('utf-8')
        
        # Create new user
        new_user = {
            "username": data["username"],
            "email": data["email"],
            "password": hashed_password,
            "created_at": datetime.datetime.utcnow()
        }
        
        # Insert user into database
        mongo.db.users.insert_one(new_user)
        
        # Create access token
        access_token = create_access_token(identity=data["email"])
        
        return jsonify({
            "success": True,
            "message": "User registered successfully",
            "token": access_token,
            "user": {
                "username": data["username"],
                "email": data["email"]
            }
        }), 201
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.json
        # Check if required fields are present
        if not all(k in data for k in ["email", "password"]):
            return jsonify({"success": False, "error": "Missing required fields"}), 400
        
        # Find user by email
        user = mongo.db.users.find_one({"email": data["email"]})
        if not user:
            return jsonify({"success": False, "error": "Invalid email or password"}), 401
        
        # Check password
        if not bcrypt.check_password_hash(user["password"], data["password"]):
            return jsonify({"success": False, "error": "Invalid email or password"}), 401
        
        # Create access token
        access_token = create_access_token(identity=data["email"])
        
        return jsonify({
            "success": True,
            "message": "Login successful",
            "token": access_token,
            "user": {
                "username": user["username"],
                "email": user["email"]
            }
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/user', methods=['GET'])
@jwt_required()
def get_user():
    try:
        # Get user email from JWT
        current_user_email = get_jwt_identity()
        
        # Find user by email
        user = mongo.db.users.find_one({"email": current_user_email})
        if not user:
            return jsonify({"success": False, "error": "User not found"}), 404
        
        return jsonify({
            "success": True,
            "user": {
                "username": user["username"],
                "email": user["email"]
            }
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# Sample career paths to start with - for API reference
sample_careers = {
    "technology": ["Software Developer", "Data Scientist", "UX Designer", "Cybersecurity Specialist"],
    "healthcare": ["Nurse", "Physician Assistant", "Medical Technologist", "Healthcare Administrator"],
    "business": ["Marketing Manager", "Financial Analyst", "Human Resources Specialist", "Management Consultant"],
    "creative": ["Graphic Designer", "Content Writer", "Video Producer", "UI/UX Designer"]
}

# Functions for AI recommendation
def get_career_recommendations(skills, interests, experience_level):
    """
    Get career recommendations from Gemini based on user inputs
    """
    try:
        # Use the Gemini 2.0 Flash model
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        prompt = f"""You are a career counselor. Provide 3-5 career recommendations based on the skills, interests, and experience level provided.

For each career recommendation:
1. Start with a numbered title
2. Provide a detailed description section (3-4 lines)
3. Include a "Why it fits" section (3-4 lines)
4. Add a "How to prepare" section (3-4 lines)

Make each section detailed and informative, with 3-4 lines of content for each point.
        
Skills: {skills}
Interests: {interests}
Experience Level: {experience_level}"""
        
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Error with Gemini API: {e}")
        return "Unable to generate AI recommendations at this time. Please try again later."

def get_learning_resources(career_path):
    """
    Get learning resources for a specific career path
    """
    try:
        # Use the Gemini 2.0 Flash model
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        prompt = f"""You are a career counselor. Provide 3-5 detailed learning resources for someone interested in the specified career path.

For each resource:
1. Start with a numbered title (e.g., "1. Online Course: Python for Data Science")
2. Provide a detailed "Why it's great" section (3-4 lines) explaining the benefits and value of this resource
3. If applicable, include specific courses, books, or websites with brief descriptions (3-4 lines each)
4. For each specific recommendation, explain what topics it covers and why it's valuable (3-4 lines)

Make each section detailed and informative, with 3-4 lines of content for each point.
        
Career path: {career_path}"""
        
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Error with Gemini API: {e}")
        return "Unable to generate learning resources at this time. Please try again later."

# API Routes
@app.route('/api/assessment', methods=['POST'])
def api_assessment():
    try:
        data = request.json
        skills = data.get('skills', [])
        interests = data.get('interests', [])
        experience_level = data.get('experienceLevel', 'beginner')
        
        # Convert lists to comma-separated strings if needed
        if isinstance(skills, list):
            skills = ', '.join(skills)
        if isinstance(interests, list):
            interests = ', '.join(interests)
        
        # Get AI recommendations
        recommendations = get_career_recommendations(skills, interests, experience_level)
        
        return jsonify({
            "success": True,
            "recommendations": recommendations
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/resources', methods=['POST'])
def api_resources():
    try:
        data = request.json
        career = data.get('career', '')
        
        if not career:
            return jsonify({"success": False, "error": "Career path is required"}), 400
        
        resources = get_learning_resources(career)
        return jsonify({
            "success": True,
            "resources": resources
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/career-categories', methods=['GET'])
def api_career_categories():
    """Return the sample career categories as a reference"""
    return jsonify({
        "success": True,
        "categories": sample_careers
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
