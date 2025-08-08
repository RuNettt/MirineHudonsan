import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, isAdmin }) {
  const token = localStorage.getItem("token");
  const userIsAdmin = localStorage.getItem("isAdmin") === 'true'; // 管理者であるかどうかを確認する方法です


  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 管理者でない場合は、管理者ダッシュボードにアクセスできないようにします
  if (isAdmin && !userIsAdmin) {
    return <Navigate to="/main" replace />;
  }

  return children;
}

export default ProtectedRoute;
