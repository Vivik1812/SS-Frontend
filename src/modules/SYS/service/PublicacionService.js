import apiGW from "./ApiGateway";

 export default class PublicacionService {

     //todas las publicaciones
     static async getPublicaciones() {
         try {
             const response = await apiGW.get('/api/v1/publicaciones');
             return response.data;
         } catch (error) {
             console.error('Error al obtener publicaciones:', error);
             throw error;
         }
     }

     //publicacion por id
     static async getPublicacionById(id) {
         try {
             const response = await apiGW.get(`/api/v1/publicaciones/${id}`);
             return response.data;
         } catch (error) {
             console.error(`Error al obtener la publicación con id ${id}:`, error);
             throw error;
         }
     }

     //crear publicacion
     static async createPublicacion(publicacion) {
         try {
             const response = await apiGW.post('/api/v1/publicaciones', publicacion);
             return response.data;
         } catch (error) {
             console.error('Error al crear la publicación:', error);
             throw error;
         }
     }

     //actualizar publicacion
     static async updatePublicacion(id, publicacion) {
         try {
             const response = await apiGW.put(`/api/v1/publicaciones/${id}`, publicacion);
             return response.data;
         } catch (error) {
             console.error(`Error al actualizar la publicación con id ${id}:`, error);
             throw error;
         }
     }

     //eliminar publicacion
     static async deletePublicacion(id) {
         try {
             const response = await apiGW.delete(`/api/v1/publicaciones/${id}`);
             return response.data;
         } catch (error) {
             console.error(`Error al eliminar la publicación con id ${id}:`, error);
             throw error;
         }
     }

     static async filtroPublicaciones(filtros) {
         try {
             const response = await apiGW.get("/api/v1/publicaciones/filtro", { params: filtros });
             return response.data;
         } catch (error) {
             console.error(`Error al filtrar publicaciones:`, error);
             throw error;
         }
     }
 }
