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
    start: '',
    end: ''
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
    } else {
      setMessage('Error: ' + resultado.data.resultado);
    }
  } catch (error) {
    console.error('Error creating/editing meeting:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
      setMessage('Error: ' + error.response.data.message); // Mostrar mensaje de error específico del backend
    } else {
      setMessage('Error al crear/editar la reunión');
    }
  }
};
  
  const handleDelete = async () => {
    if (!selectedMeeting || !selectedMeeting.id) {
      console.error('selectedMeeting is null or has no ID');
      return;
    }

    const { id, title } = selectedMeeting;
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

  const openConfirmation = (message, callback) => {
    setConfirmationMessage(message);
    setConfirmationCallback(callback);
    setIsConfirmationOpen(true);
    setModalIsOpen(false);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedMeeting(null);
    setNewMeeting({
      id: null,
      title: '',
      descripcion: '',
      start: '',
      end: ''
    });
    setIsEdit(false); // Reset edit mode
  };

  const handleCancelDelete = () => {
    setIsConfirmationOpen(false);
  };

  const handleConfirmDelete = () => {
    if (confirmationCallback) confirmationCallback();
    setIsConfirmationOpen(false);
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
    if (!dateString.match(regEx)) return false;
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return false;
    return d.toISOString().slice(0, 10) === dateString;
  };

  const handleUpdateCalendar = () => {
    if (selectedDate && selectedDate !== '0') {
      const newDate = new Date(selectedDate);
      newDate.setDate(newDate.getDate() + 1);
      setUpdatedDate(newDate);
    }
  };

  const handleSelectSlot = (slotInfo) => {
    handleCreateMeeting(slotInfo);
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h2>Calendario</h2>
        <div className="date-input">
          <label>Fecha:</label>
          <input
            type="date"
            value={selectedDate ? moment(selectedDate).format('YYYY-MM-DD') : ''}
            onChange={handleDateChange}
          />
          <button onClick={handleUpdateCalendar}>Actualizar Calendario</button>
        </div>
      </div>
      <div className="calendar-content">
        <Calendar
          localizer={localizer}
          events={[...tareas, ...reuniones]}
          startAccessor="start"
          endAccessor="end"
          selectable
          style={{ height: 500, margin: '50px' }}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          components={{ event: EventComponent }}
          defaultView="month"
          date={updatedDate}
        />
      </div>

      {modalIsOpen && (
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          contentLabel="Crear/Editar Reunión"
          className="modal"
          overlayClassName="modal-overlay"
        >
          <h2>{isEdit ? 'Editar Reunión' : 'Crear Reunión'}</h2>
          <form onSubmit={handleCreateOrEdit}>
            <label htmlFor="title">Nombre:</label>
            <input
              type="text"
              id="title"
              value={newMeeting.title}
              onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
              required
            />
            <label htmlFor="descripcion">Descripción:</label>
            <textarea
              id="descripcion"
              value={newMeeting.descripcion}
              onChange={(e) => setNewMeeting({ ...newMeeting, descripcion: e.target.value })}
              required
            ></textarea>
            <label htmlFor="start">Fecha de Inicio:</label>
            <input
              type="datetime-local"
              id="start"
              value={moment(newMeeting.start).format('YYYY-MM-DDTHH:mm')}
              onChange={(e) => setNewMeeting({ ...newMeeting, start: e.target.value })}
              required
            />
            <label htmlFor="end">Fecha de Fin:</label>
            <input
              type="datetime-local"
              id="end"
              value={moment(newMeeting.end).format('YYYY-MM-DDTHH:mm')}
              onChange={(e) => setNewMeeting({ ...newMeeting, end: e.target.value })}
              required
            />
            <div className="modal-buttons">
              <button type="submit">{isEdit ? 'Guardar Cambios' : 'Crear Reunión'}</button>
              <button type="button" onClick={closeModal}>Cancelar</button>
              {isEdit && (
                <button
                  type="button"
                  onClick={() => openConfirmation('¿Estás seguro de eliminar esta reunión?', handleDelete)}
                  className="delete-button"
                >
                  Eliminar
                </button>
              )}
            </div>
          </form>
        </Modal>
      )}

      {isConfirmationOpen && (
        <Modal
          isOpen={isConfirmationOpen}
          onRequestClose={handleCancelDelete}
          contentLabel="Confirmación"
          className="confirmation-modal"
          overlayClassName="modal-overlay"
        >
          <h2>Confirmación</h2>
          <p>{confirmationMessage}</p>
          <div className="modal-buttons">
            <button onClick={handleConfirmDelete}>Sí</button>
            <button onClick={handleCancelDelete}>No</button>
          </div>
        </Modal>
      )}

      {message && (
        <div className="message">
          <p>{message}</p>
        </div>
      )}
    </div>
  );
};

export default Calendario;
