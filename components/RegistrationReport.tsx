
import React, { useState, useMemo } from 'react';
import { ClipboardList, Search, UserCheck, UserMinus, Calendar, ExternalLink } from 'lucide-react';
import { Student } from '../types';

interface RegistrationReportProps {
  students: Student[];
}

const RegistrationReport: React.FC<RegistrationReportProps> = ({ students }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'registered' | 'pending'>('all');

  const stats = useMemo(() => ({
    total: students.length,
    registered: students.filter(s => s.isRegistered).length,
    pending: students.filter(s => !s.isRegistered).length,
    percent: (students.filter(s => s.isRegistered).length / students.length) * 100
  }), [students]);

  const filteredStudents = students.filter(s => {
    const matchesSearch = `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.includes(searchTerm);
    const matchesFilter = filter === 'all' || (filter === 'registered' ? s.isRegistered : !s.isRegistered);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Enrollment</p>
          <p className="text-3xl font-black text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-green-50 p-6 rounded-3xl border border-green-100 shadow-sm">
          <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-1">Registered Accounts</p>
          <p className="text-3xl font-black text-green-700">{stats.registered}</p>
        </div>
        <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 shadow-sm">
          <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Pending Setup</p>
          <p className="text-3xl font-black text-amber-700">{stats.pending}</p>
        </div>
        <div className="bg-blue-600 p-6 rounded-3xl shadow-lg shadow-blue-500/20 text-white">
          <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest mb-1">System Adoption</p>
          <p className="text-3xl font-black">{stats.percent.toFixed(0)}%</p>
          <div className="w-full bg-white/20 h-1 rounded-full mt-2 overflow-hidden">
            <div className="bg-white h-full" style={{ width: `${stats.percent}%` }} />
          </div>
        </div>
      </div>

      {/* Main Report Table */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-gray-50 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gray-50/30">
          <div>
            <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
              <ClipboardList className="w-6 h-6 text-blue-600" />
              Portal Access Report
            </h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Real-time Registration Status</p>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Filter by name or ID..."
                  className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm w-full md:w-64 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
             </div>
             <div className="flex bg-white p-1 rounded-full border border-gray-200 shadow-sm">
                {(['all', 'registered', 'pending'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${
                      filter === f ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {f}
                  </button>
                ))}
             </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50 bg-white">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">ID</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Standard</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Reg. Date</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredStudents.map(student => (
                <tr key={student.id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center font-black text-gray-400">
                        {student.photoUrl ? <img src={student.photoUrl} className="w-full h-full object-cover" /> : student.firstName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900 leading-none mb-1">{student.firstName} {student.lastName}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-xs font-bold text-gray-500">#{student.id}</td>
                  <td className="px-8 py-5 text-center">
                    <span className="px-2.5 py-1 bg-gray-100 rounded-lg text-[10px] font-black text-gray-600 uppercase border border-gray-200">
                      {student.grade}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    {student.isRegistered ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full border border-green-200">
                        <UserCheck className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase">Registered</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full border border-amber-200">
                        <UserMinus className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase">Pending</span>
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                      <Calendar className="w-3.5 h-3.5 opacity-50" />
                      {student.registrationDate || '---'}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <p className="text-gray-400 font-bold">No students found matching your criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RegistrationReport;
