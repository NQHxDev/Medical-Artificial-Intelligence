from flask import Blueprint, request, jsonify
from services.feature_service import convert_symptoms_to_features_nlp
from services.question_service import get_missing_feature_questions

analyze_bp = Blueprint("analyze", __name__)

@analyze_bp.route("/analyze", methods=["POST"])
def analyze():
   data = request.json or {}

   features, missing = convert_symptoms_to_features_nlp(
      data.get("symptoms", ""),
      data.get("age"),
      data.get("gender"),
      data.get("symptom_duration")
   )

   progress = round(len(features) / 11 * 100)

   return jsonify({
      "status": "analysis_complete",
      "features_extracted": features,
      "missing_features": missing,
      "questions_needed": get_missing_feature_questions(missing),
      "progress_percentage": progress
   })
