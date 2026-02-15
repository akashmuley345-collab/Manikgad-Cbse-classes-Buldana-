
import React, { useState, useMemo } from 'react';
import { GraduationCap, Award, BookOpen, Plus, X, Save, Search, User as UserIcon, Calendar, CheckCircle2, ChevronRight, ListOrdered } from 'lucide-react';
import { GradeRecord, Student, User } from '../types';
import { storageService } from '../services/storageService';

interface GradebookProps {
  grades: GradeRecord[];
  students: Student[];
  user: User;
  onUpdate: () => void;
}

const Gradebook: React.FC<GradebookProps> = ({ grades, students, user, onUpdate }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalStep, setModalStep] = useState(1); // 1: Test Details, 2: Marks Entry
  
  const [testDetails, setTestDetails] = useState({
    testName: '',
    subject: '',
    date: new Date().toISOString().split('T')[0],
    maxScore: '100',
    targetGrade: 'All'
  });

  const [batchScores, setBatchScores] = useState<Record<string, { score: string, feedback: string }>>({});

  const isTeacherOrOwner = user.role === 'teacher' || user.role === 'owner';

  const filteredGrades = useMemo(() => {
    if (user.role === 'student') {
      return grades.filter(g => g.studentId === user.linkedId);
    }
    return grades;
  }, [grades, user]);

  const filteredStudentsForBatch = useMemo(() => {
    return students.filter(s => 
      testDetails.targetGrade === 'All' || s.grade === testDetails.targetGrade
    );
  }, [students, testDetails.targetGrade]);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testDetails.testName || !testDetails.subject) return;
    setModalStep(2);
    
    // Initialize batch scores for filtered students if not already set
    const initialScores: Record<string, { score: string, feedback: string }> = {};
    filteredStudentsForBatch.forEach(s => {
      initialScores[s.id] = { score: '', feedback: '' };
    });
    setBatchScores(initialScores);
  };

  const handleSaveBatch = () => {
    const recordsToSave: GradeRecord[] = [];
    
    filteredStudentsForBatch.forEach(s => {
      const data = batchScores[s.id];
      if (data && data.score !== '') {
        recordsToSave.push({
          id: Math.random().toString(36).substr(2, 9),
          studentId: s.id,
          subject: testDetails.subject,
          testName: testDetails.testName,
          score: parseFloat(data.score),
          maxScore: parseFloat(testDetails.maxScore),
          date: testDetails.date,
          feedback: data.feedback
        });
      }
    });

    if (recordsToSave.length === 0) {
      alert("Please enter at least one student's marks.");
      return;
    }

    recordsToSave.forEach(record => storageService.addGrade(record));
    onUpdate();
    setShowAddModal(false);
    resetForm();
    alert(`Successfully saved ${recordsToSave.length} records for "${testDetails.testName}"`);
  };

  const resetForm = () => {
    setModalStep(1);
    setTestDetails({
      testName: '',
      subject: '',
      date: new Date().toISOString().split('T')[0],
      maxScore: '100',
      targetGrade: 'All'
    });
    setBatchScores({});
  };

  const subjects = ['Mathematics', 'Science', 'English', 'Social Studies', 'Hindi', 'Marathi'];
  const gradesList = ['All', '5th', '6th', '7th', '8th', '9th', '10th'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            {user.role === 'student' ? 'My Academic Performance' : 'Academic Gradebook'}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {user.role === 'student' ? 'View your test results and progress reports.' : 'Batch upload test marks for students by standard.'}
          </p>
        </div>
        {isTeacherOrOwner && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Batch Add Marks
          </button>
        )}
      </div>

      {/* Detailed Records Table */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <h3 className="font-black text-gray-900 text-lg">Result Ledger</h3>
          <div className="bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Displaying {filteredGrades.length} Records</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white border-b border-gray-50">
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date & Subject</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Test Name</th>
                {isTeacherOrOwner && <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student</th>}
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Marks</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredGrades.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(grade => {
                const student = students.find(s => s.id === grade.studentId);
                const perc = (grade.score / grade.maxScore) * 100;
                return (
                  <tr key={grade.id} className="hover:bg-blue-50/10 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-gray-300" />
                        <div>
                          <p className="text-sm font-black text-gray-900 leading-none mb-1">{grade.subject}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">{grade.date}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-bold text-gray-700">{grade.testName || 'Regular Test'}</span>
                    </td>
                    {isTeacherOrOwner && (
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                           <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-600">
                             {student?.firstName[0]}
                           </div>
                           <span className="text-xs font-bold text-gray-700">{student?.firstName} {student?.lastName}</span>
                        </div>
                      </td>
                    )}
                    <td className="px-8 py-5 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="text-sm font-black text-gray-900">{grade.score} / {grade.maxScore}</span>
                        <span className="text-[10px] font-bold text-blue-500 uppercase">{perc.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        perc >= 80 ? 'bg-green-100 text-green-700' : perc >= 40 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {perc >= 40 ? 'Satisfactory' : 'Needs Work'}
                      </span>
                    </td>
                    <td className="px-8 py-5 max-w-xs">
                       <p className="text-xs text-gray-500 font-medium italic line-clamp-2">
                         {grade.feedback || '---'}
                       </p>
                    </td>
                  </tr>
                );
              })}
              {filteredGrades.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-gray-400 font-bold">
                    No academic records available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Batch Marks Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-8 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                  <ListOrdered className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900">
                    {modalStep === 1 ? 'Step 1: Test Details' : 'Step 2: Marks Entry'}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`w-2 h-2 rounded-full ${modalStep === 1 ? 'bg-blue-600' : 'bg-gray-200'}`}></span>
                    <span className={`w-2 h-2 rounded-full ${modalStep === 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></span>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {modalStep === 1 ? 'Define assessment' : 'Evaluate students'}
                    </p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => { setShowAddModal(false); resetForm(); }}
                className="p-3 hover:bg-gray-100 rounded-2xl transition-all"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
              {modalStep === 1 ? (
                <form onSubmit={handleNextStep} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Test Name / Title</label>
                      <input 
                        required
                        type="text"
                        value={testDetails.testName}
                        onChange={e => setTestDetails({...testDetails, testName: e.target.value})}
                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none transition-all font-bold text-gray-900"
                        placeholder="e.g. Unit Test 1, Chapter Assessment..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Standard / Grade</label>
                      <select 
                        required
                        value={testDetails.targetGrade}
                        onChange={e => setTestDetails({...testDetails, targetGrade: e.target.value})}
                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none transition-all font-bold text-gray-700"
                      >
                        {gradesList.map(g => (
                          <option key={g} value={g}>{g === 'All' ? 'All Classes' : `${g} Standard`}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Subject</label>
                      <select 
                        required
                        value={testDetails.subject}
                        onChange={e => setTestDetails({...testDetails, subject: e.target.value})}
                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none transition-all font-bold text-gray-700"
                      >
                        <option value="">Select Subject...</option>
                        {subjects.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Date Conducted</label>
                      <input 
                        required
                        type="date"
                        value={testDetails.date}
                        onChange={e => setTestDetails({...testDetails, date: e.target.value})}
                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none transition-all font-bold text-gray-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Maximum Marks</label>
                      <input 
                        required
                        type="number"
                        value={testDetails.maxScore}
                        onChange={e => setTestDetails({...testDetails, maxScore: e.target.value})}
                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none transition-all font-bold text-gray-900"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <button 
                      type="submit"
                      className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group"
                    >
                      Proceed to Marking
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex items-center justify-between">
                     <div>
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">Marking Register for</p>
                        <h4 className="text-xl font-black text-blue-900">{testDetails.testName} - {testDetails.subject}</h4>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">Max Score</p>
                        <p className="text-xl font-black text-blue-900">{testDetails.maxScore}</p>
                     </div>
                  </div>

                  <div className="space-y-3">
                    {filteredStudentsForBatch.map(s => (
                      <div key={s.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col md:flex-row items-center gap-4 group hover:bg-white hover:shadow-md transition-all">
                        <div className="flex items-center gap-4 flex-1 w-full">
                           <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-black text-sm">
                             {s.firstName[0]}
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className="text-sm font-black text-gray-900 truncate">{s.firstName} {s.lastName}</p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase">Std {s.grade} • #{s.id}</p>
                           </div>
                        </div>
                        
                        <div className="flex items-center gap-4 w-full md:w-auto">
                           <div className="w-32 shrink-0">
                             <input 
                               type="number"
                               placeholder="Marks"
                               className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none font-black text-center text-gray-900"
                               value={batchScores[s.id]?.score || ''}
                               onChange={e => setBatchScores({
                                 ...batchScores,
                                 [s.id]: { ...batchScores[s.id], score: e.target.value }
                               })}
                             />
                           </div>
                           <div className="flex-1">
                             <input 
                               type="text"
                               placeholder="Optional remark..."
                               className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-xs font-medium text-gray-700"
                               value={batchScores[s.id]?.feedback || ''}
                               onChange={e => setBatchScores({
                                 ...batchScores,
                                 [s.id]: { ...batchScores[s.id], feedback: e.target.value }
                               })}
                             />
                           </div>
                        </div>
                      </div>
                    ))}
                    {filteredStudentsForBatch.length === 0 && (
                      <div className="py-12 text-center text-gray-400 font-bold">No students found in the selected standard.</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer (Batch entry step only) */}
            {modalStep === 2 && (
              <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex gap-4 shrink-0">
                <button 
                  onClick={() => setModalStep(1)}
                  className="px-8 py-4 bg-white border border-gray-200 text-gray-500 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-50 transition-all"
                >
                  Back
                </button>
                <button 
                  onClick={handleSaveBatch}
                  className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-green-500/20 hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-6 h-6" />
                  Save Marks & Complete
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
};

export default Gradebook;
