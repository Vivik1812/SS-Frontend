import { describe, it, expect, vi, beforeEach } from "vitest";

// Tests de NotificacionService
describe("NotificacionService", () => {
    const NOTIFICACIONES_URL = 'https://ss-notificaciones-service-oiq5.onrender.com/api/v1/notificaciones';
    const token = "test-token";
    const usuarioId = 1;

    beforeEach(() => {
        global.fetch = vi.fn();
    });

    it("getContador debe retornar un número", async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => 3
        });

        const { default: NotificacionService } = await import('../modules/SYS/service/NotificacionService.js');
        const resultado = await NotificacionService.getContador(usuarioId, token);
        expect(typeof resultado).toBe('number');
        expect(resultado).toBe(3);
    });

    it("getNotificaciones debe retornar un array", async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => [{ id: 1, titulo: "Test", leida: false }]
        });

        const { default: NotificacionService } = await import('../modules/SYS/service/NotificacionService.js');
        const resultado = await NotificacionService.getNotificaciones(usuarioId, token);
        expect(Array.isArray(resultado)).toBe(true);
        expect(resultado.length).toBe(1);
    });

    it("getNoLeidas debe retornar solo notificaciones no leidas", async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => [{ id: 1, titulo: "Test", leida: false }]
        });

        const { default: NotificacionService } = await import('../modules/SYS/service/NotificacionService.js');
        const resultado = await NotificacionService.getNoLeidas(usuarioId, token);
        expect(Array.isArray(resultado)).toBe(true);
        resultado.forEach(n => expect(n.leida).toBe(false));
    });

    it("marcarLeida debe retornar la notificacion actualizada", async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ id: 1, leida: true })
        });

        const { default: NotificacionService } = await import('../modules/SYS/service/NotificacionService.js');
        const resultado = await NotificacionService.marcarLeida(1, token);
        expect(resultado.leida).toBe(true);
    });

    it("marcarTodasLeidas no debe lanzar error", async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true
        });

        const { default: NotificacionService } = await import('../modules/SYS/service/NotificacionService.js');
        await expect(NotificacionService.marcarTodasLeidas(usuarioId, token)).resolves.not.toThrow();
    });
});