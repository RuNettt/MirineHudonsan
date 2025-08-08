import React, { useState, useEffect } from "react";
import SearchModal from "../components/SearchModal";
import { useNavigate } from "react-router-dom";

function TransferSearch({ onBack }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  // ✅ 최초 진입 시 전체 매물 불러오기
  useEffect(() => {
    fetch("http://localhost:5000/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ deal_type: "譲渡情報" })
    })
      .then((res) => res.json())
      .then((data) => {
        setSearchResults(data.results || []);
      })
      .catch((err) => console.error("初期データ取得エラー:", err));
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleModalSearch = async (newFilters) => {
    const filtersWithType = {
      ...newFilters,
      deal_type: "譲渡情報"
    };

    try {
      const response = await fetch("http://localhost:5000/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(filtersWithType)
      });

      if (!response.ok) {
        throw new Error("検索APIの呼び出しに失敗しました");
      }

      const resultData = await response.json();
      setSearchResults(resultData.results || []);
      setIsModalOpen(false);
    } catch (error) {
      console.error("検索エラー:", error);
    }
  };

  const handleCardClick = (id) => {
    navigate(`/bukken/${id}`);
  };

  const handleAddFavorite = (item) => {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    const minimalItem = {
      id: item.id,
      deal_type: "譲渡情報", //  반드시 포함
      large_area: item.area || "",
      small_area: "",
      address_town: item.address_town || "",
      address_chome: item.address_chome || "",
      address_banchi: item.address_banchi || "",
      address_go: item.address_go || "",
      address_building: item.address_building || "",
      rent: item.rent || "",
      image_paths: item.image_paths || [],
      created_at: new Date().toLocaleDateString("ja-JP")
    };

    const exists = favorites.find(
      (f) => f.id === item.id && f.deal_type === "譲渡情報"
    );

    if (!exists) {
      favorites.push(minimalItem);
      localStorage.setItem("favorites", JSON.stringify(favorites));
      alert("お気に入りに追加しました");
    } else {
      alert("すでにお気に入りに追加されています");
    }
  };

  return (
    <div className="container my-4">
      <h2 className="mb-4">譲渡情報を探す</h2>

      <div className="mb-3">
        <button
          className="btn btn-outline-primary"
          onClick={handleOpenModal}
        >
          地域から探す
        </button>
      </div>

      <div className="mt-4">
        {searchResults.length > 0 ? (
          <div className="row">
            {searchResults.map((item) => (
              <div className="col-md-4 mb-3" key={item.id}>
                <div
                  className="card p-3 h-100 shadow-sm"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleCardClick(item.id)}
                >
                  <h5>
                    {item.title ||
                      `${item.area || ""} ${item.address_town || ""}の物件`}
                  </h5>
                  <p>賃料: {item.rent ? `${item.rent}万円` : "未設定"}</p>
                  {item.area && <p>エリア: {item.area}</p>}
                  {item.station && <p>駅: {item.station}</p>}
                  <div
                    className="d-flex justify-content-end mt-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="btn btn-outline-warning btn-sm"
                      onClick={() => handleAddFavorite(item)}
                    >
                      ★ お気に入り追加
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted">検索結果が表示されます。</p>
        )}
      </div>

      <button className="btn btn-secondary mt-4" onClick={onBack}>
        戻る
      </button>

      {isModalOpen && (
        <SearchModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSearch={handleModalSearch}
          isTransfer={true}
          initialTab="region"
        />
      )}
    </div>
  );
}

export default TransferSearch;
