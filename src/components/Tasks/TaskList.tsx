
import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useForm } from 'react-hook-form';
import { Plus, Search, User, Filter, Pencil, X, Upload, Loader } from 'lucide-react';
import { formatDate, cn } from '../../lib/utils';
import type { Priority, Status, Task } from '../../lib/types';
import { db } from '../../lib/db';
import { useAuth } from '../../context/AuthContext';

const TaskList = () => {
    const { tasks, members, departments, addTask, updateTask, initialTaskFilter, setInitialTaskFilter } = useApp();
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();


    // Filtros
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterPriority, setFilterPriority] = useState<string>('all');
    const [filterDelay, setFilterDelay] = useState<boolean>(false); // Nuevo filtro para Delayed
    const [filterDateStart, setFilterDateStart] = useState('');
    const [filterDateEnd, setFilterDateEnd] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Aplicar filtro inicial del Dashboard
    useEffect(() => {
        if (initialTaskFilter) {
            // Resetear filtros
            setFilterStatus('all');
            setFilterPriority('all');
            setFilterDelay(false);

            if (['Completada', 'En Progreso', 'Pendiente', 'Rechazada'].includes(initialTaskFilter)) {
                setFilterStatus(initialTaskFilter);
            } else if (initialTaskFilter === 'Urgente') {
                setFilterPriority('Urgente');
            } else if (initialTaskFilter === 'Delayed') {
                setFilterDelay(true);
            }

            // Consumir el filtro para que no se reaplique
            setInitialTaskFilter(null);
        }
    }, [initialTaskFilter, setInitialTaskFilter]);

    const filteredTasks = tasks.filter(task => {
        const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
        const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;

        let matchesDelay = true;
        if (filterDelay) {
            matchesDelay = task.endDate ? (new Date(task.endDate) < new Date() && task.status !== 'Completada') : false;
        }

        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.projectId.includes(searchTerm);

        // Filtrado por fecha
        let matchesDate = true;
        if (filterDateStart) {
            matchesDate = matchesDate && new Date(task.startDate) >= new Date(filterDateStart);
        }
        if (filterDateEnd) {
            matchesDate = matchesDate && new Date(task.startDate) <= new Date(filterDateEnd);
        }

        return matchesStatus && matchesPriority && matchesDelay && matchesSearch && matchesDate;
    });

    useEffect(() => {
        if (editingTask) {
            setValue('projectId', editingTask.projectId);
            setValue('priority', editingTask.priority);
            setValue('title', editingTask.title);
            setValue('assignedTo', editingTask.assignedTo);
            setValue('departmentId', editingTask.departmentId);
            setValue('estimatedHours', editingTask.estimatedHours);
            setValue('startDate', editingTask.startDate.split('T')[0]);
            setValue('endDate', editingTask.endDate ? editingTask.endDate.split('T')[0] : '');
            setValue('description', editingTask.description);
            setImagePreview(editingTask.image_url || null);
        } else {
            reset();
            setImagePreview(null);
        }
        setSelectedFile(null);
    }, [editingTask, setValue, reset]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleOpenModal = (task?: Task) => {
        if (task) {
            setEditingTask(task);
        } else {
            setEditingTask(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingTask(null);
        setIsModalOpen(false);
        reset();
    };

    const onSubmit = async (data: any) => {
        if (!user) return;

        setIsUploading(true);
        try {
            let final_image_url = editingTask?.image_url;

            if (selectedFile) {
                // Si hay un archivo nuevo, lo subimos
                final_image_url = await db.uploadTaskImage(selectedFile, user.id);
            } else if (imagePreview === null) {
                // Si el preview es null, es que el usuario pulsó la 'X'
                final_image_url = null;
            }

            const taskData = {
                ...data,
                estimatedHours: Number(data.estimatedHours),
                image_url: final_image_url,
            };

            if (editingTask) {
                await updateTask(editingTask.id, taskData);
            } else {
                await addTask({
                    ...taskData,
                    customFields: {},
                });
            }
            handleCloseModal();
        } catch (error) {
            console.error('Error in task submission:', error);
            alert('Error al guardar la tarea. Por favor, revisa el SQL de Supabase.');
        } finally {
            setIsUploading(false);
        }
    };

    const getPriorityColor = (priority: Priority) => {
        switch (priority) {
            case 'Alta': return 'text-orange-600 bg-orange-50 ring-orange-500/10';
            case 'Media': return 'text-yellow-600 bg-yellow-50 ring-yellow-500/10';
            case 'Baja': return 'text-green-600 bg-green-50 ring-green-500/10';
            case 'Urgente': return 'text-white bg-red-600 ring-red-600 animate-pulse';
            default: return 'text-slate-600 bg-slate-50 ring-slate-500/10';
        }
    };

    const getStatusColor = (status: Status) => {
        switch (status) {
            case 'Completada': return 'bg-emerald-500';
            case 'En Progreso': return 'bg-blue-500';
            case 'Pendiente': return 'bg-amber-500';
            case 'Rechazada': return 'bg-red-500';
            default: return 'bg-slate-500';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Gestión de Tareas</h2>
                    <p className="text-slate-500">Administra y asigna el trabajo del equipo</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center shadow-lg shadow-blue-500/20 transition-all"
                >
                    <Plus size={20} className="mr-2" /> Nueva Acción
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por título o proyecto..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Desde:</span>
                            <input
                                type="date"
                                className="bg-transparent text-sm focus:outline-none text-slate-600 w-32"
                                value={filterDateStart}
                                onChange={(e) => setFilterDateStart(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Hasta:</span>
                            <input
                                type="date"
                                className="bg-transparent text-sm focus:outline-none text-slate-600 w-32"
                                value={filterDateEnd}
                                onChange={(e) => setFilterDateEnd(e.target.value)}
                            />
                        </div>

                        <div className="h-6 w-px bg-slate-200 mx-2 hidden md:block"></div>

                        <div className="flex items-center space-x-2">
                            <Filter size={18} className="text-slate-400" />
                            <select
                                className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all">Estado: Todos</option>
                                <option value="Pendiente">Pendiente</option>
                                <option value="En Progreso">En Progreso</option>
                                <option value="Completada">Completada</option>
                                <option value="Rechazada">Rechazada</option>
                            </select>

                            <select
                                className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                value={filterPriority}
                                onChange={(e) => setFilterPriority(e.target.value)}
                            >
                                <option value="all">Prioridad: Todas</option>
                                <option value="Alta">Alta</option>
                                <option value="Media">Media</option>
                                <option value="Baja">Baja</option>
                                <option value="Urgente">URGENTE</option>
                            </select>

                            {filterDelay && (
                                <button
                                    onClick={() => setFilterDelay(false)}
                                    className="bg-red-100 text-red-600 px-3 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-red-200"
                                >
                                    <X size={14} className="mr-1" /> Filtro: Atrasadas
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 font-medium text-slate-500 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Proyecto / Título</th>
                                <th className="px-6 py-4">Asignado a</th>
                                <th className="px-6 py-4">Prioridad</th>
                                <th className="px-6 py-4">Fechas</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredTasks.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                        No se encontraron tareas
                                    </td>
                                </tr>
                            ) : (
                                filteredTasks.map((task) => (
                                    <tr key={task.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                {task.image_url && (
                                                    <div
                                                        className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden border border-slate-200 group-hover:overflow-visible relative z-10"
                                                        title="Doble clic para pantalla completa"
                                                    >
                                                        <img
                                                            src={task.image_url}
                                                            alt=""
                                                            className="w-full h-full object-cover transition-all duration-300 hover:scale-[5.5] hover:shadow-2xl hover:rounded-md cursor-zoom-in origin-left"
                                                            onDoubleClick={() => setFullscreenImage(task.image_url!)}
                                                        />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="flex items-center space-x-2 mb-0.5">
                                                        <span className="text-xs font-mono text-slate-400">#{task.projectId}</span>
                                                        {task.departmentId && (
                                                            <span
                                                                className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded text-white"
                                                                style={{ backgroundColor: departments.find(d => d.id === task.departmentId)?.color || '#94a3b8' }}
                                                            >
                                                                {departments.find(d => d.id === task.departmentId)?.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-slate-700 font-medium truncate max-w-xs">{task.title}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <User size={16} className="mr-2 text-slate-400" />
                                                {members.find(m => m.id === task.assignedTo)?.name || 'Sin asignar'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn("px-2 py-1 rounded-full text-xs font-medium ring-1 ring-inset", getPriorityColor(task.priority))}>
                                                {task.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            <div><span className="text-xs font-semibold">In:</span> {formatDate(task.startDate)}</div>
                                            {task.endDate && <div><span className="text-xs font-semibold">Fin:</span> {formatDate(task.endDate)}</div>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className={cn("w-2 h-2 rounded-full mr-2", getStatusColor(task.status))} />
                                                {task.status}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => handleOpenModal(task)}
                                                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                    title="Editar tarea"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <select
                                                    value={task.status}
                                                    onChange={(e) => updateTask(task.id, { status: e.target.value as Status })}
                                                    className="text-xs border border-slate-200 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                                                >
                                                    <option value="Pendiente">Pendiente</option>
                                                    <option value="En Progreso">En Progreso</option>
                                                    <option value="Completada">Completada</option>
                                                    <option value="Rechazada">Rechazada</option>
                                                </select>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Nueva/Editar Tarea */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-800">
                                {editingTask ? 'Editar Acción' : 'Nueva Acción'}
                            </h3>
                            <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nº Proyecto</label>
                                    <input
                                        {...register('projectId', { required: true })}
                                        className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                                    />
                                    {errors.projectId && <span className="text-red-500 text-xs">Requerido</span>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Prioridad</label>
                                    <select {...register('priority')} className="w-full border border-slate-200 rounded-lg p-2">
                                        <option value="Baja">Baja</option>
                                        <option value="Media">Media</option>
                                        <option value="Alta">Alta</option>
                                        <option value="Urgente">URGENTE (No Planificado)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Título de la Acción</label>
                                <input
                                    {...register('title', { required: true })}
                                    className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Asignar a</label>
                                    <select {...register('assignedTo')} className="w-full border border-slate-200 rounded-lg p-2">
                                        {members.map(m => (
                                            <option key={m.id} value={m.id}>{m.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Horas Estimadas</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        {...register('estimatedHours', { required: true })}
                                        className="w-full border border-slate-200 rounded-lg p-2"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Departamento</label>
                                <select {...register('departmentId')} className="w-full border border-slate-200 rounded-lg p-2">
                                    <option value="">Seleccionar departamento...</option>
                                    {departments.map(d => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Entrada</label>
                                    <input
                                        type="date"
                                        {...register('startDate', { required: true })}
                                        className="w-full border border-slate-200 rounded-lg p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Límite</label>
                                    <input
                                        type="date"
                                        {...register('endDate')}
                                        className="w-full border border-slate-200 rounded-lg p-2"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Adjuntar Imagen</label>
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1">
                                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                                                <p className="text-xs text-slate-500">Haz clic para subir una imagen</p>
                                            </div>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                        </label>
                                    </div>

                                    {imagePreview && (
                                        <div className="relative w-full md:w-32 h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                                            <img src={imagePreview} alt="Vista previa" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setImagePreview(null);
                                                    setSelectedFile(null);
                                                    if (editingTask) editingTask.image_url = undefined;
                                                }}
                                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-lg"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Observaciones</label>
                                <textarea
                                    {...register('description')}
                                    rows={3}
                                    className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 transition-all font-sans text-sm"
                                    placeholder="Detalles adicionales sobre la tarea..."
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUploading}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold"
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader className="animate-spin mr-2" size={18} />
                                            Guardando...
                                        </>
                                    ) : (
                                        <>{editingTask ? 'Actualizar' : 'Guardar'} Tarea</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Pantalla Completa (Lightbox) */}
            {fullscreenImage && (
                <div
                    className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4 md:p-10 cursor-zoom-out"
                    onClick={() => setFullscreenImage(null)}
                >
                    <button
                        className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors p-2"
                        onClick={() => setFullscreenImage(null)}
                    >
                        <X size={40} />
                    </button>
                    <img
                        src={fullscreenImage}
                        alt="Vista ampliada"
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
                    />
                </div>
            )}
        </div>
    );
};

export default TaskList;
