from flask import Blueprint, request, jsonify
import pandas as pd

from extensions import model, nlp_extractor

from services.feature_service import convert_symptoms_to_features_nlp

from services.question_service import (
   get_missing_feature_questions,
   generate_missing_info_message
)

from services.recommendation_service import (
   get_recommendations,
   get_next_steps
)

predict_bp = Blueprint("predict", __name__)

@predict_bp.route("/predict", methods=["POST"])
def predict():
   if model is None:
      return jsonify({"error": "Model not loaded"}), 503

   data = request.json or {}

   features, missing = convert_symptoms_to_features_nlp(
      data.get("symptoms", ""),
      data.get("age"),
      data.get("gender"),
      data.get("symptom_duration")
   )

   critical = ['Age', 'Sex', 'Cholesterol', 'RestingBP', 'MaxHR']
   missing_critical = [f for f in critical if f in missing]

   SECONDARY_GROUPS = [
      ['ChestPainType', 'ExerciseAngina'],
      ['RestingECG', 'Oldpeak'],
      ['FastingBS'],
      ['ST_Slope']
   ]

   ask = []

   if missing_critical:
      ask = missing_critical
   else:
      for group in SECONDARY_GROUPS:
         group_missing = [f for f in group if f in missing]
         if group_missing:
            ask = group_missing
            break

   if ask:
      progress = round(len(features) / 11 * 100)
      return jsonify({
         "status": "need_more_info",
         "message": generate_missing_info_message(ask, progress),
         "questions": get_missing_feature_questions(ask),
         "partial_features": features,
         "progress_percentage": progress
      })

   expected = [
      'Age','Sex','ChestPainType','RestingBP','Cholesterol',
      'FastingBS','RestingECG','MaxHR','ExerciseAngina',
      'Oldpeak','ST_Slope'
   ]

   for f in expected:
      features.setdefault(f, nlp_extractor.default_values[f])

   df = pd.DataFrame([features])[expected]
   pred = model.predict(df)[0]
   prob = model.predict_proba(df)[0]

   risk_prob = prob[1]
   if risk_prob >= 0.75:
      risk_level = "Cao"
      message = "Nguy cơ mắc bệnh tim cao, cần đi khám sớm"
   elif risk_prob >= 0.5:
      risk_level = "Trung bình"
      message = "Có dấu hiệu nguy cơ, cần theo dõi và kiểm tra thêm"
   elif risk_prob >= 0.3:
      risk_level = "Thấp - Cần theo dõi"
      message = "Hiện tại nguy cơ chưa cao nhưng nên theo dõi định kỳ"
   else:
      risk_level = "Thấp"
      message = "Nguy cơ mắc bệnh tim thấp"

   return jsonify({
      "prediction": int(pred),
      "probability": float(prob[pred]),
      "risk_level": risk_level,
      "message": message,
      "recommendations": get_recommendations(pred, features),
      "next_steps": get_next_steps(pred, features)
   })
