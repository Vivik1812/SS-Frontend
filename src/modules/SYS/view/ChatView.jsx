import { useState, useEffect, useRef } from 'react';
import {
    conectarChat,
    desconectarChat,
    getSocket,
    obtenerConversaciones,
    obtenerMensajes
} from '../service/ChatService';
import { obtenerToken } from '../service/AuthService';

function parseJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch {
        return null;
    }
}

export default function ChatView() {
    const [conversaciones, setConversaciones] = useState([]);
    const [conversacionActiva, setConversacionActiva] = useState(null);
    const [mensajes, setMensajes] = useState([]);
    const [nuevoMensaje, setNuevoMensaje] = useState('');
    const [cargando, setCargando] = useState(true);
    const [conectado, setConectado] = useState(false);
    const mensajesRef = useRef(null);

    const token = obtenerToken();
    const payload = token ? parseJwt(token) : null;
    const usuarioId = payload?.id;

    useEffect(() => {
        if (!usuarioId) return;

        const socket = conectarChat();

        socket.on('connect', () => setConectado(true));
        socket.on('disconnect', () => setConectado(false));
        socket.on('connect_error', () => setConectado(false));

        socket.on('nuevo_mensaje', (mensaje) => {
            setMensajes((prev) => {
                if (mensaje.conversacion_id !== conversacionActivaRef.current) return prev;
                return [...prev, mensaje];
            });
        });

        cargarConversaciones();

        return () => {
            desconectarChat();
        };
    }, [usuarioId]);

    // Mantener referencia actualizada de la conversación activa para el listener
    const conversacionActivaRef = useRef(null);
    useEffect(() => {
        conversacionActivaRef.current = conversacionActiva?.id;
    }, [conversacionActiva]);

    useEffect(() => {
        if (mensajesRef.current) {
            mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight;
        }
    }, [mensajes]);

    const cargarConversaciones = async () => {
        setCargando(true);
        try {
            const data = await obtenerConversaciones(usuarioId);
            setConversaciones(data);
        } catch (error) {
            console.error('Error al cargar conversaciones:', error);
        } finally {
            setCargando(false);
        }
    };

    const abrirConversacion = async (conversacion) => {
        setConversacionActiva(conversacion);
        try {
            const data = await obtenerMensajes(conversacion.id);
            setMensajes(data);
        } catch (error) {
            console.error('Error al cargar mensajes:', error);
            setMensajes([]);
        }

        const socket = getSocket();
        if (socket) {
            socket.emit('unirse_conversacion', conversacion.id);
        }
    };

    const enviarMensaje = () => {
        if (!nuevoMensaje.trim() || !conversacionActiva) return;
        const socket = getSocket();
        if (socket) {
            socket.emit('enviar_mensaje', {
                conversacion_id: conversacionActiva.id,
                contenido: nuevoMensaje
            });
        }
        setNuevoMensaje('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') enviarMensaje();
    };

    const otroUsuario = (conversacion) => {
        return Number(conversacion.usuario1_id) === Number(usuarioId)
            ? conversacion.usuario2_id
            : conversacion.usuario1_id;
    };

    const formatearHora = (fecha) => {
        if (!fecha) return '';
        return new Date(fecha).toLocaleTimeString('es-CL', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="container-fluid py-4" style={{ height: '85vh' }}>
            <div className="row h-100 border rounded shadow-sm">
                {/* Lista de conversaciones */}
                <div className="col-4 border-end p-0" style={{ overflowY: 'auto' }}>
                    <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
                        <h5 className="m-0">Conversaciones</h5>
                        <span
                            className={`badge ${conectado ? 'bg-success' : 'bg-danger'}`}
                            title={conectado ? 'Conectado' : 'Desconectado'}
                        >
                            {conectado ? '●' : '○'}
                        </span>
                    </div>

                    {cargando ? (
                        <div className="p-3 text-center text-muted">Cargando...</div>
                    ) : conversaciones.length === 0 ? (
                        <div className="p-3 text-center text-muted">No tienes conversaciones</div>
                    ) : (
                        conversaciones.map((c) => (
                            <div
                                key={c.id}
                                onClick={() => abrirConversacion(c)}
                                className="p-3 border-bottom"
                                style={{
                                    cursor: 'pointer',
                                    background: conversacionActiva?.id === c.id ? '#f0f7ff' : 'white'
                                }}
                            >
                                <div className="fw-bold">Usuario #{otroUsuario(c)}</div>
                                {c.publicacion_id && (
                                    <div className="text-muted small">
                                        Sobre publicación #{c.publicacion_id}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Ventana de chat */}
                <div className="col-8 p-0 d-flex flex-column">
                    {!conversacionActiva ? (
                        <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                            Selecciona una conversación
                        </div>
                    ) : (
                        <>
                            <div className="p-3 border-bottom fw-bold">
                                Usuario #{otroUsuario(conversacionActiva)}
                            </div>

                            <div
                                ref={mensajesRef}
                                className="flex-grow-1 p-3"
                                style={{ overflowY: 'auto' }}
                            >
                                {mensajes.length === 0 ? (
                                    <div className="text-center text-muted">No hay mensajes aún</div>
                                ) : (
                                    mensajes.map((m, i) => (
                                        <div
                                            key={m.id || i}
                                            className={`d-flex mb-2 ${
                                                m.emisor_id === usuarioId ? 'justify-content-end' : 'justify-content-start'
                                            }`}
                                        >
                                            <div
                                                style={{
                                                    maxWidth: '70%',
                                                    padding: '8px 12px',
                                                    borderRadius: '12px',
                                                    background: m.emisor_id === usuarioId ? '#198754' : '#e9ecef',
                                                    color: m.emisor_id === usuarioId ? 'white' : 'black'
                                                }}
                                            >
                                                <div>{m.contenido}</div>
                                                <div
                                                    style={{
                                                        fontSize: '11px',
                                                        opacity: 0.7,
                                                        textAlign: 'right',
                                                        marginTop: '2px'
                                                    }}
                                                >
                                                    {formatearHora(m.enviado_en)}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="p-3 border-top d-flex gap-2">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Escribe un mensaje..."
                                    value={nuevoMensaje}
                                    onChange={(e) => setNuevoMensaje(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                />
                                <button className="btn btn-success" onClick={enviarMensaje}>
                                    Enviar
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}