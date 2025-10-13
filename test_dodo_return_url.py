#!/usr/bin/env python3
"""
Focused test for Dodo Payments Return URL verification
Tests that NEW subscriptions use the production domain instead of localhost
"""

import requests
import json
import os
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

# Test user credentials
TEST_USER = {
    "email": "test@example.com",
    "password": "password123"
}

def get_auth_token():
    """Get authentication token for testing"""
    try:
        # Try to login with existing user
        response = requests.post(f"{API_URL}/auth/login", json=TEST_USER, timeout=10)
        if response.status_code == 200:
            data = response.json()
            return data.get("access_token")
        else:
            print(f"❌ Login failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Login error: {str(e)}")
        return None

def test_dodo_return_url():
    """Test that Dodo Payments uses the correct production return URL"""
    print("🎯 Testing Dodo Payments Return URL Configuration")
    print("=" * 60)
    
    # Get authentication token
    token = get_auth_token()
    if not token:
        print("❌ Failed to get authentication token")
        return False
    
    print("✅ Authentication successful")
    
    # Create a NEW subscription to test return URL
    headers = {"Authorization": f"Bearer {token}"}
    test_data = {"package_id": "professional", "billing_interval": "annual"}
    
    print(f"📝 Creating NEW Dodo subscription...")
    
    try:
        response = requests.post(f"{API_URL}/dodo/create-subscription", 
                               json=test_data, headers=headers, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            session_id = data.get("session_id", "")
            checkout_url = data.get("checkout_url", "")
            
            print(f"✅ Subscription created successfully")
            print(f"   Session ID: {session_id}")
            print(f"   Checkout URL: {checkout_url}")
            
            # Wait for logs to be written
            time.sleep(3)
            
            # Check backend logs for return URL
            print(f"🔍 Checking backend logs for return URL...")
            
            try:
                log_result = os.popen("tail -n 10 /var/log/supervisor/backend.err.log | grep 'Using return URL'").read()
                
                expected_return_url = "https://yourbankstatementconverter.com/dashboard?payment=success"
                localhost_url = "http://localhost:3000/dashboard?payment=success"
                
                print(f"📋 Log content:")
                if log_result.strip():
                    for line in log_result.strip().split('\n'):
                        print(f"   {line}")
                else:
                    print("   No 'Using return URL' messages found in recent logs")
                
                if expected_return_url in log_result:
                    print(f"✅ SUCCESS: Found correct production return URL in logs!")
                    print(f"   Expected: {expected_return_url}")
                    
                    if localhost_url in log_result:
                        print(f"⚠️  WARNING: Also found localhost URL - this should not happen")
                        return False
                    
                    return True
                    
                elif localhost_url in log_result:
                    print(f"❌ FAILURE: Found localhost return URL instead of production URL")
                    print(f"   Found: {localhost_url}")
                    print(f"   Expected: {expected_return_url}")
                    return False
                    
                elif "Using return URL" in log_result:
                    print(f"❌ FAILURE: Found return URL message but not the expected production URL")
                    return False
                    
                else:
                    print(f"❌ FAILURE: No 'Using return URL' message found in backend logs")
                    return False
                    
            except Exception as log_error:
                print(f"❌ Failed to check backend logs: {str(log_error)}")
                return False
                
        else:
            error_detail = ""
            try:
                error_data = response.json()
                error_detail = error_data.get("detail", "")
            except:
                error_detail = response.text
                
            print(f"❌ Failed to create subscription: {response.status_code} - {error_detail}")
            return False
            
    except Exception as e:
        print(f"❌ Exception during subscription creation: {str(e)}")
        return False

def main():
    """Run the focused Dodo return URL test"""
    print("🚀 Dodo Payments Return URL Verification Test")
    print(f"Testing against: {BASE_URL}")
    print("=" * 60)
    
    success = test_dodo_return_url()
    
    print("\n" + "=" * 60)
    if success:
        print("🎉 TEST PASSED: Dodo Payments is using the correct production return URL!")
    else:
        print("❌ TEST FAILED: Dodo Payments is NOT using the correct production return URL!")
    print("=" * 60)
    
    return success

if __name__ == "__main__":
    main()