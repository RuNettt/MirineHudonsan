import React, { useState } from "react";
import postal_code from "japan-postal-code";
import { useNavigate } from "react-router-dom";

function AdminRegisterForm() {
  // 📝 登録フォームの状態管理
  const [form, setForm] = useState({
    username: "", email: "", password: "",
    full_name: "", furigana: "", phone: "", 
    birthdate: "", gender: "", zipcode: "", 
    prefecture: "", city: "", area: "",
    detailed_address: "",
  });

  // 📝 フリガナバリデーション用
  const [furiganaError, setFuriganaError] = useState("");
  const [message, alert] = useState("");

  // 🚧 入力変更時の処理
  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // フリガナは全角カナのみ許可
    if (name === "furigana") {
      const kanaRegex = /^[ァ-ンヴー\s　]+$/;
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

  const navigate = useNavigate();

  // 🚀 登録処理（POST）
  const handleSubmit = async e => {
    e.preventDefault();

    if (furiganaError) {
      alert("もう一度確認お願いします。");
      return;
    }

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
    
    const res = await fetch(`${API_BASE_URL}/api/admin/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (res.ok) {
      alert("登録成功！");
      navigate("/login");
    } else {
      alert(data.error || "エラーが発生しました");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
      <input name="username" placeholder="ID" onChange={handleChange} className="form-control mb-2" />
      <input name="password" type="password" placeholder="パスワード" onChange={handleChange} className="form-control mb-2" />
      <input name="email" type="email" placeholder="メール" onChange={handleChange} className="form-control mb-2" />
      <input name="full_name" placeholder="氏名" onChange={handleChange} className="form-control mb-2" />
      <input name="furigana" placeholder="フリガナ" onChange={handleChange} className="form-control mb-2" />
      {furiganaError && <p className="text-danger">{furiganaError}</p>}
      <input name="phone" placeholder="電話番号" onChange={handleChange} className="form-control mb-2" />
      <input name="zipcode" placeholder="郵便番号 (7桁)" onChange={handleChange} className="form-control mb-2" />
      <input name="prefecture" placeholder="都道府県" value={form.prefecture} readOnly className="form-control mb-2" />
      <input name="city" placeholder="市区町村" value={form.city} readOnly className="form-control mb-2" />
      <input name="area" placeholder="丁目・番地" value={form.area} readOnly className="form-control mb-2" />
      <input name="detailed_address" placeholder="建物名・部屋番号" onChange={handleChange} className="form-control mb-2" />

      <label className="form-label">生年月日</label>
      <input name="birthdate" type="date" onChange={handleChange} className="form-control mb-2" />
      
      <label className="form-label">性別</label>
      <select name="gender" onChange={handleChange} className="form-select mb-2">
        <option value="">選択してください</option>
        <option value="male">男</option>
        <option value="female">女</option>
        <option value="others">その他</option>
      </select>

      <button type="submit" className="btn btn-primary">管理者登録</button>
    </form>
  );
}

export default AdminRegisterForm;
