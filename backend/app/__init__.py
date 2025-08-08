from flask import Flask, request
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from app.models import db
from .routes.user import user_bp
from .routes.admin import admin_bp
from .routes.search import search_bp #0806
from .config import DevelopmentConfig  #  ProductionConfigもいいです。

def create_app():
    app = Flask(__name__)
    app.config.from_object(DevelopmentConfig)  # 設定読み込む

    # 초기화
    db.init_app(app)
    jwt = JWTManager(app)
    Migrate(app, db)

    # CORS
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

    # OPTIONS 
    @app.before_request
    def handle_options():
        if request.method == 'OPTIONS':
            response = app.make_response('')
            response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
            response.headers['Access-Control-Allow-Credentials'] = 'true'
            return response

    # Blueprint 登録
    app.register_blueprint(user_bp, url_prefix='/api/user')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(search_bp, url_prefix='/api') #0806

    return app
