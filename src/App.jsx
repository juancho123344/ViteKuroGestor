import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Page404 from './page/pageCallback';
import Loggin from './page/pageLoggin';
import DashBoard from './page/view-manager/pageDashboard.jsx';
import CreateAcount from './page/createAcount';
import { jwtDecode } from 'jwt-decode';

export const isAuthenticated = () => {
  const token = Cookies.get('token');
  return !!token;
};

export const ProtectedRoute = ({ children, requiredRole }) => {
  const token = Cookies.get('token');

  if (!token) {
    return <Navigate to="/" />;
  }

  const decodedToken = jwtDecode(token);
  const userRole = decodedToken.rol;

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
      <Router>
          <Routes>
              <Route path="/" element={<Loggin />} />
              <Route path="/create-acount" element={<CreateAcount />} />
              <Route path="/dash-manager/*" element={<ProtectedRoute><DashBoard /></ProtectedRoute>} />
              <Route path="*" element={<Page404/>} />
          </Routes>
      </Router>
  );
}

export default App;