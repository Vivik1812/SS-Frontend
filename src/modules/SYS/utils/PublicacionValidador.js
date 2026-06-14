export const validarPublicacion = (
    form,
    mascota,
    tipoPublicacion,
    puntoMarcado,
    usuarioId
) => {

    const errores = {};

    // ===== PUBLICACIÓN =====

    if (!form.titulo?.trim()) {
        errores.titulo = "El título es obligatorio";
    } else if (form.titulo.trim().length < 2) {
        errores.titulo = "Debe tener al menos 2 caracteres";
    } else if (form.titulo.trim().length > 100) {
        errores.titulo = "No puede superar los 100 caracteres";
    }

    if (!form.descripcion?.trim()) {
        errores.descripcion = "La descripción es obligatoria";
    } else if (form.descripcion.trim().length < 10) {
        errores.descripcion = "Debe tener al menos 10 caracteres";
    } else if (form.descripcion.trim().length > 1000) {
        errores.descripcion = "No puede superar los 1000 caracteres";
    }

    if (!tipoPublicacion) {
        errores.estado = "Selecciona Perdido o Encontrado";
    }

    if (!usuarioId) {
        errores.usuario = "Debes iniciar sesión";
    }

    if (!puntoMarcado) {
        errores.ubicacion = "Debes seleccionar una ubicación";
    }

    // ===== MASCOTA =====

    if (!mascota.nombreMascota?.trim()) {
        errores.nombreMascota = "El nombre es obligatorio";
    } else if (mascota.nombreMascota.trim().length < 2) {
        errores.nombreMascota = "Debe tener al menos 2 caracteres";
    } else if (mascota.nombreMascota.trim().length > 50) {
        errores.nombreMascota = "No puede superar los 50 caracteres";
    }

    if (!mascota.especie) {
        errores.especie = "Selecciona una especie";
    }

    if (!mascota.raza?.trim()) {
        errores.raza = "La raza es obligatoria";
    }

    if (!mascota.color?.trim()) {
        errores.color = "El color es obligatorio";
    }

    if (!mascota.sexo) {
        errores.sexo = "Selecciona el sexo";
    }

    if (!mascota.tamanio) {
        errores.tamanio = "Selecciona el tamaño";
    }

    return errores;
};