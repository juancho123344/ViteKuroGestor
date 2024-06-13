import './style/listarUsuario.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { TbSquareArrowDownFilled } from "react-icons/tb";
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const ShowUsers = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState('');
  const [eliminarVisible, setEliminarVisible] = useState(null);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
  const [confirmacionVisible, setConfirmacionVisible] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    mostrarUsuarios();
    const token = Cookies.get('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      setUserRole(decodedToken.rol);
    }
  }, []);

  const mostrarUsuarios = async () => {
    try {
      const token = Cookies.get('token');
      const response = await axios.get('https://backendkurogestor.onrender.com/api/usuarios', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsuarios(response.data);
      setError('');
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      setError('Error al obtener usuarios');
    }
  };

  const buscarUsuario = async () => {
    try {
      if (busqueda.trim() === '') {
        mostrarUsuarios();
        return;
      }

      const token = Cookies.get('token');
      const response = await axios.get(`https://backendkurogestor.onrender.com/api/usuario/${busqueda}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.length === 0) {
        setError('Usuario no encontrado');
        setUsuarios([]);
      } else {
        setUsuarios(response.data);
        setError('');
      }
    } catch (error) {
      console.error('Error al buscar usuario:', error);
      setError('Usuario no encontrado');
    }
  };

  const handleChange = (event) => {
    setBusqueda(event.target.value);
    setError('');

    if (event.target.value.trim() === '') {
      mostrarUsuarios();
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    buscarUsuario();
  };

  const handleDeleteClick = (usuario) => {
    if (eliminarVisible === usuario.usuario_id) {
      setEliminarVisible(null);
      setUsuarioAEliminar(null);
    } else {
      setEliminarVisible(usuario.usuario_id);
      setUsuarioAEliminar(usuario);
      setConfirmacionVisible(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      const token = Cookies.get('token');
      const usuarioLogueado = jwtDecode(token);

      await axios.delete(`https://backendkurogestor.onrender.com/api/usuario/${usuarioAEliminar.usuario_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      mostrarUsuarios();
      setEliminarVisible(null);
      setUsuarioAEliminar(null);
      setConfirmacionVisible(false);

      if (usuarioAEliminar.usuario_id === usuarioLogueado.usuario_id) {
        Cookies.remove('token');
        Cookies.remove('email');
        navigate('/');
      }
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      setError('Error al eliminar usuario');
    }
  };

  

// Función para convertir la imagen a base64
const getBase64ImageFromUrl = async (imageUrl) => {
  const res = await fetch(imageUrl);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};



const handleGenerateReport = async (usuario) => {
  const doc = new jsPDF();
  const avatarUrl = `https://unavatar.io/github/${usuario.nombre}`;

  try {
    const imgData = await getBase64ImageFromUrl(avatarUrl);

    // Configuración inicial del documento
    doc.setFontSize(18);
    doc.setTextColor(255, 215, 0); // Color dorado
    doc.text(`KuroGestor`, 105, 15, null, null, 'center');

    doc.setFontSize(16);
    doc.setTextColor(40);
    doc.text(`Reporte de Usuario`, 105, 30, null, null, 'center');

    // Línea de separación dorada
    doc.setDrawColor(255, 215, 0); // Color dorado
    doc.setLineWidth(0.5);
    doc.line(10, 35, 200, 35);

    // Añadir imagen de fondo

    // Añadir imagen del usuario
    doc.addImage(imgData, 'PNG', 10, 40, 30, 30); // Ajusta la posición y el tamaño según tus necesidades

    // Datos del usuario
    doc.setFontSize(12);
    doc.setTextColor(255, 215, 0); // Color dorado
    doc.text(`ID:`, 50, 50);
    doc.text(`Nombre:`, 50, 60);
    doc.text(`Email:`, 50, 70);
    doc.text(`Rol:`, 50, 80);

    // Valores del usuario
    doc.setTextColor(0); // Color negro
    doc.text(`${usuario.usuario_id}`, 80, 50);
    doc.text(`${usuario.nombre}`, 80, 60);
    doc.text(`${usuario.email}`, 80, 70);
    doc.text(`${usuario.rol}`, 80, 80);

    // Pie de página
    doc.setFontSize(10);
    doc.setTextColor(255, 215, 0); // Color dorado
    doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 10, 280);
    doc.text(`Sistema de Gestión de Usuarios`, 105, 290, null, null, 'center');

    doc.save(`reporte_${usuario.usuario_id}.pdf`);

  } catch (error) {
    console.error('Error al cargar la imagen de perfil', error);
  }
};


  return (
    <div className="container-listar-usuario">
      <form className="search-form-listar-usuario" onSubmit={handleSubmit}>
        <input
          type="text"
          value={busqueda}
          onChange={handleChange}
          placeholder="Buscar usuario por nombre"
          className="search-input-listar-usuario"
        />
        <button type="submit" className="search-button-listar-usuario">Buscar</button>
      </form>

      <div className="cards-container-listar-usuario">
        {error && <p className="error-listar-usuario">{error}</p>}
        {usuarios.length === 0 && !error && <p className="error-listar-usuario">Usuario no encontrado</p>}
        {usuarios.map((usuario) => (
          <div key={usuario.usuario_id} className="card-listar-usuario">
            <div className="card-header">
              <h3 className="card-title">{usuario.nombre}</h3>
              {userRole === 'Manager' && (
                <div className="action-menu">
                  {eliminarVisible === usuario.usuario_id && (
                    <div className="action-menu-options">
                      <button className="action-button" onClick={() => setConfirmacionVisible(true)}>Eliminar usuario</button>
                      <button className="action-button" onClick={() => handleGenerateReport(usuario)}>Generar informe</button>
                    </div>
                  )}
                  <button className="action-button" onClick={() => handleDeleteClick(usuario)}>
                    <TbSquareArrowDownFilled />
                  </button>
                </div>
              )}
            </div>
            <p className="card-description">{usuario.email}</p>
            <p className="card-description">{usuario.rol}</p>
          </div>
        ))}
      </div>

      {confirmacionVisible && (
        <div className="confirmacion-overlay">
          <div className="confirmacion-box">
            <p>{`¿Está seguro de que desea eliminar al usuario ${usuarioAEliminar.nombre}?`}</p>
            <button onClick={handleDeleteUser}>Confirmar</button>
            <button onClick={() => setConfirmacionVisible(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowUsers;
