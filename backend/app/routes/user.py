from flask import Blueprint, request, jsonify
from app.models import db, User
from werkzeug.security import check_password_hash
from datetime import datetime
from flask_jwt_extended import get_jwt_identity, jwt_required, create_access_token

user_bp = Blueprint("user", __name__)

@user_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    full_name = data.get("full_name")
    furigana = data.get("furigana")
    phone = data.get("phone")
    zipcode = data.get("zipcode")
    prefecture = data.get("prefecture")
    city = data.get("city")
    area = data.get("area")
    detailed_address = data.get("detailed_address")
    gender = data.get("gender")
    birthdate_str = data.get("birthdate")

    if not username or not email or not password or not full_name or not furigana or not phone or not zipcode or not prefecture or not city or not area or not detailed_address or not gender or not birthdate_str:
        return jsonify({"error": "全部入力してください。"}), 400

    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({"error": "重複します。"}), 400

    birthdate = None
    if birthdate_str:
        try:
            birthdate = datetime.strptime(birthdate_str, "%Y-%m-%d")
        except ValueError:
            return jsonify({"error" : "誕生日の形式が違います。"}), 400

    user = User(
        username=username,
        email=email,
        full_name=full_name,
        furigana=furigana,
        phone=phone,
        zipcode=zipcode,
        prefecture=prefecture,
        city=city,
        area=area,
        detailed_address=detailed_address,
        gender=gender,
        birthdate=birthdate
    )
    user.set_password(password)

    try:
        db.session.add(user)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

    return jsonify({"message": "会員登録成功!"}), 201


@user_bp.route("/login", methods=['POST'])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "IDとPASSWORDを全部入力してください。"}), 400

    user = User.query.filter_by(username=username).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "IDまたはPASSWORDが正しくありません"}), 401

    token = create_access_token(identity=str(user.id))
    return jsonify({"message": "LOGIN 成功", "token": token}), 200

@user_bp.route('/update', methods=['PUT', 'OPTIONS'])
def update_user():
    if request.method == 'OPTIONS':
        return jsonify({"message": "CORS OK"}), 200

    return protected_update_user()

@jwt_required()
def protected_update_user():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    # user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "ユーザーが存在しません"}), 404
    
    data = request.get_json()

    new_username = data.get("username")
    if new_username and new_username != user.username:
        if User.query.filter_by(username=new_username).first():
            return jsonify({"error": "このユーザー名はすでに使用されています"}), 400
        user.username = new_username

    new_email = data.get("email")
    if new_email and new_email != user.email:
        if User.query.filter_by(email=new_email).first():
            return jsonify({"error": "このメールアドレスはすでに登録されています"}), 400
        user.email = new_email

    new_password = data.get("password")
    if new_password:
        user.set_password(new_password)

    user.full_name = data.get("full_name", user.full_name)
    user.furigana = data.get("furigana", user.furigana)
    user.phone = data.get("phone", user.phone)
    user.zipcode = data.get("zipcode", user.zipcode)
    user.prefecture = data.get("prefecture", user.prefecture)
    user.city = data.get("city", user.city)
    user.area = data.get("area", user.area)
    user.detailed_address = data.get("detailed_address", user.detailed_address)
    user.gender = data.get("gender", user.gender)
    birthdate_str = data.get("birthdate")
    
    if birthdate_str and birthdate_str.strip():
        try:
            user.birthdate = datetime.strptime(birthdate_str, "%Y-%m-%d").date()
        except ValueError:
            return jsonify({"error": "誕生日の形式は正しくありません (例 : 1990-01-01)"}), 400
    elif birthdate_str == "":
        user.birthdate = None

    try:
        db.session.commit()
        return jsonify({"message": "ユーザー情報を更新しました"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@user_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    # user = User.query.get(user_id)
    print(f"GET /api/user/profile called. User ID: {user_id}")
    if not user:
        return jsonify({"error": "ユーザーが存在しません"}), 404

    return jsonify({
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "furigana": user.furigana,
        "phone": user.phone,
        "zipcode": user.zipcode,
        "prefecture": user.prefecture,
        "city": user.city,
        "area": user.area,
        "detailed_address": user.detailed_address,
        "birthdate": user.birthdate.strftime("%Y-%m-%d") if user.birthdate else "",
        "gender": user.gender
    }), 200
