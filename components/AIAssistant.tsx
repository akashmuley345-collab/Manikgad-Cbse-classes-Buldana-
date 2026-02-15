
import React, { useState } from 'react';
import { Sparkles, Send, BrainCircuit, BookOpen, UserCheck, Loader2 } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { Student, GradeRecord } from '../types';

interface AIAssistantProps {
  students: Student[];
  grades: GradeRecord[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({ students, grades }) => {
  const [activeTab, setActiveTab] = useState<'analysis' | 'lesson-plan'>('analysis');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePerformanceAnalysis = async () => {
    const student = students.find(s => s.id === selectedStudentId);
    if (!student) return;

    setLoading(true);
    setResult(null);
    const studentGrades = grades.filter(g => g.studentId === student.id);
    const analysis = await geminiService.analyzeStudentPerformance(student, studentGrades);
    setResult(analysis);
    setLoading(false);
  };

  const handleGenerateLessonPlan = async () => {
    if (!subject || !topic || !gradeLevel) return;
    setLoading(true);
    setResult(null);
    const plan = await geminiService.generateLessonPlan(subject, topic, gradeLevel);
    setResult(plan);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-yellow-300" />
            AI Education Assistant
          </h2>
          <p className="text-blue-100 max-w-lg">
            Leverage advanced AI to generate personalized student reports and creative lesson plans in seconds.
          </p>
        </div>
        <BrainCircuit className="absolute -right-12 -top-12 w-64 h-64 text-white/5 pointer-events-none" />
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => { setActiveTab('analysis'); setResult(null); }}
            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'analysis' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Performance Insight
          </button>
          <button
            onClick={() => { setActiveTab('lesson-plan'); setResult(null); }}
            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'lesson-plan' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Lesson Generator
          </button>
        </div>

        <div className="p-8">
          {activeTab === 'analysis' ? (
            <div className="space-y-6">
              <div className="max-w-md">
                <label className="block text-sm font-bold text-gray-700 mb-2">Select Student for Analysis</label>
                <select 
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none bg-gray-50"
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                >
                  <option value="">Choose a student...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.firstName} {s.lastName} (Grade {s.grade})</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handlePerformanceAnalysis}
                disabled={!selectedStudentId || loading}
                className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-200"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                Run AI Performance Audit
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
                  <select
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none bg-gray-50"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  >
                    <option value="">Select Subject</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="English">English</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Topic</label>
                  <input
                    type="text"
                    placeholder="e.g. Algebra"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none bg-gray-50"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Grade Level</label>
                  <input
                    type="text"
                    placeholder="e.g. 8th Grade"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none bg-gray-50"
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                  />
                </div>
              </div>
              <button
                onClick={handleGenerateLessonPlan}
                disabled={!subject || !topic || !gradeLevel || loading}
                className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-200"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                Generate Smart Lesson Plan
              </button>
            </div>
          )}

          {result && (
            <div className="mt-8 p-8 bg-gray-50 rounded-2xl border border-gray-100 animate-in fade-in zoom-in duration-300">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-indigo-600" />
                  AI Result
                </h4>
                <button 
                  onClick={() => {
                    const blob = new Blob([result], { type: 'text/plain' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'edu-sync-ai-output.txt';
                    a.click();
                  }}
                  className="text-xs font-bold text-indigo-600 hover:underline"
                >
                  Download TXT
                </button>
              </div>
              <div className="prose prose-blue max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                {result}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
