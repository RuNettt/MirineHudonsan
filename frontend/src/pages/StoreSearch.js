// src/pages/StoreSearch.js
import React, { useState, useEffect, useMemo, useRef } from "react";
import SearchModal from "../components/SearchModal";
import SiteHeader from "../components/SiteHeader";
import { useNavigate } from "react-router-dom";
import "./StoreSearch.css";

/* ================= 설정: 페이지당 아이템 수 ================= */
const PAGE_SIZE = 6;

/* ================= エリア(大) – 表示ラベル/内部値 ================= */
const AREA_TABS = ["首都圏", "東京23区", "東京都下", "横浜・川崎", "埼玉", "千葉", "大阪"];
const valueToLabel = (v) => (v === "横浜川" ? "横浜・川崎" : v);
const labelToValue = (label) => (label === "横浜・川崎" ? "横浜川" : label);

/* =============== 大エリア → 小エリア(登録フォーム基準のホワイトリスト) =============== */
const SMALLS_BY_LARGE = {
  "東京23区": [
    "千代田区","中央区","港区","新宿区","文京区","台東区","墨田区","江東区","品川区",
    "目黒区","大田区","世田谷区","渋谷区","中野区","杉並区","豊島区","北区","荒川区",
    "板橋区","練馬区","足立区","葛飾区","江戸川区"
  ],
  "東京都下": [
    "八王子市","立川市","武蔵野市","町田市","調布市","三鷹市","青梅市","府中市","小金井市",
    "国立市","昭島市","あきる野市","稲城市","清瀬市","国分寺市","小平市","狛江市","多摩市",
    "西東京市","羽村市","東久留米市","東村山市","東大和市","日野市","福生市","武蔵村山市",
    "西多摩郡"
  ],
  "横浜川": [
    "横浜市鶴見区","横浜市神奈川区","横浜市西区","横浜市中区","横浜市南区","横浜市保土ケ谷区",
    "横浜市磯子区","横浜市金沢区","横浜市港北区","横浜市戸塚区","横浜市港南区","横浜市旭区",
    "横浜市緑区","横浜市瀬谷区","横浜市栄区","横浜市泉区","横浜市青葉区","横浜市都筑区",
    "川崎市川崎区","川崎市幸区","川崎市中原区","川崎市高津区","川崎市多摩区","川崎市宮前区","川崎市麻生区",
    "相模原市緑区","相模原市中央区","相模原市南区","横須賀市","平塚市","鎌倉市","藤沢市","小田原市","茅ヶ崎市",
    "逗子市","秦野市","三浦市","厚木市","大和市","伊勢原市","海老名市","座間市","南足柄市","綾瀬市",
    "三浦郡","高座郡","中郡","足柄上郡","足柄下郡","愛甲郡","津久井郡"
  ],
  "埼玉": [
    "さいたま市浦和区","さいたま市大宮区","さいたま市北区","さいたま市桜区","さいたま市中央区","さいたま市西区",
    "さいたま市緑区","さいたま市南区","さいたま市見沼区","さいたま市岩槻区","上尾市","朝霞市","入間市","桶川市",
    "春日部市","加須市","ふじみ野市","川口市","川越市","北本市","行田市","久喜市","熊谷市","鴻巣市","越谷市",
    "坂戸市","幸手市","狭山市","志木市","草加市","秩父市","鶴ヶ島市","所沢市","戸田市","新座市","蓮田市","羽生市",
    "飯能市","東松山市","日高市","深谷市","富士見市","本庄市","三郷市","八潮市","吉川市","和光市","蕨市","白岡市",
    "入間郡","大里郡","北足立郡","北葛飾郡","児玉郡","秩父郡","比企郡","南埼玉郡"
  ],
  "千葉": [
    "千葉市中央区","千葉市花見川区","千葉市稲毛区","千葉市若葉区","千葉市緑区","千葉市美浜区","銚子市","市川市",
    "船橋市","館山市","木更津市","松戸市","野田市","佐原市","茂原市","佐倉市","成田市","東金市","旭市","八日市場市",
    "習志野市","柏市","勝浦市","市原市","流山市","八千代市","我孫子市","鴨川市","鎌ヶ谷市","君津市","富津市","浦安市",
    "四街道市","袖ヶ浦市","八街市","印南市","印西市","白井市","冨里市","南房総市","匝瑳市","香取市","山武市","いすみ市",
    "大網白里市","安房郡","夷隈郡","長生郡","山武郡","東葛飾郡","印旛郡","香取郡","海上郡","匝瑳郡"
  ],
  "大阪": [
    "大阪市都島区","大阪市福島区","大阪市此花区","大阪市西区","大阪市港区","大阪市大正区","大阪市天王寺区",
    "大阪市浪速区","大阪市西淀川区","大阪市東淀川区","大阪市東成区","大阪市生野区","大阪市旭区","大阪市城東区",
    "大阪市阿倍野区","大阪市住吉区","大阪市東住吉区","大阪市西成区","大阪市淀川区","大阪市鶴見区","大阪市住之江区",
    "大阪市平野区","大阪市北区","大阪市中央区","堺市堺区","堺市中区","堺市東区","堺市西区","堺市南区","堺市北区",
    "堺市美原区","岸和田市","豊中市","池田市","吹田市","泉大津市","高槻市","貝塚市","守口市","枚方市","茨木市",
    "八尾市","泉佐野市","富田林市","寝屋川市","河内長野市","松原市","大東市","和泉市","箕面市","柏原市","羽曳野市",
    "門真市","摂津市","高石市","藤井寺市","東大阪市","泉南市","四條畷市","交野市","大阪狭山市","阪南市","三島郡",
    "豊能郡","泉北郡","泉南郡","南河内郡"
  ],
};

/* =================== 業種ツリー =================== */
const FOOD_CHILDREN = ["重飲食", "軽飲食", "バー・クラブ"];
const NONFOOD_TREE = {
  "美容室・理容室": ["美容室・理容室"],
  "サロン（エステ・ネイル・その他など）": ["エステサロン", "ネイルサロン", "その他（サロン）"],
  "医療・歯科・クリニック": ["クリニック", "歯科", "薬局", "その他（医療系）"],
  "物販・小売": ["物販・アパレル", "コンビニ", "その他（小売）"],
  "ジム・教室・スタジオ": ["スタジオ", "ジム", "教室", "その他（スクール）"],
  "その他サービス・その他": ["その他店舗物件"],
};
const ALL_NONFOOD_GROUPS = Object.keys(NONFOOD_TREE);
const ALL_NONFOOD_SUBS = ALL_NONFOOD_GROUPS.flatMap((g) => NONFOOD_TREE[g]);

