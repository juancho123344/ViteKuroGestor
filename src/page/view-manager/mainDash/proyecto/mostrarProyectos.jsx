import "./style/mostrarProyectos.css";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { deleteProyect } from './eliminarUnProyecto'; 
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const ShowProjects = () => {
  const [proyectos, setProyectos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState(''); 
  const [confirmacionVisible, setConfirmacionVisible] = useState(false); 
  const [proyectoAEliminar, setProyectoAEliminar] = useState(null); 
  const [userRole, setUserRole] = useState(null); 
  const navigate = useNavigate();

  useEffect(() => {
    mostrarProyectos();
    const token = Cookies.get('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      setUserRole(decodedToken.rol);
    }
  }, []);

  const mostrarProyectos = async () => {
    try {
      const token = Cookies.get('token');
      const response = await axios.get('https://backendkurogestor.onrender.com/api/proyectos', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProyectos(response.data);
      setError('');
    } catch (error) {
      console.error('Error al obtener proyectos:', error);
    }
  };

  const buscarProyecto = async () => {
    try {
      if (busqueda.trim() === '') {
        mostrarProyectos();
        return;
      }

      const token = Cookies.get('token');
      const response = await axios.get(`https://backendkurogestor.onrender.com/api/proyecto/${busqueda}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.length === 0) {
        setError('Proyecto no encontrado');
        setProyectos([]);
      } else {
        setProyectos(response.data);
        setError('');
      }
    
    } catch (error) {
      console.error('Error al buscar proyecto:', error);
    }
  };

  const handleChange = (event) => {
    setBusqueda(event.target.value);
    setError('');

    if (event.target.value.trim() === '') {
      mostrarProyectos();
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    buscarProyecto();
  };

  const handleDelete = async (nombre) => {
    setProyectoAEliminar(nombre);
    setConfirmacionVisible(true);
  };

  const confirmarEliminar = async () => {
    try {
      const token = Cookies.get('token');
      await deleteProyect(proyectoAEliminar, token);
      setConfirmacionVisible(false);
      mostrarProyectos();
    } catch (error) {
      console.error('Error al eliminar proyecto:', error);
    }
  };

  const mostrarTareasProyecto = (proyectoNombre) => {
    navigate(`/dash-manager/tareas/${proyectoNombre}`);
  };
  const handleGenerateReport = async (proyecto) => {
    const doc = new jsPDF();

  
    try {
  
      // Configuración inicial del documento
      doc.setFontSize(18);
      doc.setTextColor(255, 215, 0); // Color dorado
      doc.text(`KuroGestor`, 105, 15, null, null, 'center');
  
      doc.setFontSize(16);
      doc.setTextColor(40);
      doc.text(`Reporte de Proyectos`, 105, 30, null, null, 'center');
  
      // Línea de separación dorada
      doc.setDrawColor(255, 215, 0); // Color dorado
      doc.setLineWidth(0.5);
      doc.line(10, 35, 200, 35);
  
      // Añadir imagen de fondo
  
      // Añadir imagen del usuario
  
      // Datos del usuario
      doc.setFontSize(12);
      doc.setTextColor(255, 215, 0); // Color dorado
      doc.text(`ID:`, 20, 40);
      doc.text(`Nombre:`, 20, 50);
      doc.text(`Descripcion:`, 20, 60);
      doc.text(`Estado:`, 20, 70);
      doc.text(`Prioridad:`, 20, 80); 
      doc.text(`Manager Email:`, 20, 90);
      doc.text(`Fecha de Actualizacion:`, 20, 100);

      
  
      // Valores del usuario
      doc.setTextColor(0); // Color negro
      doc.text(`${proyecto.proyecto_id}`, 80, 40);
      doc.text(`${proyecto.nombre}`, 80, 50);
      doc.text(`${proyecto.descripcion}`, 80, 60);
      doc.text(`${proyecto.estado}`, 80, 70);
      doc.text(`${proyecto.prioridad}`, 80, 80);
      doc.text(`${proyecto.manager_email}`, 80, 90);
      doc.text(`${proyecto.fecha_actualizacion}`, 80, 100);

  
      // Pie de página
      doc.setFontSize(10);
      doc.setTextColor(255, 215, 0); // Color dorado
      doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 10, 280);
      doc.text(`Sistema de Gestión de Proyectos`, 105, 290, null, null, 'center');
  
      doc.save(`reporte_${proyecto.nombre}.pdf`);
  
    } catch (error) {
      console.error('Error al cargar el proyecto', error);
    }
  };
  

  return (
    <div className="container">
      <form className="search-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={busqueda}
          onChange={handleChange}
          placeholder="Buscar proyecto..."
          className="search-input"
        />
        <button type="submit" className="search-button">Buscar</button>
      </form>

      {error && <p className="error-message">{error}</p>}

      <div className="cards-container">
        {proyectos.map((proyecto) => (
          <div key={proyecto.proyecto_id} className="card">
            <h3 className="card-title">{proyecto.nombre}</h3>
            <p className="card-description">{proyecto.descripcion}</p>
            <p className="card-info">Estado: {proyecto.estado}</p>
            <p className="card-info">Prioridad: {proyecto.prioridad}</p>
            <p className="card-info">Manager del proyecto: {proyecto.manager_email}</p>
            <p className="card-info">Fecha de actualización: {proyecto.fecha_actualizacion}</p>
            <button className="task-button" onClick={() => mostrarTareasProyecto(proyecto.nombre)}>
              Tareas
            </button>
            <button className="task-button" onClick={() => handleGenerateReport(proyecto)}>
              Reporte
            </button>
            {userRole === 'Manager' && (
              <button className="delete-button" onClick={() => handleDelete(proyecto.nombre)}>
                Eliminar
              </button>
            )}
          </div>
        ))}
      </div>

      {confirmacionVisible && (
        <div className="confirmacion-overlay">
          <div className="confirmacion-box">
            <p>{`¿Está seguro de que desea eliminar el proyecto ${proyectoAEliminar}?`}</p>
            <button onClick={confirmarEliminar}>Confirmar</button>
            <button onClick={() => setConfirmacionVisible(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowProjects;
