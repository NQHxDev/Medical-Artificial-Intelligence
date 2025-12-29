import os
import json
from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
import joblib
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

from model.nlp_processor import HeartDiseaseNLPExtractor
from api.services import generate_missing_info_message

model_path = os.path.join(os.path.dirname(__file__), 'heart_disease_model.pkl')

try:
   model_data = joblib.load(model_path)
   model = model_data['model']
   feature_names = model_data['feature_names']
   print(f"Mô hình đã được tải thành công từ {model_path}!")
except FileNotFoundError:
   print(f"Không tìm thấy mô hình tại {model_path}. Vui lòng chạy train_model.py trước.")
   model = None

# Khởi tạo NLP extractor
nlp_extractor = HeartDiseaseNLPExtractor()

def convert_symptoms_to_features_nlp(symptoms_text, age = None, gender=None, symptom_duration=None):
   """
   Chuyển đổi triệu chứng thành features bằng NLP
   """
   # Tạo context text từ các tham số
   context_parts = []

   if symptoms_text:
      context_parts.append(symptoms_text)

   if age is not None:
      context_parts.append(f"Tuổi: {age}")

   if gender is not None:
      context_parts.append(f"Giới tính: {gender}")

   if symptom_duration is not None:
      context_parts.append(f"Thời gian triệu chứng: {symptom_duration} ngày")

   full_text = ". ".join(context_parts)

   # Trích xuất features bằng NLP
   features, missing_features = nlp_extractor.extract_all_features(full_text)

   if age is not None:
      features['Age'] = int(age)

   if gender is not None:
      features['Sex'] = 1 if str(gender).lower() in ['nam', 'male', 'm', '1', 'true'] else 0

   # Điều chỉnh dựa trên thời gian triệu chứng
   if symptom_duration is not None:
      if symptom_duration > 30:
         features['Oldpeak'] = max(features.get('Oldpeak', 0), 1.5)
         features['ST_Slope'] = 2  # Down
      elif symptom_duration > 7:
         features['Oldpeak'] = max(features.get('Oldpeak', 0), 0.5)

   return features, missing_features

def get_missing_feature_questions(missing_features):
   """Tạo câu hỏi cho các features bị thiếu"""
   question_map = {
      'Cholesterol': "Chỉ số cholesterol của bạn hiện tại là bao nhiêu (mg/dL)?",
      'RestingBP': "Huyết áp lúc nghỉ của bạn là bao nhiêu (mmHg)?",
      'MaxHR': "Nhịp tim tối đa của bạn khi gắng sức là bao nhiêu (bpm)?",
      'RestingECG': "Kết quả điện tâm đồ gần đây của bạn thế nào? (bình thường/ST thay đổi/dày thất trái)",
      'Oldpeak': "Chỉ số ST depression (oldpeak) trên điện tâm đồ của bạn là bao nhiêu?",
      'FastingBS': "Bạn có bị tiểu đường hoặc đường huyết lúc đói cao không?",
      'ExerciseAngina': "Bạn có bị đau ngực khi gắng sức không?",
      'ChestPainType': "Bạn có bị đau ngực không? Nếu có, mô tả chi tiết hơn về cơn đau.",
      'Age': "Bạn bao nhiêu tuổi?",
      'Sex': "Giới tính của bạn là gì?"
   }

   questions = []
   for feature in missing_features:
      if feature in question_map:
         questions.append(question_map[feature])
      else:
         questions.append(f"Vui lòng cung cấp thông tin về {feature}")

   return questions