/* =================== ラベル → DB business_types キー =================== */
const FOOD_LABEL_TO_KEYS = {
  "重飲食": ["food_heavy"],
  "軽飲食": ["food_light"],
  "バー・クラブ": ["food_bar"],
};
const NONFOOD_LABEL_TO_KEYS = {
  "美容室・理容室": ["beauty_sal", "beauty_sub1"],
  "エステサロン": ["salon_est", "salon_esthe"],
  "ネイルサロン": ["salon_nail"],
  "その他（サロン）": ["salon_other"],
  "クリニック": ["clinic", "clinic_c"],
  "歯科": ["clinic_dent"],
  "薬局": ["clinic_pharm"],
  "その他（医療系）": ["clinic_other"],
  "物販・アパレル": ["retail", "retail_app"],
  "コンビニ": ["retail_conv"],
  "その他（小売）": ["retail_other"],
  "スタジオ": ["gym_studio"],
  "ジム": ["gym", "gym_gym"],
  "教室": ["gym_class"],
  "その他（スクール）": ["gym_school"],
  "その他店舗物件": ["other_service", "other_store"],
};

/* =================== ヘルパ =================== */
const norm = (s = "") =>
  String(s).trim().replace(/\s+/g, "").replace(/[‐–—ー\-ｰ･・]/g, "・");
const stripPlaceSuffix = (s = "") => String(s).replace(/(区|市|郡|町|村)$/, "");
const placeKey = (s = "") => norm(stripPlaceSuffix(s));

const toNumber = (v) => {
  if (v == null || v === "") return NaN;
  const n = Number(String(v).toString().replace(/[, ]/g, ""));
  return Number.isFinite(n) ? n : NaN;
};

/** m²がない場合は 坪→㎡ 変換 */
const getM2_safe = (row) => {
  const m2 = toNumber(row.m2);
  if (Number.isFinite(m2) && m2 > 0) return m2;
  const tsubo = toNumber(row.tsubo);
  return Number.isFinite(tsubo) && tsboToM2(tsubo);
};
const tsboToM2 = (t) => (Number.isFinite(t) && t > 0 ? t * 3.305785 : NaN);

const getBizTypes = (row) => {
  let bt = row?.business_types;
  if (!bt) return {};
  if (typeof bt === "string") {
    try { bt = JSON.parse(bt); } catch { bt = {}; }
  }
  return (bt && typeof bt === "object") ? bt : {};
};
const getFloorFlags = (row) => {
  const type = String(row.floor_type1 || row.floor_type || "");
  const vRaw = row.floor_value1 ?? row.floor ?? null;
  const v = toNumber(vRaw);
  const text = `${type}${Number.isFinite(v) ? `${v}階` : ""}`;
  const isB = /地下|B\d/i.test(text) || /地下/i.test(type);
  const is1 = (Number.isFinite(v) && v === 1) || /(^|[^0-9])1階($|[^0-9])/i.test(text);
  const is2up = (Number.isFinite(v) && v >= 2) || /([2-9]階|[2-9]F)/i.test(text);
  return { isB, is1, is2up, text };
};
const isRoadside = (row) => {
  const v = row.roadside ?? row.road_side;
  if (typeof v === "boolean") return v;
  const blob = `${row.extra_condition || ""} ${row.remarks || ""} ${row.coment || ""}`;
  return /ロードサイド|ロード\s*サイド|路面|幹線沿い/i.test(blob);
};
// 徒歩分
const getWalkMinutes = (row) => {
  const cand = row.station1_walk ?? row.walk_minutes ?? row.walk;
  if (typeof cand === "number") return cand;
  if (cand == null) return NaN;
  const m = String(cand).match(/\d+/);
  return m ? Number(m[0]) : NaN;
};

/** DB レコードから large/small を解釈 */
function getRecordLargeSmall(b) {
  let large = labelToValue(b.large_area || b.area || b.region || "");
  let small = (b.small_area || b.city || b.ward || "").trim();

  const blob = norm(
    [
      b.large_area, b.small_area,
      b.address_town, b.address_chome, b.address_banchi, b.address_go, b.address_building,
      b.station1, b.station2, b.station3
    ].filter(Boolean).join("")
  );

  if (!large || !(large in SMALLS_BY_LARGE)) {
    const smallKey = placeKey(small);
    for (const [lg, list] of Object.entries(SMALLS_BY_LARGE)) {
      const hit = list.find(
        (name) => placeKey(name) === smallKey || blob.includes(placeKey(name))
      );
      if (hit) {
        large = lg;
        if (!small) small = hit;
        break;
      }
    }
  }

  if (!large || !(large in SMALLS_BY_LARGE)) {
    if (blob.includes("東京")) {
      const is23 = SMALLS_BY_LARGE["東京23区"].some((w) => blob.includes(placeKey(w)));
      large = is23 ? "東京23区" : "東京都下";
    } else if (blob.includes("横浜") || blob.includes("川崎")) {
      large = "横浜川";
    } else if (blob.includes("埼玉")) large = "埼玉";
    else if (blob.includes("千葉")) large = "千葉";
    else if (blob.includes("大阪")) large = "大阪";
  }

  const white = SMALLS_BY_LARGE[large] || [];
  if (white.length) {
    const hit = white.find(
      (name) => placeKey(name) === placeKey(small) || blob.includes(placeKey(name))
    );
    if (hit) small = hit;
  }

  return { large, small };
}

/** 地域 + 徒歩(分) */
function matchesByFormRules(b, constraints = {}) {
  const wantLarge = constraints.large_area || "";
  const wantSmalls = Array.isArray(constraints.small_area) ? constraints.small_area : [];
  const maxWalk = toNumber(constraints.walk_minutes_max ?? constraints.walkMax);

  // 地域
  let areaOK = true;
  if (wantLarge || wantSmalls.length > 0) {
    areaOK = false;

    const rawTxt = [
      b.large_area, b.small_area,
      b.address_town, b.address_chome, b.address_banchi, b.address_go, b.address_building,
      b.station1, b.station2, b.station3
    ].filter(Boolean).join(" ");
    const blob = norm(rawTxt);

    const { large: recLarge, small: recSmall } = getRecordLargeSmall(b);
    const recKey = placeKey(recSmall || "");

    if (wantLarge && wantSmalls.length > 0) {
      const largeHitRaw = rawTxt.includes(valueToLabel(wantLarge)) || rawTxt.includes(wantLarge);
      const smallHitRaw = wantSmalls.some((s) => rawTxt.includes(String(s)));
      areaOK = largeHitRaw && smallHitRaw;
    } else if (wantSmalls.length > 0) {
      areaOK = wantSmalls.some((w) => {
        const wKey = placeKey(String(w));
        return recKey.includes(wKey) || blob.includes(wKey);
      });
    } else if (wantLarge) {
      if (wantLarge === "横浜川") {
        areaOK =
          /(横浜|川崎)/.test(rawTxt) || /(横浜|川崎)/.test(blob) ||
          (SMALLS_BY_LARGE[wantLarge] || []).some((w) => rawTxt.includes(w) || blob.includes(placeKey(w))) ||
          recLarge === wantLarge ||
          rawTxt.includes(valueToLabel(wantLarge)) || blob.includes(norm(wantLarge));
      } else {
        areaOK =
          (SMALLS_BY_LARGE[wantLarge] || []).some((w) => rawTxt.includes(w) || blob.includes(placeKey(w))) ||
          recLarge === wantLarge ||
          rawTxt.includes(valueToLabel(wantLarge)) || blob.includes(norm(wantLarge));
      }
    } else {
      areaOK = true;
    }
  }

  // 徒歩(分)
  let walkOK = true;
  if (Number.isFinite(maxWalk)) {
    const w = getWalkMinutes(b);
    walkOK = Number.isFinite(w) && w <= maxWalk;
  }

  return areaOK && walkOK;
}

