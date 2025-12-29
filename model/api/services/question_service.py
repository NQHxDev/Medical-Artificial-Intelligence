import random

def generate_missing_info_message(missing_features, progress):
   templates = [
      "Mình cần thêm một chút thông tin nữa để dự đoán chính xác hơn nha",
      "Sắp xong rồi đó! Bạn giúp mình bổ sung thêm vài thông tin nhé",
      "Hiện mình chưa đủ dữ liệu để kết luận chính xác, mình cần thêm chút nữa nè",
      "Còn thiếu một vài thông tin quan trọng, bạn hỗ trợ mình nhé"
   ]

   detail_templates = [
      "Cụ thể là còn thiếu {count} thông tin quan trọng",
      "Hiện còn {count} mục nữa là mình có thể dự đoán tốt hơn",
      "Chỉ cần thêm {count} thông tin nữa thôi là xong rồi"
   ]

   base_message = random.choice(templates)
   detail_message = random.choice(detail_templates).format(
      count=len(missing_features)
   )

   return f"{base_message} - {detail_message}"

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
