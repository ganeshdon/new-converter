# Vercel serverless function entry point
from backend.server import app

# Export the FastAPI app for Vercel
def handler(request, response):
    return app(request, response)