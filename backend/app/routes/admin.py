from flask import Blueprint, request, jsonify, current_app, send_from_directory
from app.models import db, User, Bukken
from werkzeug.security import check_password_hash
from werkzeug.utils import secure_filename
from flask_jwt_extended import get_jwt_identity, jwt_required, create_access_token
from datetime import datetime
import os 
import json

basedir = os.path.abspath(os.path.dirname(__file__))

admin_bp = Blueprint("admin_bp", __name__, url_prefix="/api/admin")

@admin_bp.route("/register", methods=["POST"])
def admin_register():
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

    if not username or not email or not password:
        return jsonify({"error": "全部入力してください。"}), 400

    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({"error": "重複します。"}), 400

    birthdate = None
    if birthdate_str:
        try:
            birthdate = datetime.strptime(birthdate_str, "%Y-%m-%d")
        except ValueError:
            return jsonify({"error": "誕生日の形式が違います"}), 400

    admin = User(
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
        birthdate=birthdate,
        is_admin=True
    )
    admin.set_password(password)

    try:
        db.session.add(admin)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

    return jsonify({"message": "管理者として登録されました！"}), 201

@admin_bp.route("/login", methods=["POST"])
def admin_login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "IDとPASSWORDを全部入力してください"}), 400

    admin = User.query.filter_by(username=username).first()
    if not admin or not check_password_hash(admin.password_hash, password) or not admin.is_admin:
        return jsonify({"error": "IDまたはPASSWORDが正しくありません"}), 401

    token = create_access_token(identity=str(admin.id))  # 토큰 발급
    return jsonify({"message": "管理者ログイン成功", "token": token}), 200

@admin_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_admin_profile():
    admin_id = get_jwt_identity()
    admin = User.query.get(int(admin_id))
    
    if not admin or not admin.is_admin:
        return jsonify({"error": "管理者が存在しません"}), 404

    return jsonify({
        "username": admin.username,
        "email": admin.email,
        "full_name": admin.full_name,
        "furigana": admin.furigana,
        "phone": admin.phone,
        "zipcode": admin.zipcode,
        "prefecture": admin.prefecture,
        "city": admin.city,
        "area": admin.area,
        "detailed_address": admin.detailed_address,
        "birthdate": admin.birthdate.strftime("%Y-%m-%d") if admin.birthdate else "",
        "gender": admin.gender
    }), 200

@admin_bp.route("/update", methods=["PUT", "OPTIONS"], endpoint = "update_admin_profile")
@jwt_required()
def update_admin():
    if request.method == 'OPTIONS':
        return jsonify({"message" : "CORS OK"}), 200
    return protected_update_admin()

