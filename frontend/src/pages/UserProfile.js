// src/pages/UserProfile.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SiteHeader from "../components/SiteHeader"; // ✅ 상단 메뉴 헤더
import "./UserProfile.css";

function UserProfile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
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
          alert(
            "ログイン情報が無効です。再ログインしてください。\n" +
              (data?.error || data?.msg || "")
          );
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
  }, [navigate]);

  if (!user) return <p className="text-muted text-center mt-5">読み込み中...</p>;

  const fullAddress = [
    user?.zipcode,
    user?.prefecture,
    user?.city,
    user?.area,
    user?.detailed_address,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      {/* ✅ 상단 메뉴 헤더 */}
      <SiteHeader />

      <div className="container profile-wrap">
        <div className="profile-card shadow-sm">
          {/* 카드 헤더 */}
          <div className="profile-card__head">
            <div className="profile-card__title">会員情報</div>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => navigate("/user-edit-profile")}
            >
              変更
            </button>
          </div>

          {/* 본문 테이블 */}
          <table className="profile-table">
            <tbody>
              <tr>
                <th>ID</th>
                <td>{user?.username || "—"}</td>
              </tr>
              <tr>
                <th>氏名</th>
                <td>{user?.full_name || "—"}</td>
              </tr>
              <tr>
                <th>氏名カナ</th>
                <td>{user?.furigana || "—"}</td>
              </tr>
              <tr>
                <th>郵便番号</th>
                <td>{user?.zipcode || "—"}</td>
              </tr>
              <tr>
                <th>住所</th>
                <td>{fullAddress || "—"}</td>
              </tr>
              <tr>
                <th>TEL</th>
                <td>{user?.phone || "—"}</td>
              </tr>
              <tr>
                <th>メール</th>
                <td>{user?.email || "—"}</td>
              </tr>
              <tr>
                <th>生年月日</th>
                <td>{user?.birthdate || "—"}</td>
              </tr>
              <tr>
                <th>性別</th>
                <td>{user?.gender || "—"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default UserProfile;
