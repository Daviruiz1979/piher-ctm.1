import { useApp } from '../../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { BookmarkCheck, Clock, AlertTriangle, Zap, AlertOctagon } from 'lucide-react';

const Dashboard = ({ onNavigate }: { onNavigate: (tab: string) => void }) => {
    const { tasks, members, departments, setInitialTaskFilter } = useApp();

    // 1. KPIs Generales
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Completada').length;
    const inProgressTasks = tasks.filter(t => t.status === 'En Progreso').length;
    const pendingTasks = tasks.filter(t => t.status === 'Pendiente').length;
    const delayedTasks = tasks.filter(t => {
        if (t.status === 'Completada' || !t.endDate) return false;
        return new Date(t.endDate) < new Date();
    }).length;

    // 2. Colores NEÓN
    const COLORS = {
        neonGreen: '#39FF14',
        neonBlue: '#04D9FF',
        neonPink: '#FF00FF',
        neonOrange: '#FF5E00',
        neonYellow: '#FFFF00',
        neonPurple: '#BF00FF',
        neonRed: '#FF0000', // Rojo para Urgente
        darkBg: '#0F172A'
    };

    // 3. Datos Gráfico Status (Donut)
    const statusData = [
        { name: 'Completed', value: completedTasks, color: COLORS.neonGreen },
        { name: 'In Progress', value: inProgressTasks, color: COLORS.neonBlue },
        { name: 'Pending', value: pendingTasks, color: COLORS.neonOrange },
        { name: 'Delayed', value: delayedTasks, color: COLORS.neonPink },
    ].filter(d => d.value > 0);

    // 4. Datos On-Time Delivery
    const onTimeTasks = tasks.filter(t => {
        if (t.status !== 'Completada' || !t.completedDate) return false;
        if (!t.endDate) return true;
        return new Date(t.completedDate) <= new Date(t.endDate);
    }).length;

    const lateClosedTasks = tasks.filter(t => {
        if (t.status !== 'Completada' || !t.completedDate) return false;
        if (!t.endDate) return false;
        return new Date(t.completedDate) > new Date(t.endDate);
    }).length;

    const onTimePercentage = (onTimeTasks + lateClosedTasks) > 0
        ? Math.round((onTimeTasks / (onTimeTasks + lateClosedTasks)) * 100)
        : 0;

    const deliveryData = [
        { name: 'On Time', value: onTimeTasks, color: COLORS.neonGreen },
        { name: 'Late', value: lateClosedTasks, color: COLORS.neonPink }
    ].filter(d => d.value > 0);

    if (deliveryData.length === 0) {
        deliveryData.push({ name: 'No closed tasks', value: 1, color: '#f1f5f9' });
    }

    // 5. Unplanned Work (Urgente)
    const unplannedTasks = tasks.filter(t => t.priority === 'Urgente').length;
    const plannedTasks = totalTasks - unplannedTasks;
    const unplannedPercentage = totalTasks > 0 ? Math.round((unplannedTasks / totalTasks) * 100) : 0;

    const planningData = [
        { name: 'Planned', value: plannedTasks, color: COLORS.neonBlue },
        { name: 'Unplanned (Urgent)', value: unplannedTasks, color: COLORS.neonRed }
    ];

    // 6. Datos Departamentos
    const deptData = departments.map(dept => {
        return {
            name: dept.name,
            value: tasks.filter(t => t.departmentId === dept.id).length,
            color: dept.color
        };
    }).filter(d => d.value > 0);

    // 7. Carga
    const workloadData = members.map((member, index) => {
        const memberTasks = tasks.filter(t => t.assignedTo === member.id && t.status !== 'Completada' && t.status !== 'Rechazada');
        const totalHours = memberTasks.reduce((acc, curr) => acc + curr.estimatedHours, 0);
        const barColors = [COLORS.neonBlue, COLORS.neonPink, COLORS.neonGreen, COLORS.neonPurple];

        return {
            name: member.name.split(' ')[0],
            hours: totalHours,
            capacity: 40,
            fill: barColors[index % barColors.length]
        };
    });

    const handleCardClick = (filter: string) => {
        setInitialTaskFilter(filter);
        onNavigate('tasks');
    };

    const StatCard = ({ title, value, subtext, icon: Icon, color, alertMode = false, onClick }: any) => (
        <div
            onClick={onClick}
            className={`bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden group cursor-pointer ${alertMode ? 'animate-pulse ring-2 ring-red-500' : ''}`}
            style={{ borderBottom: `4px solid ${color}` }}
        >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Icon size={64} color={color} />
            </div>
            <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
                        <Icon size={24} color={color} />
                    </div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{title}</p>
                </div>
                <h3 className="text-4xl font-black text-slate-800" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.05)' }}>
                    {value}
                </h3>
                {subtext && <p className="text-xs font-bold mt-2" style={{ color: color }}>{subtext}</p>}
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">

            <div className="flex items-center space-x-2">
                <Zap className="text-yellow-500" size={32} fill="currentColor" />
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">EXECUTIVE <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">DASHBOARD</span></h1>
            </div>

            {/* KPIs Principales - Ahora 5 columnas */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                <StatCard
                    title="Completed"
                    value={completedTasks}
                    subtext="GOAL ACHIEVED"
                    icon={BookmarkCheck}
                    color={COLORS.neonGreen}
                    onClick={() => handleCardClick('Completada')}
                />
                <StatCard
                    title="In Progress"
                    value={inProgressTasks}
                    subtext="FULL STEAM AHEAD"
                    icon={Zap}
                    color={COLORS.neonBlue}
                    onClick={() => handleCardClick('En Progreso')}
                />
                <StatCard
                    title="Pending"
                    value={pendingTasks}
                    subtext="IN QUEUE"
                    icon={Clock}
                    color={COLORS.neonOrange}
                    onClick={() => handleCardClick('Pendiente')}
                />
                <StatCard
                    title="Delayed"
                    value={delayedTasks}
                    subtext="ACTION REQUIRED"
                    icon={AlertTriangle}
                    color={COLORS.neonPink}
                    onClick={() => handleCardClick('Delayed')} // Nota: 'Delayed' no es un status, requiere manejo especial en TaskList
                />
                {/* Nueva tarjeta Unplanned */}
                <StatCard
                    title="Unplanned"
                    value={unplannedTasks}
                    subtext={`${unplannedPercentage}% OF TOTAL`}
                    icon={AlertOctagon}
                    color={COLORS.neonRed}
                    alertMode={unplannedPercentage > 20}
                    onClick={() => handleCardClick('Urgente')} // 'Urgente' es prioridad, no status
                />
            </div>

            {/* Grid de 3 columnas para gráficos circulares + Planning Mix */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Actions Status */}
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                    <h3 className="text-xl font-black text-slate-800 mb-8 border-l-4 border-blue-500 pl-4">ACTIONS STATUS</h3>
                    <div className="h-64 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData.length > 0 ? statusData : [{ name: 'No data', value: 1, color: '#f1f5f9' }]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {(statusData.length > 0 ? statusData : [{ name: 'No data', value: 1, color: '#f1f5f9' }]).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} style={{ filter: `drop-shadow(0px 0px 8px ${entry.color}80)` }} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontWeight: 'bold' }} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={10} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-black text-slate-700">{totalTasks}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">ACTIONS</span>
                        </div>
                    </div>
                </div>

                {/* Planning Adherence (Unplanned vs Planned) - NUEVO GRÁFICO */}
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                    <h3 className="text-xl font-black text-slate-800 mb-8 border-l-4 border-red-500 pl-4">PLANNING MIX</h3>
                    <div className="h-64 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={planningData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {planningData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} style={{ filter: `drop-shadow(0px 0px 8px ${entry.color}80)` }} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontWeight: 'bold' }} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={10} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-black text-red-500">{unplannedPercentage}%</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">UNPLANNED</span>
                        </div>
                    </div>
                </div>

                {/* On-Time Delivery */}
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                    <h3 className="text-xl font-black text-slate-800 mb-8 border-l-4 border-green-500 pl-4">ON-TIME DELIVERY</h3>
                    <div className="h-64 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={deliveryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {deliveryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} style={{ filter: `drop-shadow(0px 0px 8px ${entry.color}80)` }} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontWeight: 'bold' }} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={10} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-black text-slate-700">{onTimePercentage}%</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">SUCCESS</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* Fila Inferior: Workload & Departments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Workload */}
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                    <h3 className="text-xl font-black text-slate-800 mb-8 border-l-4 border-purple-500 pl-4">TEAM WORKLOAD</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={workloadData} barSize={30}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 'bold', fontSize: 12 }} dy={10} />
                                <YAxis hide />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                <Bar dataKey="hours" radius={[6, 6, 6, 6]}>
                                    {workloadData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                                <Bar dataKey="capacity" fill="#f1f5f9" radius={[6, 6, 6, 6]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Departments */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-3xl shadow-2xl text-white">
                    <h3 className="text-xl font-bold mb-6 flex items-center">
                        <span className="w-2 h-8 bg-pink-500 mr-3 rounded-full"></span>
                        DEPARTMENT DISTRIBUTION
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={deptData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        dataKey="value"
                                        label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                        labelLine={{ stroke: 'rgba(255,255,255,0.3)' }}
                                    >
                                        {deptData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.2)" />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ color: '#000' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-4">
                            {deptData.map(d => (
                                <div key={d.name} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                                    <div className="flex items-center">
                                        <div className="w-4 h-4 rounded-full mr-3 shadow-[0_0_10px_rgba(0,0,0,0.5)]" style={{ backgroundColor: d.color }}></div>
                                        <span className="font-bold">{d.name}</span>
                                    </div>
                                    <span className="text-2xl font-black">{d.value}</span>
                                </div>
                            ))}
                            {deptData.length === 0 && <p className="text-slate-400 italic">No department data available.</p>}
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
};

export default Dashboard;
