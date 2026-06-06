import Swal from 'sweetalert2';

export const alertaExito = (mensaje: string) => {
    return Swal.fire({
        title: '¡Éxito!',
        text: mensaje,
        icon: 'success',
        confirmButtonColor: '#3b82f6',
        confirmButtonText: 'Aceptar',
    });
};

export const alertaError = (mensaje: string) => {
    return Swal.fire({
        title: 'Error',
        text: mensaje,
        icon: 'error',
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'Entendido',
    });
};

export const alertaInformativa = (mensaje: string) => {
    return Swal.fire({
        title: 'Información',
        text: mensaje,
        icon: 'info',
        confirmButtonColor: '#3b82f6',
        confirmButtonText: 'Aceptar',
    });
};

export const confirmacionEliminar = async (mensaje: string): Promise<boolean> => {
    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: mensaje,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });
    return result.isConfirmed;
};

export const confirmacionAccion = async (mensaje: string, titulo: string = 'Confirmar Acción', confirmText: string = 'Aceptar'): Promise<boolean> => {
    const result = await Swal.fire({
        title: titulo,
        text: mensaje,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3b82f6',
        cancelButtonColor: '#6b7280',
        confirmButtonText: confirmText,
        cancelButtonText: 'Cancelar'
    });
    return result.isConfirmed;
};

export const promptTexto = async (mensaje: string, titulo: string = 'Ingresar Valor'): Promise<string | null> => {
    const result = await Swal.fire({
        title: titulo,
        text: mensaje,
        input: 'textarea',
        inputPlaceholder: 'Escribe aquí...',
        showCancelButton: true,
        confirmButtonColor: '#3b82f6',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
            if (!value) {
                return '¡Necesitas escribir algo!';
            }
            return null;
        }
    });

    if (result.isConfirmed) {
        return result.value;
    }
    return null;
};
