#!/usr/bin/env python3
"""
Backend API Testing for PDF-to-Excel Converter Authentication System
Tests all authentication endpoints and user management functionality
"""

import requests
import json
import os
from datetime import datetime
import time

# Get backend URL from frontend .env file
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except FileNotFoundError:
        pass
    return "http://localhost:8001"

BASE_URL = get_backend_url()
API_URL = f"{BASE_URL}/api"

# Test data
TEST_USER = {
    "full_name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "confirm_password": "password123"
}

class TestResults:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.errors = []
        
    def log_pass(self, test_name):
        print(f"✅ PASS: {test_name}")
        self.passed += 1
        
    def log_fail(self, test_name, error):
        print(f"❌ FAIL: {test_name} - {error}")
        self.failed += 1
        self.errors.append(f"{test_name}: {error}")
        
    def summary(self):
        total = self.passed + self.failed
        print(f"\n{'='*60}")
        print(f"TEST SUMMARY: {self.passed}/{total} tests passed")
        if self.errors:
            print(f"\nFAILED TESTS:")
            for error in self.errors:
                print(f"  - {error}")
        print(f"{'='*60}")
        return self.failed == 0

def test_health_check(results):
    """Test basic API connectivity"""
    try:
        response = requests.get(f"{API_URL}/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get("message") == "Hello World":
                results.log_pass("Health Check - API is accessible")
                return True
            else:
                results.log_fail("Health Check", f"Unexpected response: {data}")
        else:
            results.log_fail("Health Check", f"Status code: {response.status_code}")
    except Exception as e:
        results.log_fail("Health Check", f"Connection error: {str(e)}")
    return False

def test_user_signup(results):
    """Test user signup endpoint"""
    try:
        # First, try to clean up any existing test user (ignore errors)
        try:
            login_response = requests.post(f"{API_URL}/auth/login", 
                json={"email": TEST_USER["email"], "password": TEST_USER["password"]})
            if login_response.status_code == 200:
                print("⚠️  Test user already exists, continuing with tests...")
                return login_response.json()
        except:
            pass
            
        response = requests.post(f"{API_URL}/auth/signup", json=TEST_USER, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            # Validate response structure
            required_fields = ["access_token", "token_type", "user"]
            for field in required_fields:
                if field not in data:
                    results.log_fail("User Signup", f"Missing field: {field}")
                    return None
                    
            # Validate user data
            user = data["user"]
            user_fields = ["id", "email", "full_name", "subscription_tier", "pages_remaining", "pages_limit"]
            for field in user_fields:
                if field not in user:
                    results.log_fail("User Signup", f"Missing user field: {field}")
                    return None
            
            # Validate specific values
            if user["email"] != TEST_USER["email"]:
                results.log_fail("User Signup", f"Email mismatch: {user['email']}")
                return None
                
            if user["full_name"] != TEST_USER["full_name"]:
                results.log_fail("User Signup", f"Name mismatch: {user['full_name']}")
                return None
                
            if user["subscription_tier"] != "daily_free":
                results.log_fail("User Signup", f"Wrong subscription tier: {user['subscription_tier']}")
                return None
                
            if user["pages_remaining"] != 7:
                results.log_fail("User Signup", f"Wrong pages remaining: {user['pages_remaining']}")
                return None
                
            if user["pages_limit"] != 7:
                results.log_fail("User Signup", f"Wrong pages limit: {user['pages_limit']}")
                return None
                
            if data["token_type"] != "bearer":
                results.log_fail("User Signup", f"Wrong token type: {data['token_type']}")
                return None
                
            results.log_pass("User Signup - All validations passed")
            return data
            
        elif response.status_code == 400:
            error_detail = response.json().get("detail", "Unknown error")
            if "Email already registered" in error_detail:
                # User already exists, try to login instead
                login_response = requests.post(f"{API_URL}/auth/login", 
                    json={"email": TEST_USER["email"], "password": TEST_USER["password"]})
                if login_response.status_code == 200:
                    results.log_pass("User Signup - User already exists, using existing account")
                    return login_response.json()
                else:
                    results.log_fail("User Signup", f"User exists but login failed: {login_response.status_code}")
            else:
                results.log_fail("User Signup", f"Bad request: {error_detail}")
        else:
            results.log_fail("User Signup", f"Status code: {response.status_code}, Response: {response.text}")
            
    except Exception as e:
        results.log_fail("User Signup", f"Exception: {str(e)}")
    
    return None

def test_user_login(results):
    """Test user login endpoint"""
    try:
        login_data = {
            "email": TEST_USER["email"],
            "password": TEST_USER["password"]
        }
        
        response = requests.post(f"{API_URL}/auth/login", json=login_data, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            # Validate response structure (same as signup)
            required_fields = ["access_token", "token_type", "user"]
            for field in required_fields:
                if field not in data:
                    results.log_fail("User Login", f"Missing field: {field}")
                    return None
                    
            # Validate token type
            if data["token_type"] != "bearer":
                results.log_fail("User Login", f"Wrong token type: {data['token_type']}")
                return None
                
            # Validate user email
            if data["user"]["email"] != TEST_USER["email"]:
                results.log_fail("User Login", f"Email mismatch: {data['user']['email']}")
                return None
                
            results.log_pass("User Login - Successful authentication")
            return data
            
        elif response.status_code == 401:
            results.log_fail("User Login", "Invalid credentials")
        else:
            results.log_fail("User Login", f"Status code: {response.status_code}, Response: {response.text}")
            
    except Exception as e:
        results.log_fail("User Login", f"Exception: {str(e)}")
    
    return None

def test_user_profile(results, token):
    """Test user profile endpoint with JWT token"""
    if not token:
        results.log_fail("User Profile", "No token available")
        return None
        
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{API_URL}/user/profile", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            # Validate profile data
            required_fields = ["id", "email", "full_name", "subscription_tier", "pages_remaining", "pages_limit"]
            for field in required_fields:
                if field not in data:
                    results.log_fail("User Profile", f"Missing field: {field}")
                    return None
                    
            # Validate email matches
            if data["email"] != TEST_USER["email"]:
                results.log_fail("User Profile", f"Email mismatch: {data['email']}")
                return None
                
            results.log_pass("User Profile - Successfully retrieved with valid token")
            return data
            
        elif response.status_code == 401:
            results.log_fail("User Profile", "Unauthorized - token validation failed")
        else:
            results.log_fail("User Profile", f"Status code: {response.status_code}, Response: {response.text}")
            
    except Exception as e:
        results.log_fail("User Profile", f"Exception: {str(e)}")
    
    return None

def test_pages_check(results, token):
    """Test pages check endpoint"""
    if not token:
        results.log_fail("Pages Check", "No token available")
        return None
        
    try:
        headers = {"Authorization": f"Bearer {token}"}
        check_data = {"page_count": 3}
        
        response = requests.post(f"{API_URL}/user/pages/check", 
                               json=check_data, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            # Validate response structure
            required_fields = ["can_convert", "pages_remaining", "pages_limit", "message"]
            for field in required_fields:
                if field not in data:
                    results.log_fail("Pages Check", f"Missing field: {field}")
                    return None
                    
            # For new user, should be able to convert 3 pages
            if not data["can_convert"]:
                results.log_fail("Pages Check", f"Should be able to convert 3 pages, but can_convert is False")
                return None
                
            # Should have 7 pages remaining for new daily free user
            if data["pages_remaining"] != 7:
                results.log_fail("Pages Check", f"Expected 7 pages remaining, got {data['pages_remaining']}")
                return None
                
            if data["pages_limit"] != 7:
                results.log_fail("Pages Check", f"Expected 7 pages limit, got {data['pages_limit']}")
                return None
                
            results.log_pass("Pages Check - Credit system working correctly")
            return data
            
        elif response.status_code == 401:
            results.log_fail("Pages Check", "Unauthorized - token validation failed")
        else:
            results.log_fail("Pages Check", f"Status code: {response.status_code}, Response: {response.text}")
            
    except Exception as e:
        results.log_fail("Pages Check", f"Exception: {str(e)}")
    
    return None

def test_documents_endpoint(results, token):
    """Test documents listing endpoint"""
    if not token:
        results.log_fail("Documents List", "No token available")
        return None
        
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{API_URL}/documents", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            # Should be a list (empty for new user)
            if not isinstance(data, list):
                results.log_fail("Documents List", f"Expected list, got {type(data)}")
                return None
                
            # For new user, should be empty
            if len(data) == 0:
                results.log_pass("Documents List - Empty list for new user (correct)")
            else:
                results.log_pass(f"Documents List - Found {len(data)} documents")
                
            return data
            
        elif response.status_code == 401:
            results.log_fail("Documents List", "Unauthorized - token validation failed")
        else:
            results.log_fail("Documents List", f"Status code: {response.status_code}, Response: {response.text}")
            
    except Exception as e:
        results.log_fail("Documents List", f"Exception: {str(e)}")
    
    return None

def test_invalid_token(results):
    """Test endpoints with invalid token"""
    try:
        headers = {"Authorization": "Bearer invalid-token-here"}
        response = requests.get(f"{API_URL}/user/profile", headers=headers, timeout=10)
        
        if response.status_code == 401:
            results.log_pass("Invalid Token - Properly rejected")
        else:
            results.log_fail("Invalid Token", f"Expected 401, got {response.status_code}")
            
    except Exception as e:
        results.log_fail("Invalid Token", f"Exception: {str(e)}")

def test_missing_token(results):
    """Test endpoints without token"""
    try:
        response = requests.get(f"{API_URL}/user/profile", timeout=10)
        
        if response.status_code == 401 or response.status_code == 403:
            results.log_pass("Missing Token - Properly rejected")
        else:
            results.log_fail("Missing Token", f"Expected 401/403, got {response.status_code}")
            
    except Exception as e:
        results.log_fail("Missing Token", f"Exception: {str(e)}")

def main():
    """Run all authentication tests"""
    print("🚀 Starting Backend Authentication Tests")
    print(f"Testing API at: {API_URL}")
    print("="*60)
    
    results = TestResults()
    
    # Test 1: Health check
    if not test_health_check(results):
        print("❌ API is not accessible. Stopping tests.")
        return False
    
    # Test 2: User signup
    signup_data = test_user_signup(results)
    if not signup_data:
        print("❌ Signup failed. Stopping tests.")
        return False
    
    token = signup_data.get("access_token")
    
    # Test 3: User login (separate from signup)
    login_data = test_user_login(results)
    if login_data:
        # Use login token for subsequent tests
        token = login_data.get("access_token")
    
    # Test 4: User profile with valid token
    test_user_profile(results, token)
    
    # Test 5: Pages check
    test_pages_check(results, token)
    
    # Test 6: Documents endpoint
    test_documents_endpoint(results, token)
    
    # Test 7: Invalid token handling
    test_invalid_token(results)
    
    # Test 8: Missing token handling
    test_missing_token(results)
    
    # Print summary
    success = results.summary()
    
    if success:
        print("🎉 All authentication tests passed!")
    else:
        print("⚠️  Some tests failed. Check the details above.")
    
    return success

if __name__ == "__main__":
    main()