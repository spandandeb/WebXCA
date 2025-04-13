from flask import Flask, request, jsonify
import os
import datetime
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai
from pymongo import MongoClient
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import time

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure app
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "your-secret-key")
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "jwt-secret-key")

# Initialize extensions
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# MongoDB Configuration - using direct PyMongo client instead of Flask-PyMongo
mongo_uri = os.getenv("MONGO_URI")
if not mongo_uri:
    mongo_uri = "mongodb://localhost:27017/"
    print(f"Warning: Using default MongoDB URI: {mongo_uri}")
else:
    print(f"Using configured MongoDB URI from environment: {mongo_uri}")

# Initialize MongoDB with retry logic
mongo_client = None
db = None
max_retries = 3

for attempt in range(max_retries):
    try:
        print(f"Attempting to connect to MongoDB (attempt {attempt+1})...")
        mongo_client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        # Force a connection to verify it works
        mongo_client.admin.command('ping')
        db = mongo_client.career_counselor  # Use your database name here
        print("MongoDB connection successful!")
        break
    except Exception as e:
        print(f"MongoDB connection attempt {attempt+1} failed: {e}")
        if attempt < max_retries - 1:
            print(f"Retrying in 3 seconds...")
            time.sleep(3)
        else:
            print("Failed to connect to MongoDB after multiple attempts")
            mongo_client = None
            db = None

# Initialize database collections
def init_db():
    if mongo_client is not None:
        try:
            collection_names = mongo_client.career_counselor.list_collection_names()
            if 'users' not in collection_names:
                mongo_client.career_counselor.create_collection('users')
                print("Users collection created successfully")
            else:
                print("Users collection already exists")
        except Exception as e:
            print(f"Database initialization error: {e}")
    else:
        print("Cannot initialize database - MongoDB connection not established")

# Only initialize if mongo connection was successful
if mongo_client is not None:
    init_db()
else:
    print("Skipping database initialization due to connection failure")

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("Warning: GEMINI_API_KEY not set. AI features will not function.")

# Authentication routes with improved error handling
@app.route('/api/register', methods=['POST'])
def register():
    try:
        # Check if MongoDB is connected
        if mongo_client is None:
            return jsonify({"success": False, "error": "Database connection is not available"}), 500
        
        data = request.json
        # Check if required fields are present
        if not all(k in data for k in ["username", "email", "password"]):
            return jsonify({"success": False, "error": "Missing required fields"}), 400
        
        # Check if user already exists
        existing_user = db.users.find_one({"email": data["email"]})
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
        db.users.insert_one(new_user)
        
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
        print(f"Registration error: {e}")
        return jsonify({"success": False, "error": f"Database error: {str(e)}"}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        # Check if MongoDB is connected
        if mongo_client is None:
            return jsonify({"success": False, "error": "Database connection is not available"}), 500
        
        data = request.json
        # Check if required fields are present
        if not all(k in data for k in ["email", "password"]):
            return jsonify({"success": False, "error": "Missing required fields"}), 400
        
        # Find user by email
        user = db.users.find_one({"email": data["email"]})
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
        print(f"Login error: {e}")
        return jsonify({"success": False, "error": f"Database error: {str(e)}"}), 500

@app.route('/api/user', methods=['GET'])
@jwt_required()
def get_user():
    try:
        # Check if MongoDB is connected
        if mongo_client is None:
            return jsonify({"success": False, "error": "Database connection is not available"}), 500
        
        # Get user email from JWT
        current_user_email = get_jwt_identity()
        
        # Find user by email
        user = db.users.find_one({"email": current_user_email})
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
        print(f"Get user error: {e}")
        return jsonify({"success": False, "error": f"Database error: {str(e)}"}), 500

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
        if not GEMINI_API_KEY:
            return "AI recommendations unavailable - API key not configured"
            
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
        if not GEMINI_API_KEY:
            return "AI recommendations unavailable - API key not configured"
            
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
        print(f"Assessment API error: {e}")
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
        print(f"Resources API error: {e}")
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

# Health check endpoint to verify the app is running
@app.route('/api/health', methods=['GET'])
def health_check():
    db_status = "Connected" if mongo_client is not None else "Not connected"
    mongo_uri_masked = "Set (hidden for security)" if os.getenv("MONGO_URI") else "Not set"
    return jsonify({
        "status": "ok",
        "mongodb": db_status,
        "mongo_uri": mongo_uri_masked,
        "gemini_api": "Configured" if GEMINI_API_KEY else "Not configured"
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)