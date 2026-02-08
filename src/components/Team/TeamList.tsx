
import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useForm } from 'react-hook-form';
import { Plus, Trash2, Mail, User, Shield } from 'lucide-react';

const TeamList = () => {
    const { members, addMember, removeMember } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const onSubmit = (data: any) => {
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random`;
        addMember({
            ...data,
            avatar: avatarUrl
        });
        setIsModalOpen(false);
        reset();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Equipo de Ingeniería</h2>
                    <p className="text-slate-500">Gestiona los miembros y roles del departamento</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center shadow-lg shadow-blue-500/20 transition-all"
                >
                    <Plus size={20} className="mr-2" /> Nuevo Miembro
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {members.map((member) => (
                    <div key={member.id} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group relative">
                        <button
                            onClick={() => {
                                if (confirm('¿Estás seguro de eliminar a este miembro?')) removeMember(member.id);
                            }}
                            className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 size={18} />
                        </button>

                        <div className="flex items-center space-x-4 mb-4">
                            <img
                                src={member.avatar || `https://ui-avatars.com/api/?name=${member.name}`}
                                alt={member.name}
                                className="w-16 h-16 rounded-full border-2 border-slate-100"
                            />
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">{member.name}</h3>
                                <div className="flex items-center text-slate-500 text-sm">
                                    <Shield size={14} className="mr-1" />
                                    {member.role}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <div className="flex items-center text-slate-500 text-sm">
                                <Mail size={16} className="mr-2 text-slate-400" />
                                {member.email}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Nuevo Miembro */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                        <div className="p-6 border-b border-slate-200">
                            <h3 className="text-xl font-bold text-slate-800">Añadir Miembro</h3>
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                                <div className="relative">
                                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        {...register('name', { required: true })}
                                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="Ej. María López"
                                    />
                                </div>
                                {errors.name && <span className="text-red-500 text-xs">Requerido</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Rol / Cargo</label>
                                <div className="relative">
                                    <Shield size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        {...register('role', { required: true })}
                                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="Ej. Senior Engineer"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email Corporativo</label>
                                <div className="relative">
                                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="email"
                                        {...register('email', { required: true })}
                                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="usuario@empresa.com"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                >
                                    Guardar Miembro
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamList;
