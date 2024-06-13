import "./style/actualizarTarea.css";
import React, { useState } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';

const UpdateTask = () => {
  const [tarea, setTarea] = useState({
    nombreAntiguo: '',
    nombre: '',
    descripcion: '',
    estado: '',
    fecha_limite: '',
    proyecto_nombre: ''
  });
  const [error, setError] = useState('');

  const handleBuscarTarea = async () => {
    const token = Cookies.get('token');

    try {
      const response = await axios.get(`https://back-kuro-gestor-1.onrender.com/api/task/${tarea.nombreAntiguo}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.length > 0) {
        setTarea({
          ...response.data[0],
          nombreAntiguo: response.data[0].nombre,
        });
      } else {
        setError('Tarea no encontrada');
      }
    } catch (error) {
      setError('Error al obtener datos de la tarea');
      console.error('Error al obtener datos de la tarea:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTarea((prevTarea) => ({
      ...prevTarea,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = Cookies.get('token');

    try {
      const verifyResponse = await axios.get(`https://back-kuro-gestor-1.onrender.com/api/task/${tarea.nombre}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (verifyResponse.data.length > 0 && verifyResponse.data[0].nombre !== tarea.nombreAntiguo) {
        setError('El nombre de la tarea ya existe');
        return;
      }

      // Actualizar la tarea
      const response = await axios.put('https://back-kuro-gestor-1.onrender.com/api/task', tarea, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.resultado === 'Tarea actualizada exitosamente') {
        window.location.reload(); // Recargar la página después de actualizar la tarea
      } else {
        setError('Error al actualizar la tarea: ' + response.data.resultado);
      }
    } catch (error) {
      setError('Error al actualizar la tarea');
      console.error('Error al actualizar la tarea:', error);
    }
  };

  return (
    <div className="container-actualizar-tarea">
      <h1 className="heading-actualizar-tarea">Actualizar Tarea</h1>
      <input
        type='text'
        placeholder='Nombre de la tarea'
        value={tarea.nombreAntiguo}
        name='nombreAntiguo'
        onChange={handleChange}
        className="input-actualizar-tarea"
      />
      <button onClick={handleBuscarTarea} className="button-actualizar-tarea">Buscar Tarea</button>
      <form onSubmit={handleSubmit}>
        <div className="form-group-actualizar-tarea">
          <label className="label-actualizar-tarea">Nombre:</label>
          <input
            type='text'
            placeholder='Nuevo nombre de la tarea'
            value={tarea.nombre}
            name='nombre'
            onChange={handleChange}
            className="input-actualizar-tarea"
          />
        </div>
        <div className="form-group-actualizar-tarea">
          <label className="label-actualizar-tarea">Descripción:</label>
          <textarea
            placeholder='Nueva descripción de la tarea'
            value={tarea.descripcion}
            name='descripcion'
            onChange={handleChange}
            className="textarea-actualizar-tarea"
          ></textarea>
        </div>
        <div className="form-group-actualizar-tarea">
          <label className="label-actualizar-tarea">Estado:</label>
          <select
            value={tarea.estado}
            name='estado'
            onChange={handleChange}
            className="select-actualizar-tarea"
          >
            <option value='Sin completar'>Sin completar</option>
            <option value='Completa'>Completa</option>
          </select>
        </div>
        <div className="form-group-actualizar-tarea">
          <label className="label-actualizar-tarea">Fecha Limite:</label>
          <input
            type='date'
            placeholder='Nueva fecha límite de la tarea'
            value={tarea.fecha_limite}
            name='fecha_limite'
            onChange={handleChange}
            className="input-actualizar-tarea"
          />
        </div>
        <button type='submit' className="button-actualizar-tarea">Actualizar Tarea</button>
      </form>
      {error && <div className='error-actualizar-tarea'>{error}</div>}
    </div>
  );
};

export default UpdateTask;
