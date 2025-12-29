def get_recommendations(prediction, features):
   """
   Tạo khuyến nghị dựa trên kết quả dự đoán và features
   """
   recommendations = []

   if prediction == 1:
      recommendations.append("Thăm khám bác sĩ tim mạch càng sớm càng tốt")
      recommendations.append("Thực hiện điện tâm đồ (ECG) và siêu âm tim")

      if features.get('RestingBP', 0) > 140:
         recommendations.append("Kiểm soát huyết áp: giảm muối, tập thể dục đều đặn")
         recommendations.append("Chế độ ăn DASH: nhiều rau củ, ít chất béo bão hòa")
         recommendations.append("Uống đủ 2 lít nước mỗi ngày")

      if features.get('Cholesterol', 0) > 200:
         recommendations.append("Giảm cholesterol: hạn chế đồ chiên xào, tăng chất xơ")
         recommendations.append("Vận động 30 phút mỗi ngày, 5 ngày/tuần")
         recommendations.append("Uống đủ 2 lít nước mỗi ngày")

      if features.get('ExerciseAngina', 0) == 1:
         recommendations.append("Tránh gắng sức đột ngột, nghỉ ngơi khi đau ngực")
         recommendations.append("Bỏ thuốc lá nếu có hút")

      if features.get('FastingBS', 0) == 1:
         recommendations.append("Kiểm soát đường huyết: đo đường máu thường xuyên")
         recommendations.append("Hạn chế tinh bột đơn giản, ăn nhiều rau xanh")

   else:
      recommendations.append("Duy trì lối sống lành mạnh hiện tại")
      recommendations.append("Khám sức khỏe định kỳ 6-12 tháng/lần")

      if features.get('Age', 0) > 40:
         recommendations.append("Tầm soát tim mạch định kỳ từ tuổi 40")

      if features.get('Cholesterol', 0) > 180:
         recommendations.append("Kiểm tra cholesterol thường xuyên, ăn nhiều omega-3")

      if features.get('RestingBP', 0) > 130:
         recommendations.append("Giảm căng thẳng, ngủ đủ 7-8 tiếng mỗi đêm")

   return recommendations

def get_next_steps(prediction, features):
   """
   Đề xuất các bước tiếp theo
   """
   if prediction == 1:
      return [
         "Đặt lịch hẹn với bác sĩ tim mạch",
         "Thực hiện các xét nghiệm: ECG, siêu âm tim, công thức máu",
         "Theo dõi huyết áp hàng ngày",
         "Ghi nhật ký triệu chứng nếu có đau ngực tái phát",
         "Liên hệ cấp cứu 115 nếu đau ngực dữ dội, khó thở"
      ]
   else:
      return [
         "Tiếp tục duy trì lối sống lành mạnh",
         "Tập thể dục đều đặn 150 phút/tuần",
         "Khám sức khỏe định kỳ",
         "Theo dõi cân nặng và vòng bụng",
         "Tiêm phòng cúm hàng năm để bảo vệ tim mạch"
      ]
