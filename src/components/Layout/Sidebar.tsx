
import { LayoutDashboard, CheckSquare, BarChart2, Users, Layers, LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar = ({ activeTab, setActiveTab, isOpen, onClose }: SidebarProps) => {
    const { members } = useApp();
    const { user, signOut } = useAuth();

    // Si no hay miembros en la DB aún, usamos datos del usuario autenticado
    const currentUser = members.length > 0 ? members[0] : {
        name: user?.email?.split('@')[0] || 'Usuario',
        role: 'Administrador',
        avatar: `https://ui-avatars.com/api/?name=${user?.email}&background=random`
    };

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'tasks', label: 'Mis Tareas', icon: CheckSquare },
        { id: 'analytics', label: 'Analítica', icon: BarChart2 },
        { id: 'team', label: 'Equipo', icon: Users },
        { id: 'departments', label: 'Departamentos', icon: Layers },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            <div className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-auto md:flex md:flex-col min-h-screen p-4
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex items-center justify-between mb-10 px-2">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-xl">P</div>
                        <h1 className="text-xl font-bold tracking-tight">PIHER CTM</h1>
                    </div>
                    {/* Botón cerrar móvil */}
                    <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <nav className="flex-1 space-y-2">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id);
                                onClose();
                            }}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === item.id
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <item.icon size={20} />
                            <span className="font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800 space-y-4">
                    <div className="flex items-center space-x-3 bg-slate-800/50 p-3 rounded-lg">
                        <img
                            src={currentUser.avatar}
                            alt="User"
                            className="w-10 h-10 rounded-full border border-slate-600"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{currentUser.name}</p>
                            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => signOut()}
                        className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-slate-400 hover:bg-red-900/20 hover:text-red-400 transition-colors text-sm"
                    >
                        <LogOut size={16} />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
