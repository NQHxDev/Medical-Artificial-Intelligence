import re
from typing import Dict, List, Any, Optional, Tuple
import numpy as np

class HeartDiseaseNLPExtractor:
   def __init__(self):
      # Từ điển triệu chứng và điều kiện y tế
      self.medical_vocab = {
         # Giới tính
         'gender_male': {
            'vi': ['nam', 'đàn ông', 'trai', 'con trai', 'ông'],
            'en': ['male', 'man', 'boy', 'gentleman']
         },
         'gender_female': {
            'vi': ['nữ', 'phụ nữ', 'con gái', 'bà', 'cô'],
            'en': ['female', 'woman', 'girl', 'lady']
         },

         # Loại đau ngực
         'chest_pain_ata': {
            'vi': ['lan tỏa', 'lan sang tay trái', 'lan lên cổ', 'lan ra sau lưng'],
            'en': ['radiating', 'spreading to left arm', 'radiates to jaw', 'radiates to back']
         },
         'chest_pain_ta': {
            'vi': ['nghỉ ngơi', 'khi nghỉ', 'lúc ngồi', 'ban đêm'],
            'en': ['at rest', 'resting', 'while sitting', 'nocturnal']
         },
         'chest_pain_nap': {
            'vi': ['đau nhói', 'đau như kim châm', 'đau ngắn', 'đau thoáng qua'],
            'en': ['sharp', 'stabbing', 'brief', 'transient']
         },

         # Triệu chứng
         'symptom_chest_pain': {
            'vi': ['đau ngực', 'tức ngực', 'đau tức ngực', 'đau vùng tim', 'nặng ngực'],
            'en': ['chest pain', 'chest discomfort', 'chest tightness', 'angina']
         },
         'symptom_breathlessness': {
            'vi': ['khó thở', 'thở gấp', 'hụt hơi', 'thở ngắn'],
            'en': ['shortness of breath', 'dyspnea', 'breathlessness']
         },
         'symptom_fatigue': {
            'vi': ['mệt mỏi', 'uể oải', 'kiệt sức', 'mệt'],
            'en': ['fatigue', 'tiredness', 'exhaustion', 'weakness']
         },
         'symptom_dizziness': {
            'vi': ['chóng mặt', 'hoa mắt', 'choáng váng', 'quay cuồng'],
            'en': ['dizziness', 'lightheadedness', 'vertigo']
         },
         'symptom_palpitations': {
            'vi': ['hồi hộp', 'trống ngực', 'tim đập nhanh', 'hẫng hụt'],
            'en': ['palpitations', 'heart racing', 'rapid heartbeat']
         },

         # Bệnh nền
         'comorbidity_hypertension': {
            'vi': ['cao huyết áp', 'huyết áp cao', 'tăng huyết áp'],
            'en': ['hypertension', 'high blood pressure', 'elevated blood pressure']
         },
         'comorbidity_diabetes': {
            'vi': ['tiểu đường', 'đái tháo đường'],
            'en': ['diabetes', 'diabetic']
         },
         'comorbidity_hyperlipidemia': {
            'vi': ['mỡ máu cao', 'cholesterol cao', 'rối loạn lipid'],
            'en': ['high cholesterol', 'hyperlipidemia', 'elevated lipids']
         },

         # ECG patterns
         'ecg_normal': {
            'vi': ['điện tâm đồ bình thường', 'ecg bình thường'],
            'en': ['normal ecg', 'normal electrocardiogram']
         },
         'ecg_stt': {
            'vi': ['st-t thay đổi', 'sóng t dẹt', 'st chênh'],
            'en': ['st-t changes', 't wave flattening', 'st depression']
         },
         'ecg_lvh': {
            'vi': ['dày thất trái', 'phì đại thất trái'],
            'en': ['left ventricular hypertrophy', 'lvh']
         },

         # Exercise angina
         'angina_yes': {
            'vi': ['gắng sức', 'khi tập thể dục', 'leo cầu thang', 'mang vác nặng'],
            'en': ['exercise', 'exertion', 'physical activity', 'climbing stairs']
         },

         # ST Slope
         'st_up': {
            'vi': ['dốc lên', 'đi lên'],
            'en': ['upsloping', 'rising']
         },
         'st_flat': {
            'vi': ['phẳng', 'nằm ngang'],
            'en': ['flat', 'horizontal']
         },
         'st_down': {
            'vi': ['dốc xuống', 'đi xuống'],
            'en': ['downsloping', 'descending']
         }
      }

      # Regex patterns cho số
      self.number_patterns = {
         'age': r'(?:tuổi|age|aged?)\s*(?:là|khoảng|:)?\s*(\d+)',
         'blood_pressure': r'(?:huyết áp|blood pressure|bp)\s*(?:là|khoảng|:)?\s*(\d+)(?:\s*/\s*\d+)?',
         'cholesterol': r'(?:cholesterol|mỡ máu|lipid)\s*(?:là|khoảng|:)?\s*(\d+)',
         'heart_rate': r'(?:nhịp tim|heart rate|hr)\s*(?:là|khoảng|nghỉ|resting)?\s*:?\s*(\d+)',
         'oldpeak': r'(?:oldpeak|st depression)\s*(?:là|khoảng|:)?\s*([\d.]+)',
         'duration': r'(?:triệu chứng|đau|bệnh)\s*(?:đã|kéo dài|:)?\s*(\d+)\s*(?:ngày|tuần|tháng|năm|day|week|month|year)',
         'generic_number': r'\b(\d+)\s*(?:mg/dl|mmol/l|mmHg|bpm)?\b'
      }

      # Mapping giá trị cho các feature
      self.value_mapping = {
         'Sex': {'M': 1, 'F': 0},
         'ChestPainType': {'TA': 0, 'ATA': 1, 'NAP': 2, 'ASY': 3},
         'RestingECG': {'Normal': 0, 'ST': 1, 'LVH': 2},
         'ExerciseAngina': {'N': 0, 'Y': 1},
         'ST_Slope': {'Up': 0, 'Flat': 1, 'Down': 2}
      }

      # Danh sách features bắt buộc và tùy chọn
      self.required_features = ['Age', 'Sex']
      self.optional_features = [
         'ChestPainType', 'RestingBP', 'Cholesterol', 'FastingBS',
         'RestingECG', 'MaxHR', 'ExerciseAngina', 'Oldpeak', 'ST_Slope'
      ]

      # Giá trị mặc định cho features missing
      self.default_values = {
         'Age': 50,
         'Sex': 1,  # Mặc định là nam
         'ChestPainType': 3,  # ASY
         'RestingBP': 120,
         'Cholesterol': 200,
         'FastingBS': 0,
         'RestingECG': 0,  # Normal
         'MaxHR': 150,
         'ExerciseAngina': 0,  # N
         'Oldpeak': 0.0,
         'ST_Slope': 1  # Flat
      }

   def extract_all_features(self, text: str) -> Tuple[Dict[str, Any], List[str]]:
      """
      Trích xuất tất cả features từ văn bản

      Returns:
         Tuple[features_dict, missing_features]
      """
      features = {}
      text_lower = text.lower()

      # 1. Trích xuất tuổi
      age = self._extract_age(text_lower)
      features['Age'] = age if age else self.default_values['Age']

      # 2. Trích xuất giới tính
      sex = self._extract_gender(text_lower)
      features['Sex'] = sex if sex else self.default_values['Sex']

      # 3. Trích xuất ChestPainType
      cp_type = self._extract_chest_pain_type(text_lower)
      features['ChestPainType'] = cp_type if cp_type else self.default_values['ChestPainType']

      # 4. Trích xuất RestingBP
      resting_bp = self._extract_blood_pressure(text_lower)
      features['RestingBP'] = resting_bp if resting_bp else self.default_values['RestingBP']

      # 5. Trích xuất Cholesterol
      cholesterol = self._extract_cholesterol(text_lower)
      features['Cholesterol'] = cholesterol if cholesterol else self.default_values['Cholesterol']

      # 6. Trích xuất FastingBS
      fasting_bs = self._extract_fasting_bs(text_lower)
      features['FastingBS'] = fasting_bs if fasting_bs is not None else self.default_values['FastingBS']

      # 7. Trích xuất RestingECG
      resting_ecg = self._extract_resting_ecg(text_lower)
      features['RestingECG'] = resting_ecg if resting_ecg else self.default_values['RestingECG']

      # 8. Trích xuất MaxHR
      max_hr = self._extract_max_hr(text_lower, features['Age'])
      features['MaxHR'] = max_hr if max_hr else self.default_values['MaxHR']

      # 9. Trích xuất ExerciseAngina
      exercise_angina = self._extract_exercise_angina(text_lower)
      features['ExerciseAngina'] = exercise_angina if exercise_angina is not None else self.default_values['ExerciseAngina']

      # 10. Trích xuất Oldpeak
      oldpeak = self._extract_oldpeak(text_lower)
      features['Oldpeak'] = oldpeak if oldpeak else self.default_values['Oldpeak']

      # 11. Trích xuất ST_Slope
      st_slope = self._extract_st_slope(text_lower)
      features['ST_Slope'] = st_slope if st_slope else self.default_values['ST_Slope']

      # Kiểm tra features missing
      missing_features = self._check_missing_features(features, text_lower)

      return features, missing_features

   def _extract_age(self, text: str) -> Optional[int]:
      """Trích xuất tuổi"""
      # Tìm pattern tuổi cụ thể
      age_pattern = r'\b(\d+)\s*(?:tuổi|years? old)\b'
      match = re.search(age_pattern, text)
      if match:
         age = int(match.group(1))
         return min(max(age, 20), 100)  # Giới hạn trong khoảng hợp lý

      # Tìm trong cấu trúc câu thông thường
      for pattern in [r'tuổi\s*(\d+)', r'age\s*(\d+)', r'(\d+)\s*năm']:
         match = re.search(pattern, text)
         if match:
               age = int(match.group(1))
               return min(max(age, 20), 100)

      return None

   def _extract_gender(self, text: str) -> Optional[int]:
      """Trích xuất giới tính (1: Nam, 0: Nữ)"""
      male_keywords = self.medical_vocab['gender_male']['vi'] + self.medical_vocab['gender_male']['en']
      female_keywords = self.medical_vocab['gender_female']['vi'] + self.medical_vocab['gender_female']['en']

      for keyword in male_keywords:
         if keyword in text:
               return 1

      for keyword in female_keywords:
         if keyword in text:
               return 0

      return None

   def _extract_chest_pain_type(self, text: str) -> Optional[int]:
      """Trích xuất loại đau ngực"""
      # Kiểm tra xem có đau ngực không
      chest_pain_keywords = (self.medical_vocab['symptom_chest_pain']['vi'] +
                           self.medical_vocab['symptom_chest_pain']['en'])

      has_chest_pain = any(keyword in text for keyword in chest_pain_keywords)

      if not has_chest_pain:
         return 3  # ASY (không có triệu chứng)

      # Kiểm tra các loại đau ngực cụ thể
      # ATA (atypical angina)
      for keyword in self.medical_vocab['chest_pain_ata']['vi'] + self.medical_vocab['chest_pain_ata']['en']:
         if keyword in text:
               return 1  # ATA

      # TA (typical angina)
      for keyword in self.medical_vocab['chest_pain_ta']['vi'] + self.medical_vocab['chest_pain_ta']['en']:
         if keyword in text:
               return 0  # TA

      # NAP (non-anginal pain)
      for keyword in self.medical_vocab['chest_pain_nap']['vi'] + self.medical_vocab['chest_pain_nap']['en']:
         if keyword in text:
               return 2  # NAP

      # Mặc định là ATA nếu có đau ngực nhưng không xác định rõ
      return 1

   def _extract_blood_pressure(self, text: str) -> Optional[int]:
      """Trích xuất huyết áp"""
      # Tìm pattern huyết áp
      patterns = [
         r'huyết áp\s*(\d+)', r'blood pressure\s*(\d+)', r'bp\s*(\d+)',
         r'(\d+)\s*/\s*\d+\s*(?:mmHg|huyết áp)'
      ]

      for pattern in patterns:
         matches = re.findall(pattern, text)
         if matches:
               try:
                  bp = int(matches[0])
                  # Giới hạn trong khoảng hợp lý
                  return min(max(bp, 80), 200)
               except:
                  continue

      # Tìm số có thể là huyết áp
      number_pattern = r'\b(1[0-2]\d|90|1[3-9]\d|200)\b'
      matches = re.findall(number_pattern, text)
      for match in matches:
         num = int(match)
         if 90 <= num <= 200:  # Khoảng huyết áp hợp lý
               # Kiểm tra xem số này có gần từ "huyết áp" không
               idx = text.find(match)
               context = text[max(0, idx-20):min(len(text), idx+20)]
               if 'huyết áp' in context or 'blood' in context or 'bp' in context:
                  return num

      return None

   def _extract_cholesterol(self, text: str) -> Optional[int]:
      """Trích xuất cholesterol"""
      # Tìm pattern cholesterol cụ thể
      patterns = [
         r'cholesterol\s*(\d+)', r'mỡ máu\s*(\d+)', r'lipid\s*(\d+)',
         r'(\d+)\s*(?:mg/dl|mmol/l)\s*(?:cholesterol|mỡ)'
      ]

      for pattern in patterns:
         matches = re.findall(pattern, text)
         if matches:
               try:
                  chol = int(matches[0])
                  return min(max(chol, 100), 400)  # Giới hạn hợp lý
               except:
                  continue

      # Tìm số có thể là cholesterol
      number_pattern = r'\b([1-3]\d{2}|400)\b'
      matches = re.findall(number_pattern, text)
      for match in matches:
         num = int(match)
         if 150 <= num <= 300:  # Khoảng cholesterol phổ biến
               # Kiểm tra context
               idx = text.find(match)
               context = text[max(0, idx-20):min(len(text), idx+20)]
               if 'cholesterol' in context or 'mỡ' in context or 'lipid' in context:
                  return num

      return None

   def _extract_fasting_bs(self, text: str) -> Optional[int]:
      """Trích xuất đường huyết lúc đói"""
      # Kiểm tra tiểu đường
      diabetes_keywords = (self.medical_vocab['comorbidity_diabetes']['vi'] +
                        self.medical_vocab['comorbidity_diabetes']['en'])

      has_diabetes = any(keyword in text for keyword in diabetes_keywords)

      if has_diabetes:
         return 1

      # Tìm chỉ số đường huyết cụ thể
      glucose_patterns = [
         r'đường huyết\s*(\d+)', r'blood sugar\s*(\d+)', r'glucose\s*(\d+)',
         r'(\d+)\s*(?:mg/dl|mmol/l)\s*(?:đường|sugar)'
      ]

      for pattern in glucose_patterns:
         matches = re.findall(pattern, text)
         if matches:
               try:
                  glucose = int(matches[0])
                  return 1 if glucose >= 126 else 0  # Ngưỡng tiểu đường
               except:
                  continue

      return None

   def _extract_resting_ecg(self, text: str) -> Optional[int]:
      """Trích xuất kết quả ECG"""
      # Normal
      for keyword in self.medical_vocab['ecg_normal']['vi'] + self.medical_vocab['ecg_normal']['en']:
         if keyword in text:
               return 0  # Normal

      # ST-T changes
      for keyword in self.medical_vocab['ecg_stt']['vi'] + self.medical_vocab['ecg_stt']['en']:
         if keyword in text:
               return 1  # ST

      # LVH
      for keyword in self.medical_vocab['ecg_lvh']['vi'] + self.medical_vocab['ecg_lvh']['en']:
         if keyword in text:
               return 2  # LVH

      return None

   def _extract_max_hr(self, text: str, age: int) -> Optional[int]:
      """Trích xuất nhịp tim tối đa"""
      # Tìm nhịp tim cụ thể
      hr_patterns = [
         r'nhịp tim\s*(\d+)', r'heart rate\s*(\d+)', r'hr\s*(\d+)',
         r'(\d+)\s*bpm', r'mạch\s*(\d+)'
      ]

      for pattern in hr_patterns:
         matches = re.findall(pattern, text)
         if matches:
               try:
                  hr = int(matches[0])
                  return min(max(hr, 50), 200)  # Giới hạn hợp lý
               except:
                  continue

      # Ước tính dựa trên tuổi nếu không tìm thấy
      estimated_hr = 220 - age
      return min(max(estimated_hr, 60), 180)

   def _extract_exercise_angina(self, text: str) -> Optional[int]:
      """Trích xuất đau thắt ngực khi gắng sức"""
      angina_keywords = self.medical_vocab['angina_yes']['vi'] + self.medical_vocab['angina_yes']['en']

      for keyword in angina_keywords:
         if keyword in text:
               # Kiểm tra xem có đau ngực khi gắng sức không
               context = text[max(0, text.find(keyword)-30):min(len(text), text.find(keyword)+30)]
               chest_pain_keywords = (self.medical_vocab['symptom_chest_pain']['vi'] +
                                    self.medical_vocab['symptom_chest_pain']['en'])

               if any(cp in context for cp in chest_pain_keywords):
                  return 1  # Y

      return 0

   def _extract_oldpeak(self, text: str) -> Optional[float]:
      """Trích xuất oldpeak (ST depression)"""
      patterns = [
         r'oldpeak\s*([\d.]+)', r'st depression\s*([\d.]+)',
         r'([\d.]+)\s*mm\s*(?:st|depression)'
      ]

      for pattern in patterns:
         matches = re.findall(pattern, text)
         if matches:
               try:
                  op = float(matches[0])
                  return min(max(op, 0.0), 6.0)
               except:
                  continue

      severe_symptoms = ['nặng', 'dữ dội', 'severe', 'intense']
      if any(symptom in text for symptom in severe_symptoms):
         return 2.0

      return 0.0

   def _extract_st_slope(self, text: str) -> Optional[int]:
      """Trích xuất ST slope"""
      # Up
      for keyword in self.medical_vocab['st_up']['vi'] + self.medical_vocab['st_up']['en']:
         if keyword in text:
               return 0

      # Down
      for keyword in self.medical_vocab['st_down']['vi'] + self.medical_vocab['st_down']['en']:
         if keyword in text:
               return 2
      return 1

   def _check_missing_features(self, features: Dict[str, Any], text: str) -> List[str]:
      """Kiểm tra features nào còn missing hoặc cần làm rõ"""
      missing = []

      # Kiểm tra các features quan trọng
      important_features = ['Cholesterol', 'RestingBP', 'MaxHR']

      for feature in important_features:
         if features.get(feature) == self.default_values[feature]:
               # Kiểm tra xem feature này đã được đề cập trong text chưa
               mentioned = False

               if feature == 'Cholesterol':
                  mentioned = any(word in text for word in ['cholesterol', 'mỡ máu', 'lipid'])
               elif feature == 'RestingBP':
                  mentioned = any(word in text for word in ['huyết áp', 'blood pressure', 'bp'])
               elif feature == 'MaxHR':
                  mentioned = any(word in text for word in ['nhịp tim', 'heart rate', 'mạch'])

               if not mentioned:
                  missing.append(feature)

      return missing

   def generate_missing_questions(self, missing_features: List[str]) -> List[str]:
      """Tạo câu hỏi để thu thập thông tin thiếu"""
      questions = []
      question_map = {
         'Cholesterol': "Chỉ số cholesterol của bạn hiện tại là bao nhiêu (mg/dL)?",
         'RestingBP': "Huyết áp lúc nghỉ của bạn là bao nhiêu (mmHg)?",
         'MaxHR': "Nhịp tim tối đa của bạn khi gắng sức là bao nhiêu (bpm)?",
         'RestingECG': "Kết quả điện tâm đồ gần đây của bạn thế nào?",
         'Oldpeak': "Chỉ số ST depression (oldpeak) trên điện tâm đồ của bạn là bao nhiêu?",
         'FastingBS': "Bạn có bị tiểu đường hoặc đường huyết lúc đói cao không?",
         'ExerciseAngina': "Bạn có bị đau ngực khi gắng sức không?"
      }

      for feature in missing_features:
         if feature in question_map:
               questions.append(question_map[feature])

      return questions

   def update_features_with_response(self, features: Dict[str, Any], response_text: str, feature_name: str) -> Dict[str, Any]:
      """Cập nhật features với thông tin mới từ người dùng"""
      text_lower = response_text.lower()

      if feature_name == 'Cholesterol':
         value = self._extract_cholesterol(text_lower)
         if value:
               features['Cholesterol'] = value

      elif feature_name == 'RestingBP':
         value = self._extract_blood_pressure(text_lower)
         if value:
               features['RestingBP'] = value

      elif feature_name == 'MaxHR':
         value = self._extract_max_hr(text_lower, features['Age'])
         if value:
               features['MaxHR'] = value

      elif feature_name == 'RestingECG':
         value = self._extract_resting_ecg(text_lower)
         if value is not None:
               features['RestingECG'] = value

      elif feature_name == 'Oldpeak':
         value = self._extract_oldpeak(text_lower)
         if value:
               features['Oldpeak'] = value

      elif feature_name == 'FastingBS':
         value = self._extract_fasting_bs(text_lower)
         if value is not None:
               features['FastingBS'] = value

      elif feature_name == 'ExerciseAngina':
         value = self._extract_exercise_angina(text_lower)
         if value is not None:
               features['ExerciseAngina'] = value

      return features

# Tiện ích để tích hợp với Flask API
def process_user_input(user_input: str) -> Dict[str, Any]:
   """
   Xử lý input từ người dùng và trả về features hoặc câu hỏi bổ sung

   Returns:
      Dict với keys:
      - 'status': 'complete' hoặc 'need_info'
      - 'features': dict features (nếu complete)
      - 'questions': list câu hỏi (nếu need_info)
      - 'missing_features': list tên features missing
   """
   extractor = HeartDiseaseNLPExtractor()

   # Trích xuất features
   features, missing_features = extractor.extract_all_features(user_input)

   if not missing_features:
      return {
         'status': 'complete',
         'features': features,
         'message': 'Đã trích xuất đủ thông tin để dự đoán.'
      }
   else:
      questions = extractor.generate_missing_questions(missing_features)
      return {
         'status': 'need_info',
         'features': features,  # Features đã trích xuất được
         'missing_features': missing_features,
         'questions': questions,
         'message': f'Cần bổ sung thêm {len(missing_features)} thông tin.'
      }

# Test the extractor
if __name__ == "__main__":
   extractor = HeartDiseaseNLPExtractor()
