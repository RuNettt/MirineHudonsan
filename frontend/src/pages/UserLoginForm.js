import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function UserLoginForm() {
    // 📝 ログインフォームの状態管理
    const [form, setForm] = useState({ username: "", password: "" });
    const navigate = useNavigate();

    // 🚧 入力変更時ハンドラ
    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // 🚀 フォーム送信（ログイン処理）
    const handleSubmit = async e => {
        e.preventDefault();
        
        const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
        console.log(API_BASE_URL)
        const res = await fetch(`${API_BASE_URL}/api/user/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
            credentials: 'include',  // クッキー設定
            mode: 'cors',  // CORS モード設定
        });

        const data = await res.json();

        if (res.ok && data.token) {
            localStorage.setItem("token", data.token);
            alert(data.message || "ログイン成功！")
            navigate('/main')
        } else {
            alert(data.error || "ログイン失敗");
            setForm({ username: "", password: "" });  // 入力を初期化
        }
    };

    return (
        <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
            <div className="mb-3">
                <label className="form-label"><i className="fas fa-user me-2"></i>ID</label>
                <input
                    type="text"
                    name="username"
                    value={form.username}
                    className="form-control"
                    onChange={handleChange}
                />
            </div>
            <div className="mb-3">
                <label className="form-label"><i className="fas fa-lock me-2"></i>PASSWORD</label>
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
                onClick={() => navigate("/register")}
                className="btn btn-link mt-2"
            >
                アカウントを持っていませんか？会員登録
            </button>
        </form>
    );
}

export default UserLoginForm;
