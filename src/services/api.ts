import {
  Evento,
  Compra,
  Mensaje,
  Resena,
  Categoria,
  VentasEventoReporte
} from '../types';
import { Platform } from 'react-native';

// URL base automática según plataforma
const getDefaultBaseUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3001/api'; // Emulador Android por defecto
  }
  return 'http://localhost:3001/api'; // Web / iOS simulator
};

let currentBaseUrl = getDefaultBaseUrl();

export const setApiBaseUrl = (url: string) => {
  currentBaseUrl = url.replace(/\/$/, '');
};

export const getApiBaseUrl = () => currentBaseUrl;

// Helper genérico para peticiones fetch
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<{ exito: boolean; datos?: T; error?: string; errores?: string[] }> {
  try {
    const url = `${currentBaseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const json = await response.json();

    if (!response.ok) {
      return {
        exito: false,
        error: json.error || (json.errores ? json.errores.join(', ') : 'Error en la petición'),
        errores: json.errores,
      };
    }

    return json;
  } catch (err: any) {
    return {
      exito: false,
      error: err.message || 'No se pudo conectar con el servidor backend. Verificá que esté corriendo.',
    };
  }
}

// ==================== EVENTOS ====================
export const apiEventos = {
  listar: async (params?: { criterio?: string; categoria?: string; ordenarPor?: string; direccion?: string }) => {
    const query = new URLSearchParams();
    if (params?.criterio) query.append('criterio', params.criterio);
    if (params?.categoria && params.categoria !== 'Todas') query.append('categoria', params.categoria);
    if (params?.ordenarPor) query.append('ordenarPor', params.ordenarPor);
    if (params?.direccion) query.append('direccion', params.direccion);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiRequest<Evento[]>(`/eventos${qs}`);
  },

  obtenerPorId: async (id: number) => {
    return apiRequest<Evento>(`/eventos/${id}`);
  },

  crear: async (datos: {
    organizadorId: number;
    nombre: string;
    descripcion: string;
    categoria: string;
    fecha: string;
    multimedia?: string[];
    tiposEntrada: { nombre: string; precio: number; cupoTotal: number; descripcion?: string }[];
  }) => {
    return apiRequest<{ evento: Evento; tiposEntrada: any[] }>('/eventos', {
      method: 'POST',
      body: JSON.stringify(datos),
    });
  },

  listarPorOrganizador: async (organizadorId: number) => {
    return apiRequest<Evento[]>(`/eventos/organizador/${organizadorId}`);
  },

  obtenerVentas: async (eventoId: number, organizadorId: number) => {
    return apiRequest<VentasEventoReporte>(`/eventos/${eventoId}/ventas?organizadorId=${organizadorId}`);
  },

  obtenerResenas: async (eventoId: number) => {
    return apiRequest<Resena[]>(`/eventos/${eventoId}/resenas`);
  },
};

// ==================== COMPRAS ====================
export const apiCompras = {
  crear: async (datos: { compradorId: number; eventoId: number; tipoEntradaId: number; cantidad: number }) => {
    return apiRequest<Compra>('/compras', {
      method: 'POST',
      body: JSON.stringify(datos),
    });
  },

  obtenerPorComprador: async (compradorId: number) => {
    return apiRequest<Compra[]>(`/compras/comprador/${compradorId}`);
  },

  obtenerPorId: async (id: number) => {
    return apiRequest<Compra>(`/compras/${id}`);
  },

  // Solo el comprador dueño de la compra puede cancelarla
  cancelar: async (compraId: number, compradorId: number) => {
    return apiRequest<Compra>(`/compras/${compraId}/cancelar`, {
      method: 'POST',
      body: JSON.stringify({ compradorId }),
    });
  },

  // Solo el organizador del evento valida el ingreso (la entrada pasa a UTILIZADA)
  utilizar: async (compraId: number, organizadorId: number) => {
    return apiRequest<Compra>(`/compras/${compraId}/utilizar`, {
      method: 'POST',
      body: JSON.stringify({ organizadorId }),
    });
  },

  obtenerHistorial: async (compraId: number) => {
    return apiRequest<any[]>(`/compras/${compraId}/historial`);
  },
};

// ==================== CHAT DE COMPRA ====================
export const apiChat = {
  obtenerMensajes: async (compraId: number) => {
    return apiRequest<Mensaje[]>(`/compras/${compraId}/mensajes`);
  },

  enviarMensaje: async (compraId: number, datos: { mensaje: string; remitente: 'comprador' | 'organizador'; usuarioId: number }) => {
    return apiRequest<Mensaje>(`/compras/${compraId}/mensajes`, {
      method: 'POST',
      body: JSON.stringify(datos),
    });
  },
};

// ==================== RESEÑAS ====================
export const apiResenas = {
  crear: async (datos: { compraId: number; compradorId: number; eventoId?: number; puntuacion: number; detalle: string }) => {
    return apiRequest<Resena>('/resenas', {
      method: 'POST',
      body: JSON.stringify(datos),
    });
  },

  obtenerPorOrganizador: async (organizadorId: number) => {
    return apiRequest<{ organizadorId: number; puntajePromedio: number | null; cantidad: number; datos: Resena[] }>(
      `/resenas/organizador/${organizadorId}`
    );
  },
};

// ==================== FAVORITOS ====================
export const apiFavoritos = {
  obtener: async (compradorId: number) => {
    return apiRequest<number[]>(`/compradores/${compradorId}/favoritos`);
  },

  agregar: async (compradorId: number, eventoId: number) => {
    return apiRequest<any>(`/compradores/${compradorId}/favoritos`, {
      method: 'POST',
      body: JSON.stringify({ eventoId }),
    });
  },

  remover: async (compradorId: number, eventoId: number) => {
    return apiRequest<any>(`/compradores/${compradorId}/favoritos/${eventoId}`, {
      method: 'DELETE',
    });
  },
};

// ==================== CATEGORÍAS & DEMO ====================
export const apiCategorias = {
  listar: async () => {
    return apiRequest<Categoria[]>('/categorias');
  },
};

export const apiDemo = {
  resetearDatos: async () => {
    return apiRequest<any>('/seed', { method: 'POST' });
  },
  verificarSalud: async () => {
    return apiRequest<{ status: string }>('/../health');
  },
};
