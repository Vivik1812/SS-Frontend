import { useState, useEffect, useRef } from 'react';
import NotificacionService from '../../service/NotificacionService';
import { obtenerToken } from '../../service/AuthService';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_URL = 'http://localhost:8083/ws';

function parseJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch {
        return null;
    }
}

export default function NotificacionCampana() {
    const [notificaciones, setNotificaciones] = useState([]);
    const [contador, setContador] = useState(0);
    const [abierto, setAbierto] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [toast, setToast] = useState(null);
    const dropdownRef = useRef(null);
    const stompRef = useRef(null);

    const token = obtenerToken();
    const payload = token ? parseJwt(token) : null;
    const usuarioId = payload?.id;

    useEffect(() => {
        if (usuarioId && token) {
            cargarContador();
            conectarWebSocket();
        }
        return () => {
            stompRef.current?.deactivate();
        };
    }, [usuarioId]);

    useEffect(() => {
        const handleClickFuera = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setAbierto(false);
            }
        };
        document.addEventListener('mousedown', handleClickFuera);
        return () => document.removeEventListener('mousedown', handleClickFuera);
    }, []);

    const conectarWebSocket = () => {
        const client = new Client({
            webSocketFactory: () => new SockJS(WS_URL),
            connectHeaders: { Authorization: `Bearer ${token}` },
            reconnectDelay: 5000,
            onConnect: () => {
                console.log('WebSocket conectado');
                client.subscribe(`/topic/notificaciones/${usuarioId}`, (frame) => {
                    const nuevaNotif = JSON.parse(frame.body);
                    setContador(prev => prev + 1);
                    setNotificaciones(prev => [nuevaNotif, ...prev]);
                    mostrarToast(nuevaNotif.titulo, nuevaNotif.mensaje);
                });
            },
            onStompError: (frame) => {
                console.error('Error STOMP:', frame.headers['message']);
            }
        });
        client.activate();
        stompRef.current = client;
    };

    const mostrarToast = (titulo, mensaje) => {
        setToast({ titulo, mensaje });
        setTimeout(() => setToast(null), 4000);
    };

    const cargarContador = async () => {
        try {
            const count = await NotificacionService.getContador(usuarioId, token);
            setContador(count);
        } catch (error) {
            console.error('Error al cargar contador:', error);
        }
    };

    const cargarNotificaciones = async () => {
        setCargando(true);
        try {
            const data = await NotificacionService.getNotificaciones(usuarioId, token);
            setNotificaciones(data);
        } catch (error) {
            console.error('Error al cargar notificaciones:', error);
        } finally {
            setCargando(false);
        }
    };

    const toggleDropdown = () => {
        if (!abierto) cargarNotificaciones();
        setAbierto(!abierto);
    };

    const marcarLeida = async (id) => {
        try {
            await NotificacionService.marcarLeida(id, token);
            setNotificaciones(prev =>
                prev.map(n => n.id === id ? { ...n, leida: true } : n)
            );
            setContador(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error al marcar como leida:', error);
        }
    };

    const marcarTodasLeidas = async () => {
        try {
            await NotificacionService.marcarTodasLeidas(usuarioId, token);
            setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
            setContador(0);
        } catch (error) {
            console.error('Error al marcar todas como leidas:', error);
        }
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return '';
        return new Date(fecha).toLocaleDateString('es-CL', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <>
            {toast && (
                <div style={{
                    position: 'fixed', bottom: '24px', right: '24px',
                    background: '#1a73e8', color: 'white', borderRadius: '8px',
                    padding: '14px 18px', zIndex: 9999, minWidth: '260px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
                }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>🔔 {toast.titulo}</div>
                    <div style={{ fontSize: '13px', opacity: 0.9 }}>{toast.mensaje}</div>
                </div>
            )}

            <div style={{ position: 'relative' }} ref={dropdownRef}>
                <button
                    onClick={toggleDropdown}
                    style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        position: 'relative', padding: '8px'
                    }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                    {contador > 0 && (
                        <span style={{
                            position: 'absolute', top: '2px', right: '2px',
                            background: 'red', color: 'white', borderRadius: '50%',
                            width: '18px', height: '18px', fontSize: '11px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 'bold'
                        }}>
                            {contador > 9 ? '9+' : contador}
                        </span>
                    )}
                </button>

                {abierto && (
                    <div style={{
                        position: 'absolute', right: 0, top: '40px',
                        width: '320px', background: 'white', borderRadius: '8px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 1000,
                        maxHeight: '400px', overflowY: 'auto'
                    }}>
                        <div style={{
                            display: 'flex', justifyContent: 'space-between',
                            alignItems: 'center', padding: '12px 16px',
                            borderBottom: '1px solid #eee'
                        }}>
                            <strong>Notificaciones</strong>
                            {contador > 0 && (
                                <button onClick={marcarTodasLeidas} style={{
                                    background: 'none', border: 'none',
                                    cursor: 'pointer', color: '#666', fontSize: '12px'
                                }}>
                                    Marcar todas como leídas
                                </button>
                            )}
                        </div>

                        {cargando ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                                Cargando...
                            </div>
                        ) : notificaciones.length === 0 ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                                No tienes notificaciones
                            </div>
                        ) : (
                            notificaciones.map(n => (
                                <div key={n.id} onClick={() => !n.leida && marcarLeida(n.id)}
                                    style={{
                                        padding: '12px 16px', borderBottom: '1px solid #f0f0f0',
                                        background: n.leida ? 'white' : '#f0f7ff',
                                        cursor: n.leida ? 'default' : 'pointer'
                                    }}>
                                    <div style={{ fontWeight: n.leida ? 'normal' : 'bold', fontSize: '14px' }}>
                                        {n.titulo}
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#555', marginTop: '4px' }}>
                                        {n.mensaje}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
                                        {formatearFecha(n.fechaCreacion)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </>
    );
}