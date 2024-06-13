import "./style/proyectos.css";
import React, { useState, useEffect } from 'react';
import ShowProjects from "./proyecto/mostrarProyectos";
import CreateProject from "./proyecto/crearProyectos";
import UpdateProject from "./proyecto/actualizarProyecto";
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

function Proyectos() {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  return (
    <div className="content-proyecto">
      {userRole === 'Manager' && (
        <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-buttons">
            <button className="toggle-button" onClick={toggleSidebar}>
              &#9776;
            </button>
            {isSidebarOpen && (
              <>
                <button className="create-project-button" onClick={() => openModal(<CreateProject />)}>Crear Proyecto</button>
                <button className="update-project-button" onClick={() => openModal(<UpdateProject />)}>Actualizar Proyecto</button>
              </>
            )}
          </div>
        </div>
      )}
      <div className="main-content">
        <div className="show-projects">
          <ShowProjects />
        </div>
        {modalVisible && (
          <div className="modal-proyecto">
            <div className="modal-content-proyecto">
              <span className="close-button" onClick={closeModal}>&times;</span>
              {modalContent}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Proyectos;
