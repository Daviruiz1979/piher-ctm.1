
import { createContext, useContext, useState, useEffect, type ReactNode, type FC } from 'react';
import type { Task, TeamMember, CustomField, Department, Status } from '../lib/types';
import { db } from '../lib/db';
import { useAuth } from './AuthContext';

interface AppContextType {
    tasks: Task[];
    members: TeamMember[];
    departments: Department[];
    customFields: CustomField[];
    loadingData: boolean;
    addTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<void>;
    updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
    addCustomField: (field: Omit<CustomField, 'id'>) => void;
    addMember: (member: Omit<TeamMember, 'id'>) => Promise<void>;
    removeMember: (id: string) => Promise<void>;
    addDepartment: (dept: Omit<Department, 'id'>) => Promise<void>;
    removeDepartment: (id: string) => Promise<void>;
    notifications: string[];
    addNotification: (message: string) => void;
    initialTaskFilter: string | null;
    setInitialTaskFilter: (filter: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [customFields, setCustomFields] = useState<CustomField[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [notifications, setNotifications] = useState<string[]>([]);
    const [initialTaskFilter, setInitialTaskFilter] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;

        const loadData = async () => {
            setLoadingData(true);
            try {
                const [dbTasks, dbMembers, dbDepts] = await Promise.all([
                    db.getTasks(user.id),
                    db.getMembers(user.id),
                    db.getDepartments(user.id)
                ]);
                setTasks(dbTasks);
                setMembers(dbMembers);
                setDepartments(dbDepts);
            } catch (error) {
                console.error('Error loading data from Supabase:', error);
                addNotification('❌ Error al cargar datos de la nube');
            } finally {
                setLoadingData(false);
            }
        };

        loadData();
    }, [user]);

    const addNotification = (message: string) => {
        setNotifications(prev => [message, ...prev]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n !== message));
        }, 5000);
    };

    const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
        if (!user) return;
        try {
            const newTaskData = { ...taskData, status: 'Pendiente' as Status };
            const newTask = await db.saveTask(newTaskData, user.id);
            setTasks(prev => [newTask, ...prev]);

            const member = members.find(m => m.id === taskData.assignedTo);
            if (member) {
                addNotification(`📧 Correo enviado a ${member.name}: Nueva tarea asignada "${newTask.title}"`);
            }
        } catch (error) {
            console.error('Error adding task:', error);
            addNotification('❌ Error al guardar la tarea');
        }
    };

    const updateTask = async (id: string, updates: Partial<Task>) => {
        try {
            const updatedTask = await db.updateTask(id, updates);
            setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));

            if (updates.status === 'Completada') {
                addNotification(`✅ Tarea completada!`);
            }
        } catch (error) {
            console.error('Error updating task:', error);
            addNotification('❌ Error al actualizar la tarea');
        }
    };

    const deleteTask = async (id: string) => {
        try {
            await db.deleteTask(id);
            setTasks(prev => prev.filter(t => t.id !== id));
            addNotification(`🗑️ Tarea eliminada`);
        } catch (error) {
            console.error('Error deleting task:', error);
            addNotification('❌ Error al eliminar la tarea');
        }
    };

    const addCustomField = (field: Omit<CustomField, 'id'>) => {
        // Por ahora los custom fields siguen siendo locales o podríamos añadirlos a la DB más tarde
        setCustomFields(prev => [...prev, { ...field, id: Math.random().toString(36).substr(2, 9) }]);
    };

    const addMember = async (memberData: Omit<TeamMember, 'id'>) => {
        if (!user) return;
        try {
            const newMember = await db.saveMember(memberData, user.id);
            setMembers(prev => [...prev, newMember]);
            addNotification(`👥 Miembro añadido: ${newMember.name}`);
        } catch (error) {
            console.error('Error adding member:', error);
            addNotification('❌ Error al añadir miembro');
        }
    };

    const removeMember = async (id: string) => {
        try {
            await db.deleteMember(id);
            setMembers(prev => prev.filter(m => m.id !== id));
            addNotification(`🗑️ Miembro eliminado`);
        } catch (error) {
            console.error('Error removing member:', error);
            addNotification('❌ Error al eliminar miembro');
        }
    };

    const addDepartment = async (deptData: Omit<Department, 'id'>) => {
        if (!user) return;
        try {
            const newDept = await db.saveDepartment(deptData, user.id);
            setDepartments(prev => [...prev, newDept]);
            addNotification(`🏢 Departamento creado: ${newDept.name}`);
        } catch (error) {
            console.error('Error adding department:', error);
            addNotification('❌ Error al crear departamento');
        }
    };

    const removeDepartment = async (id: string) => {
        try {
            await db.deleteDepartment(id);
            setDepartments(prev => prev.filter(d => d.id !== id));
            addNotification(`🗑️ Departamento eliminado`);
        } catch (error) {
            console.error('Error removing department:', error);
            addNotification('❌ Error al eliminar departamento');
        }
    };

    return (
        <AppContext.Provider value={{
            tasks,
            members,
            departments,
            customFields,
            loadingData,
            addTask,
            updateTask,
            deleteTask,
            addCustomField,
            addMember,
            removeMember,
            addDepartment,
            removeDepartment,
            notifications,
            addNotification,
            initialTaskFilter,
            setInitialTaskFilter
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};
