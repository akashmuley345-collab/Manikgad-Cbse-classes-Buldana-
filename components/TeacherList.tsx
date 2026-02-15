
import React, { useState } from 'react';
import { UserCog, Mail, Calendar, MoreVertical, Plus, X, ShieldCheck, Lock, Copy, CheckCircle2, AlertCircle } from 'lucide-react';
import { Teacher, User } from '../types';
import { storageService } from '../services/storageService';
import { authService } from '../services/authService';

interface TeacherListProps {
  teachers: Teacher[];
  user: User;
  onUpdate: () => void;
}

const TeacherList: React.FC<TeacherListProps> = ({ teachers, user, onUpdate }) => {
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [formData, setFormData] = useState({ name: '', subject: '', email: '' });
  const [generatedUser, setGeneratedUser] = useState<User | null>(null);
  const [copied, setCopied] = useState(false);

  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let password = "";
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `T${Math.floor(100 + Math.random() * 900)}`;
    const newTeacher: Teacher = {
      id: newId,
      name: formData.name,
      subject: formData.subject,
      email: formData.email,
      joinDate: new Date().toISOString().split('T')[0]
    };

    const password = generatePassword();
    const registeredUser = authService.registerTeacher(newTeacher, password);
    
    storageService.saveTeacher(newTeacher);
    setGeneratedUser(registeredUser);
    setStep('success');
    onUpdate();
  };

  const copyToClipboard = () => {
    if (!generatedUser) return;
    const text = `Manikgad CBSE Portal\nRole: Teacher\nName: ${generatedUser.name}\nUsername: ${generatedUser.username}\nPassword: ${generatedUser.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Faculty Directory</h2>
          <p className="text-sm text-gray-500 font-medium">Manage educators and staff credentials.</p>
        </div>
        {user.role === 'owner' && (
          <button 
            onClick={() => { setStep('form'); setShowModal(true); }}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Register New Faculty
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map((teacher) => (
          <div key={teacher.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-black text-xl">
                  {teacher.name[0]}
                </div>
                <div>
                  <h3 className="font-black text-gray-900 leading-tight">{teacher.name}</h3>
                  <p className="text-xs text-blue-600 font-black uppercase tracking-widest mt-0.5">{teacher.subject}</p>
                </div>
              </div>
              <button className="p-2 text-gray-300 hover:bg-gray-50 rounded-xl transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-xs font-bold text-gray-500 bg-gray-50 p-3 rounded-2xl border border-gray-100/50">
                <Mail className="w-4 h-4 text-blue-400" />
                <span className="truncate">{teacher.email}</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-gray-500 bg-gray-50 p-3 rounded-2xl border border-gray-100/50">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>Faculty Joined: {teacher.joinDate}</span>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-50 flex gap-2">
              <button className="flex-1 text-[10px] font-black uppercase tracking-widest py-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors">
                View Profile
              </button>
              <button className="flex-1 text-[10px] font-black uppercase tracking-widest py-3 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors">
                Assigned Std.
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            {step === 'form' ? (
              <div className="p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100">
                      <UserCog className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-gray-900">Register Teacher</h3>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Credentials will be generated</p>
                    </div>
                  </div>
                  <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X className="w-6 h-6 text-gray-300" />
                  </button>
                </div>

                <form onSubmit={handleRegister} className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input 
                      required
                      type="text"
                      placeholder="e.g. Dr. Sarah Wilson"
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none transition-all font-bold text-gray-900"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Primary Subject</label>
                    <select 
                      required
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none transition-all font-bold text-gray-700"
                      value={formData.subject}
                      onChange={e => setFormData({...formData, subject: e.target.value})}
                    >
                      <option value="">Choose Subject...</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Science">Science</option>
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Social Studies">Social Studies</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Work Email</label>
                    <input 
                      required
                      type="email"
                      placeholder="teacher@school.edu"
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none transition-all font-bold text-gray-900"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>

                  <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[10px] font-bold text-amber-800 leading-relaxed uppercase">
                      The system will automatically generate a secure login ID and password for this teacher upon submission.
                    </p>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                  >
                    Confirm Registration
                  </button>
                </form>
              </div>
            ) : (
              <div className="p-10 text-center">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-100 animate-in zoom-in duration-500">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-2">Registration Complete!</h3>
                <p className="text-gray-500 font-medium mb-8 px-8">Credentials have been generated. Share these details securely with the faculty member.</p>
                
                <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 space-y-4 mb-8 text-left relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <ShieldCheck className="w-16 h-16" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Portal Username</p>
                    <p className="text-xl font-black text-blue-600">{generatedUser?.username}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Initial Password</p>
                    <div className="flex items-center gap-2">
                       <Lock className="w-4 h-4 text-gray-300" />
                       <p className="text-xl font-black text-gray-900">{generatedUser?.password}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    onClick={copyToClipboard}
                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-black transition-all"
                  >
                    {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    {copied ? 'Copied to Clipboard' : 'Copy All Credentials'}
                  </button>
                  <button 
                    onClick={() => setShowModal(false)}
                    className="w-full py-3 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherList;
