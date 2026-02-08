
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useForm } from 'react-hook-form';
import { User, Lock, ArrowRight, Loader } from 'lucide-react';

const Login = () => {
    const [loading, setLoading] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [errorMsg, setErrorMsg] = useState('');

    const onSubmit = async (data: any) => {
        setLoading(true);
        setErrorMsg('');

        try {
            if (authMode === 'signup') {
                const { error } = await supabase.auth.signUp({
                    email: data.email,
                    password: data.password,
                });
                if (error) throw error;
                alert('¡Registro exitoso! Por favor verifica tu correo electrónico.');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email: data.email,
                    password: data.password,
                });
                if (error) throw error;
                // El auth listener en App.tsx manejará la redirección
            }
        } catch (error: any) {
            setErrorMsg(error.message || 'Error en autenticación');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-in fade-in zoom-in duration-300">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mb-4 shadow-lg shadow-blue-500/30">
                        <span className="text-3xl font-bold text-white">P</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">PIHER CTM</h1>
                    <p className="text-slate-500 mt-2">Plataforma de Gestión de Ingeniería</p>
                </div>

                {errorMsg && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 flex items-center">
                        <span className="font-bold mr-2">Error:</span> {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                {...register('email', { required: true })}
                                type="email"
                                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                placeholder="ingeniero@piher.com"
                            />
                        </div>
                        {errors.email && <span className="text-red-500 text-xs mt-1">Requerido</span>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                {...register('password', { required: true, minLength: 6 })}
                                type="password"
                                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                        {errors.password && <span className="text-red-500 text-xs mt-1">Mínimo 6 caracteres</span>}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center"
                    >
                        {loading ? <Loader className="animate-spin" /> : (
                            <>
                                {authMode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
                                <ArrowRight className="ml-2" size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                        className="text-sm text-slate-500 hover:text-blue-600 font-medium transition-colors"
                    >
                        {authMode === 'login'
                            ? '¿No tienes cuenta? Regístrate aquí'
                            : '¿Ya tienes cuenta? Inicia sesión'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
