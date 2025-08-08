import { useNavigate } from 'react-router-dom';

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("ログアウトしますか？")) {
      localStorage.removeItem("token");
      alert("ログアウトしました。");
      navigate("/main");
    }
  };

  return (
    <button className="btn btn-outline-danger" onClick={handleLogout}>
      ログアウト
    </button>
  );
}

export default LogoutButton;
