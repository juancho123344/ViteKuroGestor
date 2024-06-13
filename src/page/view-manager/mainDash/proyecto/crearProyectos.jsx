import "./style/crearProyectos.css"
import React, { useState } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';

function CreateProject() {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [prioridad, setPrioridad] = useState('');
  const [manager_email, setManagerEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleCreateProject = async () => {
    if (!nombre.trim() || !descripcion.trim() || !prioridad.trim() || !manager_email.trim()) {
      setError('Todos los campos son obligatorios');
      return;
    }
  
    const token = Cookies.get('token');
  
    if (!token) {
      setError('No tiene permiso para acceder');
      return;
    }
  
    const projectData = {
      nombre,
      descripcion,
      estado: 'Sin comenzar',
      prioridad,
      manager_email
    };
  
    console.log('Sending project data:', projectData);
  
    try {
      const response = await axios.post('https://backendkurogestor.onrender.com/api/proyecto', projectData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (response.data.resultado === "Proyecto creado exitosamente") {
        setSuccess(response.data.resultado);
        setError('');
        window.location.reload();
      } else {
        setError(response.data.resultado || 'Error al crear proyecto');
        setSuccess('');
      }
    } catch (error) {
      setError('Error: No tiene permiso para acceder o problemas con el servidor.');
      console.error('Error:', error);
      setSuccess('');
    }
  };
  
  return (
    <div className='contenedor-crear-proyecto'>
      <h1 className='titulo-crear-proyecto'>Crear Proyecto</h1>
      <input
        type="text"
        placeholder="Nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        className="input-crear-proyecto"
      />
      <input
        type="text"
        placeholder="Descripción"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        className="input-crear-proyecto"
      />
      <select
        value={prioridad}
        onChange={(e) => setPrioridad(e.target.value)}
        className="select-crear-proyecto prioridad"
      >
        <option>Seleccionar importancia</option>
        <option value="No importa">No importa</option>
        <option value="Importancia baja">Importancia baja</option>
        <option value="Importancia media">Importancia media</option>
        <option value="Importancia alta">Importancia alta</option>
      </select>
      <input
        type="text"
        placeholder=" Email del manager"
        value={manager_email}
        onChange={(e) => setManagerEmail(e.target.value)}
        className="input-crear-proyecto"
      />
      <button onClick={handleCreateProject} className="button-crear-proyecto">Crear Proyecto</button>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
    </div>
  );
};


export default CreateProject;
