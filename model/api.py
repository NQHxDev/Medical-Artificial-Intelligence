# api.py
import os
from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
import joblib
from flask_cors import CORS

model_path = os.path.join(os.path.dirname(__file__), 'heart_disease_model.pkl')

app = Flask(__name__)
CORS(app)

try:
    model_data = joblib.load(model_path)
    model = model_data['model']
    feature_names = model_data['feature_names']
    print(f"Mô hình đã được tải thành công từ {model_path}!")
except FileNotFoundError:
    print(f"Không tìm thấy mô hình tại {model_path}. Vui lòng chạy train_model.py trước.")
    model = None

def convert_symptoms_to_features(symptoms_text, age, gender, symptom_duration):
    # Đây là phần xử lý ngôn ngữ tự nhiên đơn giản
    # Trong thực tế, bạn có thể dùng NLP để trích xuất features

    # Khởi tạo dictionary với giá trị mặc định
    features = {
        'Age': age,
        'Sex': 'M' if gender.lower() in ['nam', 'male', 'm'] else 'F',
        'ChestPainType': 'ASY',  # Mặc định
        'RestingBP': 120,  # Giá trị trung bình
        'Cholesterol': 200,  # Giá trị trung bình
        'FastingBS': 0,
        'RestingECG': 'Normal',
        'MaxHR': 150 - (age - 30) // 10 * 5,  # Ước lượng dựa trên tuổi
        'ExerciseAngina': 'N',
        'Oldpeak': 0.0,
        'ST_Slope': 'Flat'
    }

    # Phân tích triệu chứng từ text
    symptoms = symptoms_text.lower()

    # Xác định ChestPainType dựa trên mô tả
    if 'đau ngực' in symptoms or 'chest pain' in symptoms:
        if 'gắng sức' in symptoms or 'exercise' in symptoms:
            features['ExerciseAngina'] = 'Y'
        if 'nghỉ ngơi' in symptoms or 'rest' in symptoms:
            features['ChestPainType'] = 'TA'
        elif 'lan tỏa' in symptoms or 'radiating' in symptoms:
            features['ChestPainType'] = 'ATA'
        else:
            features['ChestPainType'] = 'NAP'

    # Xác định các chỉ số khác dựa trên triệu chứng
    if 'khó thở' in symptoms or 'shortness of breath' in symptoms:
        features['MaxHR'] = max(60, features['MaxHR'] - 20)

    if 'mệt mỏi' in symptoms or 'fatigue' in symptoms:
        features['MaxHR'] = max(60, features['MaxHR'] - 10)

    if 'chóng mặt' in symptoms or 'dizziness' in symptoms:
        features['RestingBP'] = min(180, features['RestingBP'] + 20)

    if 'tiểu đường' in symptoms or 'diabetes' in symptoms:
        features['FastingBS'] = 1
        features['Cholesterol'] = 240

    if 'huyết áp cao' in symptoms or 'hypertension' in symptoms:
        features['RestingBP'] = 160
        features['Cholesterol'] = 250

    if 'thời gian' in symptoms or 'duration' in symptoms:
        # Điều chỉnh dựa trên thời gian triệu chứng
        if symptom_duration > 30:  # hơn 30 ngày
            features['Oldpeak'] = 1.5
            features['ST_Slope'] = 'Down'
        elif symptom_duration > 7:  # hơn 7 ngày
            features['Oldpeak'] = 0.5
            features['ST_Slope'] = 'Flat'

    # Điều chỉnh theo độ tuổi
    if age > 60:
        features['Cholesterol'] = min(300, features['Cholesterol'] + 30)
        features['RestingBP'] = min(180, features['RestingBP'] + 10)
    elif age > 40:
        features['Cholesterol'] = min(280, features['Cholesterol'] + 20)

    return features

