import {useEffect, useState, useRef} from 'react';
import {useNavigate} from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { obtenerUsuarioActual } from '../service/AuthService';
import PublicacionService from '../service/PublicacionService';
import { CENTRO_SANTIAGO } from './components/MapView';
import { validarPublicacion } from '../utils/PublicacionValidador';

//Fix iconos 
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
})

//Componente para capturar clicks en el mapa
function SeleccionarPunto({onPuntoSeleccionado}){
    useMapEvents({
        click(e) {
            onPuntoSeleccionado([e.latlng.lat, e.latlng.lng]);
        },
    });
    return null;
}

export default function CrearPublicacionView() {
    const navigate = useNavigate();

    const [errores, setErrores] = useState({});
    const [usuarioId, setUsuarioId] = useState(null);
    useEffect(() => {
        obtenerUsuarioActual()
        .then(u => setUsuarioId(u.id))
        .catch(() => setUsuarioId(null));
    }, []);
    const [tipoPublicacion, setTipoPublicacion] = useState('');
    const [fotos, setFotos] = useState([]);
    const [form, setForm] = useState({
        titulo: '',
        descripcion: '',
    });
    const[mascota, setMascota] = useState({
        nombreMascota: '',
        especie: '',
        raza: '',
        color: '',
        sexo: '',
        tamanio: '',
    });

    //ubicacion en mapa
    const [puntoMarcado, setPuntoMarcado] = useState(null);
    const [direccionObtenida, setDireccionObtenida] = useState('');
    const [cargandoDireccion, setCargandoDireccion] = useState(false);
    const [cargandoGPS, setCargandoGPS] = useState(false);
    const [errorUbicacion, setErrorUbicacion] = useState('');
    const mapRef = useRef(null);

    const updateForm = (key, value) => {   
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const updateMascota = (key, value) => setMascota(prev => ({ ...prev, [key]: value }));

    const handleFoto = (e) => {
        const files = Array.from(e.target.files);
        const nuevasFotos = files.map(f => ({ file: f, url: URL.createObjectURL(f) }));
        setFotos(prev => [...prev, ...nuevasFotos].slice(0,5));
    };

    const eliminarFoto = (index) =>{
        setFotos(prev => prev.filter((_,i) => i !==index));
    };
    //obetener direccion
    const obtenerDireccion = async (lat, lng) =>{
        setCargandoDireccion(true);
        setDireccionObtenida('');
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=es`
            );
            if (!res.ok) throw new Error();
            const data = await res.json();
            setDireccionObtenida(data.display_name || 'Dirección no encontrada');
        } catch {
            setDireccionObtenida('no se pudo obtener la dirección');
        } finally {
            setCargandoDireccion(false);
        }
    };

    //Click en el mapa
    const handlePuntoSeleccionado = async (coords) => {
        setPuntoMarcado(coords);
        setErrorUbicacion('');
        await obtenerDireccion(coords[0], coords[1]);
    };

    //geolocalizacion del dispositivo
    const usarMiUbicacion = () =>{
        setErrorUbicacion('');
        if(!navigator.geolocation) {
            setErrorUbicacion('Tu navegador no soporta geolocalizacion');
            return;
        }
        setCargandoGPS(true);
        navigator.geolocation.getCurrentPosition(
            async(pos) => {
                const coords = [pos.coords.latitude, pos.coords.longitude];
                setPuntoMarcado(coords);
                //Centrar mapa
                if (mapRef.current){
                    mapRef.current.setView(coords,16);
                }
                await obtenerDireccion(coords[0], coords[1]);
                setCargandoGPS(false);
            },
            (err) => {
                const mensajes ={
                    1: 'Permiso denegado. Activalo en configuración',
                    2: 'Ubicación no disponible en este momento',
                    3: 'Tiempo de espera excedido. Vuelva a intentar',
                };
                setErrorUbicacion(mensajes[err.code] || 'No se pudo obtener la ubicación');
                setCargandoGPS(false);
            },
            {enableHighAccuracy: true, timeout: 10000, maximumAge: 0}
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if(!tipoPublicacion){
            alert('Debes seleccionar el tipo de publicación (Perdido / Encontrado)');
            return;
        }
        if(!mascota.especie){
            alert('Debes seleccionar el tipo de mascota');
            return;
        }
        if(!puntoMarcado){
            alert('Debes marcar la ubicacion en el mapa antes de publicar');
            return;
        }

        const erroresEncontrados = validarPublicacion(
            form, mascota, tipoPublicacion, puntoMarcado, usuarioId
        );

        setErrores(erroresEncontrados);

        if(Object.keys(erroresEncontrados).length > 0)
        {
            return;
        }

        try {
            const nuevaPublicacion = {
                titulo: form.titulo,
                descripcion: form.descripcion,
                estado: tipoPublicacion,
                latitud: puntoMarcado[0],
                longitud: puntoMarcado[1],
                usuarioId: usuarioId,
                mascota: {
                    nombreMascota: mascota.nombreMascota,
                    especie: mascota.especie,
                    raza: mascota.raza,
                    color: mascota.color,
                    sexo: mascota.sexo,
                    tamanio: mascota.tamanio,
                },
            };

            console.log(JSON.stringify(nuevaPublicacion, null, 2));
            console.log("usuarioId", usuarioId);
            

            await PublicacionService.createPublicacion(nuevaPublicacion);
            alert('Publicación creada con éxito');
            navigate('/');
        } catch (error) {
            console.error('Error al crear publicación:', error);
            alert('Ocurrio un error al crear la publicacion. Intentelo nuevamente');
        }
    };

    return (
        <div className="crear-publicacion">
            <h1>Crear Publicación</h1>
            <form onSubmit={handleSubmit} className="crear-publicacion-form">
                {/* Tipo de publicación */}
                <div className="form-group">
                    <label>Tipo de publicación</label>
                    <div className="tipo-row">
                        <button type="button" onClick={()=> setTipoPublicacion('PERDIDO')}
                        className={tipoPublicacion === 'PERDIDO' ? 'btn-activo-perdido' : 'btn-inactivo'}>
                        Perdido</button>
                        <button type="button" onClick={()=> setTipoPublicacion('ENCONTRADO')}
                        className={tipoPublicacion === 'ENCONTRADO' ? 'btn-activo-encontrado' : 'btn-inactivo'}>
                        Encontrado</button>
                    </div>
                </div>

                {/* Titulo */}
                <div className="mb-3">
                    <label className="form-label fw-semibold">Titulo <span className= "text-danger">*</span></label>
                    <input type="text" className= "form-control" placeholder= "Ej: Gato perdido" c
                    value={form.titulo} onChange={(e) => updateForm('titulo', e.target.value)} required />
                    {errores.titulo && (
                        <p className="text-red-500 text-sm">
                            {errores.titulo}
                        </p>
                    )}
                </div>

                {/* Tipo de mascota */}
                <div className="mb-3">
                    <label className="form-label fw-semibold">Tipo de mascota</label>
                    <div className="d-flex gap-2">
                        {['Perro', 'Gato', 'Otros'].map(tipo => (
                            <button key={tipo} type="button" onClick={() => updateMascota('especie', tipo)}
                                className={mascota.especie === tipo ? 'btn-activo' : 'btn-inactivo'}>
                                {tipo}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Nombre de la mascota */}
                <div className="mb-3">
                    <label className="form-label fw-semibold">Nombre de la mascota<span className="text-danger">*</span></label>
                    <input type="text" className= "form-control" placeholder= "Ej: Eddie" value={mascota.nombreMascota} onChange={(e) => updateMascota('nombreMascota', e.target.value)} required />

{errores.nombreMascota && (
    <p className="text-red-500 text-sm">
        {errores.nombreMascota}
    </p>
)}
                </div>

                {/*Raza */}
                <div className="mb-3">
                    <label className="form-label fw-semibold">Raza</label>
                    <input type="text" placeholder= "Ej: Labrador" className= "form-control" value={mascota.raza} onChange={(e) => updateMascota('raza', e.target.value)} />
                    {errores.especie && (
    <p className="text-red-500 text-sm">
        {errores.especie}
    </p>
)}
                </div>

                {/*Color */}
                <div className="mb-3">
                    <label className="form-label fw-semibold">Color<span className="text-danger">*</span></label>
                    <input type="text" placeholder= "Ej: Negro" className= "form-control" value={mascota.color} onChange={(e) => updateMascota('color', e.target.value)} required />
                </div>

                {/*Sexo */}
                <div className="mb-3">
                    <label className="form-label fw-semibold">Sexo<span className="text-danger">*</span></label>
                    <div className="d-flex gap-2">
                        {['Macho', 'Hembra'].map(s => (
                            <button key={s} type="button" onClick={() => updateMascota('sexo', s)}
                                className={mascota.sexo === s ? 'btn-activo' : 'btn-inactivo'}>
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/*Tamaño */}
                <div className="mb-3">
                    <label className="form-label fw-semibold">Tamaño<span className="text-danger">*</span></label>
                    <div className="d-flex gap-2">
                        {['Pequeño', 'Mediano', 'Grande'].map(t => (
                            <button key={t} type="button" onClick={() => updateMascota('tamanio', t)}
                                className={mascota.tamanio === t ? 'btn-activo' : 'btn-inactivo'}>
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Ubicación con mapa */}
                <div className="form-group mb-3">
                    <label classname ="form-label">Ubicación <span style={{ color: 'red' }}>*</span></label>
                    <p className= "text-secondary small mb-2">
                        Haz clic en el mapa para marcar la ubicación, o usa tu ubicación actual.
                    </p>

                    <button type="button" onClick={usarMiUbicacion} disabled={cargandoGPS}
                        className ={`mb-2 ${cargandoGPS ? 'btn-inactivo' : 'btn-activo'}`}>
                        {cargandoGPS ? 'Obteniendo ubicación...' : 'Usar mi ubicación'}
                    </button>
                    {errorUbicacion && (
                        <p className= "text-danger small">{errorUbicacion}</p>
                    )}
                    {/*Margenes del mapa */}
                    <div style={{ borderRadius: '0.75rem', overflow: 'hidden', marginBottom: '0.5rem' }}>
                        <MapContainer
                            center={CENTRO_SANTIAGO}
                            zoom={12}
                            scrollWheelZoom={true}
                            style={{ height: '350px', width: '100%', borderRadius: '0.75rem', marginBottom: '0.5rem' }}
                            ref={mapRef}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <SeleccionarPunto onPuntoSeleccionado={handlePuntoSeleccionado} />
                            {puntoMarcado && <Marker position={puntoMarcado} />}
                        </MapContainer>
                    </div>
                    {puntoMarcado && (
                        <div style={{ fontSize: '0.85rem', color: '#555', marginBottom: '0.5rem' }}>
                            <strong>Ubicación seleccionada:</strong>{' '}
                            {cargandoDireccion ? 'Buscando dirección...' : direccionObtenida}
                            <br />
                            <span style={{ color: '#888' }}>
                                Coordenadas: {puntoMarcado[0].toFixed(5)}, {puntoMarcado[1].toFixed(5)}
                            </span>
                        </div>
                    )}
                </div>
                {errores.ubicacion && (
    <p className="text-red-500 text-sm">
        {errores.ubicacion}
    </p>
)}

                {/*Descripción */}
                <div className="form-group">
                    <label>Descripción</label>
                    <textarea rows={5} placeholder= "Descripción  "value={form.descripcion} onChange={(e) => updateForm('descripcion', e.target.value)} />
                        
                    {errores.descripcion && (
                        <p className="text-red-500 text-sm">
                            {errores.descripcion}
                        </p>
                    )}

                </div>

                {/* Fotos */}
                <div className="form-group">
                    <label>Fotos (máx. 5)</label>
                    <input type="file" accept="image/*" multiple onChange={handleFoto} />
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                        {fotos.map((f, i) => (
                            <div key={i} style={{ position: 'relative' }}>
                                <img src={f.url} alt={`foto-${i}`}
                                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                                <button type="button" onClick={() => eliminarFoto(i)}
                                    style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(0,0,0,0.5)',
                                        color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer',
                                        width: '20px', height: '20px', fontSize: '12px', lineHeight: '20px', padding: 0 }}>
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/*Terminos y condiciones*/}
                <div className="form-group">
                    <label>
                        <input type="checkbox"
                            checked={form.aceptaTerminos}
                            onChange={(e) => updateForm('aceptaTerminos', e.target.checked)}
                            required />{' '}
                        Acepto los términos y condiciones
                    </label>
                </div>

                {/* Botón de enviar */}
                <button type="submit" className="btn-submit">Publicar aviso</button>
            </form>
        </div>
    );
}