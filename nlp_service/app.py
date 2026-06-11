import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from summarizer import summarize_text # Assuming summarizer.py contains the core summarization logic

app = Flask(__name__)

# --- Configuration ---
# Load CORS origins from environment variable.
# In a production microservice setup, this should be explicitly set to the URL(s)
# of the frontend client (e.g., http://localhost:3000 for development, or the deployed client URL).
# For broader interconnectedness, it might also include other service URLs if they
# directly consume this API (e.g., a "Collaborative Code Editor" needing summarization).
CORS_ORIGIN = os.getenv('CORS_ORIGIN', '*') # Default to '*' for development, restrict in production
CORS(app, resources={r"/*": {"origins": CORS_ORIGIN}})

# --- Health Check Endpoint ---
@app.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint to ensure the NLP service is running and responsive.
    This is useful for container orchestration (e.g., Docker, Kubernetes)
    and for other services (like the main Node.js backend) to verify connectivity.
    """
    return jsonify({
        "status": "healthy",
        "service": "AI-Powered Content Summarizer NLP Service",
        "version": "1.0.0" # Add a version for better service management
    }), 200

# --- Summarization Endpoint ---
@app.route('/summarize', methods=['POST'])
def summarize():
    """
    API endpoint to summarize a given text or content fetched from a URL.
    It expects a JSON payload with either 'text' or 'url', and optional
    parameters for summary length ('length' or 'ratio').

    Request Body Example:
    {
        "text": "This is a very long piece of text that needs to be summarized...",
        "length": "short" // or "medium", "long"
    }
    OR
    {
        "url": "https://example.com/article-to-summarize",
        "ratio": 0.3 // Summarize to 30% of original length
    }
    """
    try:
        data = request.get_json()
    except Exception:
        return jsonify({"error": "Invalid JSON payload"}), 400

    if not data:
        return jsonify({"error": "Request payload is empty or not valid JSON"}), 400

    text_content = data.get('text')
    url = data.get('url')
    summary_length = data.get('length', 'medium') # Default to 'medium'
    summary_ratio = data.get('ratio')

    if not text_content and not url:
        return jsonify({"error": "Missing 'text' or 'url' in the request payload. One must be provided."}), 400

    try:
        # Call the summarization logic from summarizer.py
        summary = summarize_text(
            text_content=text_content,
            url=url,
            length=summary_length,
            ratio=summary_ratio
        )
        return jsonify({"summary": summary}), 200
    except ValueError as e:
        # Handle specific validation errors from the summarizer (e.g., invalid length parameter)
        app.logger.warning(f"Summarization input error: {e}")
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        # Catch any unexpected errors during summarization
        app.logger.error(f"An unexpected error occurred during summarization: {e}", exc_info=True)
        return jsonify({"error": "An internal server error occurred during summarization. Please try again later."}), 500

# --- Main execution block ---
if __name__ == '__main__':
    # Get the port from environment variable, default to 5001.
    # This port is distinct from the main Node.js backend (e.g., 5000)
    # and the client (e.g., 3000), reflecting a microservice architecture.
    port = int(os.getenv('NLP_SERVICE_PORT', 5001))
    # Enable debug mode based on environment variable.
    # Set FLASK_DEBUG=True for development, False for production.
    debug_mode = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug_mode)