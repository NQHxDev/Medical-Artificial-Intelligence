import os
import joblib

from nlp_processor import HeartDiseaseNLPExtractor

BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "..", "heart_disease_model.pkl")

try:
   model_data = joblib.load(MODEL_PATH)
   model = model_data["model"]
   feature_names = model_data["feature_names"]
   print("Model loaded successfully")
except Exception as e:
   print("Cannot load model:", e)
   model = None
   feature_names = []

nlp_extractor = HeartDiseaseNLPExtractor()
