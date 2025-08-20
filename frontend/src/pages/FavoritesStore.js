// src/pages/FavoritesStore.js
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import "./Favorites.css";

/* 한 페이지당 표시 건수 */
const PER_PAGE = 4;

/* ===== 공통 유틸 ===== */
const API_BASE = (process.env.REACT_APP_API_BASE_URL || "http://localhost:5000").replace(/\/+$/, "");

/** 이미지 경로 보정 */
const buildUrlFromPaths = (paths) => {
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
};

/** 상세/리스트/DB간 키 이름 차이를 흡수 */
const G = (o, keys, fallback = "—") => {
  if (!o) return fallback;
  for (const k of keys) {
    const v = o[k];
    if (v !== undefined && v !== null && String(v) !== "") return v;
  }
  return fallback;
};

/* ===== 간단 페이저(하단 전용) ===== */
function Pager({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="d-flex justify-content-center align-items-center gap-2 mt-3 flex-wrap" role="navigation" aria-label="お気に入りページャー">
      <button
        type="button"
        className="btn btn-outline-secondary btn-sm"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        前へ
      </button>

      <div className="d-flex gap-1">
        {pages.map((n) => (
          <button
            key={n}
            type="button"
            className={`btn btn-sm ${n === page ? "btn-primary" : "btn-outline-secondary"}`}
            aria-current={n === page ? "page" : undefined}
            onClick={() => onChange(n)}
          >
            {n}
          </button>
        ))}
      </div>

      <button
        type="button"
        className="btn btn-outline-secondary btn-sm"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
      >
        次へ
      </button>
    </div>
  );
}