@app.route('/predict', methods=['POST'])
def predict():
   """
   API endpoint để dự đoán bệnh tim - Chỉ sử dụng NLP extractor
   """
   if model is None:
      return jsonify({
         'error': 'Mô hình chưa được huấn luyện. Vui lòng chạy train_model.py trước.'
      }), 503

   try:
      data = request.json

      # Lấy dữ liệu từ request
      symptoms_text = data.get('symptoms', '')
      age = data.get('age')
      gender = data.get('gender')
      symptom_duration = data.get('symptom_duration')

      # Trích xuất features bằng NLP
      features_dict, missing_features = convert_symptoms_to_features_nlp(
         symptoms_text, age, gender, symptom_duration
      )

      # Kiểm tra nếu thiếu thông tin quan trọng
      critical_features = ['Age', 'Sex', 'Cholesterol', 'RestingBP', 'MaxHR', 'FastingBS', 'ChestPainType']
      missing_critical = [f for f in critical_features if f in missing_features]

      if missing_critical:
         progress = round((len(features_dict) / 11) * 100)

         return jsonify({
            'status': 'need_more_info',
            'message': generate_missing_info_message(
               missing_critical,
               progress
            ),
            'missing_features': missing_critical,
            'questions': get_missing_feature_questions(missing_critical),
            'partial_features': features_dict,
            'progress_percentage': progress
         }), 200

      # Chuẩn bị dữ liệu cho mô hình
      # Tạo DataFrame với đúng thứ tự features
      expected_features = [
         'Age', 'Sex', 'ChestPainType', 'RestingBP', 'Cholesterol',
         'FastingBS', 'RestingECG', 'MaxHR', 'ExerciseAngina',
         'Oldpeak', 'ST_Slope'
      ]

      # Đảm bảo tất cả features đều có giá trị
      for feature in expected_features:
         if feature not in features_dict:
            features_dict[feature] = nlp_extractor.default_values[feature]

      # Tạo DataFrame theo đúng thứ tự
      input_data = pd.DataFrame([features_dict])[expected_features]

      # Dự đoán
      prediction = model.predict(input_data)[0]
      prediction_proba = model.predict_proba(input_data)[0]

      # Tính feature importance (nếu có)
      try:
         if hasattr(model, 'named_steps'):
            importances = model.named_steps['classifier'].feature_importances_

            # Lấy tên features sau preprocessing
            preprocessor = model.named_steps['preprocessor']
            feature_names_after = []

            for name, transformer, cols in preprocessor.transformers_:
               if hasattr(transformer, 'get_feature_names_out'):
                  if name == 'cat':
                     cat_features = transformer.named_steps['onehot'].get_feature_names_out(cols)
                     feature_names_after.extend(cat_features)
                  else:
                     feature_names_after.extend(cols)
               else:
                  feature_names_after.extend(cols)

            # Tạo dictionary importance
            feature_importance_dict = dict(zip(feature_names_after[:len(importances)], importances))

            # Lấy 5 features quan trọng nhất
            top_features = sorted(
               feature_importance_dict.items(),
               key=lambda x: x[1],
               reverse=True
            )[:5]

            # Chuyển đổi tên features về dạng dễ đọc
            readable_features = []
            for feat, imp in top_features:
               # Chuyển one-hot encoded features về dạng gốc
               if '_' in feat:
                  base_feature = feat.split('_')[0]
                  readable_features.append({
                     'feature': base_feature,
                     'importance': round(imp, 4),
                     'detail': feat
                  })
               else:
                  readable_features.append({
                     'feature': feat,
                     'importance': round(imp, 4)
                  })

            top_features_readable = readable_features
         else:
               top_features_readable = []

      except Exception as e:
         print(f"Error getting feature importance: {e}")
         top_features_readable = []

      # Tạo response
      result = {
         'prediction': int(prediction),
         'probability': float(prediction_proba[1] if prediction == 1 else prediction_proba[0]),
         'risk_level': 'CAO' if prediction == 1 else 'THẤP',
         'confidence': 'cao' if max(prediction_proba) > 0.8 else 'trung bình' if max(prediction_proba) > 0.6 else 'thấp',
         'message': 'CÓ nguy cơ mắc bệnh tim. Nên thăm khám bác sĩ chuyên khoa tim mạch.' if prediction == 1 else 'KHÔNG có nguy cơ mắc bệnh tim. Duy trì lối sống lành mạnh.',
         'features_used': features_dict,
         'important_factors': top_features_readable,
         'recommendations': get_recommendations(prediction, features_dict),
         'next_steps': get_next_steps(prediction, features_dict)
      }

      print("\n" + "=" * 40)
      print("📤 API RESPONSE /predict")
      print(json.dumps(result, ensure_ascii=False, indent=2))
      print("=" * 40 + "\n")

      return jsonify(result)

   except Exception as e:
      return jsonify({
         'error': str(e),
         'message': 'Có lỗi xảy ra khi xử lý yêu cầu'
      }), 400

