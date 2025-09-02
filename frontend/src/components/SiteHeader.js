// src/components/SiteHeader.js
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./SiteHeader.css";

const AREA_OPTIONS = ["首都圏", "東京23区", "東京都下", "横浜・川崎", "埼玉", "千葉", "大阪"];

export default function SiteHeader({ selectedArea }) {
  const navigate = useNavigate();

  const currentArea =
    selectedArea ??
    (typeof window !== "undefined"
      ? localStorage.getItem("selectedArea") || "首都圏"
      : "首都圏");

  const go = (p) => () => navigate(p);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST", credentials: "include" });
    } catch {}
    navigate("/login");
  };

  const handleAreaChange = (e) => {
    const v = e.target.value;
    try {
      localStorage.setItem("selectedArea", v);
    } catch {}
    navigate(`/main?area=${encodeURIComponent(v)}`);
  };

  return (
    <header className="site-header">
      <div className="container sh-inner">
        {/* Left: ロゴ */}
        <button className="sh-brand" onClick={go("/main")} aria-label="ホームへ">
          飲食店舗専門検索
        </button>

        {/* Center: タブ */}
        <nav className="sh-primary" aria-label="主要ナビゲーション">
          <NavLink
            to="/store-search"
            className={({ isActive }) => `sh-tab ${isActive ? "active" : ""}`}
          >
            店舗物件を探す
          </NavLink>
          <NavLink
            to="/transfer-search"
            className={({ isActive }) => `sh-tab ${isActive ? "active" : ""}`}
          >
            譲渡情報を探す
          </NavLink>
        </nav>

        {/* Right: エリア / ユーティリティ */}
        <div className="sh-right">
          <div className="sh-area">
            <span className="sh-area-prefix">エリア</span>
            <select
              className="sh-area-select"
              value={currentArea}
              onChange={handleAreaChange}
              aria-label="表示エリアを選択"
            >
              {AREA_OPTIONS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          {/* 저장 조건: 전역 노출 */}
          <button
            className="sh-btn"
            onClick={() => navigate("/saved-conditions")}
            title="保存した検索条件"
          >
            保存条件
          </button>

          {/* 즐겨찾기/프로필/로그아웃 */}
          <button className="sh-btn sh-fav" onClick={go("/favorites")}>
            ★ お気に入り
          </button>
          <button className="sh-btn" onClick={go("/profile")}>
            プロフィール
          </button>
          <button className="sh-btn sh-danger" onClick={handleLogout}>
            ログアウト
          </button>
        </div>
      </div>
    </header>
  );
}
