import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function UserProfile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 🚀 コンポーネント初期表示時、ユーザープロフィールを取得
    const token = localStorage.getItem("token");
    if (!token) {
      alert("ログイン情報がありません。ログインしてください。");
      navigate("/login");
      return;
    }
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
    fetch(`${API_BASE_URL}/api/user/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          alert("ログイン情報が無効です。再ログインしてください。\n" + (data?.error || data?.msg || ""));
          navigate("/login");
        } else {
          setUser(data);
        }
      })
      .catch((err) => {
        console.error("ユーザー情報取得失敗:", err);
        alert("ネットワークエラーが発生しました");
        navigate("/login");
      });
  }, []);

  if (!user) return <p>読み込み中...</p>;

  return (
    <div className="container mt-5">
      <h2>プロフィール</h2>
      <p><strong>ID:</strong> {user.username}</p>
      <p><strong>氏名:</strong> {user.full_name}</p>
      <p><strong>メール:</strong> {user.email}</p>
      <p><strong>電話番号:</strong> {user.phone}</p>
      <p><strong>住所:</strong> {user.zipcode} {user.prefecture} {user.city} {user.area} {user.detailed_address}</p>
      <p><strong>生年月日:</strong> {user.birthdate}</p>
      <p><strong>性別:</strong> {user.gender}</p>

      <div className="d-flex justify-content-start gap-3 mt-4">
        <button className="btn btn-secondary mt-3" onClick={() => navigate("/user-edit-profile")}>
          プロフィール編集
        </button>
        <button className="btn btn-outline-info" onClick={() => navigate("/main")}>
          メインページ
        </button>
      </div>
    </div>
  );
}

export default UserProfile;