def get_recommendations(prediction, features):
    """
    Tạo khuyến nghị dựa trên kết quả dự đoán và features
    """
    recommendations = []

    if prediction == 1:
        recommendations.append("🎯 Thăm khám bác sĩ tim mạch càng sớm càng tốt")
        recommendations.append("📋 Thực hiện điện tâm đồ (ECG) và siêu âm tim")

        if features.get('RestingBP', 0) > 140:
            recommendations.append("💊 Kiểm soát huyết áp: giảm muối, tập thể dục đều đặn")
            recommendations.append("🍎 Chế độ ăn DASH: nhiều rau củ, ít chất béo bão hòa")

        if features.get('Cholesterol', 0) > 200:
            recommendations.append("🥗 Giảm cholesterol: hạn chế đồ chiên xào, tăng chất xơ")
            recommendations.append("🏃 Vận động 30 phút mỗi ngày, 5 ngày/tuần")

        if features.get('ExerciseAngina', 0) == 1:
            recommendations.append("⚠️ Tránh gắng sức đột ngột, nghỉ ngơi khi đau ngực")
            recommendations.append("🚭 Bỏ thuốc lá nếu có hút")

        if features.get('FastingBS', 0) == 1:
            recommendations.append("🩸 Kiểm soát đường huyết: đo đường máu thường xuyên")
            recommendations.append("🍚 Hạn chế tinh bột đơn giản, ăn nhiều rau xanh")

    else:
        recommendations.append("✅ Duy trì lối sống lành mạnh hiện tại")
        recommendations.append("📅 Khám sức khỏe định kỳ 6-12 tháng/lần")

        if features.get('Age', 0) > 40:
            recommendations.append("👨‍⚕️ Tầm soát tim mạch định kỳ từ tuổi 40")

        if features.get('Cholesterol', 0) > 180:
            recommendations.append("🥑 Kiểm tra cholesterol thường xuyên, ăn nhiều omega-3")

        if features.get('RestingBP', 0) > 130:
            recommendations.append("🧘 Giảm căng thẳng, ngủ đủ 7-8 tiếng mỗi đêm")

    # Thêm khuyến nghị chung
    recommendations.append("💧 Uống đủ 2 lít nước mỗi ngày")
    recommendations.append("😊 Giữ tinh thần lạc quan, tránh stress")

    return recommendations

def get_next_steps(prediction, features):
    """
    Đề xuất các bước tiếp theo
    """
    if prediction == 1:
        return [
            "1. Đặt lịch hẹn với bác sĩ tim mạch",
            "2. Thực hiện các xét nghiệm: ECG, siêu âm tim, công thức máu",
            "3. Theo dõi huyết áp hàng ngày",
            "4. Ghi nhật ký triệu chứng nếu có đau ngực tái phát",
            "5. Liên hệ cấp cứu 115 nếu đau ngực dữ dội, khó thở"
        ]
    else:
        return [
            "1. Tiếp tục duy trì lối sống lành mạnh",
            "2. Tập thể dục đều đặn 150 phút/tuần",
            "3. Khám sức khỏe định kỳ",
            "4. Theo dõi cân nặng và vòng bụng",
            "5. Tiêm phòng cúm hàng năm để bảo vệ tim mạch"
        ]

