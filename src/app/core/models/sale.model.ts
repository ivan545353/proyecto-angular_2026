export interface SaleDetail {
    productoId: number;
    cantidad: number;
    precioUnit: number;
    subtotal: number;
    producto?: string;
}

export type SaleEstado = 'presupuesto' | 'confirmada' | 'cobrada' | 'anulada';

export interface Sale {
    id: number;
    numero: number;
    usuario_id: number;
    cliente: string | null;
    fecha: string;
    estado: SaleEstado;
    subtotal: number;
    descuento: number;
    total: number;
    observaciones: string | null;
    vendedor?: string;
    detalles?: SaleDetail[];
}

// Lo que el frontend envía: solo producto + cantidad por línea.
// El backend resuelve precios y totales (fuente de verdad).
export interface SaleLinePayload {
    productoId: number;
    cantidad: number;
}

export interface SalePayload {
    cliente: string;
    observaciones: string;
    descuento: number;
    detalles: SaleLinePayload[];
}