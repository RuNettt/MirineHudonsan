// src/pages/MainPage.js
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import SiteHeader from "../components/SiteHeader"; // 공용 헤더
import "../components/MainPage.css";

import StoreSearch from "./StoreSearch";
import TransferSearch from "./TransferSearch";

const AREA_LABELS = ["首都圏", "東京23区", "東京都下", "横浜・川崎", "埼玉", "千葉", "大阪"];
const normalizeArea = (s) => (s || "").toString().trim().replace(/\s+/g, "").replace(/[\/･]/g, "・");
const matchByAreaLabel = (item, selectedLabel) => {
  if (!selectedLabel || selectedLabel === "首都圏") return true;
  const raw = item?.large_area ?? item?.area ?? "";
  return normalizeArea(raw) === normalizeArea(selectedLabel);
};
const firstImage = (b) => {
  const base = (process.env.REACT_APP_API_BASE_URL || "").replace(/\/+$/, "");
  let p = b?.image_paths;
  try {
    if (typeof p === "string") {
      const j = JSON.parse(p);
      if (Array.isArray(j)) p = j;
    }
  } catch {}
  const f = Array.isArray(p) ? p[0] : null;
  if (!f) return "/no-image.jpg";
  if (/^https?:\/\//i.test(f) || f.startsWith("data:")) return f;
  return `${base}/api/admin/uploads/${f}`;
};

function MainPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [pageMode, setPageMode] = useState("home");
  const [all, setAll] = useState([]);
  const [selectedArea, setSelectedArea] = useState("首都圏");

  // ?area 또는 localStorage 로 초기화
  useEffect(() => {
    const qsArea = new URLSearchParams(location.search).get("area");
    if (qsArea && AREA_LABELS.includes(qsArea)) {
      setSelectedArea(qsArea);
      try {
        localStorage.setItem("selectedArea", qsArea);
      } catch {}
    } else {
      const saved = localStorage.getItem("selectedArea");
      setSelectedArea(saved && AREA_LABELS.includes(saved) ? saved : "首都圏");
    }
  }, [location.search]);

  // 전체 데이터 로드
  useEffect(() => {
    (async () => {
      try {
        const base = (process.env.REACT_APP_API_BASE_URL || "").replace(/\/+$/, "");
        const res = await axios.get(`${base}/api/admin/bukken/all`);
        const list = Array.isArray(res.data) ? res.data : res.data?.results || [];
        setAll(list || []);
      } catch (e) {
        console.error("/bukken/all 取得失敗:", e);
        setAll([]);
      }
    })();
  }, []);

  const filtered = useMemo(() => all.filter((b) => matchByAreaLabel(b, selectedArea)), [all, selectedArea]);
  const featured = useMemo(() => filtered.slice(0, 8), [filtered]);
  const latest = useMemo(() => filtered.slice(0, 12), [filtered]);

  const gotoDetail = (id) => navigate(`/bukken/${id}`);

  if (pageMode === "store") return <StoreSearch onBack={() => setPageMode("home")} />;
  if (pageMode === "transfer") return <TransferSearch onBack={() => setPageMode("home")} />;

  return (
    <div className="mp-container">
      {/* 공용 헤더 — 헤더의 エリア는 /main?area=...로 이동만 처리 */}
      <SiteHeader selectedArea={selectedArea} />

      {/* 본문: 추천/최신 */}
      <div className="mp-featured-block container">
        <h5 className="mp-section-title">店舗物件情報を続々と配信中！</h5>

        {/* 가로 썸네일 스트립 */}
        <div className="mp-strip">
          {featured.map((b) => (
            <div key={b.id} className="mp-thumb" onClick={() => gotoDetail(b.id)}>
              <img src={firstImage(b)} alt="thumb" />
              <div className="mp-thumb-meta">
                <span className="mp-badge">{b.small_area || b.large_area || "—"}</span>
                <div className="mp-thumb-text">{b.address_town || b.address_building || "　"}</div>
                <div className="mp-thumb-sub">
                  {b.tsubo ? `${b.tsubo}坪` : b.m2 ? `${b.m2}㎡` : ""} {b.rent ? ` / ${b.rent}円` : ""}
                </div>
              </div>
            </div>
          ))}
          {featured.length === 0 && <div className="text-muted">該当する物件がありません。</div>}
        </div>

        {/* 최신 리스트 */}
        <div className="mp-latest">
          <div className="mp-latest-header">
            <span className="mp-chip">新着物件!!</span>
            <span className="mp-latest-title">リアルタイムな更新速報です！</span>
          </div>

          <div className="mp-latest-list">
            {latest.map((b) => (
              <div key={b.id} className="mp-latest-row" onClick={() => gotoDetail(b.id)}>
                <span className="mp-row-badge">{b.small_area || b.large_area || "—"}</span>

                <div className="mp-row-info">
                  <div className="mp-row-title">
                    {b.address_town || b.address_building || "所在地未登録"} の物件
                  </div>
                  <div className="mp-row-sub">
                    {(b.large_area || b.small_area) && <span>{b.large_area || b.small_area}</span>}
                    {b.tsubo && <span>・{b.tsubo}坪</span>}
                    {b.station && <span>・{b.station}</span>}
                  </div>
                </div>

                <span className="mp-row-meta">{b.created_at || ""}</span>
              </div>
            ))}
            {latest.length === 0 && <div className="text-muted">該当する物件がありません。</div>}
          </div>
        </div>
      </div>

      {/* ✅ 하단 중앙 브랜드 라벨 */}
      <div className="mp-bottom-brand" aria-hidden="true">
        Restaurant Property Search System
      </div>
    </div>
  );
}

export default MainPage;
