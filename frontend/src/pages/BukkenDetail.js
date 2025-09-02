import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../components/BukkenDetail.css";
import SiteHeader from "../components/SiteHeader";
import { toImageUrl } from "../utils/image";

function BukkenDetailPage() {
  const { id } = useParams(); // URLから物件IDを取得
  const [bukken, setBukken] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(null); // モーダルで拡大中の画像index
  const navigate = useNavigate();

  const goToMain = () => navigate("/main");

  useEffect(() => {
    // 🚀 初回マウント時、物件詳細を取得
    axios
      .get(`${process.env.REACT_APP_API_BASE_URL}/api/admin/bukken/${id}`)
      .then((res) => setBukken(res.data))
      .catch((err) => console.error("詳細情報取得失敗:", err));
  }, [id]);

  // 🖼️ モーダル次の画像
  const handleNext = () => {
    if (bukken && currentIndex !== null && bukken.image_paths?.length) {
      setCurrentIndex((currentIndex + 1) % bukken.image_paths.length);
    }
  };
  // 🖼️ モーダル前の画像
  const handlePrev = () => {
    if (bukken && currentIndex !== null && bukken.image_paths?.length) {
      setCurrentIndex(
        (currentIndex - 1 + bukken.image_paths.length) % bukken.image_paths.length
      );
    }
  };

  // お気に入り追加処理
  const handleAddFavorite = () => {
    if (!bukken) return;
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const exists = favorites.find((item) => item.id === bukken.id);

    if (!exists) {
      const newFavorite = {
        id: bukken.id,
        deal_type: bukken.deal_type === "譲渡情報" ? "譲渡情報" : "店舗物件",
        image_paths: bukken.image_paths,
        large_area: bukken.large_area,
        small_area: bukken.small_area,
        address_town: bukken.address_town,
        address_chome: bukken.address_chome,
        address_banchi: bukken.address_banchi,
        address_go: bukken.address_go,
        address_building: bukken.address_building,
        rent: bukken.rent,
        created_at: bukken.created_at,
      };
      favorites.push(newFavorite);
      localStorage.setItem("favorites", JSON.stringify(favorites));
      alert("お気に入りに追加しました");
    } else {
      alert("すでにお気に入りに追加されています");
    }
  };

  // 業態カテゴリー表示用マップ
  const CATEGORY_DISPLAY_MAP = {
    food_light: "軽飲食",
    food_heavy: "重飲食",
    food_bar: "バー・クラブ",
    beauty_sal: "美容室・理容室",
    salon_est: "サロン（マッサージ・エステ・ネイルなど）",
    clinic: "医療・歯科・クリニック",
    retail: "物販・小売",
    gym: "ジム・教室・スタジオ",
    other_service: "その他サービス・その他",
  };

  if (!bukken) return <p>読み込み中...</p>;

  return (
    <>
      {/* ✅ 공용 헤더 추가 (상세의 large_area와 동기화하면 UX가 자연스러워요) */}
      <SiteHeader selectedArea={bukken?.large_area} />

      <div className="detail-container">
        <h2 className="title">物件詳細</h2>

        {/* 🔙 メインページへ */}
        {/* <div className="d-flex justify-content-end mb-3 gap-2">
          <button className="btn btn-outline-secondary" onClick={goToMain}>
            メインページ
          </button>
        </div> */}

        {/* 📷 画像ギャラリー */}
        <div className="image-gallery">
          {(bukken.image_paths || []).map((path, idx) => (
            <img
              key={idx}
              src={toImageUrl(path)} // server用
              alt={`img-${idx}`}
              onClick={() => setCurrentIndex(idx)}
            />
          ))}
        </div>

        {/* 📷 クリックでモーダル */}
        {currentIndex !== null && (
          <div className="modal-overlay" onClick={() => setCurrentIndex(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <img
                src={toImageUrl(bukken.image_paths[currentIndex])}
                alt="拡大画像"
              />
              <button className="close-btn" onClick={() => setCurrentIndex(null)}>
                ×
              </button>
              <button className="nav-btn prev-btn" onClick={handlePrev}>
                ‹
              </button>
              <button className="nav-btn next-btn" onClick={handleNext}>
                ›
              </button>
            </div>
          </div>
        )}

        {/* 📝 物件情報 */}
        <div className="info-section">
          <h4 className="section-title">物件情報</h4>
          <button className="btn btn-warning mb-3" onClick={handleAddFavorite}>
            ★ お気に入り追加
          </button>
          <table className="info-table">
            <tbody>
              <tr>
                <th>所在地</th>
                <td>
                  {[
                    bukken.large_area,
                    bukken.small_area,
                    bukken.address_town,
                    bukken.address_chome,
                    bukken.address_banchi,
                    bukken.address_go,
                    bukken.address_building,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                </td>
              </tr>
              <tr>
                <th>最寄り駅</th>
                <td>
                  <table className="station-table">
                    <thead>
                      <tr>
                        <th>駅名</th>
                        <th>徒歩</th>
                        <th>バス</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3, 4, 5].map((num) => {
                        const station = bukken[`station${num}`];
                        const walk = bukken[`station${num}_walk`];
                        const bus = bukken[`station${num}_bus`];
                        if (!station) return null;
                        return (
                          <tr key={num}>
                            <td>{station}</td>
                            <td>{walk ? `${walk}分` : "-"}</td>
                            <td>{bus ? `${bus}分` : "-"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <th>築年</th>
                <td>{bukken.built_year}年</td>
              </tr>
              <tr>
                <th>賃料</th>
                <td>
                  {bukken.rent} 円 {bukken.rent_negotiable ? "(応相談)" : ""}
                </td>
              </tr>
              <tr>
                <th>構造</th>
                <td>{bukken.structure}</td>
              </tr>
              <tr>
                <th>面積</th>
                <td>
                  {bukken.m2}㎡ / {bukken.tsubo}坪
                </td>
              </tr>
              <tr>
                <th>建物階数</th>
                <td>
                  地上 {bukken.stories_up} 階 / 地下 {bukken.stories_down} 階
                </td>
              </tr>
              <tr>
                <th>フロア区分</th>
                <td>
                  {bukken.floor_type}（{bukken.whole_building ? "一棟貸し" : "フロア貸し"}）
                </td>
              </tr>
              <tr>
                <th>契約期間</th>
                <td>{bukken.contract_period}</td>
              </tr>
              <tr>
                <th>敷金</th>
                <td>
                  {bukken.deposit_month
                    ? `${bukken.deposit_month} ヶ月`
                    : bukken.deposit_yen
                    ? `${bukken.deposit_yen} 万円`
                    : "-"}
                  {bukken.deposit_neg ? "（応相談）" : ""}
                </td>
              </tr>
              <tr>
                <th>礼金</th>
                <td>
                  {bukken.key_money_month
                    ? `${bukken.key_money_month} ヶ月`
                    : bukken.key_money_yen
                    ? `${bukken.key_money_yen} 万円`
                    : "-"}
                  {bukken.key_money_neg ? "（応相談）" : ""}
                </td>
              </tr>
              <tr>
                <th>更新料</th>
                <td>{bukken.renewal_fee}</td>
              </tr>
              <tr>
                <th>管理費</th>
                <td>
                  {bukken.maintenance} {bukken.maint_neg ? "(応相談)" : ""}
                </td>
              </tr>
              <tr>
                <th>造作譲渡料</th>
                <td>
                  {bukken.transfer_fee ? `${bukken.transfer_fee} 万円` : "-"}
                  {bukken.transfer_neg ? "（応相談）" : ""}
                </td>
              </tr>
              <tr>
                <th>前テナント</th>
                <td>{bukken.prev_tenant}</td>
              </tr>
              <tr>
                <th>償却</th>
                <td>{bukken.amortization}</td>
              </tr>
              <tr>
                <th>出店可能な業態</th>
                <td>
                  <div className="industry-grid">
                    {Object.entries(CATEGORY_DISPLAY_MAP).map(([key, label], idx) => {
                      const isSelected = bukken.business_types?.[key];
                      return (
                        <div
                          key={idx}
                          className={`industry-item ${isSelected ? "selected" : ""}`}
                        >
                          {label}
                        </div>
                      );
                    })}
                  </div>
                </td>
              </tr>
              <tr>
                <th>備考</th>
                <td>{bukken.remarks}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="info-section">
          <h4 className="section-title">仲介会社情報</h4>
          <table className="info-table">
            <tbody>
              <tr>
                <th>会社</th>
                <td>{bukken.company}</td>
              </tr>
              <tr>
                <th>担当者</th>
                <td>{bukken.contact}</td>
              </tr>
              <tr>
                <th>電話番号</th>
                <td>{bukken.company_tel}</td>
              </tr>
              <tr>
                <th>FAX番号</th>
                <td>{bukken.company_fax}</td>
              </tr>
              <tr>
                <th>コメント</th>
                <td>{bukken.coment}</td>
              </tr>
              <tr>
                <th>管理者メモ</th>
                <td>{bukken.memo}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default BukkenDetailPage;
