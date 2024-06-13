import "./style/crearTareas.css"
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';

const CreateTask = () => {
  const { proyectoNombre } = useParams(); // Obtener el nombre del proyecto desde la URL
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [estado, setEstado] = useState('Sin completar');
  const [fecha_limite, setFecha_limite] = useState('');
  const [proyecto_nombre, setProyecto_nombre] = useState(proyectoNombre || ''); // Usar el nombre del proyecto obtenido
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (proyectoNombre) {
      setProyecto_nombre(proyectoNombre); // Establecer el nombre del proyecto en el estado si está disponible
    }
  }, [proyectoNombre]);

  const handleCreateTask = async () => {
    if (!nombre.trim() || !descripcion.trim() || !fecha_limite.trim() || !proyecto_nombre.trim()) {
      setError("Todos los campos son obligatorios");
      return;
    }

    const token = Cookies.get('token');

    if (!token) {
      setError('No tiene permiso para acceder');
      return;
    }

    try {
      const response = await axios.post('https://backendkurogestor.onrender.com/api/task', {
        nombre,
        descripcion,
        estado,
        fecha_limite,
        proyecto_nombre
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.resultado === 'Tarea creada exitosamente') {
        setSuccess(response.data.resultado);
        setError('');
        window.location.reload();
        // Restablecer los campos del formulario después de una creación exitosa
        setNombre('');
        setDescripcion('');
        setEstado('Sin completar');
        setFecha_limite('');
        setProyecto_nombre(proyectoNombre || ''); // Mantener el nombre del proyecto al restablecer
      } else {
        setError(response.data.resultado || 'Error al crear tarea');
        setSuccess('');
      }
    } catch (error) {
      setError('Error: No tiene permiso para acceder o problemas con el servidor.');
      console.error('Error:', error);
      setSuccess('');
    }
  };

  return (
    <div className='container-tarea'>
      <h1 className='title-tarea'>Crear Tarea</h1>
      <div className="input-container-tarea">
        <input
          type='text'
          placeholder='Nombre'
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className='input-nombre-tarea'
        />
      </div>
      <div className="input-container-tarea">
        <input
          type='text'
          placeholder='Descripción'
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className='input-descripcion-tarea'
        />
      </div>
      <div className="input-container-tarea">
        <span className='label-fecha-limite-tarea'>Fecha limite:</span>
        <input
          type='date'
          placeholder='Fecha de Limite'
          value={fecha_limite}
          onChange={(e) => setFecha_limite(e.target.value)}
          className='input-fecha-limite-tarea'
        />
      </div>
      <div className="input-container-tarea">
        <input
          type='text'
          placeholder='Nombre Proyecto'
          value={proyecto_nombre}
          onChange={(e) => setProyecto_nombre(e.target.value)}
          className='input-proyecto-nombre-tarea'
          readOnly // Hacer que el campo sea de solo lectura
        />
      </div>
      <button onClick={handleCreateTask} className='button-crear-tarea'>Crear Tarea</button>
      {error && <div className='error-message'>{error}</div>}
      {success && <div className='success-message'>{success}</div>}
    </div>
  );
}

export default CreateTask;