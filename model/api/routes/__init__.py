from flask import Blueprint

from .predict import predict_bp
from .analyze import analyze_bp
from .complete import complete_bp
from .health import health_bp

def register_routes(app):
   app.register_blueprint(predict_bp)
   app.register_blueprint(analyze_bp)
   app.register_blueprint(complete_bp)
   app.register_blueprint(health_bp)
