import { Navigate, Route, Routes } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import PublicMenu from './pages/PublicMenu.jsx';
import { CartProvider } from './context/CartContext.jsx';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('abu_saj_token');
  return token ? children : <Navigate to="/admin" replace />;
}

export default function App() {
  return (
    <CartProvider>
      <Routes>
        <Route path="/" element={<PublicMenu />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </CartProvider>
  );
}
