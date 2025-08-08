// src/pages/Favorites.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Favorites() {
  const [storeFavorites, setStoreFavorites] = useState([]);
  const [transferFavorites, setTransferFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState("store");

  const navigate = useNavigate();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("favorites")) || [];
    const store = saved.filter((item) => item.deal_type === "店舗物件");
    const transfer = saved.filter((item) => item.deal_type === "譲渡情報");

    setStoreFavorites(store);
    setTransferFavorites(transfer);
  }, []);

  const handleCardClick = (id) => {
    navigate(`/bukken/${id}`);
  };

  const handleRemoveFavorite = (id, dealType) => {
    const saved = JSON.parse(localStorage.getItem("favorites")) || [];
    const updated = saved.filter(
      (item) => !(item.id === id && item.deal_type === dealType)
    );

    localStorage.setItem("favorites", JSON.stringify(updated));

    const newStore = updated.filter((item) => item.deal_type === "店舗物件");
    const newTransfer = updated.filter((item) => item.deal_type === "譲渡情報");
    setStoreFavorites(newStore);
    setTransferFavorites(newTransfer);

    alert("削除しました");
  };

  const renderCards = (items) => {
    return items.length === 0 ? (
      <p className="text-muted">お気に入りの物件がありません。</p>
    ) : (
      <div className="row">
        {items.map((item) => (
          <div className="col-md-4 mb-4" key={item.id}>
            <div
              className="card h-100 shadow-sm"
              style={{ cursor: "pointer" }}
              onClick={() => handleCardClick(item.id)}
            >
              <img
                src={
                  item.image_paths && item.image_paths.length > 0
                    ? `${process.env.REACT_APP_API_BASE_URL}/api/admin/uploads/${item.image_paths[0]}`
                    : "/no-image.jpg"
                }
                className="card-img-top"
                alt="物件画像"
                style={{ height: "200px", objectFit: "cover" }}
              />
              <div className="card-body">
                <h5 className="card-title">
                  {item.large_area} {item.small_area}
                </h5>
                <p className="card-text">
                  {[item.address_town, item.address_chome, item.address_banchi, item.address_go, item.address_building]
                    .filter(Boolean)
                    .join(" ")}
                </p>
                <p className="card-text">
                  <strong>賃料:</strong> {item.rent || "未設定"} 円
                </p>
                <p className="card-text text-muted glow-text" style={{ fontSize: "0.85rem" }}>
                  登録日: {item.created_at}
                </p>
                <button
                  className="btn btn-sm btn-outline-danger mt-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFavorite(item.id, item.deal_type);
                  }}
                >
                  ✖ お気に入り削除
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container my-4">
      <h2 className="mb-4">お気に入り店舗物件一覧</h2>

      <div className="btn-group mb-3">
        <button
          className={`btn btn-outline-primary ${activeTab === "store" ? "active" : ""}`}
          onClick={() => setActiveTab("store")}
        >
          店舗物件
        </button>
        <button
          className={`btn btn-outline-success ${activeTab === "transfer" ? "active" : ""}`}
          onClick={() => setActiveTab("transfer")}
        >
          譲渡情報
        </button>
      </div>

      {activeTab === "store" && renderCards(storeFavorites)}
      {activeTab === "transfer" && renderCards(transferFavorites)}
    </div>
  );
}

export default Favorites;
