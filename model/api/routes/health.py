from flask import Blueprint, jsonify
from extensions import model

health_bp = Blueprint("health", __name__)

@health_bp.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None,
        "api_version": "2.0-nlp"
    })
