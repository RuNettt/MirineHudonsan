import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LogoutButton from "../components/LogoutButton";
import "../components/MainPage.css";

import StoreSearch from "./StoreSearch";
import TransferSearch from "./TransferSearch";

const AREA_OPTIONS = [
  { key: "metro", label: "首都圏エリア" }, // 기본(전체)
  { key: "osaka", label: "大阪エリア" },
  { key: "hyogo", label: "兵庫エリア" },
  { key: "east", label: "東部エリア" },
];

// 각 드롭다운 키에 대해 매물 필터 규칙 정의
function matchArea(item, selectedKey) {
  if (!selectedKey || selectedKey === "metro") return true; // 전체
  const L = `${item.large_area || ""}${item.small_area || ""}${item.address_town || ""}`;
  if (selectedKey === "osaka") return /大阪/.test(L);
  if (selectedKey === "hyogo") return /兵庫/.test(L);
  if (selectedKey === "east") return /(千葉|埼玉|茨城|栃木|群馬|東|船橋|柏|浦安|川口|越谷)/.test(L); // 필요시 키워드 조정
  return true;
}

function MainPage() {
  const navigate = useNavigate();

  const [pageMode, setPageMode] = useState("home");
  const [allBukkens, setAllBukkens] = useState([]);
  const [selectedArea, setSelectedArea] = useState("metro"); // 기본: 首都圏エリア
  const token = localStorage.getItem("token");

  // 전체 데이터 로드 (추천 스트립/리스트용)
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/admin/bukken/all`);
        if (Array.isArray(res.data)) {
          setAllBukkens(res.data);
        } else {
          setAllBukkens([]);
        }
      } catch (err) {
        console.error("物件データ取得失敗 /bukken/all:", err);
        setAllBukkens([]);
      }
    })();
  }, []);

  const filtered = useMemo(
    () => allBukkens.filter((b) => matchArea(b, selectedArea)),
    [allBukkens, selectedArea]
  );

  const featured = useMemo(() => filtered.slice(0, 8), [filtered]); // 상단 가로 썸네일
  const latest = useMemo(() => filtered.slice(0, 12), [filtered]); // 최신 리스트(가운데)

  const goToLogin = () => navigate("/login");
  const goToProfile = () => navigate("/profile");
  const goToFavorites = () => navigate("/favorites");
  const gotoDetail = (id) => navigate(`/bukken/${id}`);

  if (pageMode === "store") return <StoreSearch onBack={() => setPageMode("home")} />;
  if (pageMode === "transfer") return <TransferSearch onBack={() => setPageMode("home")} />;

  return (
    <div className="mp-container">
      {/* 헤더 바 */}
      <div className="mp-header">
        <div className="mp-brand" onClick={() => setPageMode("home")}>
          飲食店ミリネ{/* 로고 자리 - 이미지 쓰면 여기에 img */}
        </div>

        {/* エリア ドロップダウン */}
        <div className="mp-area">
          <div className="dropdown">
            <button className="btn btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
              {AREA_OPTIONS.find((o) => o.key === selectedArea)?.label || "エリア"}
            </button>
            <ul className="dropdown-menu">
              {AREA_OPTIONS.map((opt) => (
                <li key={opt.key}>
                  <button
                    className={`dropdown-item ${selectedArea === opt.key ? "active" : ""}`}
                    onClick={() => setSelectedArea(opt.key)}
                  >
                    {opt.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 우측 계정/즐겨찾기 */}
        <div className="mp-right">
          <button className="btn btn-outline-warning me-2" onClick={goToFavorites}>
            ★ お気に入り
          </button>
          {token ? (
            <>
              <button className="btn btn-outline-secondary me-2" onClick={goToProfile}>
                プロフィール
              </button>
              <LogoutButton />
            </>
          ) : (
            <button className="btn btn-outline-primary" onClick={goToLogin}>
              ログイン
            </button>
          )}
        </div>
      </div>

      {/* 탭형 링크 */}
      <div className="mp-tabs">
        <button className="mp-tab" onClick={() => setPageMode("store")}>
          店舗物件を探す
        </button>
        <button className="mp-tab" onClick={() => setPageMode("transfer")}>
          譲渡情報を探す
        </button>
      </div>

      {/* 제목 */}
      <h5 className="mp-section-title">
        店舗物件情報を続々と配信中！
      </h5>

      {/* 가로 썸네일 스트립 */}
      <div className="mp-strip">
        {featured.map((b) => (
          <div key={b.id} className="mp-thumb" onClick={() => gotoDetail(b.id)}>
            <img
              src={
                b.image_paths && b.image_paths.length > 0
                  ? `${process.env.REACT_APP_API_BASE_URL}/api/admin/uploads/${b.image_paths[0]}`
                  : "/no-image.jpg"
              }
              alt="thumb"
            />
            <div className="mp-thumb-meta">
              <span className="mp-badge">{b.small_area || b.large_area || "—"}</span>
              <div className="mp-thumb-text">{b.address_town || b.address_building || "　"}</div>
              <div className="mp-thumb-sub">
                {b.tsubo ? `${b.tsubo}坪` : b.m2 ? `${b.m2}㎡` : ""}{" "}
                {b.rent ? ` / ${b.rent}円` : ""}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 중앙 최신 리스트 */}
      <div className="mp-latest">
        <div className="mp-latest-header">
          <span className="mp-chip">新着物件!!</span>
          <span className="mp-latest-title">リアルタイムな更新速報です！</span>
        </div>

        <div className="mp-latest-list">
          {latest.map((b, idx) => (
            <div key={b.id} className="mp-latest-row" onClick={() => gotoDetail(b.id)}>
              <span className="mp-row-badge">{b.small_area || b.large_area || "—"}</span>
              <span className="mp-row-title">
                {b.address_town || b.address_building || "所在地未登録"} の物件
              </span>
              <span className="mp-row-meta">
                {b.created_at ? b.created_at : ""}{" "}
              </span>
            </div>
          ))}
          {latest.length === 0 && (
            <div className="text-muted">該当する物件がありません。</div>
          )}
        </div>
      </div>

      {/* 아래 전체 카드 그리드(옵션). 필요 없으면 이 섹션 삭제해도 됨 */}
      <div className="mp-grid">
        {filtered.map((b) => (
          <div key={b.id} className="mp-card" onClick={() => gotoDetail(b.id)}>
            <img
              src={
                b.image_paths && b.image_paths.length > 0
                  ? `${process.env.REACT_APP_API_BASE_URL}/api/admin/uploads/${b.image_paths[0]}`
                  : "/no-image.jpg"
              }
              alt="card"
            />
            <div className="mp-card-body">
              <div className="mp-card-title">
                {b.large_area} {b.small_area}
              </div>
              <div className="mp-card-addr">
                {[b.address_town, b.address_chome, b.address_banchi, b.address_go, b.address_building]
                  .filter(Boolean)
                  .join(" ")}
              </div>
              <div className="mp-card-meta">
                <span>{b.rent ? `賃料: ${b.rent} 円` : "賃料: 未設定"}</span>
                <span>{b.structure || "構造: -"}</span>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-muted">物件が見つかりませんでした。</p>}
      </div>
    </div>
  );
}

export default MainPage;
