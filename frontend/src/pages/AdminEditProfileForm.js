import React, { useState, useEffect } from "react";
import postal_code from "japan-postal-code";
import { useNavigate } from "react-router-dom";

function AdminEditProfileForm() {
    // 📝 プロフィール情報の状態管理
  const [form, setForm] = useState({
    username: "", email: "", password: "",
    full_name: "", furigana: "", phone: "",
    birthdate: "", gender: "", zipcode: "",
    prefecture: "", city: "", area: "",
    detailed_address: ""
  });
    // 📝 フリガナのバリデーションエラー
  const [furiganaError, setFuriganaError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
     // 🚀 初回マウント時にプロフィール情報を取得
    const token = localStorage.getItem("token");
    fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.username) {
          setForm(prev => ({ ...prev, ...data }));
        }
      });
  }, []);

    // 🚧 入力変更時のハンドラ
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // フリガナは全角カナのみ許可
    if (name === "furigana") {
      const kanaRegex = /^[ァ-ヶ\s　]+$/;
      if (!kanaRegex.test(value)) {
        setFuriganaError("※ 全角カナで入力してください。");
      } else {
        setFuriganaError("");
      }
    }

    // 郵便番号7桁入力時、自動住所補完
    if (name === "zipcode" && value.length === 7) {
      postal_code.get(value, (address) => {
        if (address) {
          setForm((prev) => ({
            ...prev,
            prefecture: address.prefecture,
            city: address.city,
            area: address.area,
          }));
        }
      });
    }
  };

// 🚀 フォーム送信（プロフィール更新）
const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (furiganaError) {
      alert("もう一度確認お願いします。");
      return;
    }
    
    // 空のフィールドは送信しないようクリーニング
    const cleanedForm = {};  
    for (let key in form) {
      if (form[key] !== undefined && form[key] !== null && form[key] !== "") {
        cleanedForm[key] = form[key];
      }
    }
  
    console.log("Sending cleanedForm:", cleanedForm);
  
    const token = localStorage.getItem("token");
  
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/update`, {
          method: "PUT",
          headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(cleanedForm),
      });
  
      if (!res.ok) {
          const data = await res.json();
          alert(data.error || "更新に失敗しました");
          return;
      }
  
      const data = await res.json();
      console.log("Response:", res.status, data);
  
      alert("プロフィールを更新しました！");
      navigate("/admin/dashboard");
  } catch (error) {
      console.error("Error occurred during update:", error);
      alert("ネットワークエラーが発生しました");
  }
  
  };
  
  return (
    <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
      <input name="username" placeholder="ID" value={form.username} onChange={handleChange} className="form-control mb-2" />
      <input name="password" type="password" placeholder="新しいパスワード" value={form.password} onChange={handleChange} className="form-control mb-2" />
      <input name="email" type="email" placeholder="メール" value={form.email} onChange={handleChange} className="form-control mb-2" />
      <input name="full_name" placeholder="氏名" value={form.full_name} onChange={handleChange} className="form-control mb-2" />
      <input name="furigana" placeholder="フリガナ" value={form.furigana} onChange={handleChange} className="form-control mb-2" />
      {furiganaError && <p className="text-danger">{furiganaError}</p>}
      <input name="phone" placeholder="電話番号" value={form.phone} onChange={handleChange} className="form-control mb-2" />
      <input name="zipcode" placeholder="郵便番号 (7桁)" value={form.zipcode} onChange={handleChange} className="form-control mb-2" />
      <input name="prefecture" placeholder="都道府県" value={form.prefecture} readOnly className="form-control mb-2" />
      <input name="city" placeholder="市区町村" value={form.city} readOnly className="form-control mb-2" />
      <input name="area" placeholder="丁目・番地" value={form.area} readOnly className="form-control mb-2" />
      <input name="detailed_address" placeholder="建物名・部屋番号" value={form.detailed_address} onChange={handleChange} className="form-control mb-2" />
      <label className="form-label">生年月日</label>
      <input name="birthdate" type="date" value={form.birthdate} onChange={handleChange} className="form-control mb-2" />
      <label className="form-label">性別</label>
      <select name="gender" value={form.gender} onChange={handleChange} className="form-select mb-2">
        <option value="">選択してください</option>
        <option value="male">男</option>
        <option value="female">女</option>
        <option value="others">その他</option>
      </select>
      <button type="submit" className="btn btn-success">更新</button>
    </form>
  );
}

export default AdminEditProfileForm;
