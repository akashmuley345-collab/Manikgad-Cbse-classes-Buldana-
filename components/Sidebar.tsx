
import React from 'react';
import { 
  LayoutDashboard, Users, UserCog, GraduationCap, 
  Sparkles, Settings, CheckSquare, UserPlus, 
  IndianRupee, LogOut, User as UserIcon, StickyNote, ClipboardList, FileText, Phone, School
} from 'lucide-react';
import { ViewType, User, SchoolProfile } from '../types';
import { authService } from '../services/authService';

interface SidebarProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  user: User;
  onLogout: () => void;
  schoolProfile: SchoolProfile;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, user, onLogout, schoolProfile }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['owner', 'teacher'] },
    { id: 'my-profile', label: 'My Profile', icon: UserIcon, roles: ['student'] },
    { id: 'students', label: 'Students', icon: Users, roles: ['owner', 'teacher'] },
    { id: 'registration-report', label: 'Registered Students', icon: ClipboardList, roles: ['owner', 'teacher'] },
    { id: 'teachers', label: 'Teachers', icon: UserCog, roles: ['owner'] },
    { id: 'grades', label: 'Courses', icon: GraduationCap, roles: ['owner', 'teacher', 'student'] },
    { id: 'attendance', label: 'Attendance', icon: CheckSquare, roles: ['owner', 'teacher'] },
    { id: 'admission', label: 'Admission', icon: UserPlus, roles: ['owner', 'teacher'] },
    { id: 'fees', label: 'Fees', icon: IndianRupee, roles: ['owner', 'teacher', 'student'] },
    { id: 'notes', label: 'My Notes', icon: StickyNote, roles: ['student', 'teacher'] },
    { id: 'test-generator', label: 'AI Test Maker', icon: FileText, roles: ['owner', 'teacher'] },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Sparkles, roles: ['owner', 'teacher'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['owner'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(user.role));

  const handleLogout = () => {
    authService.logout();
    onLogout();
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen sticky top-0 flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold text-blue-600 flex flex-col items-start gap-1">
          <div className="flex items-center gap-2">
            {schoolProfile.logoUrl ? (
              <img src={schoolProfile.logoUrl} className="w-8 h-8 rounded-lg object-contain bg-white shadow-sm" alt="Logo" />
            ) : (
              <School className="w-8 h-8" />
            )}
            <span className="truncate max-w-[150px]">{schoolProfile.name.split(' ')[0]}</span>
          </div>
          <span className="text-[10px] text-gray-400 uppercase tracking-widest ml-10">CBSE Classes</span>
        </h1>
      </div>
      
      <nav className="mt-2 px-4 space-y-1 flex-1 overflow-y-auto custom-scrollbar">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setView(item.id as ViewType)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 space-y-3">
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Phone className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Admin Contact</span>
          </div>
          <div className="text-[9px] font-bold text-gray-500 space-y-1">
             {schoolProfile.contactNumbers.map(no => <p key={no}>{no}</p>)}
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-blue-900 p-5 rounded-[2rem] text-white shadow-xl">
          <p className="text-[10px] opacity-60 font-black uppercase tracking-widest mb-1">Authenticated</p>
          <p className="text-sm font-bold truncate leading-none mb-1">{user.name}</p>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full uppercase font-black tracking-tighter">
            {user.role}
          </span>
          <button 
            type="button" 
            onClick={handleLogout}
            className="mt-4 text-xs bg-red-500 hover:bg-red-600 w-full py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 font-black uppercase tracking-wider shadow-lg shadow-red-500/10"
          >
            <LogOut className="w-3 h-3" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
