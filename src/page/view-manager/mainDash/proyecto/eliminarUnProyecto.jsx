import axios from 'axios';
import Cookies from "js-cookie"

export const deleteProyect = async (nombre) => {
  try {
    const token = Cookies.get('token');
    const response = await axios.delete(`https://backendkurogestor.onrender.com/api/proyecto/${nombre}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error al eliminar proyecto:', error);
    return { resultado: 'Error al eliminar proyecto' };
  }
};