@app.route('/analyze', methods=['POST'])
def analyze_symptoms():
    """
    Phân tích triệu chứng và trả về features đã trích xuất
    (Dùng để preview trước khi predict)
    """
    try:
        data = request.json
        symptoms_text = data.get('symptoms', '')
        age = data.get('age')
        gender = data.get('gender')
        symptom_duration = data.get('symptom_duration')

        # Trích xuất features
        features_dict, missing_features = convert_symptoms_to_features_nlp(
            symptoms_text, age, gender, symptom_duration
        )

        # Tính phần trăm hoàn thành
        total_features = 11
        completed_features = len(features_dict)
        progress = round((completed_features / total_features) * 100)

        # Tạo câu hỏi cho features missing
        questions = get_missing_feature_questions(missing_features)

        return jsonify({
            'status': 'analysis_complete',
            'features_extracted': features_dict,
            'missing_features': missing_features,
            'progress_percentage': progress,
            'questions_needed': questions,
            'message': f'Đã trích xuất được {completed_features}/{total_features} features ({progress}%)'
        })

    except Exception as e:
        return jsonify({
            'error': str(e),
            'message': 'Có lỗi xảy ra khi phân tích triệu chứng'
        }), 400

@app.route('/complete_features', methods=['POST'])
def complete_features():
    """
    Bổ sung thông tin cho features bị thiếu
    """
    try:
        data = request.json
        partial_features = data.get('partial_features', {})
        user_response = data.get('user_response', '')
        feature_to_update = data.get('feature_to_update', '')

        # Cập nhật features với thông tin mới
        if feature_to_update and user_response:
            updated_features = nlp_extractor.update_features_with_response(
                partial_features, user_response, feature_to_update
            )

            # Kiểm tra lại xem còn missing không
            _, still_missing = nlp_extractor.extract_all_features("")

            # Tính phần trăm hoàn thành
            total_features = 11
            completed = len([k for k in updated_features.keys() if updated_features[k] != nlp_extractor.default_values.get(k)])
            progress = round((completed / total_features) * 100)

            return jsonify({
                'status': 'updated',
                'updated_features': updated_features,
                'still_missing': still_missing,
                'progress_percentage': progress,
                'ready_for_prediction': len(still_missing) == 0,
                'message': f'Đã cập nhật thông tin {feature_to_update}. Hoàn thành {progress}%'
            })

        return jsonify({
            'error': 'Thiếu thông tin cần thiết'
        }), 400

    except Exception as e:
        return jsonify({
            'error': str(e),
            'message': 'Có lỗi xảy ra khi cập nhật features'
        }), 400

@app.route('/health', methods=['GET'])
def health_check():
   """Endpoint để kiểm tra tình trạng API"""
   return jsonify({
      'status': 'healthy',
      'model_loaded': model is not None,
      'nlp_ready': True,
      'api_version': '2.0-nlp',
      'endpoints': {
         'POST /predict': 'Dự đoán bệnh tim với NLP',
         'POST /analyze': 'Phân tích triệu chứng',
         'POST /complete_features': 'Bổ sung thông tin thiếu',
         'GET /health': 'Kiểm tra tình trạng API'
      }
   })

if __name__ == '__main__':
   print("=" * 60)
   print("Khởi động API Heart Disease Prediction với NLP")
   print("=" * 60)
   print("🚀 API version 2.0 - Natural Language Processing")
   print("📝 Endpoints:")
   print("   POST /predict     - Dự đoán bệnh tim từ văn bản")
   print("   POST /analyze     - Phân tích và trích xuất features")
   print("   POST /complete_features - Bổ sung thông tin thiếu")
   print("   GET  /health      - Kiểm tra tình trạng API")
   print("🌐 URL: http://localhost:5000")
   print("=" * 60)

   app.run(debug=True, host='0.0.0.0', port = 5000)
