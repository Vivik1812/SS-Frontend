const NOTIFICACIONES_URL = 'https://ss-notificaciones-service-oiq5.onrender.com/api/v1/notificaciones';
const NotificacionService = {
    getNotificaciones: async (usuarioId, token) => {
        const response = await fetch(`${NOTIFICACIONES_URL}/usuario/${usuarioId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Error al obtener notificaciones');
        return await response.json();
    },

    getNoLeidas: async (usuarioId, token) => {
        const response = await fetch(`${NOTIFICACIONES_URL}/usuario/${usuarioId}/no-leidas`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Error al obtener notificaciones no leidas');
        return await response.json();
    },

    getContador: async (usuarioId, token) => {
        const response = await fetch(`${NOTIFICACIONES_URL}/usuario/${usuarioId}/contador`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Error al obtener contador');
        return await response.json();
    },

    marcarLeida: async (id, token) => {
        const response = await fetch(`${NOTIFICACIONES_URL}/${id}/leida`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Error al marcar notificacion como leida');
        return await response.json();
    },

    marcarTodasLeidas: async (usuarioId, token) => {
        const response = await fetch(`${NOTIFICACIONES_URL}/usuario/${usuarioId}/leer-todas`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Error al marcar todas como leidas');
    }
};

export default NotificacionService;