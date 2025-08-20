import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import React from "react";
import UserRegisterForm from "./pages/UserRegisterForm"; 
import UserLoginForm from "./pages/UserLoginForm";
import MainPage from "./pages/MainPage";
import ProtectedRoute from "./components/ProtectedRoute";
import UserProfile from "./pages/UserProfile";
import UserEditProfileForm from "./pages/UserEditProfileForm";
import AdminLoginForm from "./pages/AdminLoginForm";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRegisterForm from "./pages/AdminRegisterForm";
import AdminProfile from "./pages/AdminProfile";
import AdminEditProfileForm from "./pages/AdminEditProfileForm";
import AdminBukkenRegisterForm from "./pages/AdminBukkenRegisterForm"
import AdminBukkenRegisterStep2 from "./pages/AdminBukkenRegisterStep2"
import BukkenDetail from "./pages/BukkenDetail";
import AdminBukkenList from "./pages/AdminBukkenList"; 
import AdminBukkenEdit from "./pages/AdminBukkenEdit";
import Favorites from "./pages/Favorites";
import StoreSearch from "./pages/StoreSearch";
import TransferSearch from "./pages/TransferSearch";
import FavoritesStore from "./pages/FavoritesStore";
import FavoritesTransfer from "./pages/FavoritesTransfer";
import SavedConditions from "./pages/SavedConditions";

function NavigationButtons({ current }) {
  const navigate = useNavigate();

  return (
    <div className="mt-3">
      {current === "login" ? (
        <button onClick={() => navigate("/register")} className="btn btn-link">
          アカウントを持っていませんか？会員登録
        </button>
      ) : (
        <button onClick={() => navigate("/login")} className="btn btn-link">
          アカウントをお持ちですか？ログイン
        </button>
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="container mt-5">
        <Routes>
          {/* 一般ユーザーログイン */}
          <Route
            path="/login"
            element={
              <>
                <h2>ログイン</h2>
                <UserLoginForm />
              </>
            }
          />

          {/* 会員登録 */}
          <Route
            path="/register"
            element={
              <>
                <h2>会員登録</h2>
                <UserRegisterForm />
              </>
            }
          />

          {/* メインページ */}
          <Route
            path="/main"
            element={
                <MainPage />
            }
          />

          {/* ユーザープロフィール(ログインしたユーザーのみアクセス) */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />

          {/* ユーザープロファイルの修正 (ログインしたユーザーのみアクセス)　*/}
          <Route
            path="/user-edit-profile"
            element={
              <ProtectedRoute>
                <UserEditProfileForm />
              </ProtectedRoute>
            }
          />

          {/* 保存した検索条件 */}
          <Route
            path="/saved-conditions"
            element={
              <ProtectedRoute>
                <SavedConditions />
              </ProtectedRoute>
            }
          />

          {/* StoreSearch */}
          <Route
            path="/store-search"
            element={
              <ProtectedRoute>
                <StoreSearch />
              </ProtectedRoute>
            }
          />
          {/* StoreSearch */}
          <Route
            path="/transfer-search"
            element={
              <ProtectedRoute>
                <TransferSearch />
              </ProtectedRoute>
            }
          />

          {/* 管理者ログイン */}
          <Route
            path="/admin/login"
            element={
              <>
                <h2>管理者ログイン</h2>
                <AdminLoginForm />
              </>
            }
          />
          {/* 管理者会員登録 */}
          <Route
            path="/admin/register"
            element={
              <>
                <h2>管理者会員登録</h2>
                <AdminRegisterForm />
              </>
            }
          />

          {/* 管理者ダッシュボード（ログインした管理者のみアクセス） */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute isAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          {/* 管理者プロフィール (ログインした管理者のみアクセス) */}
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute isAdmin={true}>
                <AdminProfile />
              </ProtectedRoute>
            }
          />
          {/* 管理者プロファイルの修正 (ログインした管理者のみアクセス) */}
          <Route
            path="/admin-edit-profile"
            element={
              <ProtectedRoute isAdmin={true}>
                <AdminEditProfileForm />
              </ProtectedRoute>
            }
          />
          {/* 物件登録　(住所、イメージ) */}
          <Route
            path="/admin-bukken-register"
            element={
              <ProtectedRoute isAdmin={true}>
                <AdminBukkenRegisterForm />
              </ProtectedRoute>
            }
          />
          {/* 物件登録　(詳細情報) */}
          <Route
            path="/admin-bukken-register-2"
            element={
              <ProtectedRoute isAdmin={true}>
                <AdminBukkenRegisterStep2 />
              </ProtectedRoute>
            }
          />

          {/* IDによる特定物件ページ */}
          <Route
            path="/bukken/:id"
            element={
                <BukkenDetail />
            }
          />
          
          {/* 物件リストページ */}
          <Route 
          path="/admin/bukken-list" 
          element={
              <AdminBukkenList />
            } 
          />

          {/* 特定物件修正 */}
          <Route
          path="/admin/bukken/edit/:id"
          element={
              <AdminBukkenEdit />
            }
          />

          {/* お気に入りページ */}
          <Route
            path="/favorites"
            element={
                <FavoritesStore />
            }
          />

          <Route
            path="/favorites-transfer"
            element={
                <FavoritesTransfer />
            }
          />

          {/* 基本経路 (住所が間違い場合はMainPageでリダイレクト)*/}
          <Route
            path="*"
            element={
                <MainPage />
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
    
  );
}

export default App;
