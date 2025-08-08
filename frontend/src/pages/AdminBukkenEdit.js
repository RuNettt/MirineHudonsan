import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import AdminBukkenRegisterStep2 from "./AdminBukkenRegisterStep2";

function AdminBukkenEdit() {
  const { id } = useParams(); // URLから物件IDを取得
  const navigate = useNavigate();
  const [initialForm, setInitialForm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/admin/bukken/${id}`);
        const bukken = res.data;

        // 取得したデータをフォームの初期値に設定
        setInitialForm(bukken);
        setLoading(false);
      } catch (err) {
        console.error("データ取得エラー:", err);
        alert("物件情報の取得に失敗しました。");
        navigate("/admin/dashboard"); // エラー発生時はダッシュボードへリダイレクト
      }
    };

    fetchData();
  }, [id, navigate]);

  if (loading) return <div>読み込み中...</div>;

  return (
    <div>
      <h2>物件情報の編集</h2>
      <AdminBukkenRegisterStep2
        editMode={true}
        initialForm={initialForm}
      />
    </div>
  );
}

export default AdminBukkenEdit;
