// components/FavoriteButton.js
import React, { useEffect, useState } from "react";

function FavoriteButton({ bukken, category }) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("favorites")) || [];
    setIsFavorite(saved.some(item => item.id === bukken.id && item.category === category));
  }, [bukken.id, category]);

  const toggleFavorite = () => {
    const saved = JSON.parse(localStorage.getItem("favorites")) || [];
    const exists = saved.find(item => item.id === bukken.id && item.category === category);

    let updated;
    if (exists) {
      // 삭제
      updated = saved.filter(item => !(item.id === bukken.id && item.category === category));
    } else {
      // 추가
      updated = [...saved, { id: bukken.id, category }];
    }

    localStorage.setItem("favorites", JSON.stringify(updated));
    setIsFavorite(!exists);
  };

  return (
    <button className="btn btn-sm btn-outline-danger mt-2" onClick={toggleFavorite}>
      {isFavorite ? "お気に入り解除" : "お気に入り追加"}
    </button>
  );
}

export default FavoriteButton;
