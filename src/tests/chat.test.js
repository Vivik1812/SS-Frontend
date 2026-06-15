import { describe, it, expect, vi, beforeEach } from "vitest";

describe("ChatService", () => {
    const token = "test-token";
    const usuarioId = 1;
    const conversacionId = 1;

    beforeEach(() => {
        global.fetch = vi.fn();
    });

    it("obtenerConversaciones debe retornar un array", async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => [{ id: 1, usuario1_id: 1, usuario2_id: 2 }]
        });

        const { obtenerConversaciones } = await import('../modules/SYS/service/ChatService.js');
        const resultado = await obtenerConversaciones(usuarioId);
        expect(Array.isArray(resultado)).toBe(true);
        expect(resultado.length).toBe(1);
    });

    it("obtenerMensajes debe retornar un array", async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => [{ id: 1, contenido: "Hola", emisor_id: 1 }]
        });

        const { obtenerMensajes } = await import('../modules/SYS/service/ChatService.js');
        const resultado = await obtenerMensajes(conversacionId);
        expect(Array.isArray(resultado)).toBe(true);
        expect(resultado[0].contenido).toBe("Hola");
    });

    it("crearConversacion debe retornar la conversacion creada", async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ id: 1, usuario1_id: 1, usuario2_id: 2 })
        });

        const { crearConversacion } = await import('../modules/SYS/service/ChatService.js');
        const resultado = await crearConversacion(1, 2);
        expect(resultado.id).toBe(1);
        expect(resultado.usuario1_id).toBe(1);
    });

    it("obtenerConversaciones debe lanzar error si respuesta no es ok", async () => {
        global.fetch.mockResolvedValueOnce({
            ok: false
        });

        const { obtenerConversaciones } = await import('../modules/SYS/service/ChatService.js');
        await expect(obtenerConversaciones(usuarioId)).rejects.toThrow();
    });

    it("obtenerMensajes debe lanzar error si respuesta no es ok", async () => {
        global.fetch.mockResolvedValueOnce({
            ok: false
        });

        const { obtenerMensajes } = await import('../modules/SYS/service/ChatService.js');
        await expect(obtenerMensajes(conversacionId)).rejects.toThrow();
    });
});