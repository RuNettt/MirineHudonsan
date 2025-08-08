from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.sql import func
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timezone
import json

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    full_name = db.Column(db.String(30))
    furigana = db.Column(db.String(30))
    phone = db.Column(db.String(20))
    zipcode = db.Column(db.String(10))
    prefecture = db.Column(db.String(50))
    city = db.Column(db.String(50))
    area = db.Column(db.String(100))
    detailed_address = db.Column(db.String(200))
    birthdate = db.Column(db.Date)
    gender = db.Column(db.String(10))
    created_at = db.Column(db.DateTime, nullable=False, server_default=func.now())    
    is_admin = db.Column(db.Boolean, default = False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f"<User {self.username}>"

class Bukken(db.Model):
    __tablename__ = 'bukken_detail'

    id = db.Column(db.Integer, primary_key=True)
    large_area = db.Column(db.String(50))       #東京23区
    small_area = db.Column(db.String(100))      #練馬区
    address_town = db.Column(db.String(50))      # 〇〇町
    address_chome = db.Column(db.String(20))      # 〇〇丁目
    address_banchi = db.Column(db.String(20))     # 〇〇番地
    address_go = db.Column(db.String(20))         # 〇〇号
    address_building = db.Column(db.String(50))   # ビル名
    station1 = db.Column(db.String(100))
    station1_walk = db.Column(db.Integer, nullable=True)
    station1_bus = db.Column(db.Integer, nullable=True)
    station2 = db.Column(db.String(100))
    station2_walk = db.Column(db.Integer, nullable=True)
    station2_bus = db.Column(db.Integer, nullable=True)
    station3 = db.Column(db.String(100))
    station4 = db.Column(db.String(100))
    station5 = db.Column(db.String(100))
    rent = db.Column(db.Integer)
    rent_negotiable = db.Column(db.Boolean)
    building_upper = db.Column(db.Integer)
    building_lower = db.Column(db.Integer)
    floor_type1 = db.Column(db.String(10), nullable=True)
    floor_value1 = db.Column(db.Integer, nullable=True)
    floor_type2 = db.Column(db.String(10), nullable=True)
    floor_value2 = db.Column(db.Integer, nullable=True)
    whole_building = db.Column(db.Boolean)
    extra_condition = db.Column(db.Boolean)
    m2 = db.Column(db.Float)
    tsubo = db.Column(db.Float)
    structure = db.Column(db.String(100))
    deposit_month = db.Column(db.Float, nullable=True)
    deposit_yen = db.Column(db.Integer, nullable=True)
    deposit_neg = db.Column(db.Boolean, default=False)
    contract_period = db.Column(db.String(50))
    key_money_month = db.Column(db.Float, nullable=True)
    key_money_yen = db.Column(db.Integer, nullable=True)
    key_money_neg = db.Column(db.Boolean, default=False)
    state = db.Column(db.String(20))
    transfer_fee = db.Column(db.Float)
    transfer_neg = db.Column(db.Boolean)
    maintenance = db.Column(db.Integer)
    maint_neg = db.Column(db.Boolean)
    prev_tenant = db.Column(db.String(100))
    amortization = db.Column(db.String(100))
    renewal_fee = db.Column(db.String(100))
    built_year = db.Column(db.Integer)
    deal_type = db.Column(db.String(20))
    business_types = db.Column(db.Text)  # JSON 
    remarks = db.Column(db.Text)
    coment = db.Column(db.String(100))
    company = db.Column(db.String(100))
    contact = db.Column(db.String(100))
    company_tel = db.Column(db.String(20))
    company_fax = db.Column(db.String(20))
    memo = db.Column(db.Text)
    open_range = db.Column(db.Boolean)
    management_id = db.Column(db.String(100))
    customer_registration = db.Column(db.Boolean)
    image_paths = db.Column(db.Text)  # JSON 
    created_at = db.Column(db.DateTime, nullable=False, server_default=func.now())