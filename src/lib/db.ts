
import { supabase } from './supabase';
import type { Task, TeamMember, Department } from './types';

export const db = {
    // STORAGE
    uploadTaskImage: async (file: File, userId: string): Promise<string> => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `task-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('task-attachments')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from('task-attachments')
            .getPublicUrl(filePath);

        return data.publicUrl;
    },

    // TASKS
    getTasks: async (userId: string): Promise<Task[]> => {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching tasks:', error);
            return [];
        }

        // Mapeo de snake_case (DB) a camelCase (UI)
        return data.map(t => ({
            id: t.id,
            projectId: t.project_id,
            title: t.title,
            description: t.description,
            assignedTo: t.assigned_to,
            departmentId: t.department_id,
            createdBy: t.user_id,
            priority: t.priority,
            status: t.status,
            estimatedHours: t.estimated_hours,
            startDate: t.start_date,
            endDate: t.end_date,
            completedDate: t.completed_date,
            customFields: t.custom_fields,
            image_url: t.image_url,
            createdAt: t.created_at,
            updatedAt: t.updated_at
        })) as Task[];
    },

    saveTask: async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, userId: string) => {
        const { data, error } = await supabase
            .from('tasks')
            .insert([{
                user_id: userId,
                project_id: task.projectId,
                title: task.title,
                description: task.description,
                assigned_to: task.assignedTo,
                department_id: task.departmentId,
                priority: task.priority,
                status: task.status,
                estimated_hours: task.estimatedHours,
                start_date: task.startDate,
                end_date: task.endDate,
                custom_fields: task.customFields || {},
                image_url: task.image_url
            }])
            .select()
            .single();

        if (error) throw error;

        // Devolver mapped result
        return {
            ...task,
            id: data.id,
            createdAt: data.created_at,
            updatedAt: data.updated_at
        } as Task;
    },

    updateTask: async (id: string, updates: Partial<Task>) => {
        // Mapear updates a snake_case
        const mappedUpdates: any = {};
        if (updates.projectId !== undefined) mappedUpdates.project_id = updates.projectId;
        if (updates.title !== undefined) mappedUpdates.title = updates.title;
        if (updates.description !== undefined) mappedUpdates.description = updates.description;
        if (updates.assignedTo !== undefined) mappedUpdates.assigned_to = updates.assignedTo;
        if (updates.departmentId !== undefined) mappedUpdates.department_id = updates.departmentId;
        if (updates.priority !== undefined) mappedUpdates.priority = updates.priority;
        if (updates.status !== undefined) mappedUpdates.status = updates.status;
        if (updates.estimatedHours !== undefined) mappedUpdates.estimated_hours = updates.estimatedHours;
        if (updates.startDate !== undefined) mappedUpdates.start_date = updates.startDate;
        if (updates.endDate !== undefined) mappedUpdates.end_date = updates.endDate;
        if (updates.completedDate !== undefined) mappedUpdates.completed_date = updates.completedDate;
        if (updates.customFields !== undefined) mappedUpdates.custom_fields = updates.customFields;
        if (updates.image_url !== undefined) mappedUpdates.image_url = updates.image_url;

        const { data, error } = await supabase
            .from('tasks')
            .update(mappedUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // Mapear de vuelta
        return {
            ...updates,
            id: data.id,
            projectId: data.project_id,
            assignedTo: data.assigned_to,
            departmentId: data.department_id,
            estimatedHours: data.estimated_hours,
            startDate: data.start_date,
            endDate: data.end_date,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            image_url: data.image_url
        } as unknown as Task;
    },

    deleteTask: async (id: string) => {
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // DEPARTMENTS (Para una app compartida serían globales o por usuario, usaremos por usuario por ahora)
    getDepartments: async (userId: string): Promise<Department[]> => {
        const { data, error } = await supabase
            .from('departments')
            .select('*')
            .eq('user_id', userId);

        if (error) {
            console.error('Error fetching departments:', error);
            return [];
        }
        return data as Department[];
    },

    saveDepartment: async (dept: Omit<Department, 'id'>, userId: string) => {
        const { data, error } = await supabase
            .from('departments')
            .insert([{ ...dept, user_id: userId }])
            .select()
            .single();

        if (error) throw error;
        return data as Department;
    },

    // MEMBERS
    getMembers: async (userId: string): Promise<TeamMember[]> => {
        const { data, error } = await supabase
            .from('team_members')
            .select('*')
            .eq('user_id', userId);

        if (error) {
            console.error('Error fetching members:', error);
            return [];
        }
        return data as TeamMember[];
    },

    saveMember: async (member: Omit<TeamMember, 'id'>, userId: string) => {
        const { data, error } = await supabase
            .from('team_members')
            .insert([{ ...member, user_id: userId }])
            .select()
            .single();

        if (error) throw error;
        return data as TeamMember;
    },

    deleteMember: async (id: string) => {
        const { error } = await supabase
            .from('team_members')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    deleteDepartment: async (id: string) => {
        const { error } = await supabase
            .from('departments')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
