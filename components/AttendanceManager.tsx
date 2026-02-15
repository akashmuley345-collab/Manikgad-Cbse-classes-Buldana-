
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Check, X, Search, Calendar, Filter, Users, BookOpen, 
  GraduationCap, Save, History, ChevronRight, Clock, 
  MessageSquare, Loader2, ShieldCheck, Send
} from 'lucide-react';
import { Student, AttendanceRecord, User } from '../types';
import { storageService } from '../services/storageService';
import { notificationService } from '../services/notificationService';

interface AttendanceManagerProps {
  students: Student[];
  user: User;
}

const AttendanceManager: React.FC<AttendanceManagerProps> = ({ students, user }) => {
  const [activeTab, setActiveTab] = useState<'take' | 'history'>('take');
  const [selectedGrade, setSelectedGrade] = useState<string>('All');
  const [selectedCourse, setSelectedCourse] = useState<string>('All');
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [logs, setLogs] = useState<AttendanceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // SMS Notification states
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchProgress, setDispatchProgress] = useState({ current: 0, total: 0, currentName: '' });

  const todayDate = new Date().toISOString().split('T')[0];
  const todayDisplay = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  useEffect(() => {
    setLogs(storageService.getAttendanceLogs());
  }, []);

  const grades = ['All', '5th', '6th', '7th', '8th', '9th', '10th'];
  
  const allCourses = useMemo(() => {
    const courses = new Set<string>();
    students.forEach(s => s.enrolledCourses?.forEach(c => courses.add(c)));
    return ['All', ...Array.from(courses)].sort();
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const gradeMatch = selectedGrade === 'All' || student.grade === selectedGrade;
      const courseMatch = selectedCourse === 'All' || student.enrolledCourses?.includes(selectedCourse);
      const nameMatch = `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) || student.id.includes(searchQuery);
      return gradeMatch && courseMatch && nameMatch;
    });
  }, [students, selectedGrade, selectedCourse, searchQuery]);

  const markFilteredPresent = () => {
    const newBatch = { ...attendance };
    filteredStudents.forEach(s => newBatch[s.id] = true);
    setAttendance(newBatch);
  };

  const handleSaveAttendance = async () => {
    const presentIds = filteredStudents.filter(s => attendance[s.id] === true).map(s => s.id);
    const absentIds = filteredStudents.filter(s => attendance[s.id] === false).map(s => s.id);
    const untouched = filteredStudents.filter(s => attendance[s.id] === undefined);

    if (untouched.length > 0) {
      alert(`Please mark attendance for all ${untouched.length} students in the list first.`);
      return;
    }

    if (absentIds.length > 0) {
      const confirmMsg = `You are about to mark ${absentIds.length} students as ABSENT. This will automatically send SMS alerts to their parents. Proceed?`;
      if (!window.confirm(confirmMsg)) return;
    }

    // 1. Dispatch SMS Notifications
    if (absentIds.length > 0) {
      setIsDispatching(true);
      setDispatchProgress({ current: 0, total: absentIds.length, currentName: '' });

      for (let i = 0; i < absentIds.length; i++) {
        const student = students.find(s => s.id === absentIds[i]);
        if (student) {
          setDispatchProgress(prev => ({ ...prev, current: i + 1, currentName: `${student.firstName} ${student.lastName}` }));
          await notificationService.sendAbsenteeSMS(student, todayDisplay);
        }
      }
      setIsDispatching(false);
    }

    // 2. Save the record
    const record: AttendanceRecord = {
      id: Math.random().toString(36).substr(2, 9),
      date: todayDate,
      grade: selectedGrade,
      course: selectedCourse,
      presentIds,
      absentIds,
      takenBy: user.name
    };

    storageService.saveAttendanceRecord(record);
    setLogs(storageService.getAttendanceLogs());
    setAttendance({});
    alert(`Attendance register saved! ${absentIds.length} parent alerts were successfully dispatched.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm w-fit">
        <button 
          onClick={() => setActiveTab('take')}
          className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'take' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Take Attendance
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-400 hover:text-gray-600'}`}
        >
          View Logs
        </button>
      </div>

      {activeTab === 'take' ? (
        <>
          {/* Filters Section */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex flex-col lg:flex-row gap-6 items-end">
              <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <GraduationCap className="w-3 h-3" /> Standard
                  </label>
                  <select 
                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-gray-700"
                    value={selectedGrade}
                    onChange={(e) => { setSelectedGrade(e.target.value); setAttendance({}); }}
                  >
                    {grades.map(g => (
                      <option key={g} value={g}>{g === 'All' ? 'All Classes' : `${g} Standard`}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <BookOpen className="w-3 h-3" /> Course / Subject
                  </label>
                  <select 
                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-gray-700"
                    value={selectedCourse}
                    onChange={(e) => { setSelectedCourse(e.target.value); setAttendance({}); }}
                  >
                    {allCourses.map(c => (
                      <option key={c} value={c}>{c === 'All' ? 'General Registry' : c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Search className="w-3 h-3" /> Search Student
                  </label>
                  <input 
                    type="text"
                    placeholder="Quick find..."
                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-gray-700"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex gap-3 w-full lg:w-auto">
                <button 
                  onClick={markFilteredPresent}
                  className="flex-1 lg:flex-none px-6 py-3 bg-green-50 text-green-700 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-green-100 transition-colors whitespace-nowrap border border-green-100"
                >
                  All Present
                </button>
                <button 
                  disabled={isDispatching}
                  className="flex-1 lg:flex-none px-8 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                  onClick={handleSaveAttendance}
                >
                  {isDispatching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
                  {isDispatching ? 'Sending SMS...' : 'Save & Alert'}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <Users className="w-6 h-6 text-blue-600" />
                  {selectedGrade === 'All' ? 'School-wide' : selectedGrade} / {selectedCourse === 'All' ? 'General' : selectedCourse}
                </h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">{todayDisplay}</p>
              </div>
              <div className="flex items-center gap-4">
                 <div className="text-right">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Marked Present</p>
                   <p className="text-lg font-black text-green-600">{Object.values(attendance).filter(v => v).length}</p>
                 </div>
                 <div className="w-px h-8 bg-gray-200"></div>
                 <div className="text-right">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Marked Absent</p>
                   <p className="text-lg font-black text-red-600">{Object.values(attendance).filter(v => v === false).length}</p>
                 </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white border-b border-gray-50">
                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student Details</th>
                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Class</th>
                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredStudents.length > 0 ? filteredStudents.map((student) => {
                    const isPresent = attendance[student.id];
                    
                    return (
                      <tr key={student.id} className="hover:bg-blue-50/20 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-black text-sm shadow-sm overflow-hidden ring-2 ring-transparent group-hover:ring-blue-100 transition-all">
                              {student.photoUrl ? (
                                <img src={student.photoUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                student.firstName[0]
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-black text-gray-900 leading-none">{student.firstName} {student.lastName}</p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">ID: #{student.id} • Parent: {student.parentMobile}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-center">
                          <span className="text-[10px] font-black text-gray-600 bg-gray-100 px-3 py-1 rounded-lg uppercase border border-gray-200">
                            {student.grade}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex justify-center gap-3">
                            <button 
                              onClick={() => setAttendance(prev => ({ ...prev, [student.id]: true }))}
                              className={`w-12 h-10 rounded-xl flex items-center justify-center transition-all ${
                                isPresent === true 
                                  ? 'bg-green-600 text-white shadow-lg shadow-green-100 scale-105' 
                                  : 'bg-gray-50 text-gray-300 hover:bg-green-50 hover:text-green-600'
                              }`}
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => setAttendance(prev => ({ ...prev, [student.id]: false }))}
                              className={`w-12 h-10 rounded-xl flex items-center justify-center transition-all ${
                                isPresent === false
                                  ? 'bg-red-600 text-white shadow-lg shadow-red-100 scale-105' 
                                  : 'bg-gray-50 text-gray-300 hover:bg-red-50 hover:text-red-600'
                              }`}
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={3} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Filter className="w-10 h-10 text-gray-200" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900">No students found</h3>
                          <p className="text-sm text-gray-400 max-w-xs mx-auto mt-1">No students match your filter criteria.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {logs.length > 0 ? logs.sort((a,b) => b.id.localeCompare(a.id)).map(log => (
                <div key={log.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all">
                   <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                         <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                            <History className="w-5 h-5" />
                         </div>
                         <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none">Record #{log.id.substr(0,4)}</p>
                            <p className="text-sm font-black text-gray-900">{log.date}</p>
                         </div>
                      </div>
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${log.grade === 'All' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                        {log.grade}
                      </span>
                   </div>

                   <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-6">
                      <div className="flex items-center gap-2 mb-2">
                         <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                         <span className="text-xs font-bold text-gray-700">{log.course}</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <Clock className="w-3.5 h-3.5 text-gray-400" />
                         <span className="text-[10px] font-bold text-gray-400">By {log.takenBy}</span>
                      </div>
                   </div>

                   <div className="flex items-center gap-4">
                      <div className="flex-1 text-center">
                         <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Present</p>
                         <p className="text-xl font-black text-green-600">{log.presentIds.length}</p>
                      </div>
                      <div className="w-px h-8 bg-gray-100"></div>
                      <div className="flex-1 text-center">
                         <div className="flex items-center justify-center gap-1 mb-1">
                           <p className="text-[10px] font-black text-gray-400 uppercase">Absent</p>
                           <MessageSquare className="w-2.5 h-2.5 text-red-400" />
                         </div>
                         <p className="text-xl font-black text-red-600">{log.absentIds.length}</p>
                      </div>
                   </div>
                </div>
              )) : (
                <div className="col-span-full py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center">
                   <History className="w-16 h-16 text-gray-100 mb-4" />
                   <h3 className="text-xl font-bold text-gray-900">No logs available</h3>
                   <p className="text-sm text-gray-400 mt-1">Attendance history will appear here once you save a register.</p>
                </div>
              )}
           </div>
        </div>
      )}

      {/* SMS Dispatch Overlay */}
      {isDispatching && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md p-10 rounded-[3rem] shadow-2xl text-center space-y-6">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-25"></div>
              <div className="relative w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center shadow-xl shadow-blue-200">
                <MessageSquare className="w-10 h-10 text-white animate-pulse" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-gray-900">Dispatching Alerts</h3>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Parent SMS Notification System</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-4">
              <div className="flex items-center justify-between text-xs font-black text-gray-500 uppercase">
                <span>Sending {dispatchProgress.current} of {dispatchProgress.total}</span>
                <span className="text-blue-600">{Math.round((dispatchProgress.current / dispatchProgress.total) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 h-full transition-all duration-500" 
                  style={{ width: `${(dispatchProgress.current / dispatchProgress.total) * 100}%` }}
                />
              </div>
              <div className="flex items-center gap-3 justify-center text-sm font-bold text-gray-700">
                <Send className="w-4 h-4 text-blue-500" />
                <span>SMS for {dispatchProgress.currentName}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-[10px] font-black text-green-600 uppercase tracking-tighter">
              <ShieldCheck className="w-4 h-4" />
              Secure Encrypted Channel Active
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManager;