@jwt_required()
def protected_update_admin():
    admin_id = get_jwt_identity()
    print(f"Admin ID from JWT : {admin_id}")
    admin = User.query.get(int(admin_id))
    
    if not admin or not admin.is_admin:
        return jsonify({"error": "管理者が存在しません"}), 404

    data = request.get_json()
    print(f"Received data: {data}")

    new_username = data.get("username")
    if new_username and new_username != admin.username:
        if User.query.filter_by(username=new_username).first():
            return jsonify({"error": "このユーザー名はすでに使用されています"}), 400
        admin.username = new_username

    new_email = data.get("email")
    if new_email and new_email != admin.email:
        if User.query.filter_by(email=new_email).first():
            return jsonify({"error": "このメールアドレスはすでに登録されています"}), 400
        admin.email = new_email

    new_password = data.get("password")
    if new_password:
        admin.set_password(new_password)

    admin.full_name = data.get("full_name", admin.full_name)
    admin.furigana = data.get("furigana", admin.furigana)
    admin.phone = data.get("phone", admin.phone)
    admin.zipcode = data.get("zipcode", admin.zipcode)
    admin.prefecture = data.get("prefecture", admin.prefecture)
    admin.city = data.get("city", admin.city)
    admin.area = data.get("area", admin.area)
    admin.detailed_address = data.get("detailed_address", admin.detailed_address)
    admin.gender = data.get("gender", admin.gender)

    birthdate_str = data.get("birthdate")
    if birthdate_str:
        try:
            admin.birthdate = datetime.strptime(birthdate_str, "%Y-%m-%d").date()
        except ValueError:
            return jsonify({"error": "誕生日の形式は正しくありません"}), 400

    try:
        db.session.commit()
        return jsonify({"message": "管理者プロフィールを更新しました"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
@admin_bp.route("/update", methods=["PUT", "OPTIONS"])
@jwt_required()
def update_admin():
    if request.method == 'OPTIONS':
        return jsonify({"message" : "CORS OK"}), 200

    return protected_update_admin()

@jwt_required()
def protected_update_admin():
    admin_id = get_jwt_identity()  # JWTから管理者のIDを抽出
    print(f"Admin ID from JWT : {admin_id}")  # ここでadmin_idが正しく出力されるか確認します。
    admin = User.query.get(int(admin_id))

    if not admin or not admin.is_admin:
        return jsonify({"error": "管理者が存在しません"}), 404  # 管理者権限がない場合は404 返還
    data = request.get_json()  # クライアントからのデータ
    print(f"Received data: {data}")  # クライアントからのデータが正常にオンになっていることを確認します。

    new_username = data.get("username")
    if new_username and new_username != admin.username:
        if User.query.filter_by(username=new_username).first():
            return jsonify({"error": "このユーザー名はすでに使用されています"}), 400
        admin.username = new_username

    new_email = data.get("email")
    if new_email and new_email != admin.email:
        if User.query.filter_by(email=new_email).first():
            return jsonify({"error": "このメールアドレスはすでに登録されています"}), 400
        admin.email = new_email

    new_password = data.get("password")
    if new_password:
        admin.set_password(new_password)

    admin.full_name = data.get("full_name", admin.full_name)
    admin.furigana = data.get("furigana", admin.furigana)
    admin.phone = data.get("phone", admin.phone)
    admin.zipcode = data.get("zipcode", admin.zipcode)
    admin.prefecture = data.get("prefecture", admin.prefecture)
    admin.city = data.get("city", admin.city)
    admin.area = data.get("area", admin.area)
    admin.detailed_address = data.get("detailed_address", admin.detailed_address)
    admin.gender = data.get("gender", admin.gender)

    birthdate_str = data.get("birthdate")
    if birthdate_str:
        try:
            admin.birthdate = datetime.strptime(birthdate_str, "%Y-%m-%d").date()
        except ValueError:
            return jsonify({"error": "誕生日の形式は正しくありません"}), 400

    try:
        db.session.commit()  # 変更事項Commit
        return jsonify({"message": "管理者プロフィールを更新しました"}), 200  # 成功
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500  # Rollback

@admin_bp.route('/bukken', methods=['POST'])
def register_bukken():
    print("register_bukken POST")
    
    try:
        # 住所
        large_area = request.form.get("large_area")
        small_area = request.form.get("small_area")
        address_town = request.form.get("address_town")
        address_chome = request.form.get("address_chome")
        address_banchi = request.form.get("address_banchi")
        address_go = request.form.get("address_go")
        address_building = request.form.get("address_building")
        files = request.files.getlist('images')

        
        # 電話番号とFAX併合
        tel = "-".join(filter(None, [
            request.form.get("company_tel_1", ""),
            request.form.get("company_tel_2", ""),
            request.form.get("company_tel_3", "")
        ]))
        fax = "-".join(filter(None, [
            request.form.get("company_fax_1", ""),
            request.form.get("company_fax_2", ""),
            request.form.get("company_fax_3", "")
        ]))

        # 業種情報 (formStateのチェック)
        business_keys = [
            "food_light", "food_heavy", "food_bar",
            "beauty_sal", "beauty_sub1",
            "salon_est", "salon_esthe", "salon_nail", "salon_other",
            "clinic", "clinic_c", "clinic_dent", "clinic_pharm", "clinic_other",
            "retail", "retail_app", "retail_conv", "retail_other",
            "gym", "gym_studio", "gym_gym", "gym_class", "gym_school",
            "other_service", "other_store"
        ]
        business_types = {key: True for key in business_keys if request.form.get(key) == 'true'}
         # 敷金（deposit）の処理

        def safe_int(val):
            try:
                return int(val)
            except (ValueError, TypeError):
                return None
            
        def safe_str(val):
            return val if val and val.strip() != "" else None
        
        def to_int_or_none(value):
            if value is None or value == "":
                return None
            return int(value)
        
        def empty_to_none(value):
            return None if value == "" else value


        deposit_raw = request.form.get("deposit", "")
        deposit_type = request.form.get("deposit_type")  # 'month' または 'yen'
        deposit_month = None
        deposit_yen = None
        if deposit_raw:
            try:
                deposit_value = float(deposit_raw)
                if deposit_type == "month":
                    deposit_month = deposit_value
                elif deposit_type == "yen":
                    deposit_yen = int(deposit_value * 10000)
            except ValueError:
                pass
        
        key_money_raw = request.form.get("key_money", "")
        key_money_type = request.form.get("key_money_type")
        key_money_month = None
        key_money_yen = None
        if key_money_raw:
            try:
                key_money_value = float(key_money_raw)
                if key_money_type == "month":
                    key_money_month = key_money_value
                elif key_money_type == "yen":
                    key_money_yen = int(key_money_value * 10000)
            except ValueError:
                pass      
        
        building_upper = safe_str(request.form.get("building_upper"))
        building_lower = safe_str(request.form.get("building_lower"))
        built_year = safe_int(request.form.get("built_year"))
        contract_period = safe_int(request.form.get("contract_period"))
        renewal_fee = safe_int(request.form.get("renewal_fee"))
        floor_type1 = request.form.get("floor_type1") or None
        floor_value1 = safe_int(request.form.get("floor_value1"))
        floor_type2 = request.form.get("floor_type2") or None
        floor_value2 = safe_int(request.form.get("floor_value2"))
        
        # Bukken モデルオブジェクト生成
        bukken = Bukken(
            large_area=large_area,
            small_area=small_area,
            address_town=address_town, 
            address_chome=address_chome,
            address_banchi=address_banchi, 
            address_go=address_go,
            address_building=address_building,
            image_paths=json.dumps([]),

            station1 = request.form.get("station1"),
            station1_walk = to_int_or_none(request.form.get("station1_walk")),
            station1_bus = to_int_or_none(request.form.get("station1_bus")),
            station2 = request.form.get("station2"),
            station2_walk = to_int_or_none(request.form.get("station2_walk")),
            station2_bus = to_int_or_none(request.form.get("station2_bus")),
            station3 = request.form.get("station3"),
            station4 = request.form.get("station4"),
            station5 = request.form.get("station5"),

            rent=request.form.get("rent"),
            rent_negotiable=bool(request.form.get("rent_negotiable")),

            building_upper=building_upper,
            building_lower=building_lower,

            floor_type1=floor_type1,
            floor_value1=floor_value1,
            floor_type2=floor_type2,
            floor_value2=floor_value2,
            whole_building=bool(request.form.get("whole_building")),
            extra_condition=bool(request.form.get("extra_condition")),

            m2=request.form.get("m2"),
            tsubo=request.form.get("tsubo"),
            structure=request.form.get("structure"),

            deposit_month=deposit_month,
            deposit_yen=deposit_yen,
            deposit_neg=bool(request.form.get("deposit_neg")),

            contract_period=contract_period,

            key_money_month=key_money_month,
            key_money_yen=key_money_yen,
            key_money_neg=bool(request.form.get("key_money_neg")),

            state=request.form.get("state"),
            transfer_fee=empty_to_none(request.form.get("transfer_fee")),
            transfer_neg=bool(request.form.get("transfer_neg")),

            maintenance=request.form.get("maintenance"),
            maint_neg=bool(request.form.get("maint_neg")),

            prev_tenant=request.form.get("prev_tenant"),
            amortization=request.form.get("amortization"),
            renewal_fee=renewal_fee,  

            built_year=built_year,
            deal_type=request.form.get("deal_type"),

            business_types=json.dumps(business_types),  

            remarks=request.form.get("remarks"),
            coment=request.form.get("coment"),
            company=request.form.get("company"),
            contact=request.form.get("contact"),
            company_tel=tel,
            company_fax=fax,
            memo=request.form.get("memo"),
            open_range=bool(request.form.get("open_range")),
            management_id=request.form.get("management_id"),
            customer_registration=bool(request.form.get("customer_registration")),
        )

        db.session.add(bukken)
        db.session.commit()

        upload_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], str(bukken.id))
        os.makedirs(upload_dir, exist_ok=True)

        saved_filenames = []
        for file in files:
            if file and file.filename:
                filename = secure_filename(file.filename)
                file_path = os.path.join(upload_dir, filename)
                file.save(file_path)
                saved_filenames.append(f"{bukken.id}/{filename}")
        
        bukken.image_paths = json.dumps(saved_filenames)
        db.session.commit()

        return jsonify({"message": "物件登録が完了しました。"}), 201

    except Exception as e:
        print("[ERROR]", e)
        return jsonify({"message": "物件登録に失敗しました。", "error": str(e)}), 500
    

