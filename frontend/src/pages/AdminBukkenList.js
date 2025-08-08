import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminBukkenList = () => {
  const [bukkenList, setBukkenList] = useState([]); // 物件リストの状態管理
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();

  useEffect(() => {
    // コンポーネントマウント時に物件データを取得
    fetch(`${API_BASE_URL}/api/admin/bukken/all`)
      .then(res => res.json())
      .then(data => setBukkenList(data));
  }, []);

  // 物件削除処理
  const handleDelete = async (id) => {
    if (window.confirm("本当に削除しますか？")) {
      const res = await fetch(`${API_BASE_URL}/api/admin/bukken/${id}`, { method: "DELETE" });
      const data = await res.json();
      alert(data.message || data.error);
      // 削除後、リストから該当物件を除外
      setBukkenList(bukkenList.filter(item => item.id !== id));
    }
  };

  return (
    <div className="container mt-4">
      <h2>物件リスト（管理者用）</h2>
      {bukkenList.map(b => (
        <div key={b.id} className="card p-3 mb-3 shadow-sm">
          {/* エリア・町名・家賃 */}
          <h5>{b.large_area} / {b.address_town} - ¥{b.rent}万</h5>
          {/* 物件の状態・構造 */}
          <p>{b.state} / {b.structure}</p>
          {/* 編集ボタン */}
          <button 
            onClick={() => navigate(`/admin/bukken/edit/${b.id}`)} 
            className="btn btn-sm btn-warning me-2">
            編集
          </button>
          {/* 削除ボタン */}
          <button 
            onClick={() => handleDelete(b.id)} 
            className="btn btn-sm btn-danger">
            削除
          </button>
        </div>
      ))}
    </div>
  );
};

export default AdminBukkenList;
