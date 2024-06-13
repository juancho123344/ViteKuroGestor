import "../style/createAcount.css";
import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { FaSave } from "react-icons/fa";

function CreateAcount() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    contrasena: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSave = async () => {
    const { nombre, email, contrasena, confirmPassword } = formData;

    if (!nombre || !email || !contrasena) {
      setError('Campos vacíos');
      return;
    }

    const emailPattern = /^[^@]+@[^@]+\.[^@]+$/;
    if (!emailPattern.test(email)) {
      setError('Correo inválido');
      return;
    }

    if (contrasena !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      const response = await fetch('https://backendkurogestor.onrender.com/api/usuario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nombre, email, contrasena })
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Error al guardar el usuario');
        return;
      }

      const data = await response.json();
      if (data.resultado === 'Usuario creado exitosamente') {
        navigate('/');
      } else {
        setError('Error al guardar el usuario');
      }
    } catch (error) {
      setError(`Hubo un problema al guardar el usuario: ${error.message}`);
      console.error('Error:', error);
    }
  };

  return (
<div className="content-loggin">
  <div className="content-info-loggin">
    <div className="logo-loggin"></div>
    <div className="info-loggin">
      <span>"Del sueño a la realidad, un proyecto a la vez: Tu visión, nuestro impulso"</span>
    </div>
  </div>
  <div className="content-create-acount">
    <div className="formulario-agregar-usuario">
      <div className="content-left">
        <input
          type="text"
          placeholder="Ingrese su nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          className="input-agregar-usuario"
        />
        <input
          type="email"
          placeholder="Ingrese su correo"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="input-agregar-usuario"
        />
        <button className="guardar-agregar-usuario" onClick={handleSave}><FaSave />Guardar</button>
        {error && <div className="error-message">{error}</div>}
      </div>
      <div className="content-right">
        <input
          type="password"
          placeholder="Ingrese su contraseña"
          name="contrasena"
          value={formData.contrasena}
          onChange={handleChange}
          className="input-agregar-usuario"
        />
        <input
          type="password"
          placeholder="Valide su contraseña"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="input-agregar-usuario"
        />
      </div>
    </div>
  </div>
</div>

  );
}

export default CreateAcount;
