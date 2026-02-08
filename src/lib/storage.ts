import type { Task, TeamMember, Department } from './types';

const TASKS_KEY = 'protask_tasks';
const MEMBERS_KEY = 'protask_members';
const DEPTS_KEY = 'protask_departments';

// Datos iniciales de ejemplo
const INITIAL_DEPARTMENTS: Department[] = [
    { id: '1', name: 'Ingeniería de Procesos', color: '#3b82f6' }, // Blue
    { id: '2', name: 'Calidad', color: '#10b981' }, // Green
    { id: '3', name: 'Mantenimiento', color: '#f59e0b' }, // Amber
    { id: '4', name: 'Seguridad', color: '#ef4444' }, // Red
];

const INITIAL_MEMBERS: TeamMember[] = [
    { id: '1', name: 'Ana García', email: 'ana.garcia@example.com', role: 'Ingeniera de Procesos', avatar: 'https://i.pravatar.cc/150?u=1' },
    { id: '2', name: 'Carlos López', email: 'carlos.lopez@example.com', role: 'Técnico Senior', avatar: 'https://i.pravatar.cc/150?u=2' },
    { id: '3', name: 'Elena Rodríguez', email: 'elena.rodriguez@example.com', role: 'Analista de Calidad', avatar: 'https://i.pravatar.cc/150?u=3' },
    { id: '4', name: 'David Martínez', email: 'david.martinez@example.com', role: 'Ingeniero Junior', avatar: 'https://i.pravatar.cc/150?u=4' },
];

export const storage = {
    getTasks: (): Task[] => {
        const data = localStorage.getItem(TASKS_KEY);
        return data ? JSON.parse(data) : [];
    },

    saveTasks: (tasks: Task[]) => {
        localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    },

    getDepartments: (): Department[] => {
        const data = localStorage.getItem(DEPTS_KEY);
        if (data) return JSON.parse(data);
        localStorage.setItem(DEPTS_KEY, JSON.stringify(INITIAL_DEPARTMENTS));
        return INITIAL_DEPARTMENTS;
    },

    saveDepartments: (depts: Department[]) => {
        localStorage.setItem(DEPTS_KEY, JSON.stringify(depts));
    },

    getMembers: (): TeamMember[] => {
        const data = localStorage.getItem(MEMBERS_KEY);
        if (data) return JSON.parse(data);

        // Inicializar con datos de ejemplo si está vacío
        localStorage.setItem(MEMBERS_KEY, JSON.stringify(INITIAL_MEMBERS));
        return INITIAL_MEMBERS;
    },

    saveMembers: (members: TeamMember[]) => {
        localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
    },
};
