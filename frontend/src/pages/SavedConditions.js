// src/pages/SavedConditions.js
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import "./SavedConditions.css";

/** 既存キー */
const SAVED_KEY = "store_saved_conditions_v1";
const APPLY_KEY = "store_apply_saved_v1";

/** 画面遷移先（あなたのルーティングに合わせて調整） */
const ROUTE_MAP = {
  transfer: "/transfer-search", // 譲渡情報を探す
  store: "/store-search",       // 店舗物件を探す
};

/** 一覧の件数/ページ */
const PER_PAGE = 4;

/** API ベースURL */
const API_BASE = (process.env.REACT_APP_API_BASE_URL || "http://localhost:5000").replace(/\/+$/, "");

/* =================== Transfer と同じ判定ヘルパ =================== */
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

const norm = (s = "") => String(s).trim().replace(/\s+/g, "").replace(/[‐–—ー\-ｰ･・]/g, "・");
const toNumber = (v) => {
  if (v == null || v === "") return NaN;
  const n = Number(String(v).toString().replace(/[, ]/g, ""));
  return Number.isFinite(n) ? n : NaN;
};
const tsboToM2 = (t) => (Number.isFinite(t) && t > 0 ? t * 3.305785 : NaN);
const getM2 = (row) => {
  const m2 = toNumber(row.m2);
  if (Number.isFinite(m2) && m2 > 0) return m2;
  const tsubo = toNumber(row.tsubo);
  return tsboToM2(tsubo);
};
const getBizTypes = (row) => {
  let bt = row?.business_types;
  if (!bt) return {};
  if (typeof bt === "string") { try { bt = JSON.parse(bt); } catch { bt = {}; } }
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
const getWalkMinutes = (row) => {
  const cand = row.station1_walk ?? row.walk_minutes ?? row.walk;
  if (typeof cand === "number") return cand;
  if (cand == null) return NaN;
  const m = String(cand).match(/\d+/);
  return m ? Number(m[0]) : NaN;
};

const valueToLabel = (v) => (v === "横浜川" ? "横浜・川崎" : v);

/** 厳密小エリア */
function strictSmallHit(row, wantSmalls = []) {
  if (!Array.isArray(wantSmalls) || wantSmalls.length === 0) return true;
  const raw = [
    row.small_area,
    row.address_town, row.address_chome, row.address_banchi, row.address_go, row.address_building,
    row.large_area, row.area, row.region,
    row.station1, row.station2, row.station3
  ].filter(Boolean).join(" ");
  const blob = norm(raw);
  return wantSmalls.some((s) => {
    const sStr = String(s);
    const sNorm = norm(sStr);
    return raw.includes(sStr) || blob.includes(sNorm);
  });
}

/** 地域+徒歩 */
function matchesByFormRules(b, constraints = {}) {
  const wantLarge = constraints.large_area || "";
  const wantSmalls = Array.isArray(constraints.small_area) ? constraints.small_area : [];
  const maxWalk = toNumber(constraints.walk_minutes_max ?? constraints.walkMax);

  let areaOK = true;
  if (wantLarge || wantSmalls.length > 0) {
    areaOK = false;
    const rawTxt = [
      b.large_area, b.small_area,
      b.address_town, b.address_chome, b.address_banchi, b.address_go, b.address_building,
      b.station1, b.station2, b.station3
    ].filter(Boolean).join(" ");
    const blob = norm(rawTxt);

    const largeHit = wantLarge
      ? rawTxt.includes(valueToLabel(wantLarge)) || rawTxt.includes(wantLarge) || blob.includes(norm(wantLarge))
      : true;

    if (wantLarge && wantSmalls.length > 0) {
      const smallHit = wantSmalls.some((s) => rawTxt.includes(String(s)) || blob.includes(norm(String(s))));
      areaOK = largeHit && smallHit;
    } else if (wantSmalls.length > 0) {
      areaOK = wantSmalls.some((w) => rawTxt.includes(String(w)) || blob.includes(norm(String(w))));
    } else {
      areaOK = largeHit;
    }
  }

  let walkOK = true;
  if (Number.isFinite(maxWalk)) {
    const w = getWalkMinutes(b);
    walkOK = Number.isFinite(w) && w <= maxWalk;
  }
  return areaOK && walkOK;
}

/** サイドフィルタ */
function matchesBySideFilters(row, filters = {}) {
  if (!filters) return true;

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

  const minYen = filters.rentMin != null ? Number(filters.rentMin) * 10000 : null;
  const maxYen = filters.rentMax != null ? Number(filters.rentMax) * 10000 : null;
  if (minYen != null || maxYen != null) {
    const rentYen = toNumber(row.rent);
    if (minYen != null && !(Number.isFinite(rentYen) && rentYen >= minYen)) return false;
    if (maxYen != null && !(Number.isFinite(rentYen) && rentYen <= maxYen)) return false;
  }

  const sMin = filters.sizeMin != null ? Number(filters.sizeMin) : null;
  const sMax = filters.sizeMax != null ? Number(filters.sizeMax) : null;
  if (sMin != null || sMax != null) {
    const area = getM2(row);
    if (sMin != null && !(Number.isFinite(area) && area >= sMin)) return false;
    if (sMax != null && !(Number.isFinite(area) && area <= sMax)) return false;
  }

  const cond = Array.isArray(filters.condition) ? filters.condition : [];
  if (cond.length) {
    const blob = `${row.state || ""} ${row.extra_condition || ""} ${row.remarks || ""}`;
    const ok = cond.some((name) => blob.includes(name));
    if (!ok) return false;
  }

  const floors = Array.isArray(filters.floors) ? filters.floors : [];
  if (floors.length) {
    const f = getFloorFlags(row);
    const ok =
      (floors.includes("地下") && f.isB) ||
      (floors.includes("1階") && f.is1) ||
      (floors.includes("2階以上") && f.is2up);
    if (!ok) return false;
  }

  if (filters.roadside) {
    if (!isRoadside(row)) return false;
  }

  const q = String(filters.q || "").trim();
  if (q) {
    const tokens = q.split(/\s+/).filter(Boolean);
    if (tokens.length) {
      const bt = getBizTypes(row);
      const bizWords = Object.keys(bt).filter((k) => bt[k]).join(" ");
      const floorTxt = getFloorFlags(row).text;

      const hay = [
        row.large_area, row.small_area,
        row.address_town, row.address_chome, row.address_banchi, row.address_go, row.address_building,
        row.station1, row.station2, row.station3, row.prev_tenant,
        row.extra_condition, row.state, row.remarks, row.coment, row.company,
        bizWords, floorTxt,
      ].filter(Boolean).join(" ").toLowerCase();

      const ok = tokens.every((t) => hay.includes(t.toLowerCase()));
      if (!ok) return false;
    }
  }
  return true;
}

/* =================== 保存/読み込みユーティリティ =================== */
function loadSaved() {
  try {
    const arr = JSON.parse(localStorage.getItem(SAVED_KEY)) || [];
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

/** サーバーに渡す body を保存条件から作る */
function buildServerBodyFromSaved(item) {
  const rc = item?.region || {};
  const sf = item?.filters || {};
  return {
    deal_type: item?.source === "transfer" ? "譲渡情報" : "店舗物件",
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
}

/** ✅ Transfer と同じ手順で“最終件数”を算出 */
async function fetchMatchCount(item) {
  try {
    const rc = item?.region || {};
    const sf = item?.filters || {};

    const body = buildServerBodyFromSaved(item);
    const res = await fetch(`${API_BASE}/api/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    const raw = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];

    const needRegion = !!rc.large_area || ((rc.small_area || []).length > 0) || !!rc.station;
    const needWalk   = Number.isFinite(toNumber(rc.walk_minutes_max));
    const needBiz    = (sf.food && sf.food.length) || (sf.nonFoodSubs && sf.nonFoodSubs.length);
    const needFloor  = (sf.floors && sf.floors.length) || sf.roadside;
    const needQ      = !!(sf.q && String(sf.q).trim());
    const needDetail = !!(needRegion || needWalk || needBiz || needFloor || needQ);

    let enriched = raw;
    if (needDetail && raw.length) {
      enriched = [];
      for (const r of raw) {
        try {
          const d = await fetch(`${API_BASE}/api/admin/bukken/${r.id}`);
          if (!d.ok) { enriched.push(r); continue; }
          const det = await d.json();
          enriched.push({ ...r, ...det });
        } catch {
          enriched.push(r);
        }
      }
    }

    const filtered = enriched
      .filter((b) => matchesByFormRules(b, rc))
      .filter((b) => matchesBySideFilters(b, sf));

    const final = (Array.isArray(rc.small_area) && rc.small_area.length)
      ? filtered.filter((b) => strictSmallHit(b, rc.small_area))
      : filtered;

    return final.length;
  } catch {
    return null;
  }
}

/* =================== 表示用フォーマット =================== */
const fmtJoin = (arr, empty = "—", sep = "・") =>
  Array.isArray(arr) && arr.length ? arr.join(sep) : empty;

const fmtRange = (min, max, unit = "") => {
  const hasMin = min != null && min !== "";
  const hasMax = max != null && max !== "";
  if (!hasMin && !hasMax) return "—";
  if (hasMin && hasMax) return `${min}${unit}〜${max}${unit}`;
  if (hasMin) return `${min}${unit}〜`;
  return `〜${max}${unit}`;
};

/* =================== ページャ(数字ボタン付き) =================== */
function SimplePager({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="scv-pager" role="navigation" aria-label="保存条件ページャ">
      <button
        className="scv-page-btn"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        前へ
      </button>

      <div className="scv-page-numbers" aria-label="ページ番号">
        {pages.map((n) => (
          <button
            key={n}
            type="button"
            className={`scv-page-num ${n === page ? "active" : ""}`}
            aria-current={n === page ? "page" : undefined}
            onClick={() => onChange(n)}
          >
            {n}
          </button>
        ))}
      </div>

      <button
        className="scv-page-btn"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
      >
        次へ
      </button>
    </div>
  );
}

/* =================== コンポーネント =================== */
export default function SavedConditions() {
  const navigate = useNavigate();
  const [list, setList] = useState(() => loadSaved());
  const [counts, setCounts] = useState({}); // { id: number|null }

  // 📝 メモ編集用
  const [editingId, setEditingId] = useState(null);
  const [draftMemo, setDraftMemo] = useState("");

  // ページング
  const [page, setPage] = useState(1);

  const items = useMemo(
    () => [...list].sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || ""))),
    [list]
  );

  // 総ページ数とスライス
  const totalPages = Math.max(1, Math.ceil(items.length / PER_PAGE));
  const sliceStart = (page - 1) * PER_PAGE;
  const sliceEnd = sliceStart + PER_PAGE;
  const viewItems = items.slice(sliceStart, sliceEnd);

  // 件数取得
  useEffect(() => {
    let aborted = false;
    (async () => {
      for (const it of items) {
        const c = await fetchMatchCount(it);
        if (aborted) return;
        setCounts((prev) => ({ ...prev, [it.id]: c }));
      }
    })();
    return () => { aborted = true; };
  }, [items]);

  // ページ数の変化に合わせて現在ページを補正
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages]);

  const handleChangePage = (next) => {
    const safe = Math.min(Math.max(1, next), totalPages);
    setPage(safe);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const persist = (next) => {
    setList(next);
    localStorage.setItem(SAVED_KEY, JSON.stringify(next));
  };

  const run = (item) => {
    localStorage.setItem(APPLY_KEY, JSON.stringify({ id: item.id, source: item.source || "store" }));
    const to = ROUTE_MAP[item.source || "store"] || "/";
    navigate(to);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const remove = (id) => {
    const next = list.filter((x) => x.id !== id);
    persist(next);
  };

  // 📝 編集開始 / 保存 / キャンセル
  const startEdit = (it) => {
    setEditingId(it.id);
    setDraftMemo(it.memo || "");
  };
  const saveMemo = (id) => {
    const next = list.map((x) => (x.id === id ? { ...x, memo: draftMemo } : x));
    persist(next);
    setEditingId(null);
    setDraftMemo("");
  };
  const cancelEdit = () => {
    setEditingId(null);
    setDraftMemo("");
  };

  return (
    <>
      <SiteHeader selectedArea="首都圏" />
      <div className="container my-4">
        <h2 className="mb-3" style={{ marginLeft: 2 }}>保存した検索条件一覧</h2>

        {items.length === 0 ? (
          <div className="text-muted">保存された条件はありません。</div>
        ) : (
          <>
            <div className="scv-list">
              {viewItems.map((it, idx) => {
                const created = it.createdAt
                  ? new Date(it.createdAt).toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" })
                  : "—";
                const matchCount = counts[it.id];
                const typeLabel = it.source === "transfer" ? "譲渡情報" : "店舗物件";

                // 詳細行に使うフィールド
                const rc = it.region || {};
                const sf = it.filters || {};
                const large = rc.large_area ? valueToLabel(rc.large_area) : "";
                const smalls = Array.isArray(rc.small_area) ? rc.small_area : [];
                const stations = Array.isArray(rc.station_list) && rc.station_list.length
                  ? rc.station_list
                  : (rc.station ? [rc.station] : []);

                const searchFromStation = stations.length > 0;

                const areaLine = (
                  <div className="scv-detail-line">
                    <span className="scv-bullet">◆</span>
                    <span className="scv-detail-title">{searchFromStation ? "駅から探す：" : "地域から探す："}</span>
                    {large && (
                      <span className="scv-chip"><span className="scv-chip-label">エリア</span>{large}</span>
                    )}
                    {!searchFromStation && (
                      <span className="scv-chip"><span className="scv-chip-label">地域</span>{fmtJoin(smalls, "—", "・")}</span>
                    )}
                    {searchFromStation && (
                      <>
                        <span className="scv-chip"><span className="scv-chip-label">地域</span>{fmtJoin(smalls, "—", "・")}</span>
                        <span className="scv-chip"><span className="scv-chip-label">駅</span>{fmtJoin(stations, "—", "・")}</span>
                      </>
                    )}
                  </div>
                );

                const detailLine = (
                  <div className="scv-detail-line">
                    <span className="scv-bullet">◆</span>
                    <span className="scv-detail-title">詳細条件：</span>

                    <span className="scv-chip">
                      <span className="scv-chip-label">面積</span>
                      {fmtRange(sf.sizeMin, sf.sizeMax, "㎡")}
                    </span>

                    <span className="scv-chip">
                      <span className="scv-chip-label">賃料</span>
                      {fmtRange(sf.rentMin, sf.rentMax, "万")}
                    </span>

                    <span className="scv-chip">
                      <span className="scv-chip-label">徒歩</span>
                      {rc.walk_minutes_max != null && rc.walk_minutes_max !== ""
                        ? `${rc.walk_minutes_max}分以内`
                        : "—"}
                    </span>

                    <span className="scv-chip">
                      <span className="scv-chip-label">階数</span>
                      {fmtJoin(sf.floors || [], "—")}
                    </span>

                    <span className="scv-chip">
                      <span className="scv-chip-label">フリーワード</span>
                      {sf.q ? sf.q : "—"}
                    </span>

                    <span className="scv-chip">
                      <span className="scv-chip-label">出店可能業態</span>
                      {(() => {
                        const foods = Array.isArray(sf.food) ? sf.food : [];
                        const nonFoods = Array.isArray(sf.nonFoodSubs) ? sf.nonFoodSubs : [];
                        const all = [...foods, ...nonFoods];
                        return fmtJoin(all, "—", "、");
                      })()}
                    </span>

                    <span className="scv-chip">
                      <span className="scv-chip-label">こだわり条件</span>
                      {sf.roadside ? "ロードサイド" : "—"}
                    </span>

                    <span className="scv-chip">
                      <span className="scv-chip-label">物件の状態</span>
                      {fmtJoin(sf.condition || [], "—", "、")}
                    </span>
                  </div>
                );

                const isEditing = editingId === it.id;
                const memoText = (it.memo || "").trim();
                const placeholder = "出店希望の業態・エリア等を入力してください。";

                // 連番は全体件数基準（降順）
                const globalIndex = (page - 1) * PER_PAGE + idx;
                const serialNumber = items.length - globalIndex;

                return (
                  <div key={it.id} className="scv-card">
                    {/* 左：番号 */}
                    <div className="scv-left">
                      <div className="scv-num">{serialNumber}</div>
                    </div>

                    {/* 中央：内容 */}
                    <div className="scv-main">
                      <div className="scv-topline">
                        <div className="scv-type">◆ {typeLabel}</div>
                        <div className="scv-date">登録日：{created}</div>
                      </div>

                      {areaLine}
                      {detailLine}

                      {/* 📝 メモ（検索には影響なし） */}
                      <div className="scv-note">
                        <div className="scv-note-label">▼ 希望条件の詳細をご記入ください。</div>

                        {!isEditing ? (
                          <>
                            <div
                              className={`scv-memo-box ${memoText ? "" : "placeholder"}`}
                              style={{
                                border: "1px solid #e5e7eb",
                                borderRadius: 8,
                                padding: "10px 12px",
                                minHeight: 44,
                                background: "#fff",
                                whiteSpace: "pre-wrap",
                                color: memoText ? "#111827" : "#9ca3af",
                              }}
                            >
                              {memoText || placeholder}
                            </div>

                            {/* 編集ボタン：右寄せ */}
                            <div className="mt-2 d-flex gap-2 justify-content-end scv-note-actions">
                              <button
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => startEdit(it)}
                              >
                                編集
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <textarea
                              className="form-control scv-note-input"
                              style={{ minHeight: 90 }}
                              value={draftMemo}
                              onChange={(e) => setDraftMemo(e.target.value)}
                              placeholder={`${placeholder}\n※ 連絡先等の個人情報は入力しないでください。`}
                            />
                            {/* 保存/キャンセル：右寄せ */}
                            <div className="mt-2 d-flex gap-2 justify-content-end scv-note-actions">
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => saveMemo(it.id)}
                              >
                                保存
                              </button>
                              <button
                                className="btn btn-outline-secondary btn-sm"
                                onClick={cancelEdit}
                              >
                                キャンセル
                              </button>
                            </div>
                          </>
                        )}

                        <div className="scv-note-caption">※ 連絡先等の個人情報は入力しないでください。</div>
                      </div>
                    </div>

                    {/* 右：アクション縦積み */}
                    <div className="scv-right">
                      <div className="scv-count">
                        <span className="scv-count-num">
                          {typeof matchCount === "number" ? matchCount.toLocaleString("ja-JP") : "—"}
                        </span>
                        <span className="scv-count-txt">件がマッチ</span>
                      </div>

                      <button className="btn btn-primary scv-btn-match" onClick={() => run(it)}>
                        <span className="scv-ico">🔍</span> マッチした一覧を表示
                      </button>

                      <button className="btn btn-outline-secondary scv-btn-delete" onClick={() => remove(it.id)}>
                        この条件を削除
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ▼ 下部ページャ（하단만 유지) */}
            <SimplePager page={page} totalPages={totalPages} onChange={handleChangePage} />
          </>
        )}
      </div>
    </>
  );
}
