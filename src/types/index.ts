
export interface Aspirante {
  id: number;
  puesto: number;
  puntaje: number;
  cedula: string;
  nombre: string;
  plaza_deseada?: string;
}

export interface Plaza {
  id: number;
  departamento: string;
  municipio: string;
  vacantes: number;
}

export interface Prioridad {
  id: number;
  aspirante_id: number;
  municipio: string;
  prioridad: number;
}

export interface AuthUser {
  id: number;
  cedula: string;
  role: 'admin' | 'aspirante';
  puesto?: number;
  nombre?: string;
}

export interface AspiranteWithPrioridades extends Aspirante {
  prioridades: Prioridad[];
}

export interface PlazaWithOcupacion extends Plaza {
  ocupadas: number;
}

export interface AsignacionPlaza {
  aspirante_id: number;
  plaza_id: number;
  municipio: string;
  departamento: string;
}
