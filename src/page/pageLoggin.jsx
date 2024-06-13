import "../style/loggin.css";
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';

function Loggin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post('https://backendkurogestor.onrender.com/api/login', { email, contrasena: password });
      
      if (!response.data.token) {
        throw new Error('No token generated');
      }

      Cookies.set('token', response.data.token);
      navigate('/dash-manager');
    } catch (error) {
      setError('Error: Credenciales incorrectas o problemas con el servidor.');
      console.error('Error:', error);
    }
  };

  const handleOptionClick = (path) => {
    navigate(path);
  };

  return (
  <div className="content-loggin">
    <div className="content-info-loggin">
      <div className="logo-loggin"></div>
      <div className="info-loggin">
        <span>"Del sueño a la realidad, un proyecto a la vez: Tu visión, nuestro impulso"</span>
      </div>
    </div>
    <div className="logging-loggin">
      <div className="registro-loggin">
        <input
          type="email"
          className="email-loggin"
          placeholder="INGRESE SU EMAIL"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="password-loggin"
          placeholder="INGRESE SU CONTRASEÑA"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="singUp-loggin" onClick={handleLogin}>INGRESAR</button>
        <button className="create-acount-loggin" onClick={() => handleOptionClick("/create-acount")}>CREAR CUENTA</button>
        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  </div>
  );
}

export default Loggin;