import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminLoginForm() {
  const [form, setForm] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
    const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (res.ok && data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("isAdmin", "true");  // 管理者かどうかを保存します
      alert(data.message || "ログイン成功！");
      navigate("/admin/dashboard");  // 管理者はダッシュボードに移動します
    } else {
      alert(data.error || "ログイン失敗");
      setForm({ username: "", password: "" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
      <div className="mb-3">
        <label className="form-label">ID</label>
        <input
          type="text"
          name="username"
          value={form.username}
          className="form-control"
          onChange={handleChange}
        />
      </div>
      <div className="mb-3">
        <label className="form-label">PASSWORD</label>
        <input
          type="password"
          name="password"
          value={form.password}
          className="form-control"
          onChange={handleChange}
        />
      </div>
      <button className="btn btn-secondary" type="submit">ログイン</button>
      <button
        type="button"
        onClick={() => navigate("/admin/register")}
        className="btn btn-link mt-2"
      >
        アカウントを持っていませんか？会員登録
      </button>
    </form>
  );
}

export default AdminLoginForm;
