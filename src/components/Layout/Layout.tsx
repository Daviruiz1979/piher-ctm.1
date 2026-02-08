
import { useState } from 'react';
import Sidebar from './Sidebar';
import Dashboard from '../Dashboard/Dashboard';
import TaskList from '../Tasks/TaskList';
import TeamList from '../Team/TeamList';
import DepartmentList from '../Departments/DepartmentList';
import { useApp } from '../../context/AppContext';

const Layout = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { notifications } = useApp();

    return (
        <div className="bg-slate-50 min-h-screen flex flex-col md:flex-row">

            {/* Mobile Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between md:hidden shadow-md z-30 sticky top-0">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-xl">P</div>
                    <h1 className="text-xl font-bold tracking-tight">PIHER CTM</h1>
                </div>
                <button onClick={() => setIsSidebarOpen(true)} className="text-slate-300 hover:text-white p-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
            </div>

            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <main className="flex-1 p-4 md:p-8 overflow-y-auto h-[calc(100vh-64px)] md:h-screen w-full">
                {/* Notificaciones Toast simuladas */}
                <div className="fixed top-20 md:top-4 right-4 z-50 space-y-2 pointer-events-none">
                    {notifications.map((msg, idx) => (
                        <div key={idx} className="bg-slate-800 text-white px-4 py-3 rounded-lg shadow-xl flex items-center animate-fade-in-down pointer-events-auto max-w-sm border-l-4 border-blue-500">
                            <span className="text-sm">{msg}</span>
                        </div>
                    ))}
                </div>

                {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} />}
                {activeTab === 'tasks' && <TaskList />}
                {activeTab === 'analytics' && (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
                        <h2 className="text-2xl font-bold mb-2">Módulo de Analítica Avanzada</h2>
                        <p>Los gráficos principales ya están disponibles en el Dashboard.</p>
                    </div>
                )}
                {activeTab === 'team' && <TeamList />}
                {activeTab === 'departments' && <DepartmentList />}
            </main>
        </div>
    );
};

export default Layout;