@app.route('/predict', methods=['POST'])
def predict():
    """
    API endpoint để dự đoán bệnh tim
    """
    if model is None:
        return jsonify({
            'error': 'Mô hình chưa được huấn luyện. Vui lòng train model trước.'
        }), 503

    try:
        # Nhận dữ liệu từ request
        data = request.json

        symptoms_text = data.get('symptoms', '')
        age = int(data.get('age', 40))
        gender = data.get('gender', 'nam')
        symptom_duration = int(data.get('symptom_duration', 0))  # số ngày

        # Chuyển đổi triệu chứng thành features
        features_dict = convert_symptoms_to_features(
            symptoms_text, age, gender, symptom_duration
        )

        # Tạo DataFrame từ features
        input_df = pd.DataFrame([features_dict])

        # Đảm bảo thứ tự cột giống như khi huấn luyện
        input_df = pd.DataFrame([features_dict])

        # Dự đoán trực tiếp bằng pipeline
        prediction = model.predict(input_df)[0]
        prediction_proba = model.predict_proba(input_df)[0]

        # Tính feature importance cho dự đoán này
        try:
            # Lấy feature importance từ Random Forest
            importances = model.named_steps['classifier'].feature_importances_

            # Lấy tên features sau khi one-hot encoding
            preprocessor = model.named_steps['preprocessor']

            # Lấy tên các features
            feature_names_after = []
            for name, transformer, cols in preprocessor.transformers_:
                if hasattr(transformer, 'get_feature_names_out'):
                    if name == 'cat':
                        # Cho one-hot encoded features
                        cat_features = transformer.named_steps['onehot'].get_feature_names_out(cols)
                        feature_names_after.extend(cat_features)
                    else:
                        feature_names_after.extend(cols)
                else:
                    feature_names_after.extend(cols)

            # Tạo dictionary feature importance
            feature_importance_dict = dict(zip(feature_names_after[:len(importances)], importances))

            # Sắp xếp theo importance
            top_features = sorted(
                feature_importance_dict.items(),
                key=lambda x: x[1],
                reverse=True
            )[:5]  # Lấy 5 features quan trọng nhất

        except:
            top_features = []

        # Tạo response
        result = {
            'prediction': int(prediction),
            'probability': float(prediction_proba[1] if prediction == 1 else prediction_proba[0]),
            'risk_level': 'CAO' if prediction == 1 else 'THẤP',
            'message': 'CÓ nguy cơ mắc bệnh tim' if prediction == 1 else 'KHÔNG có nguy cơ mắc bệnh tim',
            'features_used': features_dict,
            'important_factors': [
                {'feature': feat, 'importance': round(imp, 4)}
                for feat, imp in top_features
            ],
            'recommendations': get_recommendations(prediction, features_dict)
        }

        return jsonify(result)

    except Exception as e:
        return jsonify({
            'error': str(e),
            'message': 'Có lỗi xảy ra khi xử lý yêu cầu'
        }), 400

def get_recommendations(prediction, features):
    """
    Tạo khuyến nghị dựa trên kết quả dự đoán
    """
    recommendations = []

    if prediction == 1:
        recommendations.append("Cần thăm khám bác sĩ tim mạch ngay")
        recommendations.append("Thực hiện điện tâm đồ (ECG) và siêu âm tim")

        if features['RestingBP'] > 140:
            recommendations.append("Kiểm soát huyết áp: giảm muối, tập thể dục nhẹ")

        if features['Cholesterol'] > 200:
            recommendations.append("Chế độ ăn ít chất béo, nhiều rau xanh")

        if features['ExerciseAngina'] == 'Y':
            recommendations.append("Tránh gắng sức đột ngột, nghỉ ngơi hợp lý")
    else:
        recommendations.append("Duy trì lối sống lành mạnh")
        recommendations.append("Khám sức khỏe định kỳ 6 tháng/lần")

        if features['Age'] > 40:
            recommendations.append("Tầm soát tim mạch định kỳ")

        if features['FastingBS'] == 1:
            recommendations.append("Kiểm soát đường huyết thường xuyên")

    return recommendations

@app.route('/health', methods=['GET'])
def health_check():
    """Endpoint để kiểm tra tình trạng API"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'api_version': '1.0'
    })

if __name__ == '__main__':
    print("Khởi động API Heart Disease Prediction...")
    print("URL: http://localhost:5000")
    print("Endpoint: POST /predict")
    print("Endpoint: GET /health")
    app.run(debug=True, host='0.0.0.0', port=5000)
