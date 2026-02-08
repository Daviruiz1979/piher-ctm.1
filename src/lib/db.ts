
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
        return data as Task[];
    },

    saveTask: async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, userId: string) => {
        const { data, error } = await supabase
            .from('tasks')
            .insert([{ ...task, user_id: userId }])
            .select()
            .single();

        if (error) throw error;
        return data as Task;
    },

    updateTask: async (id: string, updates: Partial<Task>) => {
        const { data, error } = await supabase
            .from('tasks')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Task;
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
