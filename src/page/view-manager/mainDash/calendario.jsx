import 'react-big-calendar/lib/css/react-big-calendar.css';
import './style/calendario.css';
import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import axios from 'axios';
import Cookies from 'js-cookie';
import Modal from 'react-modal';

const localizer = momentLocalizer(moment);

const Calendario = () => {
  const [tareas, setTareas] = useState([]);
  const [reuniones, setReuniones] = useState([]);
  const [message, setMessage] = useState('');
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    id: null,
    title: '',
    descripcion: '',
    start: null,
    end: null
  });
  const [isEdit, setIsEdit] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [updatedDate, setUpdatedDate] = useState(new Date());

  useEffect(() => {
    fetchTareas();
    fetchReuniones();
  }, []);

  const fetchTareas = async () => {
    try {
      const token = Cookies.get('token');
      const response = await axios.get('https://backendkurogestor.onrender.com/api/tasks', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const tasks = response.data.map(task => ({
        id: task.tarea_id,
        title: task.nombre,
        start: new Date(task.fecha_limite),
        end: new Date(task.fecha_limite),
        allDay: true,
        type: 'task'
      }));
      setTareas(tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setMessage('Error al obtener las tareas');
    }
  };

  const fetchReuniones = async () => {
    try {
      const token = Cookies.get('token');
      const response = await axios.get('https://backendkurogestor.onrender.com/api/meetings', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const reuniones = response.data.map(reunion => ({
        id: reunion.reunion_id,
        title: reunion.nombre,
        start: new Date(reunion.fecha_inicio),
        end: new Date(reunion.fecha_fin),
        descripcion: reunion.descripcion,
        type: 'meeting'
      }));
      setReuniones(reuniones);
    } catch (error) {
      console.error('Error fetching reuniones:', error);
      setMessage('Error al obtener las reuniones');
    }
  };

  const handleCreateMeeting = (slotInfo) => {
    const start = slotInfo.start;
    const end = slotInfo.end;

    setNewMeeting({
      id: null,
      title: '',
      descripcion: '',
      start: start,
      end: end
    });
    setIsEdit(false);
    setModalIsOpen(true);
  };

const handleCreateOrEdit = async (e) => {
  e.preventDefault();
  try {
    let resultado;
    const token = Cookies.get('token');
    if (isEdit) {
      resultado = await axios.put(`https://backendkurogestor.onrender.com/api/meeting/${newMeeting.id}`, {
        nombre: newMeeting.title,
        descripcion: newMeeting.descripcion,
        fecha_inicio: moment(newMeeting.start).format('YYYY-MM-DD HH:mm:ss'),
        fecha_fin: moment(newMeeting.end).format('YYYY-MM-DD HH:mm:ss')
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } else {
      resultado = await axios.post('https://backendkurogestor.onrender.com/api/meeting', {
        nombre: newMeeting.title,
        descripcion: newMeeting.descripcion,
        fecha_inicio: moment(newMeeting.start).format('YYYY-MM-DD HH:mm:ss'),
        fecha_fin: moment(newMeeting.end).format('YYYY-MM-DD HH:mm:ss')
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    if (resultado.data.resultado === 'Reunión actualizada exitosamente' || resultado.data.resultado === 'Reunión creada exitosamente') {
      fetchReuniones();
      closeModal();
      setMessage(resultado.data.resultado);
      window.location.reload(); // Recarga la página
    } else {
      setMessage('Error: ' + resultado.data.resultado);
    }
  } catch (error) {
    console.error('Error creating/editing meeting:', error);
    setMessage('Error al crear/editar la reunión');
    if (error.response) {
      setMessage('Error: ' + error.response.data.message); // Mostrar mensaje de error específico del backend
    }
  }
};
  
  const handleDelete = async () => {
    if (!selectedMeeting || !selectedMeeting.id) {
      console.error('selectedMeeting is null or has no ID');
      return;
    }

    const { id } = selectedMeeting;
    const token = Cookies.get('token');

    try {
      await axios.delete(`https://backendkurogestor.onrender.com/api/meeting/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMessage('Reunión eliminada exitosamente');
      fetchReuniones();
      closeModal();
    } catch (error) {
      console.error('Error deleting meeting:', error);
      setMessage('Error al eliminar la reunión');
    }
  };

  const handleSelectEvent = (event) => {
    setSelectedMeeting(event);
    if (event.type === 'meeting') {
      handleEdit(event);
    }
  };

  const handleEdit = (event) => {
    setIsEdit(true);
    const { id, title, descripcion, start, end } = event;
    setNewMeeting({
      id,
      title,
      descripcion,
      start,
      end
    });
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedMeeting(null);
    setNewMeeting({
      id: null,
      title: '',
      descripcion: '',
      start: null,
      end: null
    });
    setIsEdit(false);
  };

  const EventComponent = ({ event }) => {
    const isTask = event.type === 'task';
    const eventStyle = {
      height: '12px',
      fontSize: '13px',
      backgroundColor: isTask ? '#f0ad4e' : '#5bc0de',
      color: '#fff',
      borderRadius: '5px',
      padding: '5px',
      cursor: 'pointer',
      display: 'flex',
      justifyContent: 'space-between'
    };

    const eventTitle = event.title || '';

    const handleEditClick = () => {
      handleEdit(event);
    };

    return (
      <div style={eventStyle}>
        <div>{eventTitle}</div>
        {event.type === 'meeting' && (
          <button onClick={handleEditClick} style={{ backgroundColor: '#d4af37', border: 'none', borderRadius: '3px', color: '#333', cursor: 'pointer', padding: '3px 8px' }}>Editar</button>
        )}
      </div>
    );
  };

  const handleDateChange = (e) => {
    const value = e.target.value;
    if (value && isValidDate(value)) {
      setSelectedDate(new Date(value));
    }
  };

  const isValidDate = (dateString) => {
    const regEx = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateString.match(regEx)) return false; // Invalid format
    const date = new Date(dateString);
    const timestamp = date.getTime();
    if (typeof timestamp !== 'number' || Number.isNaN(timestamp)) return false; // NaN value, Invalid date
    return date.toISOString().startsWith(dateString);
  };

  const updateCalendar = () => {
    setUpdatedDate(selectedDate);
  };

  return (
    <div className="container-calendario">
      <div className="calendar-container-calendario">
        {message && <div className="message-calendario">{message}</div>}
        <input className="input-date" type="date" value={selectedDate.toISOString().substring(0, 10)} onChange={handleDateChange} />
        <button className="update-button" onClick={updateCalendar}>Actualizar Calendario</button>
        <Calendar
          localizer={localizer}
          events={[...tareas, ...reuniones]}
          startAccessor="start"
          endAccessor="end"
          selectable
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleCreateMeeting}
          defaultView="month"
          style={{ height: '55vh' }}
          date={updatedDate}
          components={{
            event: EventComponent
          }}
          className="rbc-calendar" // Aplica el estilo al calendario
        />
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel={isEdit ? 'Editar Reunión' : 'Crear Reunión'}
        className="modal-calendario"
        overlayClassName="overlay-calendario"
        ariaHideApp={false}
      >
        <h2>{isEdit ? 'Editar Reunión' : 'Crear Reunión'}</h2>
        <form onSubmit={handleCreateOrEdit}>
          <label>
            Nombre:
            <input
              className="input-nombre"
              type="text"
              value={newMeeting.title}
              onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
            />
          </label>
          <label>
            Descripción:
            <input
              className="input-descripcion"
              type="text"
              value={newMeeting.descripcion}
              onChange={(e) => setNewMeeting({ ...newMeeting, descripcion: e.target.value })}
            />
          </label>
          <label>
            Fecha Inicio:
            <input
              className="input-fecha-inicio"
              type="datetime-local"
              value={moment(newMeeting.start).format('YYYY-MM-DDTHH:mm')}
              onChange={(e) => setNewMeeting({ ...newMeeting, start: new Date(e.target.value) })}
            />
          </label>
          <label>
            Fecha Fin:
            <input
              className="input-fecha-fin"
              type="datetime-local"
              value={moment(newMeeting.end).format('YYYY-MM-DDTHH:mm')}
              onChange={(e) => setNewMeeting({ ...newMeeting, end: new Date(e.target.value) })}
            />
          </label>
          <div className="button-group-calendario">
            <button type="submit">{isEdit ? 'Guardar Cambios' : 'Crear Reunión'}</button>
            {isEdit && <button type="button" onClick={() => setIsConfirmationOpen(true)}>Eliminar</button>}
            <button type="button" onClick={closeModal}>Cancelar</button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isConfirmationOpen}
        onRequestClose={() => setIsConfirmationOpen(false)}
        contentLabel="Confirmar Eliminación"
        className="modal-calendario"
        overlayClassName="overlay-calendario confirmation-overlay" // Aplica el estilo al overlay
        ariaHideApp={false}
      >
        <h2>¿Estás seguro de que deseas eliminar esta reunión?</h2>
        <div className="button-group-calendario">
          <button onClick={handleDelete}>Sí, eliminar</button>
          <button onClick={() => setIsConfirmationOpen(false)}>Cancelar</button>
        </div>
      </Modal>
    </div>
  );
};

export default Calendario;