export default function FavoritesStore() {
  const navigate = useNavigate();

  // 로컬 저장 즐겨찾기(店舗物件만)
  const [items, setItems] = useState([]);
  // id -> 상세 데이터 캐시 (이미지 포함)
  const [detailMap, setDetailMap] = useState({});

  // 툴바(정렬/표시)
  const [sortKey, setSortKey] = useState(null); // 'rentAsc' | 'walkAsc' | 'areaDesc'
  const [hideContacted, setHideContacted] = useState(false);
  const [hideClosed, setHideClosed] = useState(false);

  // 페이징
  const [page, setPage] = useState(1);

  // 초기 로드
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("favorites")) || [];
    setItems(saved.filter((f) => f.deal_type === "店舗物件"));
  }, []);

  // 상세 수화
  useEffect(() => {
    let aborted = false;
    const targets = (items || []).filter((x) => x?.id && !detailMap[x.id]);
    if (!targets.length) return;

    (async () => {
      for (const f of targets) {
        try {
          const res = await fetch(`${API_BASE}/api/admin/bukken/${f.id}`);
          if (!res.ok) continue;
          const detail = await res.json();
          if (!aborted) {
            setDetailMap((prev) => (prev[f.id] ? prev : { ...prev, [f.id]: detail }));
          }
        } catch {}
      }
    })();

    return () => { aborted = true; };
  }, [items, detailMap]);

  const mergedItems = useMemo(
    () => items.map((x) => (detailMap[x.id] ? { ...x, ...detailMap[x.id] } : x)),
    [items, detailMap]
  );

  // 정렬/간단 필터(표시용)
  const filteredItems = useMemo(() => {
    let arr = [...mergedItems];
    if (hideContacted) arr = arr.filter((x) => !x._contacted); // 앱에서 연결 시 사용
    if (hideClosed) arr = arr.filter((x) => !x._closed);

    if (sortKey === "rentAsc") {
      arr.sort((a, b) => (Number(a.rent || Infinity) - Number(b.rent || Infinity)));
    } else if (sortKey === "areaDesc") {
      const area = (x) => {
        if (x.m2) return Number(x.m2);
        if (x.tsubo) return Number(x.tsubo) * 3.305;
        return -1;
      };
      arr.sort((a, b) => area(b) - area(a));
    } else if (sortKey === "walkAsc") {
      const w = (x) => Number(x.station1_walk ?? x.walk_minutes ?? x.徒歩 ?? Infinity);
      arr.sort((a, b) => w(a) - w(b));
    }
    return arr;
  }, [mergedItems, sortKey, hideContacted, hideClosed]);

  // 정렬/필터 변경 시 1페이지로
  useEffect(() => { setPage(1); }, [sortKey, hideContacted, hideClosed]);

  // 페이지 수/슬라이스
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PER_PAGE));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages]);

  const sliceStart = (page - 1) * PER_PAGE;
  const sliceEnd = sliceStart + PER_PAGE;
  const pageItems = filteredItems.slice(sliceStart, sliceEnd);

  const handleRemove = (id) => {
    const saved = JSON.parse(localStorage.getItem("favorites")) || [];
    const updated = saved.filter((x) => !(x.id === id && x.deal_type === "店舗物件"));
    localStorage.setItem("favorites", JSON.stringify(updated));
    setItems(updated.filter((f) => f.deal_type === "店舗物件"));
    alert("削除しました");
  };

  const gotoDetail = (id) => navigate(`/bukken/${id}`);

  const changePage = (next) => {
    const safe = Math.min(Math.max(1, next), totalPages);
    setPage(safe);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  return (
    <>
      {/* === 상단 헤더 추가 === */}
      <SiteHeader />

      <div className="container my-4 fav-page">
        <div className="fav-title-wrap">
          <h2 className="mb-3 fav-title">お気に入り店舗物件一覧</h2>
        </div>

        {/* ======== タブ ======== */}
        <div className="fav-tabs" role="tablist" aria-label="お気に入りの種類">
          <Link to="/favorites" className="fav-tab active" role="tab" aria-selected="true">
            店舗物件
          </Link>
          <Link to="/favorites-transfer" className="fav-tab" role="tab" aria-selected="false">
            譲渡情報
          </Link>
        </div>

        {/* ======== ツールバー（정렬/필터 체크） ======== */}
        <div className="fav-toolbar">
          <div className="fav-sort">
            並び替え&nbsp;
            <button className="linklike" onClick={() => setSortKey("rentAsc")}>賃料の安い順</button>
            <span className="sep">|</span>
            <button className="linklike" onClick={() => setSortKey("walkAsc")}>駅から近い順</button>
            <span className="sep">|</span>
            <button className="linklike" onClick={() => setSortKey("areaDesc")}>面積が広い順</button>
          </div>
          <div className="fav-filters">
            <label className="form-check-inline">
              <input
                type="checkbox"
                checked={hideContacted}
                onChange={(e) => setHideContacted(e.target.checked)}
              />{" "}
              問い合わせ済みの物件を除く
            </label>
            <label className="form-check-inline">
              <input
                type="checkbox"
                checked={hideClosed}
                onChange={(e) => setHideClosed(e.target.checked)}
              />{" "}
              掲載終了済みの物件を除く
            </label>
          </div>
        </div>

        <div className="mb-2 text-muted small">
          お気に入り件数：{filteredItems.length}件
        </div>

        {filteredItems.length === 0 ? (
          <p className="text-muted mt-3">お気に入りの物件がありません。</p>
        ) : (
          <>
            {pageItems.map((b, i) => {
              const img = buildUrlFromPaths(b.image_paths);

              // ====== DB 필드 매핑 (검색 페이지와 동일) ======
              const station = G(b, ["station1", "nearest_station", "駅名"], "");
              const walk = G(b, ["station1_walk", "walk_minutes", "徒歩"], "");
              const m2 = G(b, ["m2", "面積㎡"], "");
              const tsubo = G(b, ["tsubo", "面積坪"], "");
              const floor = G(b, ["floor_value1", "階数表示"], "");
              const deposit = G(b, ["deposit", "敷金"], "—");
              const keyMoney = G(b, ["key_money", "礼金"], "—");
              const tsuboUnit = G(b, ["tsubo_unit_price", "坪単価"], "");
              const rent = G(b, ["rent", "賃料"], "");
              const company = G(b, ["agency", "company", "不動産会社"], "—");
              const previous = G(b, ["previous_business", "前業態"], "—");
              const ztPrice = G(b, ["transfer_price", "希望譲渡額"], "");

              const structure = G(b, ["structure", "building_structure", "構造"], "—");
              const above = G(b, ["above_floors", "地上階"], "");
              const below = G(b, ["under_floors", "地下階"], "");
              const floorClass = G(b, ["floor_category", "フロア区分"], "—");
              const contractTerm = G(b, ["contract_term", "contract_period", "契約期間"], "—");
              const renewalFee = G(b, ["renewal_fee", "更新料"], "—");
              const maintenance = G(b, ["maintenance_fee", "management_fee", "管理費"], "");

              const address = [
                b.prefecture, b.city, b.ward, b.small_area, b.address_town, b.address_building,
              ]
                .filter(Boolean)
                .reduce((acc, cur) => (acc.includes(cur) ? acc : [...acc, cur]), [])
                .join(" ") || "—";

              return (
                <article
                  key={b.id || `${page}-${i}`}
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
                      {(b.zousaku === "居抜き" || b.inuki) && <div className="jp-ribbon">居抜き</div>}
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

                    {/* Store/TransferSearch 와 동일한 표 구성 */}
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
                        <div className="jp-th">賃料／坪単価</div>
                        <div className="jp-td">
                          {rent ? `${rent}円` : "—"}
                          {tsuboUnit ? ` ／ ${tsuboUnit}円` : ""}
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
                        <div className="jp-td">{contractTerm}</div>
                      </div>

                      <div className="jp-row">
                        <div className="jp-th">更新料</div>
                        <div className="jp-td">{renewalFee}</div>
                        <div className="jp-th">管理費</div>
                        <div className="jp-td">{maintenance}</div>
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
                          className="btn btn-outline-danger btn-sm"
                          onClick={(e) => { e.stopPropagation(); handleRemove(b.id); }}
                        >
                          ✖ お気に入り削除
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}

            {/* 하단 페이저 */}
            <Pager page={page} totalPages={totalPages} onChange={changePage} />
          </>
        )}
      </div>
    </>
  );
}
