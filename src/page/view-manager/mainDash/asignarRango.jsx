import "./style/asignarRol.css";
import React, { useState } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';

const AsignarRango = () => {
  const [formData, setFormData] = useState({ email: '', rol: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = Cookies.get('token');
    if (!token) {
      setMessage('Token no disponible');
      console.error('Token no disponible');
      return;
    }
    try {
      const response = await axios.put('https://backendkurogestor.onrender.com/api/usuario/rol/', {
        email: formData.email,
        rol: formData.rol,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.data.mensaje) {
        setMessage(response.data.mensaje);
      } else {
        setMessage('Error al actualizar el usuario');
      }
    } catch (error) {
      setMessage('Error al actualizar el usuario');
      console.error('Error:', error);
    }
  };

  return (
    <div className="formulario-asignar-rol">
      <form onSubmit={handleSubmit}>
        <div className="asignar-rol">
          <input
            type="email"
            placeholder="Ingrese su correo"
            name="email"
            className="email-rol"
            value={formData.email}
            onChange={handleChange}
          />
          <select
            name="rol"
            className="rol-rol"
            value={formData.rol}
            onChange={handleChange}
          >
            <option className="option-rol" value=''>Seleccione el rol</option>
            <option className="option-rol" value='Usuario'>Usuario</option>
            <option className="option-rol" value='Administrador'>Administrador</option>
            <option className="option-rol" value='Manager'>Manager</option>
          </select>
          <button className="guardar-rol" type="submit">Guardar</button>
          {message && <p className="mensaje">{message}</p>}
        </div>
      </form>
    </div>
  );
};

export default AsignarRango;