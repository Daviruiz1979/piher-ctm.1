
import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useForm } from 'react-hook-form';
import { Plus, Trash2, Layers, Briefcase } from 'lucide-react';

const COLORS = [
    { name: 'Rojo Neón', value: '#FF0000' },
    { name: 'Naranja Volt', value: '#FF5E00' },
    { name: 'Amarillo Láser', value: '#FFFF00' },
    { name: 'Verde Alien', value: '#39FF14' },
    { name: 'Cian Eléctrico', value: '#04D9FF' },
    { name: 'Azul Hielo', value: '#00F0FF' },
    { name: 'Azul Real', value: '#0047FF' },
    { name: 'Violeta Ultra', value: '#7B00FF' },
    { name: 'Magenta Puro', value: '#FF00FF' },
    { name: 'Rosa Chicle', value: '#FF0099' },
    { name: 'Coral Vivo', value: '#FF4040' },
    { name: 'Lima Ácida', value: '#CCFF00' },
    { name: 'Turquesa Fluor', value: '#00FFCC' },
    { name: 'Púrpura Deep', value: '#6600CC' },
    { name: 'Carmesí', value: '#DC143C' },
    { name: 'Naranja Mango', value: '#FF8000' },
    { name: 'Oro', value: '#FFD700' },
    { name: 'Verde Menta', value: '#00FF99' },
    { name: 'Azul Cielo', value: '#1E90FF' },
    { name: 'Berenjena', value: '#4B0082' },
    { name: 'Rosa Fuerte', value: '#FF1493' },
    { name: 'Negro Medianoche', value: '#0F172A' },
    { name: 'Gris Tech', value: '#475569' },
    { name: 'Blanco Humo', value: '#F8FAFC' },
    // Pasteles
    { name: 'Rosa Pastel', value: '#FBCFE8' },
    { name: 'Menta Suave', value: '#A7F3D0' },
    { name: 'Lavanda', value: '#DDD6FE' },
    { name: 'Melocotón', value: '#FDE68A' },
    { name: 'Cielo Claro', value: '#BAE6FD' },
    { name: 'Crema', value: '#FEF3C7' },
];

const DepartmentList = () => {
    const { departments, addDepartment, removeDepartment } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();

    // Watch color for preview
    const selectedColor = watch('color', COLORS[0].value);

    const onSubmit = (data: any) => {
        addDepartment(data);
        setIsModalOpen(false);
        reset({ color: COLORS[0].value });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Departamentos</h2>
                    <p className="text-slate-500">Organiza las áreas funcionales de la empresa</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center shadow-lg shadow-blue-500/20 transition-all"
                >
                    <Plus size={20} className="mr-2" /> Nuevo Departamento
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {departments.map((dept) => (
                    <div key={dept.id} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                        {/* Decorative background accent */}
                        <div
                            className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10"
                            style={{ backgroundColor: dept.color }}
                        />

                        <button
                            onClick={() => {
                                if (confirm(`¿Eliminar departamento ${dept.name}? Las tareas asociadas perderán esta referencia.`)) removeDepartment(dept.id);
                            }}
                            className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 z-10"
                        >
                            <Trash2 size={18} />
                        </button>

                        <div className="flex items-center space-x-4 mb-4 relative z-10">
                            <div
                                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg"
                                style={{ backgroundColor: dept.color }}
                            >
                                {dept.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">{dept.name}</h3>
                                <div className="flex items-center text-slate-500 text-sm">
                                    <Layers size={14} className="mr-1" />
                                    Departamento
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Nuevo Departamento */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                        <div className="p-6 border-b border-slate-200">
                            <h3 className="text-xl font-bold text-slate-800">Nuevo Departamento</h3>
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Departamento</label>
                                <div className="relative">
                                    <Briefcase size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        {...register('name', { required: true })}
                                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="Ej. Logística"
                                    />
                                </div>
                                {errors.name && <span className="text-red-500 text-xs">Requerido</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-3">Color Identificativo</label>
                                <div className="grid grid-cols-6 gap-3">
                                    {COLORS.map((color) => (
                                        <button
                                            key={color.value}
                                            type="button"
                                            onClick={() => setValue('color', color.value)}
                                            className={`w-10 h-10 rounded-full transition-transform hover:scale-110 focus:outline-none ring-2 ring-offset-2 ${selectedColor === color.value ? 'ring-slate-400 scale-110' : 'ring-transparent'}`}
                                            style={{ backgroundColor: color.value }}
                                            title={color.name}
                                        />
                                    ))}
                                </div>
                                <input type="hidden" {...register('color', { required: true })} value={selectedColor} />
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
                                    Crear Departamento
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DepartmentList;
