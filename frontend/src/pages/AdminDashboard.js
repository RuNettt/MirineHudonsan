import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoutButton from '../components/LogoutButton';
import { FaUser, FaSignOutAlt, FaPlus, FaList } from 'react-icons/fa';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
        // 🚀 トークンがない場合（未ログイン）、ログインページへリダイレクト
    if (!token) {
      navigate('/admin/login');
    }
  }, [token, navigate]);

  return (
    <div className="container mt-5">
      <h2 className="mb-4"> 管理者ダッシュボード</h2>

      <div className="row g-4">
        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <FaUser size={32} className="mb-2" />
              <h5 className="card-title">プロフィール</h5>
              <button className="btn btn-primary mt-2" onClick={() => navigate('/admin/profile')}>
                プロフィールを見る
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <FaSignOutAlt size={32} className="mb-2" />
              <h5 className="card-title">ログアウト</h5>
              <LogoutButton />
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <FaPlus size={32} className="mb-2" />
              <h5 className="card-title">新規物件登録</h5>
              <button className="btn btn-success mt-2" onClick={() => navigate('/admin-bukken-register')}>
                登録する
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <FaList size={32} className="mb-2" />
              <h5 className="card-title">物件一覧</h5>
              <button className="btn btn-info mt-2" onClick={() => navigate('/admin/bukken-list')}>
                一覧を見る
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
