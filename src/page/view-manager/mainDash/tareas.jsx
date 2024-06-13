import "./style/tareas.css";
import React, { useState, useEffect } from 'react';
import ShowTasks from "./tarea/mostrarTareas";
import CreateTask from "./tarea/crearTareas";
import UpdateTask from "./tarea/actualizarTarea";
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

function Tareas() {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [proyectoSeleccionado] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      setUserRole(decodedToken.rol);
    }
  }, []);

  const openModal = (content) => {
    setModalContent(content);
    setModalVisible(true);
    setIsSidebarOpen(false);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCreateTask = (taskData) => {
    openModal(<CreateTask proyectoNombre={proyectoSeleccionado} onCreate={handleCreateTask} />);
  };

  return (
    <div className='content-tarea'>
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-buttons">
          <button className="toggle-button" onClick={toggleSidebar}>
            &#9776;
          </button>
          {isSidebarOpen && (
            <>
              {(userRole === 'Manager' || userRole === 'Administrador') && (
                <button onClick={() => openModal(<CreateTask proyectoNombre={proyectoSeleccionado} onCreate={handleCreateTask} />)}>Crear Tarea</button>
              )}
              <button onClick={() => openModal(<UpdateTask />)}>Actualizar Tarea</button>
            </>
          )}
        </div>
      </div>
      <div className='main-content'>
        <div className='show-tareas'>
          <ShowTasks />
        </div>
        {modalVisible && (
          <div className="modal-tarea">
            <div className="modal-content-tarea">
              <span className="close" onClick={closeModal}>&times;</span>
              {modalContent}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Tareas;
