from flask import Blueprint, request, jsonify
from extensions import nlp_extractor

complete_bp = Blueprint("complete", __name__)

@complete_bp.route("/complete_features", methods=["POST"])
def complete_features():
   data = request.json or {}

   updated = nlp_extractor.update_features_with_response(
      data.get("partial_features", {}),
      data.get("user_response", ""),
      data.get("feature_to_update", "")
   )

   return jsonify({
      "status": "updated",
      "updated_features": updated
   })