/* =================== サイドフィルタ =================== */
function matchesBySideFilters(row, filters = {}) {
  if (!filters) return true;

  // 業種(OR)
  const wantedFood = Array.isArray(filters.food) ? filters.food : [];
  const wantedNonFood = Array.isArray(filters.nonFoodSubs) ? filters.nonFoodSubs : [];
  if (wantedFood.length || wantedNonFood.length) {
    const bt = getBizTypes(row);
    const keySet = new Set();
    wantedFood.forEach((label) => (FOOD_LABEL_TO_KEYS[label] || []).forEach((k) => keySet.add(k)));
    wantedNonFood.forEach((label) => (NONFOOD_LABEL_TO_KEYS[label] || []).forEach((k) => keySet.add(k)));
    if (keySet.size > 0) {
      const any = [...keySet].some((k) => !!bt[k]);
      if (!any) return false;
    }
  }

  // 賃料(万円 → 円)
  const minYen = filters.rentMin != null ? Number(filters.rentMin) * 10000 : null;
  const maxYen = filters.rentMax != null ? Number(filters.rentMax) * 10000 : null;
  if (minYen != null || maxYen != null) {
    const rentYen = toNumber(row.rent);
    if (minYen != null && !(Number.isFinite(rentYen) && rentYen >= minYen)) return false;
    if (maxYen != null && !(Number.isFinite(rentYen) && rentYen <= maxYen)) return false;
  }

  // 面積(m²)
  const sMin = filters.sizeMin != null ? Number(filters.sizeMin) : null;
  const sMax = filters.sizeMax != null ? Number(filters.sizeMax) : null;
  if (sMin != null || sMax != null) {
    const area = getM2_safe(row);
    if (sMin != null && !(Number.isFinite(area) && area >= sMin)) return false;
    if (sMax != null && !(Number.isFinite(area) && area <= sMax)) return false;
  }

  // 物件の状態(OR)
  const cond = Array.isArray(filters.condition) ? filters.condition : [];
  if (cond.length) {
    const blob = `${row.state || ""} ${row.extra_condition || ""} ${row.remarks || ""}`;
    const ok = cond.some((name) => blob.includes(name));
    if (!ok) return false;
  }

  // 階(OR)
  const floors = Array.isArray(filters.floors) ? filters.floors : [];
  if (floors.length) {
    const f = getFloorFlags(row);
    const ok =
      (floors.includes("地下") && f.isB) ||
      (floors.includes("1階") && f.is1) ||
      (floors.includes("2階以上") && f.is2up);
    if (!ok) return false;
  }

  // ロードサイド
  if (filters.roadside) {
    if (!isRoadside(row)) return false;
  }

  // フリーワード (AND)
  const q = String(filters.q || "").trim();
  if (q) {
    const tokens = q.split(/\s+/).filter(Boolean);
    if (tokens.length) {
      const bt = getBizTypes(row);
      const bizWords = Object.keys(bt).filter((k) => bt[k]).join(" ");
      const floorTxt = getFloorFlags(row).text;

      const hay =
        [
          row.large_area, row.small_area,
          row.address_town, row.address_chome, row.address_banchi, row.address_go, row.address_building,
          row.station1, row.station2, row.station3, row.prev_tenant,
          row.extra_condition, row.state, row.remarks, row.coment, row.company,
          bizWords, floorTxt,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

      const ok = tokens.every((t) => hay.includes(t.toLowerCase()));
      if (!ok) return false;
    }
  }

  return true;
}

/** 左タブ(見た目) */
function matchByViewTab(item, selectedTab) {
  if (!selectedTab || selectedTab === "首都圏") return true;
  const { large } = getRecordLargeSmall(item);
  const label = valueToLabel(large);
  return label === selectedTab;
}

/** 画像 URL */
function buildUrlFromPaths(paths, API_BASE) {
  let list = [];
  if (Array.isArray(paths)) list = paths;
  else if (typeof paths === "string" && paths.trim()) {
    try {
      const parsed = JSON.parse(paths);
      list = Array.isArray(parsed) ? parsed : [paths];
    } catch {
      list = [paths];
    }
  }
  const first = list[0]?.toString().trim();
  if (!first) return null;
  if (/^https?:\/\//i.test(first) || first.startsWith("data:")) return first;
  return `${API_BASE}/api/admin/uploads/${first}`;
}

/** 安全 getter */
const G = (o, keys, fallback = "—") => {
  if (!o) return fallback;
  for (const k of keys) {
    const v = o[k];
    if (v !== undefined && v !== null && String(v) !== "") return v;
  }
  return fallback;
};

const DEBUG = false;

/* ===================== 保存/要約ユーティリティ ===================== */
const SAVED_KEY = "store_saved_conditions_v1";
const APPLY_KEY = "store_apply_saved_v1"; // ✅ 保存条件の適用指示

// 駅を複数保持
const defaultRegion = {
  large_area: "",
  small_area: [],
  station: "",
  station_list: [],
  walk_minutes_max: null,
};

const defaultSide = {
  foodAll: false, food: [],
  nonFoodAll: false, nonFoodGroups: [], nonFoodSubs: [],
  rentMin: null, rentMax: null, sizeMin: null, sizeMax: null,
  condition: [], floors: [], roadside: false, q: "",
};

const loadSaved = () => {
  try {
    const arr = JSON.parse(localStorage.getItem(SAVED_KEY)) || [];
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
};
const saveSaved = (list) => localStorage.setItem(SAVED_KEY, JSON.stringify(list));

function fmtRange(prefix, min, max, unit = "") {
  const hasMin = min != null && min !== "";
  const hasMax = max != null && max !== "";
  if (!hasMin && !hasMax) return "";
  if (hasMin && hasMax) return `${prefix}${min}${unit}〜${max}${unit}`;
  if (hasMin) return `${prefix}${min}${unit}〜`;
  return `${prefix}〜${max}${unit}`;
}

function summarize(rc, sf) {
  const parts = [];
  if (Array.isArray(rc.station_list) && rc.station_list.length) {
    parts.push(rc.station_list.join("・"));
  } else if (rc.station) {
    parts.push(rc.station);
  } else if (rc.small_area?.length) {
    parts.push(rc.small_area.join("・"));
  }
  if (Number.isFinite(Number(rc.walk_minutes_max)) && Number(rc.walk_minutes_max) > 0) {
    parts.push(`徒歩${Number(rc.walk_minutes_max)}分以内`);
  }
  const rentTxt = fmtRange("賃料", sf.rentMin, sf.rentMax, "万");
  if (rentTxt) parts.push(rentTxt);
  const sizeTxt = fmtRange("面積", sf.sizeMin, sf.sizeMax, "㎡");
  if (sizeTxt) parts.push(sizeTxt);
  if (sf.food?.length) parts.push(sf.food.join("、"));
  if (sf.nonFoodSubs?.length) parts.push(sf.nonFoodSubs.join("、"));
  if (!sf.nonFoodSubs?.length && sf.nonFoodGroups?.length) parts.push(sf.nonFoodGroups.join("、"));
  if (sf.condition?.length) parts.push(sf.condition.join("・"));
  if (sf.floors?.length) parts.push(sf.floors.join("・"));
  if (sf.roadside) parts.push("ロードサイド");
  if (sf.q) parts.push(sf.q);
  return parts.filter(Boolean).join("、");
}

/* =================== 페이지네이션 컴포넌트 =================== */
function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const go = (p) => onChange(Math.min(Math.max(1, p), totalPages));

  // 1 ... (page-2)(page-1) page (page+1)(page+2) ... last
  const window = 2;
  const items = [];
  const push = (v, key = v) =>
    items.push(
      <li key={key} className={`page-item ${v === page ? "active" : ""}`}>
        {typeof v === "number" ? (
          <button className="page-link" onClick={() => go(v)}>{v}</button>
        ) : (
          <span className="page-link disabled">{v}</span>
        )}
      </li>
    );

  push(1);
  const start = Math.max(2, page - window);
  const end = Math.min(totalPages - 1, page + window);
  if (start > 2) push("…", "l-ellipsis");
  for (let i = start; i <= end; i++) push(i);
  if (end < totalPages - 1) push("…", "r-ellipsis");
  if (totalPages > 1) push(totalPages);

  return (
    <nav aria-label="ページナビ" className="d-flex align-items-center justify-content-end">
      <ul className="pagination mb-0">
        <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
          <button className="page-link" onClick={() => go(page - 1)}>前の6件</button>
        </li>
        {items}
        <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
          <button className="page-link" onClick={() => go(page + 1)}>次の6件</button>
        </li>
      </ul>
    </nav>
  );
}

/* =================== 本体 =================== */
function StoreSearch({ onBack }) {
  const navigate = useNavigate();
  const asideRef = useRef(null);
  const searchBtnRef = useRef(null);
  const listTopRef = useRef(null); // 결과 목록 상단 앵커

  const [mode, setMode] = useState("region");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const [detailMap, setDetailMap] = useState({});
  const [selectedTab, setSelectedTab] = useState("首都圏");

  // 페이지네이션
  const [page, setPage] = useState(1);

  // 🔐 요청 경합 방지용 최신요청 id
  const activeReqRef = useRef(0);

  // 地域/駅
  const [modalConstraints, setModalConstraints] = useState(defaultRegion);
  // 左フィルタ
  const [sideFilters, setSideFilters] = useState(defaultSide);

  // 요약 텍스트
  const summaryText = useMemo(
    () => summarize(modalConstraints, sideFilters),
    [modalConstraints, sideFilters]
  );

  // 검색 결과/탭이 바뀌면 페이지 1로
  useEffect(() => { setPage(1); }, [searchResults, selectedTab]);

  // 페이지 변경 시 목록 상단으로 스크롤
  useEffect(() => {
    const el = listTopRef.current;
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [page]);

  // 공통 업데이트 + 검색
  const updateAndSearch = async (nextRC, nextSF) => {
    setModalConstraints(nextRC);
    setSideFilters(nextSF);
    setSearchResults([]);
    setPage(1);
    await runSearch(nextRC, nextSF);
  };

  const [savedOpen, setSavedOpen] = useState(false);
  const [savedList, setSavedList] = useState(loadSaved());

  const API_BASE = (process.env.REACT_APP_API_BASE_URL || "http://localhost:5000").replace(/\/+$/, "");

  /* 初期ロード */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const my = ++activeReqRef.current;
        const res = await fetch(`${API_BASE}/api/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deal_type: "店舗物件" }),
        });
        const data = await res.json();
        if (activeReqRef.current !== my) return;
        const rows = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
        setSearchResults(rows);
      } catch (e) {
        console.error("初期データ取得失敗:", e);
        setSearchResults([]);
      } finally {
        setTimeout(() => { if (activeReqRef.current) setLoading(false); }, 0);
      }
    })();
  }, [API_BASE]);

  /* ✅ 保存条件 適用 */
  useEffect(() => {
    const raw = localStorage.getItem(APPLY_KEY);
    if (!raw) return;
    (async () => {
      try {
        const payload = JSON.parse(raw) || {};
        if (payload?.source && payload.source !== "store") return;

        const saved = JSON.parse(localStorage.getItem(SAVED_KEY)) || [];
        const item = saved.find((x) => x.id === payload.id);
        if (!item) return;

        setModalConstraints(item.region || defaultRegion);
        setSideFilters(item.filters || defaultSide);
        if (item?.region?.large_area) setSelectedTab(valueToLabel(item.region.large_area));
        else setSelectedTab("首都圏");

        setSearchResults([]);
        setPage(1);
        await runSearch(item.region || defaultRegion, item.filters || defaultSide);
      } catch (e) {
        console.error("APPLY_KEY parse error:", e);
      } finally {
        localStorage.removeItem(APPLY_KEY);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* サーバ検索 + クライアントフィルタ */
  const runSearch = async (regionConstraints, sideFiltersArg) => {
    try {
      setLoading(true);
      const my = ++activeReqRef.current;

      const rc = regionConstraints || {};
      const sf = sideFiltersArg || {};

      const serverBody = {
        deal_type: "店舗物件",
        ...(rc.large_area ? { area: rc.large_area } : {}),
        ...(Array.isArray(rc.small_area) && rc.small_area.length
          ? { region: rc.small_area[0], regions: rc.small_area }
          : {}),
        ...(rc.station ? { station: rc.station } : {}),
        ...(sf.rentMin != null ? { minRent: sf.rentMin } : {}),
        ...(sf.rentMax != null ? { maxRent: sf.rentMax } : {}),
        ...(sf.sizeMin != null ? { minSize: sf.sizeMin } : {}),
        ...(sf.sizeMax != null ? { maxSize: sf.sizeMax } : {}),
      };

      const res = await fetch(`${API_BASE}/api/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serverBody),
      });
      const data = await res.json();
      if (activeReqRef.current !== my) return;
      const raw = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];

      const needRegion = !!rc.large_area || ((rc.small_area || []).length > 0);
      const needBiz = (sf.food && sf.food.length) || (sf.nonFoodSubs && sf.nonFoodSubs.length);
      const needFloor = (sf.floors && sf.floors.length) || sf.roadside;
      const needQ = !!(sf.q && sf.q.trim());
      const needWalk = Number.isFinite(toNumber(rc.walk_minutes_max));
      const needDetail = !!(needRegion || needBiz || needFloor || needQ || needWalk);

      let enriched = raw;
      if (needDetail && raw.length) {
        enriched = await Promise.all(
          raw.map(async (r) => {
            try {
              const d = await fetch(`${API_BASE}/api/admin/bukken/${r.id}`);
              if (!d.ok) return r;
              const det = await d.json();
              return { ...r, ...det };
            } catch {
              return r;
            }
          })
        );
        if (activeReqRef.current !== my) return;
      }

      const filtered = enriched
        .filter((b) => matchesByFormRules(b, rc))
        .filter((b) => matchesBySideFilters(b, sf));

      if (DEBUG) {
        console.groupCollapsed("[runSearch] after client filters");
        console.log("serverCount :", raw.length);
        console.log("clientCount :", filtered.length);
        console.log("region     :", rc);
        console.log("sideFilters:", sf);
        console.groupEnd();
      }

      if (activeReqRef.current !== my) return;
      setSearchResults(filtered);
      setDetailMap((m) => m);
    } catch (e) {
      console.error("検索失敗:", e);
    } finally {
      setTimeout(() => { if (activeReqRef.current) setLoading(false); }, 0);
    }
  };

  /* モーダル検索実行 — エリア+地域 or エリア+駅 */
  const handleModalSearch = async (fromModal) => {
    const largeVal = labelToValue(fromModal?.large_area || "");

    const wantsRaw =
      (Array.isArray(fromModal?.small_areas) && fromModal.small_areas) ||
      (Array.isArray(fromModal?.small_area)  && fromModal.small_area)  ||
      (Array.isArray(fromModal?.smallAreas)  && fromModal.smallAreas)  ||
      (Array.isArray(fromModal?.smallArea)   && fromModal.smallArea)   ||
      [];
    const whitelist = SMALLS_BY_LARGE[largeVal] || [];
    const cleanedSmalls = Array.from(
      new Set(wantsRaw.filter((s) => whitelist.includes(String(s).trim())))
    );

    const stationsRaw = [
      ...(Array.isArray(fromModal?.stations) ? fromModal.stations : []),
      ...(Array.isArray(fromModal?.station_list) ? fromModal.station_list : []),
      ...(Array.isArray(fromModal?.selectedStations) ? fromModal.selectedStations : []),
      typeof fromModal?.station === "string" ? fromModal.station : "",
    ].map((s) => String(s || "").trim()).filter(Boolean);
    const stationUniq = Array.from(new Set(stationsRaw));
    const station = stationUniq[0] || "";

    const walkMax = fromModal?.walk_minutes_max != null
      ? Number(fromModal.walk_minutes_max)
      : null;

    const nextRegion =
      fromModal?._from === "station"
        ? {
            large_area: largeVal,
            small_area: [],
            station,
            station_list: stationUniq,
            walk_minutes_max: walkMax,
          }
        : {
            large_area: largeVal,
            small_area: cleanedSmalls,
            station: "",
            station_list: [],
            walk_minutes_max: walkMax,
          };

    const groupFromModal = Array.isArray(fromModal?.nonFoodGroups) ? fromModal.nonFoodGroups : [];
    const subsFromModal  = Array.isArray(fromModal?.nonFoodSubs) ? fromModal.nonFoodSubs : [];
    const resolvedSubs = subsFromModal.length
      ? subsFromModal
      : groupFromModal.flatMap((g) => NONFOOD_TREE[g] || []);

    const mergedFilters = {
      ...sideFilters,
      ...(Array.isArray(fromModal?.food) && fromModal.food.length ? { food: fromModal.food } : {}),
      ...(resolvedSubs.length ? { nonFoodSubs: resolvedSubs } : {}),
      ...(groupFromModal.length ? { nonFoodGroups: groupFromModal } : {}),
      ...(fromModal?.rentMin ? { rentMin: Number(fromModal.rentMin) } : {}),
      ...(fromModal?.rentMax ? { rentMax: Number(fromModal.rentMax) } : {}),
      ...(fromModal?.sizeMin ? { sizeMin: Number(fromModal.sizeMin) } : {}),
      ...(fromModal?.sizeMax ? { sizeMax: Number(fromModal.sizeMax) } : {}),
      ...(Array.isArray(fromModal?.floors) && fromModal.floors.length ? { floors: fromModal.floors } : {}),
      ...(fromModal?.roadside != null ? { roadside: !!fromModal.roadside } : {}),
      ...(Array.isArray(fromModal?.condition) && fromModal.condition.length ? { condition: fromModal.condition } : {}),
      ...(fromModal?.q ? { q: fromModal.q } : {}),
    };

    setIsModalOpen(false);
    if (largeVal) setSelectedTab(valueToLabel(largeVal));

    await updateAndSearch(nextRegion, mergedFilters);
  };

  /* 左「この条件で検索」 */
  const handleSideFilterSearch = async () => {
    setSearchResults([]);
    setPage(1);
    await runSearch({ ...modalConstraints }, sideFilters);
  };

  /* 条件保存 */
  const handleSaveConditions = () => {
    const label = summarize(modalConstraints, sideFilters) || "（条件なし）";
    const item = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      createdAt: new Date().toISOString(),
      region: modalConstraints,
      filters: sideFilters,
      label,
      source: "store",
    };
    const next = [item, ...savedList].slice(0, 100);
    setSavedList(next);
    saveSaved(next);
    alert("条件を保存しました。ヘッダーの『保存条件』から確認できます。");
  };

  /* 条件クリア */
  const handleClearConditions = async () => {
    setModalConstraints(defaultRegion);
    setSideFilters(defaultSide);
    setSelectedTab("首都圏");
    setSearchResults([]);
    setPage(1);
    await runSearch(defaultRegion, defaultSide);
  };

  /* 詳細(画像含む) 遅延ロード */
  useEffect(() => {
    let aborted = false;
    const targets = (searchResults || []).filter((r) => r?.id && !detailMap[r.id]);
    if (!targets.length) return;

    (async () => {
      for (const item of targets) {
        try {
          const res = await fetch(`${API_BASE}/api/admin/bukken/${item.id}`);
          if (!res.ok) continue;
          const detail = await res.json();
          if (!aborted) {
            setDetailMap((prev) => (prev[item.id] ? prev : { ...prev, [item.id]: detail }));
          }
        } catch {}
      }
    })();

    return () => { aborted = true; };
  }, [searchResults, API_BASE, detailMap]);

  const mergeDetail = (row) => (detailMap[row.id] ? { ...row, ...detailMap[row.id] } : row);

  const results = useMemo(() => {
    const filtered = (searchResults || []).filter((it) => matchByViewTab(it, selectedTab));
    return filtered.sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")));
  }, [searchResults, selectedTab]);

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const pageItems = results.slice(start, start + PAGE_SIZE);

  const addFav = (item) => {
    const merged = mergeDetail(item);
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    if (favorites.find((f) => f.id === merged.id && f.deal_type === "店舗物件")) {
      alert("すでにお気に入りに追加されています");
      return;
    }
    const { large, small } = getRecordLargeSmall(merged);
    favorites.push({
      id: merged.id,
      deal_type: "店舗物件",
      large_area: large,
      small_area: small,
      address_town: merged.address_town || "",
      address_building: merged.address_building || "",
      rent: merged.rent || "",
      image_paths: merged.image_paths || [],
      created_at: new Date().toLocaleDateString("ja-JP"),
    });
    localStorage.setItem("favorites", JSON.stringify(favorites));
    alert("お気に入りに追加しました");
  };

  const gotoDetail = (id) => navigate(`/bukken/${id}`);

  /* 保存条件 実行/削除（モーダル内用） */
  const runSaved = async (item) => {
    setSavedOpen(false);
    setModalConstraints(item.region || defaultRegion);
    setSideFilters(item.filters || defaultSide);
    if (item?.region?.large_area) {
      setSelectedTab(valueToLabel(item.region.large_area));
    } else {
      setSelectedTab("首都圏");
    }
    setSearchResults([]);
    setPage(1);
    await runSearch(item.region || defaultRegion, item.filters || defaultSide);
  };
  const deleteSaved = (id) => {
    const next = savedList.filter((x) => x.id !== id);
    setSavedList(next);
    saveSaved(next);
  };

  return (
    <>
      <SiteHeader
        selectedArea={selectedTab}
        rightExtra={
          <button className="btn btn-outline-primary btn-sm ms-2" onClick={() => setSavedOpen(true)}>
            保存条件
          </button>
        }
      />

      <div className="container my-4">
        <h2 className="mb-3 store-title">店舗物件一覧</h2>

        <div className="row g-3">
          {/* 左パネル */}
          <aside ref={asideRef} className="col-lg-3" id="filter-aside">
            {/* 選択中の条件 */}
            <div className="as-panel shadow-sm selected-card mb-3">
              <div className="as-header">選択中の条件</div>
              <div className="as-body selected-body">
                <div
                  className={`selected-summary ${summaryText ? "" : "text-muted"}`}
                  title={summaryText || "—"}
                >
                  {summaryText || "—"}
                </div>
                <div className="selected-actions">
                  <button className="btn btn-outline-secondary btn-sm" onClick={handleClearConditions}>
                    条件クリア
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={handleSaveConditions}>
                    保存する
                  </button>
                </div>
              </div>
            </div>

            <div className="area-tabs">
              {AREA_TABS.map((label) => (
                <button
                  key={label}
                  className={`area-tab ${selectedTab === label ? "active" : ""}`}
                  onClick={async () => {
                    const largeVal = label === "首都圏" ? "" : labelToValue(label);
                    const next = largeVal ? { ...defaultRegion, large_area: largeVal } : { ...defaultRegion };
                    setModalConstraints(next);
                    setSelectedTab(label);
                    setSearchResults([]);
                    setPage(1);
                    await runSearch(next, sideFilters);
                  }}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>

            {/* 地域/駅で絞る */}
            <div className="as-panel shadow-sm">
              <div className="as-header">地域/駅で絞る</div>
              <div className="as-body">
                <button
                  className="as-btn"
                  onClick={() => { setMode("region"); setIsModalOpen(true); }}
                >
                  <span className="as-ico">📍</span>地域から探す
                </button>
                <button
                  className="as-btn"
                  onClick={() => { setMode("station"); setIsModalOpen(true); }}
                >
                  <span className="as-ico">🚉</span>駅から探す
                </button>
              </div>
            </div>

            {/* 条件で絞る */}
            <FilterPanel
              filters={sideFilters}
              setFilters={setSideFilters}
              onSearch={handleSideFilterSearch}
              buttonRef={searchBtnRef}
            />

            {onBack && (
              <button className="btn btn-secondary w-100 mt-3" onClick={onBack}>
                戻る
              </button>
            )}
          </aside>

          {/* 右：結果 */}
          <main className="col-lg-9">
            <div ref={listTopRef} className="mb-2 d-flex justify-content-between align-items-center">
              <div className="text-muted small">
                エリア：{selectedTab}／{results.length}件
              </div>
              {/* 상단 페이지네이션 */}
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </div>

            {loading ? (
              <div className="text-muted">読み込み中…</div>
            ) : results.length === 0 ? (
              <div className="text-muted">該当する物件がありません。</div>
            ) : (
              pageItems.map((row, i) => {
                const b = mergeDetail(row);
                const img = buildUrlFromPaths(b.image_paths, API_BASE);

                const station = G(b, ["station1"], "");
                const walk = G(b, ["station1_walk"], "");
                const m2 = G(b, ["m2"], "");
                const tsubo = G(b, ["tsubo"], "");
                const floor = G(b, ["floor_value1"], "");
                const floorClass = G(b, ["floor_type1"], "—");

                const above = G(b, ["building_upper"], "");
                const below = G(b, ["building_lower"], "");

                const rent = G(b, ["rent"], "");
                const structure = G(b, ["structure"], "—");
                const renewalFee = G(b, ["renewal_fee"], "—");
                const previous = G(b, ["prev_tenant"], "—");
                const company = G(b, ["company"], "—");

                const address = [
                  b.small_area,
                  b.address_town,
                  b.address_chome,
                  b.address_banchi,
                  b.address_go,
                  b.address_building,
                ].filter(Boolean)
                 .reduce((acc, cur) => (acc.includes(cur) ? acc : [...acc, cur]), [])
                 .join(" ") || "—";

                const deposit = (() => {
                  const yen = G(b, ["deposit_yen"], "");
                  const mon = G(b, ["deposit_month"], "");
                  const neg = G(b, ["deposit_neg"], "");
                  if (yen) return `${yen}円`;
                  if (mon) return `${mon}ヶ月`;
                  if (neg) return "相談";
                  return "—";
                })();

                const keyMoney = (() => {
                  const yen = G(b, ["key_money_yen"], "");
                  const mon = G(b, ["key_money_month"], "");
                  const neg = G(b, ["key_money_neg"], "");
                  if (yen) return `${yen}円`;
                  if (mon) return `${mon}ヶ月`;
                  if (neg) return "相談";
                  return "—";
                })();

                const ztPrice = (() => {
                  const fee = G(b, ["transfer_fee"], "");
                  const neg = G(b, ["transfer_neg"], "");
                  if (fee) return `${fee}`;
                  if (neg) return "相談";
                  return "";
                })();

                return (
                  <article
                    key={b.id || i}
                    className="jp-card jp-clickable"
                    onClick={() => gotoDetail(b.id)}
                  >
                    <div className="jp-head">
                      <span className="jp-badge-new">New</span>
                      <button
                        className="jp-title"
                        onClick={(e) => { e.stopPropagation(); gotoDetail(b.id); }}
                      >
                        {address}
                        {(station || walk)
                          ? `（${station || ""}${walk ? ` 徒歩${walk}分` : ""}）`
                          : ""}
                        {` の${floor ? `${floor}` : ""}店舗`}
                      </button>
                    </div>

                    <div className="jp-body">
                      <div className="jp-media">
                        <div className={`jp-thumb ${img ? "" : "noimg"}`}>
                          {img ? (
                            <img
                              src={img}
                              alt="物件画像"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                e.currentTarget.closest(".jp-thumb")?.classList.add("noimg");
                              }}
                            />
                          ) : (
                            <div className="jp-noimg">画像なし</div>
                          )}
                        </div>
                        <div className="jp-date">登録日：{b.created_at || "—"}</div>
                      </div>

                      <div className="jp-table">
                        <div className="jp-row">
                          <div className="jp-th">所在地</div>
                          <div className="jp-td">{address}</div>
                          <div className="jp-th">階数／面積</div>
                          <div className="jp-td">
                            {floor || (above || below ? `地上 ${above || 0}階／地下 ${below || 0}階` : "—")} ／{" "}
                            {tsubo ? `${tsubo}坪` : m2 ? `${m2}㎡` : "—"}
                            {m2 && tsubo ? `（${m2}㎡）` : ""}
                          </div>
                        </div>

                        <div className="jp-row">
                          <div className="jp-th">最寄り駅</div>
                          <div className="jp-td">
                            {station || "—"}{walk ? ` 徒歩${walk}分` : ""}
                          </div>
                          <div className="jp-th">賃料</div>
                          <div className="jp-td">
                            {rent ? `${rent}円` : "—"}
                          </div>
                        </div>

                        <div className="jp-row">
                          <div className="jp-th">敷金／礼金</div>
                          <div className="jp-td">{deposit}{keyMoney ? ` ／ ${keyMoney}` : ""}</div>
                          <div className="jp-th">構造</div>
                          <div className="jp-td">{structure}</div>
                        </div>

                        <div className="jp-row">
                          <div className="jp-th">フロア区分</div>
                          <div className="jp-td">{floorClass}</div>
                          <div className="jp-th">契約期間</div>
                          <div className="jp-td">{G(b, ["contract_period"], "—")}</div>
                        </div>

                        <div className="jp-row">
                          <div className="jp-th">更新料</div>
                          <div className="jp-td">{renewalFee}</div>
                          <div className="jp-th">管理費</div>
                          <div className="jp-td">{G(b, ["maintenance"], "") || (G(b, ["maint_neg"], "") ? "相談" : "—")}</div>
                        </div>

                        <div className="jp-row">
                          <div className="jp-th">前業態／希望譲渡額</div>
                          <div className="jp-td">
                            {previous}
                            {ztPrice ? ` ／ ${ztPrice}` : ""}
                          </div>
                          <div className="jp-th">不動産会社</div>
                          <div className="jp-td">{company}</div>
                        </div>

                        <div className="jp-actions">
                          <button
                            className="btn btn-outline-warning btn-sm"
                            onClick={(e) => { e.stopPropagation(); addFav(b); }}
                          >
                            ★ お気に入り追加
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })
            )}

            {/* 하단 페이지네이션 */}
            <div className="mt-3 d-flex justify-content-end">
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </div>
          </main>
        </div>

        {/* 下部固定バー */}
        <FixedFilterBar
          targetRef={asideRef}
          anchorRef={searchBtnRef}
          count={results.length}
          onSearch={handleSideFilterSearch}
        />
      </div>

      {/* 地域/駅モーダル */}
      {isModalOpen && (
        <SearchModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSearch={handleModalSearch}
          isTransfer={false}
          initialTab={mode}
        />
      )}

      {/* 保存条件モーダル */}
      {savedOpen && (
        <SavedConditionsModal
          list={savedList}
          onClose={() => setSavedOpen(false)}
          onRun={runSaved}
          onDelete={deleteSaved}
        />
      )}
    </>
  );
}

/* =================== 左フィルタパネル =================== */
function FilterPanel({ filters, setFilters, onSearch, buttonRef }) {
  const set = (k, v) => setFilters((f) => ({ ...f, [k]: v }));

  const toggleFoodAll = (checked) =>
    setFilters((f) => ({
      ...f,
      foodAll: checked,
      food: checked ? [...FOOD_CHILDREN] : [],
    }));

  const toggleFoodChild = (name, checked) =>
    setFilters((f) => {
      const s = new Set(f.food || []);
      checked ? s.add(name) : s.delete(name);
      return { ...f, foodAll: s.size === FOOD_CHILDREN.length, food: [...s] };
    });

  const toggleNonFoodRoot = (checked) =>
    setFilters((f) => ({
      ...f,
      nonFoodAll: checked,
      nonFoodGroups: checked ? [...ALL_NONFOOD_GROUPS] : [],
      nonFoodSubs: checked ? [...ALL_NONFOOD_SUBS] : [],
    }));

  const toggleNonFoodGroup = (group, checked) =>
    setFilters((f) => {
      const groups = new Set(f.nonFoodGroups || []);
      const subs = new Set(f.nonFoodSubs || []);
      const children = NONFOOD_TREE[group] || [];
      if (checked) {
        groups.add(group);
        children.forEach((c) => subs.add(c));
      } else {
        groups.delete(group);
        children.forEach((c) => subs.delete(c));
      }
      const allOn = groups.size === ALL_NONFOOD_GROUPS.length;
      return {
        ...f,
        nonFoodAll: allOn,
        nonFoodGroups: [...groups],
        nonFoodSubs: [...subs],
      };
    });

  return (
    <div className="as-panel shadow-sm mt-3">
      <div className="as-header">条件で絞る</div>
      <div className="as-body">
        <div className="filter-title">出店可能業態で絞る</div>

        {/* 飲食店 */}
        <div className="group-box">
          <label className="group-head">
            <input
              className="form-check-input"
              type="checkbox"
              checked={!!filters.foodAll}
              onChange={(e) => toggleFoodAll(e.target.checked)}
            />
            <span>飲食店</span>
          </label>
        </div>
        <div className="group-children mb-2">
          {FOOD_CHILDREN.map((c) => (
            <label key={c} className="form-check small">
              <input
                className="form-check-input"
                type="checkbox"
                checked={filters.food?.includes(c) || false}
                onChange={(e) => toggleFoodChild(c, e.target.checked)}
              />
              <span className="form-check-label">{c}</span>
            </label>
          ))}
        </div>

        {/* 飲食店以外 */}
        <div className="group-box">
          <label className="group-head">
            <input
              className="form-check-input"
              type="checkbox"
              checked={!!filters.nonFoodAll}
              onChange={(e) => toggleNonFoodRoot(e.target.checked)}
            />
            <span>飲食店以外</span>
          </label>
        </div>
        <div className="group-children mb-2">
          {ALL_NONFOOD_GROUPS.map((g) => (
            <div key={g} className="mb-1">
              <label className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={filters.nonFoodGroups?.includes(g) || false}
                  onChange={(e) => toggleNonFoodGroup(g, e.target.checked)}
                />
                <span className="form-check-label">{g}</span>
              </label>
            </div>
          ))}
        </div>

        {/* 範囲/条件 */}
        <div className="mb-2 fw-bold mt-2">賃料(万円)</div>
        <div className="d-flex align-items-center gap-2 mb-2">
          <select
            className="form-select"
            value={filters.rentMin ?? ""}
            onChange={(e) => set("rentMin", e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">下限なし</option>
            {[0, 5, 10, 20, 30, 50, 80, 100].map((v) => (
              <option key={v} value={v}>{v}〜</option>
            ))}
          </select>
          <span>〜</span>
          <select
            className="form-select"
            value={filters.rentMax ?? ""}
            onChange={(e) => set("rentMax", e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">上限なし</option>
            {[10, 20, 30, 50, 80, 100, 150, 200].map((v) => (
              <option key={v} value={v}>{v}まで</option>
            ))}
          </select>
        </div>

        <div className="mb-2 fw-bold">面積(㎡)</div>
        <div className="d-flex align-items-center gap-2 mb-2">
          <select
            className="form-select"
            value={filters.sizeMin ?? ""}
            onChange={(e) => set("sizeMin", e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">下限なし</option>
            {[5, 10, 20, 30, 50, 80, 100].map((v) => (
              <option key={v} value={v}>{v}〜</option>
            ))}
          </select>
          <span>〜</span>
          <select
            className="form-select"
            value={filters.sizeMax ?? ""}
            onChange={(e) => set("sizeMax", e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">上限なし</option>
            {[10, 20, 30, 50, 80, 100, 200].map((v) => (
              <option key={v} value={v}>{v}まで</option>
            ))}
          </select>
        </div>

        <div className="mb-2 fw-bold">物件の状態</div>
        <div className="d-grid gap-1 mb-2">
          {["スケルトン", "居抜き"].map((name) => (
            <label key={name} className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                checked={filters.condition?.includes(name) || false}
                onChange={(e) => {
                  setFilters((f) => {
                    const cur = new Set(f.condition || []);
                    e.target.checked ? cur.add(name) : cur.delete(name);
                    return { ...f, condition: [...cur] };
                  });
                }}
              />
              <span className="form-check-label">{name}</span>
            </label>
          ))}
        </div>

        <div className="mb-2 fw-bold">階数・路面</div>
        <div className="d-grid gap-1 mb-2">
          {["地下", "1階", "2階以上"].map((name) => (
            <label key={name} className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                checked={filters.floors?.includes(name) || false}
                onChange={(e) => {
                  setFilters((f) => {
                    const cur = new Set(f.floors || []);
                    e.target.checked ? cur.add(name) : cur.delete(name);
                    return { ...f, floors: [...cur] };
                  });
                }}
              />
              <span className="form-check-label">{name}</span>
            </label>
          ))}
          <label className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              checked={!!filters.roadside}
              onChange={(e) => set("roadside", e.target.checked)}
            />
            <span className="form-check-label">ロードサイド</span>
          </label>
        </div>

        <div className="mb-2 fw-bold">フリーワード</div>
        <input
          className="form-control mb-3"
          type="text"
          placeholder="例：渋谷　1階　カフェ"
          value={filters.q || ""}
          onChange={(e) => set("q", e.target.value)}
        />

        <button ref={buttonRef} className="btn btn-primary w-100" onClick={onSearch}>
          この条件で検索
        </button>
      </div>
    </div>
  );
}

/* ======= 下固定バー ======= */
function FixedFilterBar({ targetRef, anchorRef, onSearch, count }) {
  const [style, setStyle] = useState({ left: 0, width: 0 });
  const [show, setShow] = useState(false);

  useEffect(() => {
    const updateAsideMetrics = () => {
      const el = targetRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setStyle({ left: Math.round(rect.left), width: Math.round(rect.width) });
    };
    const updateVisibility = () => {
      const btn = anchorRef.current;
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      setShow(r.top > vh);
    };
    const update = () => { updateAsideMetrics(); updateVisibility(); };
    update();

    const opts = { passive: true };
    window.addEventListener("scroll", update, opts);
    window.addEventListener("resize", update, opts);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [targetRef, anchorRef]);

  if (!style.width || !show) return null;

  return (
    <div
      className="fixed-filter-bar"
      style={{ left: style.left, width: style.width }}
      role="region"
      aria-label="検索アクション"
    >
      <div className="fixed-filter-inner">
        {typeof count === "number" && (
          <div className="sticky-count">{count.toLocaleString("ja-JP")}件の該当物件</div>
        )}
        <button className="btn btn-primary w-100" onClick={onSearch}>
          この条件で検索
        </button>
      </div>
    </div>
  );
}

/* ======= 保存条件モーダル ======= */
function SavedConditionsModal({ list, onClose, onRun, onDelete }) {
  return (
    <div className="sm-overlay" style={{ zIndex: 10000 }}>
      <div className="sm-modal" style={{ width: "min(820px, 100%)" }}>
        <div className="sm-header">
          <div className="fw-bold">保存した検索条件</div>
          <button className="sm-close" onClick={onClose}>✕</button>
        </div>

        <div className="sm-body" style={{ maxHeight: "70vh", overflow: "auto" }}>
          {list.length === 0 ? (
            <div className="text-muted p-3">保存された条件はありません。</div>
          ) : (
            <div className="list-group list-group-flush">
              {list.map((it) => (
                <div key={it.id} className="list-group-item">
                  <div className="d-flex align-items-center justify-content-between gap-2">
                    <div className="small text-muted">{new Date(it.createdAt).toLocaleString("ja-JP")}</div>
                    <div className="ms-auto">
                      <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(it.id)}>削除</button>
                    </div>
                  </div>
                  <div
                    className="fw-bold mt-1"
                    title={it.label}
                    style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                  >
                    {it.label}
                  </div>
                  <div className="mt-2 d-flex gap-2">
                    <button className="btn btn-primary btn-sm" onClick={() => onRun(it)}>
                      マッチした一覧を表示
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sm-footer">
          <div />
          <div className="sm-actions">
            <button className="sm-btn" onClick={onClose}>閉じる</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StoreSearch;
