
import React, { useState } from 'react';
import { GraduationCap, Lock, User as UserIcon, AlertCircle, ArrowRight, School, UserCheck, ShieldCheck } from 'lucide-react';
import { authService } from '../services/authService';
import { User, UserRole } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loginMode, setLoginMode] = useState<UserRole>('student');
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  const [grade, setGrade] = useState('5th');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const grades = ['5th', '6th', '7th', '8th', '9th', '10th'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Short timeout to feel like a real auth process
    setTimeout(() => {
      const user = authService.login(username, password, loginMode, grade);
      if (user) {
        onLogin(user);
      } else {
        if (loginMode === 'student') {
          setError('Student not found. Please ensure you enter your full name and class exactly as provided during admission.');
        } else {
          setError('Login failed. Please verify your Staff Username and Password.');
        }
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 flex items-center justify-center p-6">
      <div className="bg-white/95 backdrop-blur-xl w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-500">
        <div className="p-10">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4 animate-bounce-slow">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Manikgad Cbse</h1>
            <p className="text-gray-500 font-medium mt-2">Buldana Education Portal</p>
          </div>

          {/* Mode Switcher */}
          <div className="flex bg-gray-100 p-1 rounded-2xl mb-8">
            <button 
              onClick={() => { setLoginMode('student'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${loginMode === 'student' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <UserCheck className="w-4 h-4" />
              Student
            </button>
            <button 
              onClick={() => { setLoginMode('owner'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${loginMode !== 'student' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <ShieldCheck className="w-4 h-4" />
              Staff / Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                {loginMode === 'student' ? 'Student Full Name' : 'Staff/Admin Username'}
              </label>
              <div className="relative group">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <input 
                  required
                  type="text" 
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none transition-all font-bold text-gray-700 placeholder:font-normal"
                  placeholder={loginMode === 'student' ? "e.g. Alice Johnson" : "Enter Username"}
                />
              </div>
              {loginMode === 'owner' && (
                <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 ml-1 italic">Case-sensitive: e.g. Manikgad-Classess</p>
              )}
            </div>

            {loginMode === 'student' && (
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Standard / Class</label>
                <div className="relative group">
                  <School className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  <select 
                    value={grade}
                    onChange={e => setGrade(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none transition-all font-bold text-gray-700 appearance-none"
                  >
                    {grades.map(g => (
                      <option key={g} value={g}>{g} Standard</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                {loginMode === 'student' ? 'Student Password' : 'Staff Password'}
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none transition-all font-bold text-gray-700 placeholder:font-normal"
                  placeholder={loginMode === 'student' ? "Leave blank for first login" : "••••••••"}
                  required={loginMode !== 'student'}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 p-4 rounded-xl flex items-center gap-3 text-red-600 animate-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-xs font-bold leading-snug">{error}</p>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {loginMode === 'student' ? 'Access Student Portal' : 'Login to Staff Portal'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-400 font-medium italic mb-2">
              "Providing Excellence at Buldana"
            </p>
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex flex-col gap-1">
              <span>Admin Support:</span>
              <span>9309521598, 7666254983, 9561334669</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(-5%); animation-timing-function: cubic-bezier(0.8,0,1,1); }
          50% { transform: none; animation-timing-function: cubic-bezier(0,0,0.2,1); }
        }
        .animate-bounce-slow { animation: bounce-slow 3s infinite; }
      `}</style>
    </div>
  );
};

export default Login;