@admin_bp.route('/bukken/list', methods=['GET'])
def get_bukken_list():
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 9))
    offset = (page - 1) * limit

    total_count = Bukken.query.count()
    bukken_list = (
        Bukken.query
        .order_by(Bukken.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    result = []
    for b in bukken_list:
        try:
            image_paths = json.loads(b.image_paths) if b.image_paths else []
            if not isinstance(image_paths, list):
                raise ValueError
        except Exception:
            print(f"[WARN] Invalid JSON found in image_paths: {b.image_paths}")
            image_paths = []

        result.append({
            "id": b.id,
            "large_area": b.large_area,
            "small_area": b.small_area,
            "address_town": b.address_town,
            "address_chome": b.address_chome,
            "address_banchi": b.address_banchi,
            "address_go": b.address_go,
            "address_building": b.address_building,
            "rent": b.rent,
            "structure": b.structure,
            "remarks": b.remarks,
            "image_paths": image_paths,
            "created_at": b.created_at if isinstance(b.created_at, str) else b.created_at.strftime("%Y-%m-%d %H:%M:%S")
        })
    return jsonify({
        "total": total_count,
        "page": page,
        "limit": limit,
        "data": result
    })

@admin_bp.route('/uploads/<path:filepath>')
def uploaded_file(filepath):
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filepath)

@admin_bp.route('/bukken/<int:id>', methods=['GET'])
def get_bukken_detail(id):
    bukken = Bukken.query.get(id)

    if not bukken:
        return jsonify({"message" : "該当する物件が見つかりませんでした。"}), 404
        
    try:
        if bukken.business_types and bukken.business_types.strip():
            business_types = json.loads(bukken.business_types)
            if not isinstance(business_types, dict):
                business_types = {}
        else:
            business_types = {}
    except Exception as e:
        print(f"[WARN] business_types 파싱 오류: {e}")
        business_types = {}

    try:
        if bukken.image_paths and bukken.image_paths.strip():
            image_paths = json.loads(bukken.image_paths)
            if not isinstance(image_paths, list):
                image_paths = []
        else:
            image_paths = []
    except Exception as e:
        print(f"[WARN] image_paths 파싱 오류: {e}")
        image_paths = []

    if isinstance(bukken.created_at, str):
        created_at_str = bukken.created_at
    elif bukken.created_at:
        created_at_str = bukken.created_at.isoformat()
    else:
        created_at_str = None

    try:
        bukken_data = {
            "id": bukken.id,
            "large_area": bukken.large_area,
            "small_area": bukken.small_area,
            "address_town": bukken.address_town,
            "address_chome": bukken.address_chome,
            "address_banchi": bukken.address_banchi,
            "address_go": bukken.address_go,
            "address_building": bukken.address_building,
            "station1": bukken.station1,
            "station1_walk": bukken.station1_walk,
            "station1_bus": bukken.station1_bus,
            "station2": bukken.station2,
            "station2_walk": bukken.station2_walk,
            "station2_bus": bukken.station2_bus,
            "station3": bukken.station3,
            "station4": bukken.station4,
            "station5": bukken.station5,
            "rent": bukken.rent,
            "rent_negotiable": bukken.rent_negotiable,
            "building_upper": bukken.building_upper,
            "building_lower": bukken.building_lower,
            "floor_type1": bukken.floor_type1,
            "floor_value1": bukken.floor_value1,
            "floor_type2": bukken.floor_type2,
            "floor_value2": bukken.floor_value2,
            "whole_building": bukken.whole_building,
            "extra_condition": bukken.extra_condition,
            "m2": bukken.m2,
            "tsubo": bukken.tsubo,
            "structure": bukken.structure,
            "deposit_month": bukken.deposit_month,
            "deposit_yen": bukken.deposit_yen,
            "deposit_neg": bukken.deposit_neg,
            "contract_period": bukken.contract_period,
            "key_money_month": bukken.key_money_month,
            "key_money_yen": bukken.key_money_yen,
            "key_money_neg": bukken.key_money_neg,
            "state": bukken.state,
            "transfer_fee": bukken.transfer_fee,
            "transfer_neg": bukken.transfer_neg,
            "maintenance": bukken.maintenance,
            "maint_neg": bukken.maint_neg,
            "prev_tenant": bukken.prev_tenant,
            "amortization": bukken.amortization,
            "renewal_fee": bukken.renewal_fee,
            "built_year": bukken.built_year,
            "deal_type": bukken.deal_type,
            "business_types": business_types,
            "remarks": bukken.remarks,
            "coment": bukken.coment,
            "company": bukken.company,
            "contact": bukken.contact,
            "company_tel": bukken.company_tel,
            "company_fax": bukken.company_fax,
            "memo": bukken.memo,
            "open_range": bukken.open_range,
            "management_id": bukken.management_id,
            "customer_registration": bukken.customer_registration,
            "image_paths": image_paths,
            "created_at": created_at_str
        }
        return jsonify(bukken_data), 200
    except Exception as e:
        return jsonify({"error" : str(e)}), 500

@admin_bp.route("/bukken/all", methods=['GET'])
def get_all_bukken():
    bukken_list = Bukken.query.order_by(Bukken.created_at.desc()).all()
    result = []

    for b in bukken_list:
        # business_types 安全パッシング
        try:
            business_types = json.loads(b.business_types) if b.business_types else {}
            if not isinstance(business_types, dict):
                raise ValueError
        except Exception:
            print(f"[WARN] Invalid JSON found in business_types: {b.business_types}")
            business_types = {}

        # image_paths 安全パッシング
        try:
            image_paths = json.loads(b.image_paths) if b.image_paths else []
            if not isinstance(image_paths, list):
                raise ValueError
        except Exception:
            print(f"[WARN] Invalid JSON found in image_paths: {b.image_paths}")
            image_paths = []

        result.append({
            "id": b.id,
            "large_area": b.large_area,
            "small_area": b.small_area,
            "address_town": b.address_town,
            "address_chome": b.address_chome,
            "address_banchi": b.address_banchi,
            "address_go": b.address_go,
            "address_building": b.address_building,
            "station1": b.station1,
            "station1_walk": b.station1_walk,
            "station1_bus": b.station1_bus,
            "station2": b.station2,
            "station2_walk": b.station2_walk,
            "station2_bus": b.station2_bus,
            "station3": b.station3,
            "station4": b.station4,
            "station5": b.station5,
            "rent": b.rent,
            "rent_negotiable": b.rent_negotiable,
            "building_upper": b.building_upper,
            "building_lower": b.building_lower,
            "floor_type1": b.floor_type1,
            "floor_value1": b.floor_value1,
            "floor_type2": b.floor_type2,
            "floor_value2": b.floor_value2,
            "whole_building": b.whole_building,
            "extra_condition": b.extra_condition,
            "m2": b.m2,
            "tsubo": b.tsubo,
            "structure": b.structure,
            "deposit_month": b.deposit_month,
            "deposit_yen": b.deposit_yen,
            "deposit_neg": b.deposit_neg,
            "contract_period": b.contract_period,
            "key_money_month": b.key_money_month,
            "key_money_yen": b.key_money_yen,
            "key_money_neg": b.key_money_neg,
            "state": b.state,
            "transfer_fee": b.transfer_fee,
            "transfer_neg": b.transfer_neg,
            "maintenance": b.maintenance,
            "maint_neg": b.maint_neg,
            "prev_tenant": b.prev_tenant,
            "amortization": b.amortization,
            "renewal_fee": b.renewal_fee,
            "built_year": b.built_year,
            "deal_type": b.deal_type,
            "business_types": business_types,
            "remarks": b.remarks,
            "coment": b.coment,
            "company": b.company,
            "contact": b.contact,
            "company_tel": b.company_tel,
            "company_fax": b.company_fax,
            "memo": b.memo,
            "open_range": b.open_range,
            "management_id": b.management_id,
            "customer_registration": b.customer_registration,
            "image_paths": image_paths,
            "created_at": b.created_at.strftime("%Y-%m-%d %H:%M:%S") if isinstance(b.created_at, datetime) else None
        })

    return jsonify(result)




@admin_bp.route('/bukken/<int:id>', methods=['DELETE'])
def delete_bukken(id):
    bukken = Bukken.query.get(id)
    if not bukken:
        return jsonify({'error': '物件が見つかりませんでした。'}), 404

    try:
        db.session.delete(bukken)
        db.session.commit()
        return jsonify({'message': '削除に成功しました。'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/bukken/<int:id>', methods=['PUT'])
def update_bukken(id):
    bukken = Bukken.query.get(id)

    if not bukken:
        return jsonify({'error': '物件が見つかりませんでした。'}), 404

    data = request.get_json()

    # 最初に一般キーを自動処理します
    for key, value in data.items():
        if key.startswith("company_tel") or key.startswith("company_fax"):
            continue  # 電話番号は以下で別に処理します
        if hasattr(bukken, key):
            if value == "":
                value = None
            if isinstance(value, str) and value.lower() in ("true", "false"):
                value = value.lower() == "true"
            setattr(bukken, key, value)

    # 電話番号まとめて保存します
    tel_parts = [data.get("company_tel_1", ""), data.get("company_tel_2", ""), data.get("company_tel_3", "")]
    fax_parts = [data.get("company_fax_1", ""), data.get("company_fax_2", ""), data.get("company_fax_3", "")]
    bukken.company_tel = "-".join(filter(None, tel_parts)) or None
    bukken.company_fax = "-".join(filter(None, fax_parts)) or None

    try:
        db.session.commit()
        return jsonify({'message': '更新に成功しました。'})
    except Exception as e:
        db.session.rollback()
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500



