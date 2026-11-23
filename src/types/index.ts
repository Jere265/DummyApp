export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface TipoEntrada {
  id: number;
  eventoId: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  cupoTotal: number;
  cupoDisponible: number;
  cupo?: number;
}

export interface Evento {
  id: number;
  organizadorId: number;
  nombre: string;
  titulo?: string;
  descripcion: string;
  categoria: string;
  fecha: string;
  fechaEvento?: string;
  multimedia?: string[];
  imagen?: string;
  tiposEntrada?: TipoEntrada[];
  diasRestantes?: number | null;
  organizadorNombre?: string | null;
}

export type EstadoCompraTipo =
  | 'PENDIENTE'
  | 'PENDIENTE_PAGO'
  | 'CONFIRMADA'
  | 'UTILIZADA'
  | 'CANCELADA'
  | 'REEMBOLSADA';

export interface CambioEstadoCompra {
  id: number;
  compraId: number;
  estado: EstadoCompraTipo;
  quienId?: number;
  fechaHora: string;
}

export interface Compra {
  id: number;
  compradorId: number;
  eventoId: number;
  tipoEntradaId: number;
  cantidad: number;
  cantidadEntradas?: number;
  total: number;
  estado: EstadoCompraTipo;
  fechaCompra: string;
  diasRestantes?: number | null;
  evento?: Evento;
  tipoEntrada?: TipoEntrada;
  // Datos extra que el backend agrega en el reporte de ventas del organizador
  compradorNombre?: string;
  tipoEntradaNombre?: string | null;
}

export interface Mensaje {
  id: number;
  compraId: number;
  contenido: string;
  mensaje?: string;
  remitente: 'comprador' | 'organizador';
  usuarioId?: number;
  fechaHora: string;
  enviado?: string;
}

export interface Resena {
  id: number;
  compraId: number;
  eventoId: number;
  compradorId: number;
  puntaje: number;
  puntuacion?: number;
  comentario: string;
  detalle?: string;
  fecha: string;
}

export interface Usuario {
  id: number;
  nombre: string;
  apellido?: string;
  email: string;
  favoritos?: number[];
  rol?: 'comprador' | 'organizador';
}

export interface VentasEventoReporte {
  evento: Evento;
  disponibilidadPorTipo: {
    tipoEntradaId: number;
    nombre: string;
    precio: number;
    cupoTotal: number;
    cupoDisponible: number;
    entradasVendidas: number;
  }[];
  compras: Compra[];
  comprasPorEstado: {
    PENDIENTE: Compra[];
    CONFIRMADA: Compra[];
    UTILIZADA: Compra[];
    CANCELADA: Compra[];
    REEMBOLSADA: Compra[];
  };
  totalEntradasVendidas: number;
}
