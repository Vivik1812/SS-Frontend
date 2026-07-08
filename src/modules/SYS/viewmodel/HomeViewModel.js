import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { guardarToken } from "../service/AuthService";
import PublicacionService from "../service/PublicacionService";

const useHomeViewModel = () => {
    
    console.log("HomeViewModel cargado");
    

    const [parametros] = useSearchParams();
    const navigate = useNavigate();
    const [marcadores, setMarcadores] = useState([]);
    const [publicaciones, setPublicaciones] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    //Guarda token
    useEffect(() => {
        const token = parametros.get("token");

        if(token){
            console.log("Token detectado: ",token);
            guardarToken(token);
            console.log("TOKEN GUARDADO");
            
            navigate("/", {replace: true})
            
        }
    }, [parametros, navigate]);

    //Cargar publicaciones
    useEffect(() => {
        const cargarPublicaciones = async () => {
            try {
                setCargando(true);
                const data = await PublicacionService.getPublicaciones();

                //Marcadores en el mapa
                const nuevosMarcadores = data
                    .filter(p => p.latitud && p.longitud)
                    .map(p => ({
                        id: p.id,
                        posicion: [p.latitud, p.longitud],
                        titulo: p.titulo || `Mascota ${p.estado}`,
                        descripcion: p.mascota?.nombreMascota
                            ? `${p.mascota.nombreMascota} — ${p.estado}`
                            : p.estado,
                    }));
                
                    setMarcadores(nuevosMarcadores);
            } catch (err) {
                console.error("Error al cargar publicaciones", err);
                setError("No se pudieron cargar las publicaciones.");
            } finally {
                setCargando(false);
            }
        };
        cargarPublicaciones();
    }, []);
    return {marcadores,publicaciones,cargando,error};
};

export default useHomeViewModel;