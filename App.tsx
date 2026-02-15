
import React, { useState, useEffect } from 'react';
import { Bell, Search, Calendar, ChevronRight } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import StudentList from './components/StudentList';
import TeacherList from './components/TeacherList';
import Gradebook from './components/Gradebook';
import AttendanceManager from './components/AttendanceManager';
import AdmissionForm from './components/AdmissionForm';
import FeeManagement from './components/FeeManagement';
import AIAssistant from './components/AIAssistant';
import Login from './components/Login';
import NotesManager from './components/NotesManager';
import StudentRegistration from './components/StudentRegistration';
import RegistrationReport from './components/RegistrationReport';
import TestGenerator from './components/TestGenerator';
import Settings from './components/Settings';
import { storageService } from './services/storageService';
import { authService } from './services/authService';
import { ViewType, Student, Teacher, GradeRecord, FeeRecord, User, SchoolProfile } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setView] = useState<ViewType>('dashboard');
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [needsRegistration, setNeedsRegistration] = useState(false);
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(storageService.getSchoolProfile());

  useEffect(() => {
    const activeUser = authService.getCurrentUser();
    if (activeUser) {
      if (activeUser.role === 'student' && activeUser.isRegistered === false) {
        setNeedsRegistration(true);
      }
      setUser(activeUser);
      if (activeUser.role === 'student' && activeUser.isRegistered !== false) setView('my-profile');
    }
    refreshData();
  }, []);

  const refreshData = () => {
    setStudents(storageService.getStudents());
    setTeachers(storageService.getTeachers());
    setGrades(storageService.getGrades());
    setFees(storageService.getFees());
    setSchoolProfile(storageService.getSchoolProfile());
  };

  const handleLogin = (u: User) => {
    if (u.role === 'student' && u.isRegistered === false) {
      setNeedsRegistration(true);
    } else {
      setView(u.role === 'student' ? 'my-profile' : 'dashboard');
    }
    setUser(u);
  };

  const handleRegistrationComplete = (u: User) => {
    setUser(u);
    setNeedsRegistration(false);
    setView('my-profile');
    refreshData();
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  if (needsRegistration && user.linkedId) {
    return (
      <StudentRegistration 
        studentId={user.linkedId} 
        onComplete={handleRegistrationComplete} 
        onCancel={() => { setUser(null); setNeedsRegistration(false); }}
      />
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard students={students} teachers={teachers} grades={grades} user={user} onProfileUpdate={refreshData} />;
      case 'my-profile':
        const currentStudent = students.find(s => s.id === user.linkedId);
        return currentStudent ? (
          <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl max-w-4xl mx-auto text-center">
             <img src={currentStudent.photoUrl} className="w-40 h-40 rounded-[2.5rem] mx-auto mb-6 shadow-2xl ring-4 ring-blue-50" alt="" />
             <h2 className="text-4xl font-black text-gray-900">{currentStudent.firstName} {currentStudent.lastName}</h2>
             <p className="text-blue-600 font-bold text-xl mt-2">Std {currentStudent.grade} • ID: #{currentStudent.id}</p>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
               <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
                 <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">GPA</p>
                 <p className="text-3xl font-black text-blue-700">{currentStudent.gpa.toFixed(1)}</p>
               </div>
               <div className="p-6 bg-green-50 rounded-3xl border border-green-100">
                 <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-1">Attendance</p>
                 <p className="text-3xl font-black text-green-700">{currentStudent.attendance.toFixed(1)}%</p>
               </div>
               <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
                 <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Fees Status</p>
                 <p className="text-3xl font-black text-indigo-700">Clear</p>
               </div>
             </div>
          </div>
        ) : null;
      case 'students':
        return <StudentList students={students} fees={fees} onUpdate={refreshData} />;
      case 'registration-report':
        return <RegistrationReport students={students} />;
      case 'teachers':
        return <TeacherList teachers={teachers} user={user} onUpdate={refreshData} />;
      case 'grades':
        return <Gradebook grades={grades} students={students} user={user} onUpdate={refreshData} />;
      case 'attendance':
        return <AttendanceManager students={students} user={user} />;
      case 'admission':
        return <AdmissionForm onSuccess={() => { setView('students'); refreshData(); }} />;
      case 'fees':
        const filteredFees = user.role === 'student' ? fees.filter(f => f.studentId === user.linkedId) : fees;
        return <FeeManagement students={students} fees={filteredFees} user={user} onUpdate={refreshData} schoolProfile={schoolProfile} />;
      case 'notes':
        return <NotesManager user={user} />;
      case 'test-generator':
        return <TestGenerator schoolProfile={schoolProfile} />;
      case 'ai-assistant':
        return <AIAssistant students={students} grades={grades} />;
      case 'settings':
        return <Settings user={user} schoolProfile={schoolProfile} onUpdate={refreshData} />;
      default:
        return <div>Not found</div>;
    }
  };

  const getBreadcrumbs = () => {
    const labels: Record<ViewType, string> = {
      dashboard: 'Overview',
      students: 'Student Directory',
      teachers: 'Faculty Management',
      grades: 'Academic Progress',
      attendance: 'Attendance Registry',
      admission: 'New Enrollment',
      fees: 'Financial Records',
      'ai-assistant': 'Intelligent Assistant',
      settings: 'App Settings',
      'my-profile': 'Student Profile',
      notes: 'Personal Notes',
      'registration-report': 'Registration Status',
      'test-generator': 'CBSE Test Generator'
    };
    return labels[currentView];
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FD]">
      <Sidebar currentView={currentView} setView={setView} user={user} onLogout={() => setUser(null)} schoolProfile={schoolProfile} />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-400">Portal</span>
            <ChevronRight className="w-4 h-4 text-gray-300" />
            <span className="text-sm font-bold text-gray-900">{getBreadcrumbs()}</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Quick Access..."
                className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none"
              />
            </div>
            
            <button type="button" className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            </button>
            
            <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                alt="Profile" 
                className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-50/50"
              />
              <div className="hidden lg:block text-left">
                <p className="text-sm font-bold text-gray-900 leading-none">{user.name}</p>
                <p className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-wider">{user.role}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto pb-12">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">{getBreadcrumbs()}</h2>
                <p className="text-gray-500 text-sm mt-1">Personalized portal for {user.name}.</p>
              </div>
              <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-bold text-gray-700">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
            
            <div className="transition-all duration-300">
              {renderContent()}
            </div>
          </div>
        </div>
      </main>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default App;
