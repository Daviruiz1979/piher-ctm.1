
export type Priority = 'Alta' | 'Media' | 'Baja' | 'Urgente';
export type Status = 'Pendiente' | 'En Progreso' | 'Completada' | 'Rechazada';

export interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
}

export interface CustomField {
    id: string;
    name: string;
    type: 'text' | 'number' | 'date' | 'select';
    options?: string[]; // Para tipo select
    value?: string | number;
}

export interface Department {
    id: string;
    name: string;
    color: string;
}

export interface Task {
    id: string;
    projectId: string; // Número de proyecto
    title: string;
    description?: string;
    assignedTo: string; // ID del miembro
    departmentId?: string; // ID del departamento
    createdBy: string; // ID del creador (simulado)
    priority: Priority;
    status: Status;
    estimatedHours: number;
    startDate: string; // ISO Date
    endDate?: string; // ISO Date
    completedDate?: string; // ISO Date
    customFields?: Record<string, any>; // ID del campo -> Valor
    createdAt: string;
    updatedAt: string;
}

export interface TaskFilter {
    memberId?: string;
    status?: Status;
    startDate?: string;
    endDate?: string;
    search?: string;
}
