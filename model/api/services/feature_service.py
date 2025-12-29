from nlp_processor import HeartDiseaseNLPExtractor

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
