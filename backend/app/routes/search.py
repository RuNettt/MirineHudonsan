from flask import Blueprint, request, jsonify
from app.models import db, Bukken
from sqlalchemy import or_

search_bp = Blueprint("search", __name__)

@search_bp.route("/search", methods=["POST"])
def search_properties():
    data = request.get_json()

    # 필터 조건 받아오기
    deal_type = data.get("deal_type")
    area = data.get("area")
    station = data.get("station")
    min_rent = data.get("minRent")
    max_rent = data.get("maxRent")
    min_size = data.get("minSize")
    max_size = data.get("maxSize")
    floor = data.get("floor")
    walk_time = data.get("walkTime")
    roadside = data.get("roadside")
    industry_dict = data.get("industry", {})

    query = Bukken.query

    # 거래 유형 필터
    if deal_type:
        query = query.filter(Bukken.deal_type == deal_type)

    if area:
        query = query.filter(Bukken.large_area == area)

    if station:
        query = query.filter(
            or_(
                Bukken.station1 == station,
                Bukken.station2 == station,
                Bukken.station3 == station
            )
        )

    if min_rent:
        query = query.filter(Bukken.rent >= int(min_rent) * 10000)
    if max_rent:
        query = query.filter(Bukken.rent <= int(max_rent) * 10000)

    if min_size:
        query = query.filter(Bukken.m2 >= float(min_size))
    if max_size:
        query = query.filter(Bukken.m2 <= float(max_size))

    if floor:
        if floor == "3階以上":
            query = query.filter(Bukken.floor_value1 >= 3)
        else:
            try:
                floor_num = int(floor.replace("階", ""))
                query = query.filter(Bukken.floor_value1 == floor_num)
            except ValueError:
                pass

    if walk_time:
        try:
            walk_limit = int(walk_time)
            walk_conditions = []
            if walk_limit > 0:
                walk_conditions.append(Bukken.station1_walk <= walk_limit)
                walk_conditions.append(Bukken.station2_walk <= walk_limit)
                if walk_conditions:
                    query = query.filter(or_(*walk_conditions))
        except ValueError:
            pass

    if roadside:
        query = query.filter(Bukken.extra_condition == True)

    if industry_dict:
        for industry, checked in industry_dict.items():
            if checked:
                query = query.filter(Bukken.business_types.like(f'%"{industry}"%'))

    results = query.limit(50).all()

    output = []
    for b in results:
        output.append({
            "id": b.id,
            "title": f"{b.large_area or ''} {b.address_town or ''}の物件",
            "area": b.large_area,
            "station": b.station1,
            "rent": f"{b.rent // 10000}万円" if b.rent else "-"
        })

    # ✅ 중요: 프론트엔드가 기대하는 구조로 수정
    return jsonify({"results": output})
