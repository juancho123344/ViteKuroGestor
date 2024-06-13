import 'react-big-calendar/lib/css/react-big-calendar.css';
import './style/calendario.css';
import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import axios from 'axios'; // Importamos Axios directamente
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
    if (event.type === 'meeting') {
      setSelectedMeeting(event);
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
      padding: '0px',
      cursor: 'pointer'
    };

    const eventTitle = event.title || '';

    return (
      <div style={eventStyle} onClick={event.type === 'meeting' ? handleDelete : null}>
        {eventTitle}
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
        style={{ minHeight: 390, position: 'relative', zIndex: 999 }}
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
            right: 'auto',
            bottom: 'auto',
            transform: 'translate(-50%, -50%)',
            backgroundColor: '#333',
            color: '#d4af37',
            borderRadius: '10px',
            padding: '20px',
            zIndex: 1001
          }
        }}
      >
        <h2 style={{ color: '#d4af37', textAlign: 'center', marginBottom: '20px' }}>{isEdit ? 'Editar Reunión' : 'Crear Reunión'}</h2>
        <form onSubmit={handleCreateOrEdit} style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="title" style={{ color: '#d4af37', marginBottom: '10px' }}>Título:</label>
          <input
            type="text"
            id="title"
            value={newMeeting.title}
            onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
            required
            style={{ marginBottom: '10px', padding: '5px', borderRadius: '5px' }}
          />
          <label htmlFor="descripcion" style={{ color: '#d4af37', marginBottom: '10px' }}>Descripción:</label>
          <textarea
            id="descripcion"
            value={newMeeting.descripcion}
            onChange={(e) => setNewMeeting({ ...newMeeting, descripcion: e.target.value })}
            style={{ marginBottom: '10px', padding: '5px', borderRadius: '5px' }}
          />
          <label htmlFor="start" style={{ color: '#d4af37', marginBottom: '10px' }}>Inicio:</label>
          <input
            type="datetime-local"
            id="start"
            value={moment(newMeeting.start).format('YYYY-MM-DDTHH:mm')}
            onChange={(e) => setNewMeeting({ ...newMeeting, start: new Date(e.target.value) })}
            required
            style={{ marginBottom: '10px', padding: '5px', borderRadius: '5px' }}
          />
          <label htmlFor="end" style={{ color: '#d4af37', marginBottom: '10px' }}>Fin:</label>
          <input
            type="datetime-local"
            id="end"
            value={moment(newMeeting.end).format('YYYY-MM-DDTHH:mm')}
            onChange={(e) => setNewMeeting({ ...newMeeting, end: new Date(e.target.value) })}
            required
            style={{ marginBottom: '10px', padding: '5px', borderRadius: '5px' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button type="submit" style={{ padding: '5px', borderRadius: '5px', backgroundColor: '#d4af37', color: '#333', cursor: 'pointer', width: '45%' }}>Guardar</button>
            <button type="button" onClick={closeModal} style={{ padding: '5px', borderRadius: '5px', backgroundColor: '#d4af37', color: '#333', cursor: 'pointer', width: '45%' }}>Cancelar</button>
          </div>
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
            right: 'auto',
            bottom: 'auto',
            transform: 'translate(-50%, -50%)',
            backgroundColor: '#333',
            color: '#d4af37',
            borderRadius: '10px',
            padding: '20px',
            zIndex: 1001
          }
        }}
      >
        <h2 style={{ color: '#d4af37', textAlign: 'center', marginBottom: '20px' }}>Confirmar eliminación</h2>
        <p style={{ color: '#d4af37', marginBottom: '20px' }}>{confirmationMessage}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={handleConfirmDelete} style={{ padding: '5px', borderRadius: '5px', backgroundColor: '#d4af37', color: '#333', cursor: 'pointer', width: '45%' }}>Eliminar</button>
          <button onClick={handleCancelDelete} style={{ padding: '5px', borderRadius: '5px', backgroundColor: '#d4af37', color: '#333', cursor: 'pointer', width: '45%' }}>Cancelar</button>
        </div>
      </Modal>
    </div>
  );
};

export default Calendario;
