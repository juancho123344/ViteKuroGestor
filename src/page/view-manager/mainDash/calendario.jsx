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
        setMessage('Reunión editada exitosamente');
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
        setMessage('Reunión creada exitosamente');
      }
      if (resultado.data.resultado === 'Reunión actualizada exitosamente' || resultado.data.resultado === 'Reunión creada exitosamente') {
        fetchReuniones();
        closeModal();
      } else {
        setMessage('Error al crear/editar la reunión');
      }
    } catch (error) {
      console.error('Error creating/editing meeting:', error);
      setMessage('Error al crear/editar la reunión');
    }
  };

  const handleDelete = async () => {
    if (!selectedMeeting) {
      console.error('selectedMeeting is null');
      return;
    }

    const { id, title } = selectedMeeting;
    const token = Cookies.get('token');

    openConfirmation(`¿Está seguro de eliminar la reunión "${title}"?`, async () => {
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
    });
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
    setConfirmationCallback(() => callback);
    setIsConfirmationOpen(true);
    setModalIsOpen(false);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedMeeting(null);
    setNewMeeting({
      title: '',
      descripcion: '',
      start: null,
      end: null
    });
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

  const handleNavigate = (date, view) => {
    setUpdatedDate(date);
  };

  return (
    <div>
      {message && <p>{message}</p>}
      <input
        type="date"
        onChange={handleDateChange}
        value={selectedDate.toISOString().split('T')[0]}
        className="date-input"
        min="1900-01-01"
      />
      <button onClick={handleUpdateCalendar} className="update-button">Clic para ir a la fecha</button>

      <Calendar
        localizer={localizer}
        events={[...tareas, ...reuniones]}
        startAccessor="start"
        endAccessor="end"
        style={{ minHeight: 390, position: 'elative', zIndex: 999 }}
        views={['month', 'week', 'day']}
        step={15}
        selectable
        onSelectEvent={handleSelectEvent}
        components={{
          event: EventComponent
        }}
        date={updatedDate}
        onNavigate={handleNavigate}
      />
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Detalles de la reunión"
        ariaHideApp={false}
        style={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000
          },
          content: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '20px',
            border: '1px solid #ccc',
            borderRadius: '10px',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
            backgroundColor: '#fff'
          }
        }}
      >
        <h2>Detalles de la reunión</h2>
        <form onSubmit={handleCreateOrEdit}>
          <label>
            Título:
            <input type="text" value={newMeeting.title} onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })} />
          </label>
          <br />
          <label>
            Descripción:
            <textarea value={newMeeting.descripcion} onChange={(e) => setNewMeeting({ ...newMeeting, descripcion: e.target.value })} />
          </label>
          <br />
          <label>
            Fecha de inicio:
            <input type="datetime-local" value={moment(newMeeting.start).format('YYYY-MM-DDTHH:mm')} onChange={(e) => setNewMeeting({ ...newMeeting, start: new Date(e.target.value) })} />
          </label>
          <br />
          <label>
            Fecha de fin:
            <input type="datetime-local" value={moment(newMeeting.end).format('YYYY-MM-DDTHH:mm')} onChange={(e) => setNewMeeting({ ...newMeeting, end: new Date(e.target.value) })} />
          </label>
          <br />
          <button type="submit">Guardar</button>
          <button type="button" onClick={closeModal}>Cancelar</button>
        </form>
      </Modal>

      <Modal
        isOpen={isConfirmationOpen}
        onRequestClose={handleCancelDelete}
        contentLabel="Confirmación de eliminación"
        ariaHideApp={false}
        style={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000
          },
          content: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '20px',
            border: '1px solid #ccc',
            borderRadius: '10px',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
            backgroundColor: '#fff'
          }
        }}
      >
        <h2>Confirmación de eliminación</h2>
        <p>{confirmationMessage}</p>
        <button type="button" onClick={handleConfirmDelete}>Sí, eliminar</button>
        <button type="button" onClick={handleCancelDelete}>Cancelar</button>
      </Modal>
    </div>
  );
};

export default Calendario;