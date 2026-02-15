
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Student, Teacher, GradeRecord, AcademicSession, User, SchoolProfile } from '../types';
// Added missing Settings icon to the lucide-react imports
import { Users, UserPlus, TrendingUp, AlertCircle, Calendar, Plus, X, Save, History, CheckCircle2, Upload, Camera, School, Trash2, Settings } from 'lucide-react';
import { storageService } from '../services/storageService';

interface DashboardProps {
  students: Student[];
  teachers: Teacher[];
  grades: GradeRecord[];
  user: User;
  onProfileUpdate: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ students, teachers, grades, user, onProfileUpdate }) => {
  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [activeSession, setActiveSession] = useState<AcademicSession | null>(null);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [newSessionData, setNewSessionData] = useState({ name: '', startDate: '', endDate: '' });
  const [profile, setProfile] = useState<SchoolProfile>(storageService.getSchoolProfile());
  const [isBrandingOpen, setIsBrandingOpen] = useState(false);
  
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadedSessions = storageService.getSessions();
    setSessions(loadedSessions);
    const current = loadedSessions.find(s => s.isCurrent) || loadedSessions[0];
    setActiveSession(current);
  }, []);

  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    const newSession: AcademicSession = {
      id: Math.random().toString(36).substr(2, 9),
      name: newSessionData.name,
      startDate: newSessionData.startDate,
      endDate: newSessionData.endDate,
      isCurrent: true
    };
    storageService.saveSession(newSession);
    const updated = storageService.getSessions();
    setSessions(updated);
    setActiveSession(newSession);
    setIsSessionModalOpen(false);
    setNewSessionData({ name: '', startDate: '', endDate: '' });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const newProfile = { ...profile, logoUrl: base64String };
        storageService.saveSchoolProfile(newProfile);
        setProfile(newProfile);
        onProfileUpdate();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.saveSchoolProfile(profile);
    onProfileUpdate();
    setIsBrandingOpen(false);
  };

  // Filter logic based on session date ranges
  const filteredData = useMemo(() => {
    if (!activeSession) return { students: [], grades: [], stats: [] };

    const start = new Date(activeSession.startDate);
    const end = new Date(activeSession.endDate);

    const sessionStudents = students.filter(s => {
      const admissionDate = new Date(s.admissionDate);
      return admissionDate <= end; // Simplified: Students admitted before or during this session
    });

    const sessionGrades = grades.filter(g => {
      const gradeDate = new Date(g.date);
      return gradeDate >= start && gradeDate <= end;
    });

    const avgGpa = sessionStudents.length > 0 
      ? (sessionStudents.reduce((acc, s) => acc + s.gpa, 0) / sessionStudents.length).toFixed(2)
      : '0.00';

    const atRisk = sessionStudents.filter(s => s.attendance < 75).length;

    const stats = [
      { label: 'Session Students', value: sessionStudents.length, icon: Users, color: 'bg-blue-500' },
      { label: 'Active Teachers', value: teachers.length, icon: UserPlus, color: 'bg-green-500' },
      { label: 'Average GPA', value: avgGpa, icon: TrendingUp, color: 'bg-purple-500' },
      { label: 'At Risk Students', value: atRisk, icon: AlertCircle, color: 'bg-red-500' },
    ];

    return { 
      students: sessionStudents, 
      grades: sessionGrades, 
      stats 
    };
  }, [students, teachers, grades, activeSession]);

  const attendanceData = [
    { name: 'Mon', rate: 94 },
    { name: 'Tue', rate: 96 },
    { name: 'Wed', rate: 92 },
    { name: 'Thu', rate: 89 },
    { name: 'Fri', rate: 95 },
  ];

  const gpaData = filteredData.students.map(s => ({
    name: `${s.firstName} ${s.lastName.charAt(0)}.`,
    gpa: s.gpa
  })).sort((a, b) => b.gpa - a.gpa).slice(0, 10);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header with Branding */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="relative z-10 flex items-center gap-6">
           <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-[2rem] p-4 flex items-center justify-center shadow-xl border border-white/10 group relative">
             {profile.logoUrl ? (
               <img src={profile.logoUrl} className="w-full h-full object-contain" alt="Logo" />
             ) : (
               <School className="w-12 h-12 text-white" />
             )}
             {user.role === 'owner' && (
                <button 
                  onClick={() => setIsBrandingOpen(true)}
                  className="absolute inset-0 bg-black/40 rounded-[2rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Upload className="w-6 h-6 text-white" />
                </button>
             )}
           </div>
           <div>
             <h1 className="text-3xl font-black tracking-tight">{profile.name}</h1>
             <p className="text-blue-100 font-bold uppercase tracking-widest text-[10px] mt-1 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                CBSE Pattern Excellence Centre
             </p>
           </div>
        </div>

        {user.role === 'owner' && (
           <button 
            onClick={() => setIsBrandingOpen(true)}
            className="relative z-10 px-6 py-3 bg-white text-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-blue-50 transition-all flex items-center gap-2"
           >
             <Settings className="w-4 h-4" />
             Manage Branding
           </button>
        )}
      </div>

      {/* Session Header / Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900 leading-none">Academic Session</h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Select Year to Filter Records</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-gray-100 p-1.5 rounded-2xl">
            {sessions.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSession(s)}
                className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                  activeSession?.id === s.id 
                    ? 'bg-white text-blue-600 shadow-sm ring-2 ring-blue-50' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {s.name}
                {s.isCurrent && <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>}
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => setIsSessionModalOpen(true)}
            className="p-3 bg-gray-900 text-white rounded-2xl hover:bg-black transition-colors shadow-xl shadow-gray-200"
            title="Manage Sessions"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredData.stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-4 group hover:shadow-lg hover:shadow-gray-100 transition-all">
            <div className={`${stat.color} p-4 rounded-2xl text-white shadow-lg shadow-${stat.color.split('-')[1]}-200 group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-gray-900">Attendance Trend (Current Week)</h3>
            <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Live Updates</div>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }} />
                <YAxis domain={[80, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 800 }}
                />
                <Line type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={4} dot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-gray-900">Top Performers ({activeSession?.name})</h3>
            <TrendingUp className="w-5 h-5 text-purple-500" />
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gpaData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }} />
                <YAxis domain={[0, 4]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 800 }}
                />
                <Bar dataKey="gpa" fill="#8b5cf6" radius={[10, 10, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Branding Management Modal */}
      {isBrandingOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
              <div className="p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg">
                      <School className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900">Class Branding</h3>
                  </div>
                  <button onClick={() => setIsBrandingOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X className="w-6 h-6 text-gray-300" />
                  </button>
                </div>

                <form onSubmit={handleProfileSave} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Class Name</label>
                    <input 
                      required
                      type="text"
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-gray-900"
                      value={profile.name}
                      onChange={e => setProfile({...profile, name: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Official Logo</label>
                    <div className="flex flex-col items-center gap-4 p-6 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl group">
                       <div className="w-32 h-32 bg-white rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden">
                         {profile.logoUrl ? (
                           <img src={profile.logoUrl} className="w-full h-full object-contain" alt="Logo" />
                         ) : (
                           <School className="w-10 h-10 text-gray-200" />
                         )}
                       </div>
                       <div className="flex gap-2">
                         <button 
                          type="button" 
                          onClick={() => logoInputRef.current?.click()}
                          className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase rounded-xl shadow-lg shadow-blue-200"
                         >
                           Choose Logo
                         </button>
                         {profile.logoUrl && (
                           <button 
                            type="button" 
                            onClick={() => setProfile({...profile, logoUrl: undefined})}
                            className="px-4 py-2 bg-red-50 text-red-600 text-[10px] font-black uppercase rounded-xl border border-red-100"
                           >
                             Remove
                           </button>
                         )}
                       </div>
                       <input 
                        type="file" 
                        ref={logoInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleLogoUpload} 
                       />
                       <p className="text-[9px] text-gray-400 font-bold uppercase">PNG or JPG, max 1MB. (Transparent recommended)</p>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Save Class Identity
                  </button>
                </form>
              </div>
           </div>
        </div>
      )}

      {/* Session Manager Modal */}
      {isSessionModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-900 text-white rounded-2xl shadow-lg">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">Manage Sessions</h3>
                </div>
                <button onClick={() => setIsSessionModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-6 h-6 text-gray-300" />
                </button>
              </div>

              <form onSubmit={handleAddSession} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Session Name</label>
                  <input 
                    required
                    type="text"
                    placeholder="e.g. 2025-26"
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-gray-900"
                    value={newSessionData.name}
                    onChange={e => setNewSessionData({...newSessionData, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Start Date</label>
                    <input 
                      required
                      type="date"
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-gray-900"
                      value={newSessionData.startDate}
                      onChange={e => setNewSessionData({...newSessionData, startDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">End Date</label>
                    <input 
                      required
                      type="date"
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-gray-900"
                      value={newSessionData.endDate}
                      onChange={e => setNewSessionData({...newSessionData, endDate: e.target.value})}
                    />
                  </div>
                </div>

                <div className="p-5 bg-blue-50 rounded-3xl border border-blue-100 flex items-start gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                    <History className="w-5 h-5" />
                  </div>
                  <p className="text-[10px] font-bold text-blue-800 leading-relaxed uppercase">
                    Adding a new session will automatically archive previous records and set this as the active session for the portal.
                  </p>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Initialize Session
                </button>
              </form>

              <div className="mt-8 pt-8 border-t border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Past Sessions</p>
                <div className="space-y-2">
                  {sessions.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-sm font-bold text-gray-700">{s.name} Academic Year</span>
                      {s.isCurrent ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-[9px] font-black uppercase rounded-lg">Active</span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-200 text-gray-500 text-[9px] font-black uppercase rounded-lg">Archived</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
