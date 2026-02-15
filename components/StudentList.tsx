
import React, { useState } from 'react';
import { 
  Search, UserPlus, MoreVertical, Eye, FileEdit, IndianRupee, X, 
  Receipt, Download, BookOpen, Phone, MessageCircle, Mail, MapPin, 
  Calendar, Award, User, Info, CheckCircle2, UserCheck, AlertCircle
} from 'lucide-react';
import { Student, FeeRecord } from '../types';

interface StudentListProps {
  students: Student[];
  fees: FeeRecord[];
  onUpdate: () => void;
}

const StudentList: React.FC<StudentListProps> = ({ students, fees, onUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentProfile, setSelectedStudentProfile] = useState<Student | null>(null);

  const filteredStudents = students.filter(s => 
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.id.includes(searchTerm)
  );

  const getStudentFeesTotalPaid = (studentId: string) => {
    return fees
      .filter(f => f.studentId === studentId)
      .reduce((acc, f) => acc + f.amount, 0);
  };

  const getStudentFeeRecords = (studentId: string) => {
    return fees.filter(f => f.studentId === studentId).sort((a, b) => 
      new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name or ID..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
          <UserPlus className="w-5 h-5" />
          Add Student
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Grade</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Courses</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Fees Paid</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">GPA</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.map((student) => {
                const totalPaid = getStudentFeesTotalPaid(student.id);
                return (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div 
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => setSelectedStudentProfile(student)}
                      >
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-indigo-50 flex-shrink-0 border border-gray-100 group-hover:ring-2 group-hover:ring-blue-500/30 transition-all">
                          {student.photoUrl ? (
                            <img src={student.photoUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-indigo-700 font-bold text-sm">
                              {student.firstName[0]}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 leading-none mb-1 group-hover:text-blue-600 transition-colors">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">#{student.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">{student.grade}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {student.enrolledCourses?.map((course) => (
                          <span key={course} className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold border border-blue-100">
                            {course}
                          </span>
                        )) || <span className="text-gray-400 text-[10px]">None</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-green-600">₹{totalPaid.toLocaleString()}</span>
                        {totalPaid >= student.totalFees && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-md font-bold uppercase">PAID</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-indigo-600">{student.gpa.toFixed(1)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        student.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => setSelectedStudentProfile(student)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                          title="View Full Profile & Fees"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                          <FileEdit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full Student Profile & Fee Ledger Modal */}
      {selectedStudentProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-[#F8F9FD] w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 my-8">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-3xl bg-white/20 p-1 backdrop-blur-md shadow-xl">
                    {selectedStudentProfile.photoUrl ? (
                      <img src={selectedStudentProfile.photoUrl} alt="" className="w-full h-full object-cover rounded-[1.25rem]" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-white text-blue-600 text-3xl font-black rounded-[1.25rem]">
                        {selectedStudentProfile.firstName[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-3xl font-black">{selectedStudentProfile.firstName} {selectedStudentProfile.lastName}</h3>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        selectedStudentProfile.status === 'active' ? 'bg-green-400/20 text-green-300' : 'bg-white/20 text-white'
                      } border border-white/10 backdrop-blur-md`}>
                        {selectedStudentProfile.status}
                      </span>
                    </div>
                    <p className="text-blue-100 flex items-center gap-2 mt-1 font-medium">
                      <User className="w-4 h-4 opacity-70" /> Student ID: #{selectedStudentProfile.id} • Std {selectedStudentProfile.grade}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedStudentProfile(null)}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/5"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Information Cards */}
              <div className="lg:col-span-1 space-y-6">
                {/* Financial Summary Card (New Feature) */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <IndianRupee className="w-3.5 h-3.5 text-blue-600" /> Fee Summary
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl border border-gray-100">
                      <span className="text-xs font-bold text-gray-500">Total Assigned</span>
                      <span className="text-sm font-black text-gray-900">₹{selectedStudentProfile.totalFees.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-2xl border border-green-100">
                      <span className="text-xs font-bold text-green-600">Total Paid</span>
                      <span className="text-sm font-black text-green-700">₹{getStudentFeesTotalPaid(selectedStudentProfile.id).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-2xl border border-red-100">
                      <span className="text-xs font-bold text-red-600">Balance Pending</span>
                      <span className="text-sm font-black text-red-700">₹{(selectedStudentProfile.totalFees - getStudentFeesTotalPaid(selectedStudentProfile.id)).toLocaleString()}</span>
                    </div>
                  </div>
                  {(selectedStudentProfile.totalFees - getStudentFeesTotalPaid(selectedStudentProfile.id)) > 0 && (
                    <div className="mt-4 p-3 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <p className="text-[10px] font-bold text-amber-800 uppercase tracking-tighter">Please clear outstanding dues at the earliest.</p>
                    </div>
                  )}
                </div>

                {/* Contact Info Card */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-blue-500" /> Personal Details
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><Mail className="w-4 h-4" /></div>
                      <div className="overflow-hidden">
                        <p className="text-[10px] font-bold text-gray-400 uppercase leading-none">Email Address</p>
                        <p className="text-sm font-bold text-gray-900 truncate">{selectedStudentProfile.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-50 rounded-xl text-green-600"><Phone className="w-4 h-4" /></div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase leading-none">Parent Mobile</p>
                        <p className="text-sm font-bold text-gray-900">{selectedStudentProfile.parentMobile || 'Not Provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600"><MessageCircle className="w-4 h-4" /></div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase leading-none">WhatsApp No.</p>
                        <p className="text-sm font-bold text-gray-900">{selectedStudentProfile.whatsappNo || 'Not Provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-red-50 rounded-xl text-red-600 mt-1"><MapPin className="w-4 h-4" /></div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase leading-none">Residence</p>
                        <p className="text-sm font-bold text-gray-900 leading-relaxed">{selectedStudentProfile.address || 'Address not listed'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Academic Standing Card */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-indigo-500" /> Academic Standing
                  </h4>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-indigo-50 p-4 rounded-2xl text-center">
                      <p className="text-[10px] font-bold text-indigo-400 uppercase mb-1">Current GPA</p>
                      <p className="text-2xl font-black text-indigo-700">{selectedStudentProfile.gpa.toFixed(1)}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-2xl text-center">
                      <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">Attendance</p>
                      <p className="text-2xl font-black text-blue-700">{selectedStudentProfile.attendance}%</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-3 px-1">Enrolled Courses</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedStudentProfile.enrolledCourses?.map(course => (
                        <div key={course} className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl">
                          <BookOpen className="w-3 h-3 text-blue-600" />
                          <span className="text-xs font-bold text-gray-700">{course}</span>
                        </div>
                      )) || <p className="text-xs text-gray-400 italic">No courses enrolled yet.</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Fee Ledger */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col h-full">
                  <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-black text-gray-900">Fee Ledger</h4>
                      <p className="text-xs text-gray-400 font-medium">History of all financial transactions</p>
                    </div>
                    <div className="bg-green-50 px-4 py-2 rounded-2xl border border-green-100 text-right">
                      <p className="text-[10px] font-bold text-green-400 uppercase">Total Collected</p>
                      <p className="text-xl font-black text-green-700">₹{getStudentFeesTotalPaid(selectedStudentProfile.id).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex-1 overflow-hidden">
                    <div className="overflow-x-auto h-full max-h-[500px] custom-scrollbar">
                      {getStudentFeeRecords(selectedStudentProfile.id).length > 0 ? (
                        <table className="w-full text-left">
                          <thead className="sticky top-0 bg-gray-50/80 backdrop-blur-md z-10">
                            <tr>
                              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Receipt</th>
                              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Staff</th>
                              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {getStudentFeeRecords(selectedStudentProfile.id).map((record) => (
                              <tr key={record.id} className="hover:bg-blue-50/30 transition-colors">
                                <td className="px-6 py-4 text-sm font-medium text-gray-500">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 text-gray-300" />
                                    {record.paymentDate}
                                  </div>
                                </td>
                                <td className="px-6 py-4 font-mono text-xs font-bold text-blue-600">{record.receiptNo}</td>
                                <td className="px-6 py-4">
                                  <span className="text-[10px] font-black bg-gray-100 text-gray-600 px-2 py-1 rounded-lg border border-gray-200 uppercase">
                                    {record.feeType}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                                    <span className="text-xs font-bold text-gray-700">{record.collectedBy}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <p className="text-sm font-black text-gray-900">₹{record.amount.toLocaleString()}</p>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Receipt className="w-10 h-10 text-gray-200" />
                          </div>
                          <h5 className="text-gray-900 font-bold">No Records Found</h5>
                          <p className="text-sm text-gray-400 max-w-xs mx-auto mt-1">This student has no registered fee payments in the current ledger.</p>
                          <button className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-200">
                            Create First Receipt
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                    <button className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                      <Download className="w-4 h-4" /> Download Full Transcript
                    </button>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setSelectedStudentProfile(null)}
                        className="px-6 py-2 text-xs font-bold text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        Close Profile
                      </button>
                      <button className="px-6 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Save Adjustments
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentList;
