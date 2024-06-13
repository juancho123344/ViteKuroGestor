import React from "react";
import { Route, Routes } from "react-router-dom";
import Calendario from "./mainDash/calendario.jsx";
import ShowUsers from './mainDash/listarUsuario.jsx';
import AsignarRango from "./mainDash/asignarRango.jsx";
import Proyectos from './mainDash/proyectos.jsx';
import Tareas from './mainDash/tareas.jsx';
import {ProtectedRoute} from "../../App.jsx"
const MainDash = () => {
  return (
    <div>
      <Routes>
        <Route path="/calendario" element={<Calendario />} />
        <Route path="/listausuario" element={<ShowUsers />} />
        <Route
          path="/asignarrol"
          element={
            <ProtectedRoute requiredRole="Manager">
              <AsignarRango />
            </ProtectedRoute>
          }
        />
        <Route path="/proyectos" element={<Proyectos />} />
        <Route path="/tareas/:proyectoNombre" element={<Tareas />} />
      </Routes>
    </div>
  );
}

export default MainDash;
