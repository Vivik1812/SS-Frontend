import { io } from "socket.io-client";
import { obtenerToken } from "./AuthService";

const CHAT_URL = "https://ss-chat-service.onrender.com";

let socket = null;

export const conectarChat = () => {
    const token = obtenerToken();
    socket = io(CHAT_URL, {
        auth: { token }
    });
    return socket;
};

export const desconectarChat = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export const getSocket = () => socket;

export const obtenerConversaciones = async (usuarioId) => {
    const token = obtenerToken();
    const res = await fetch(`${CHAT_URL}/api/v1/chat/conversaciones/${usuarioId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Error al obtener conversaciones");
    return res.json();
};

export const obtenerMensajes = async (conversacionId) => {
    const token = obtenerToken();
    const res = await fetch(`${CHAT_URL}/api/v1/chat/mensajes/${conversacionId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Error al obtener mensajes");
    return res.json();
};

export const crearConversacion = async (usuario1_id, usuario2_id, publicacion_id = null) => {
    const token = obtenerToken();
    const res = await fetch(`${CHAT_URL}/api/v1/chat/conversaciones`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ usuario1_id, usuario2_id, publicacion_id })
    });
    if (!res.ok) throw new Error("Error al crear conversacion");
    return res.json();
};
