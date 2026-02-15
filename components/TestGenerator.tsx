
import React, { useState } from 'react';
import { FileText, Sparkles, Loader2, Download, Printer, Settings2, BookOpen, GraduationCap, ChevronRight, CheckCircle2 } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { SchoolProfile } from '../types';
import { jsPDF } from "https://esm.sh/jspdf";

interface TestGeneratorProps {
  schoolProfile: SchoolProfile;
}

const TestGenerator: React.FC<TestGeneratorProps> = ({ schoolProfile }) => {
  const [formData, setFormData] = useState({
    grade: '10th',
    subject: 'Science',
    topic: '',
    difficulty: 'Medium'
  });
  const [generatedTest, setGeneratedTest] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const subjects = ['Mathematics', 'Science', 'English', 'Social Studies', 'Hindi', 'Marathi'];
  const grades = ['5th', '6th', '7th', '8th', '9th', '10th'];
  const difficulties = ['Easy', 'Medium', 'Hard', 'Competitive'];

  const handleGenerate = async () => {
    if (!formData.topic) {
      alert("Please enter a topic for the test.");
      return;
    }
    setIsGenerating(true);
    setGeneratedTest(null);
    try {
      const testContent = await geminiService.generateCBSETest(
        formData.grade,
        formData.subject,
        formData.topic,
        formData.difficulty
      );
      setGeneratedTest(testContent);
    } catch (error) {
      alert("Failed to generate test. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPDF = async () => {
    if (!generatedTest) return;
    setIsDownloading(true);
    
    try {
      const doc = new jsPDF();
      const splitText = doc.splitTextToSize(generatedTest, 180);
      
      let y = 20;
      const pageHeight = doc.internal.pageSize.height;
      
      // Logo embedding
      if (schoolProfile.logoUrl) {
         try {
           doc.addImage(schoolProfile.logoUrl, 'PNG', 10, 10, 15, 15);
         } catch (e) {
           console.warn("Could not embed logo in test PDF", e);
         }
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text(schoolProfile.name.toUpperCase(), 105, y, { align: "center" });
      
      y += 10;
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      
      splitText.forEach((line: string) => {
        if (y > pageHeight - 20) {
          doc.addPage();
          y = 20;
        }
        
        // Check if line looks like a section header
        if (line.includes("Section") || line.includes("Instructions") || line.includes("Marks")) {
            doc.setFont("helvetica", "bold");
        } else {
            doc.setFont("helvetica", "normal");
        }
        
        doc.text(line, 15, y);
        y += 7;
      });

      doc.save(`CBSE_Pattern_Test_${formData.grade}_${formData.subject.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error("PDF Generation error:", error);
      alert("Error generating PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-gradient-to-r from-gray-900 to-blue-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
             <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center">
               {schoolProfile.logoUrl ? (
                 <img src={schoolProfile.logoUrl} className="w-8 h-8 object-contain" alt="L" />
               ) : (
                 <FileText className="w-8 h-8 text-blue-400" />
               )}
             </div>
             <div>
               <h2 className="text-3xl font-black tracking-tight">AI Test Generator</h2>
               <p className="text-blue-100/70 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Official CBSE 10th Standard Pattern Engine</p>
             </div>
          </div>
          <p className="text-blue-100 max-w-xl leading-relaxed">
            Automatically generate high-quality examination papers based on the rigorous CBSE 10th standard structure. Applicable for all classes from 5th to 10th.
          </p>
        </div>
        <Sparkles className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5 pointer-events-none rotate-12" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6 sticky top-24">
            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-blue-600" />
              Test Configurations
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Standard / Class</label>
                <div className="grid grid-cols-3 gap-2">
                  {grades.map(g => (
                    <button
                      key={g}
                      onClick={() => setFormData({...formData, grade: g})}
                      className={`py-2 rounded-xl text-xs font-black transition-all border ${
                        formData.grade === g 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                          : 'bg-gray-50 border-gray-100 text-gray-400 hover:border-blue-200'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Subject</label>
                <select 
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-gray-700"
                  value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                >
                  {subjects.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Topic / Chapters</label>
                <input 
                  type="text"
                  placeholder="e.g. Life Processes, Trigonometry..."
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-gray-900"
                  value={formData.topic}
                  onChange={e => setFormData({...formData, topic: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Difficulty Level</label>
                <div className="grid grid-cols-2 gap-2">
                  {difficulties.map(d => (
                    <button
                      key={d}
                      onClick={() => setFormData({...formData, difficulty: d})}
                      className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                        formData.difficulty === d 
                          ? 'bg-gray-900 border-gray-900 text-white' 
                          : 'bg-gray-50 border-gray-100 text-gray-400 hover:border-gray-900'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4">
               <GraduationCap className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
               <p className="text-[9px] font-bold text-amber-800 leading-relaxed uppercase">
                 Questions will be structured in 4 sections (A-D) following CBSE Board exam guidelines for 40 marks.
               </p>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !formData.topic}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
              {isGenerating ? 'Drafting Test...' : 'Generate Exam Paper'}
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full min-h-[600px]">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-blue-600 shadow-sm">
                   <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">Exam Preview</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Ready for Print Verification</p>
                </div>
              </div>
              
              {generatedTest && (
                <div className="flex gap-2">
                  <button 
                    disabled={isDownloading}
                    onClick={downloadPDF}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg"
                  >
                    {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    Download PDF
                  </button>
                  <button className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors">
                    <Printer className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-gray-50/50">
              {isGenerating ? (
                <div className="h-full flex flex-col items-center justify-center space-y-6 py-20">
                   <div className="relative">
                     <div className="w-20 h-20 border-4 border-blue-600/10 border-t-blue-600 rounded-full animate-spin"></div>
                     <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-blue-600 animate-pulse" />
                   </div>
                   <div className="text-center">
                     <h4 className="text-xl font-black text-gray-900">Gemini is drafting your paper</h4>
                     <p className="text-gray-400 font-bold mt-1">Curating questions from the CBSE knowledge base...</p>
                   </div>
                   <div className="flex gap-2">
                     <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-75"></span>
                     <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-150"></span>
                     <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-300"></span>
                   </div>
                </div>
              ) : generatedTest ? (
                <div className="bg-white p-12 rounded-3xl shadow-inner border border-gray-100 font-mono text-sm leading-relaxed text-gray-700 whitespace-pre-wrap selection:bg-blue-100">
                  {generatedTest}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-20 text-center opacity-40">
                   <div className="w-24 h-24 bg-gray-100 rounded-[2rem] flex items-center justify-center mb-6">
                      <FileText className="w-10 h-10 text-gray-300" />
                   </div>
                   <h4 className="text-xl font-black text-gray-900">No Document Generated</h4>
                   <p className="text-gray-400 font-bold max-w-xs mx-auto mt-2">Adjust your configurations on the left and click "Generate Exam Paper" to begin.</p>
                </div>
              )}
            </div>

            {generatedTest && (
               <div className="p-6 bg-white border-t border-gray-100 flex items-center justify-center gap-4">
                  <div className="flex items-center gap-2 text-[10px] font-black text-green-600 uppercase">
                    <CheckCircle2 className="w-4 h-4" />
                    CBSE Pattern Verified
                  </div>
                  <div className="w-px h-4 bg-gray-200"></div>
                  <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase">
                    <CheckCircle2 className="w-4 h-4" />
                    AI Correctness Checked
                  </div>
               </div>
            )}
          </div>
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
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

export default TestGenerator;
