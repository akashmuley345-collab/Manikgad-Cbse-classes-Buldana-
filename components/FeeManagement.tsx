
import React, { useState, useEffect } from 'react';
import { IndianRupee, CreditCard, Calendar, User, Search, Plus, Filter, Receipt, CheckCircle2, FileText, Download, X, Printer, Loader2, UserCheck, Settings2, Save, GraduationCap, Info, BookOpen, Trash2 } from 'lucide-react';
import { Student, FeeRecord, User as UserType, Teacher, FeeStructure, SchoolProfile } from '../types';
import { storageService } from '../services/storageService';
import { jsPDF } from "https://esm.sh/jspdf";
import autoTable from "https://esm.sh/jspdf-autotable";

interface FeeManagementProps {
  students: Student[];
  fees: FeeRecord[];
  user: UserType;
  onUpdate: () => void;
  schoolProfile: SchoolProfile;
}

const FeeManagement: React.FC<FeeManagementProps> = ({ students, fees, user, onUpdate, schoolProfile }) => {
  const [activeTab, setActiveTab] = useState<'history' | 'structure'>('history');
  const [showForm, setShowForm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [reportGrade, setReportGrade] = useState('10th');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [feeStructure, setFeeStructure] = useState<FeeStructure[]>([]);
  
  const [formData, setFormData] = useState({
    studentId: '',
    amount: '',
    feeType: 'Tuition Fee' as FeeRecord['feeType'],
    paymentMethod: 'UPI' as FeeRecord['paymentMethod'],
    paymentDate: new Date().toISOString().split('T')[0],
    collectedBy: user.name
  });

  useEffect(() => {
    setTeachers(storageService.getTeachers());
    setFeeStructure(storageService.getFeeStructure());
  }, []);

  const totalCollected = fees.reduce((acc, f) => acc + f.amount, 0);
  const filteredFees = fees.filter(f => {
    const student = students.find(s => s.id === f.studentId);
    const studentName = student ? `${student.firstName} ${student.lastName}` : '';
    return studentName.toLowerCase().includes(searchTerm.toLowerCase()) || f.receiptNo.includes(searchTerm);
  });

  const generateIndividualReceipt = (student: Student, fee: FeeRecord) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a5'
    });

    // Design Elements
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, 148, 20, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("FEE RECEIPT", 74, 12, { align: "center" });

    doc.setTextColor(40, 40, 40);
    doc.setFontSize(16);
    doc.text(schoolProfile.name, 74, 32, { align: "center" });
    
    // Header Logo integration
    if (schoolProfile.logoUrl) {
       try {
         doc.addImage(schoolProfile.logoUrl, 'PNG', 10, 25, 12, 12);
       } catch (e) {
         console.warn("Could not embed logo in PDF", e);
       }
    }

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Contact: ${schoolProfile.contactNumbers.join(', ')}`, 74, 38, { align: "center" });

    // Receipt Metadata
    doc.setDrawColor(230, 230, 230);
    doc.line(10, 45, 138, 45);

    doc.setFontSize(9);
    doc.text(`Receipt No: ${fee.receiptNo}`, 15, 52);
    doc.text(`Date: ${fee.paymentDate}`, 133, 52, { align: "right" });

    // Table of Details
    autoTable(doc, {
      startY: 58,
      margin: { left: 10, right: 10 },
      body: [
        ['Student Name', `${student.firstName} ${student.lastName}`],
        ['Student ID', `#${student.id}`],
        ['Standard/Class', `${student.grade} Standard`],
        ['Fee Category', fee.feeType],
        ['Payment Mode', fee.paymentMethod],
        ['Total Amount', `Rs. ${fee.amount.toLocaleString()}/-`],
        ['Collected By', fee.collectedBy],
      ],
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 40 },
        1: { halign: 'right' }
      }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 100;

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Note: This is a computer-generated receipt and does not require a physical signature.", 15, finalY + 15);
    
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.5);
    doc.line(90, finalY + 35, 138, finalY + 35);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text("Authorized Signatory", 114, finalY + 40, { align: "center" });

    doc.save(`Receipt_${fee.receiptNo}_${student.firstName}.pdf`);
  };

  const handleCollectFee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId || !formData.amount) return;

    const student = students.find(s => s.id === formData.studentId);
    if (!student) return;

    const newRecord: FeeRecord = {
      id: Math.random().toString(36).substr(2, 9),
      studentId: formData.studentId,
      amount: parseFloat(formData.amount),
      paymentDate: formData.paymentDate,
      paymentMethod: formData.paymentMethod,
      feeType: formData.feeType,
      receiptNo: `RCP-${Math.floor(1000 + Math.random() * 9000)}`,
      collectedBy: formData.collectedBy || user.name
    };

    storageService.addFeeRecord(newRecord);
    
    // Auto-generate PDF for the new receipt
    generateIndividualReceipt(student, newRecord);
    
    onUpdate();
    setShowForm(false);
    setFormData({
      studentId: '',
      amount: '',
      feeType: 'Tuition Fee',
      paymentMethod: 'UPI',
      paymentDate: new Date().toISOString().split('T')[0],
      collectedBy: user.name
    });
  };

  const handleSaveFeeStructure = () => {
    storageService.saveFeeStructure(feeStructure);
    alert('Fee structure updated successfully!');
  };

  const updateBaseFee = (grade: string, baseAmount: number) => {
    setFeeStructure(prev => prev.map(f => f.grade === grade ? { ...f, baseAmount } : f));
  };

  const updateCourseFee = (grade: string, courseName: string, amount: number) => {
    setFeeStructure(prev => prev.map(f => {
      if (f.grade === grade) {
        return {
          ...f,
          courseFees: f.courseFees.map(cf => cf.name === courseName ? { ...cf, amount } : cf)
        };
      }
      return f;
    }));
  };

  const generateClassFeeReport = async () => {
    setIsGenerating(true);
    const classStudents = students.filter(s => s.grade === reportGrade);
    
    if (classStudents.length === 0) {
      alert(`No students found in ${reportGrade} Standard.`);
      setIsGenerating(false);
      return;
    }

    try {
      const doc = new jsPDF();
      const dateStr = new Date().toLocaleDateString();
      
      // Header Section
      doc.setFontSize(22);
      doc.setTextColor(40, 40, 40);
      doc.text(schoolProfile.name, 105, 15, { align: "center" });
      
      doc.setFontSize(14);
      doc.setTextColor(100, 100, 100);
      doc.text(`Fee Ledger Report: ${reportGrade} Standard`, 105, 25, { align: "center" });
      doc.text(`Generated on: ${dateStr}`, 105, 32, { align: "center" });

      const tableData = classStudents.map((s, index) => {
        const studentPaid = fees
          .filter(f => f.studentId === s.id)
          .reduce((acc, f) => acc + f.amount, 0);
        
        const remaining = s.totalFees - studentPaid;
        const courses = s.enrolledCourses?.join(', ') || 'General';

        return [
          index + 1,
          `${s.firstName} ${s.lastName}`,
          courses,
          `Rs. ${studentPaid.toLocaleString()}`,
          `Rs. ${remaining.toLocaleString()}`,
          s.parentMobile || 'N/A'
        ];
      });

      autoTable(doc, {
        head: [['#', 'Student Name', 'Courses', 'Paid Fees', 'Remaining', 'Mobile']],
        body: tableData,
        startY: 45,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 4 },
        columnStyles: {
          3: { fontStyle: 'bold', textColor: [22, 163, 74] },
          4: { fontStyle: 'bold', textColor: [220, 38, 38] }
        },
        margin: { top: 40 }
      });

      // Footer Summary
      const finalY = (doc as any).lastAutoTable.finalY || 50;
      const totalPaidClass = classStudents.reduce((acc, s) => {
        return acc + fees.filter(f => f.studentId === s.id).reduce((sum, f) => sum + f.amount, 0);
      }, 0);

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Class Total Collection: Rs. ${totalPaidClass.toLocaleString()}`, 14, finalY + 15);
      doc.text(`Authorized Signatory: _________________________`, 14, finalY + 25);

      doc.save(`Fee_Report_${reportGrade}_${dateStr.replace(/\//g, '-')}.pdf`);
      setShowReportModal(false);
    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert("Failed to generate PDF. Check console for details.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Navigation Tabs */}
      <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm w-fit">
        <button 
          onClick={() => setActiveTab('history')}
          className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Transaction History
        </button>
        <button 
          onClick={() => setActiveTab('structure')}
          className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'structure' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Global Fee Structure
        </button>
      </div>

      {activeTab === 'history' ? (
        <>
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 group hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-4 rounded-2xl text-green-600 shadow-sm group-hover:scale-105 transition-transform">
                  <IndianRupee className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Collected</p>
                  <p className="text-3xl font-black text-gray-900 leading-none">₹{totalCollected.toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 group hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-4 rounded-2xl text-blue-600 shadow-sm group-hover:scale-105 transition-transform">
                  <Receipt className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Active Receipts</p>
                  <p className="text-3xl font-black text-gray-900 leading-none">{fees.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-600 p-2 rounded-3xl shadow-lg shadow-blue-500/20 text-white flex gap-2">
              <button 
                onClick={() => setShowForm(!showForm)}
                className="flex-1 flex items-center justify-center gap-2 font-black uppercase text-xs tracking-widest bg-white/10 hover:bg-white/20 rounded-2xl transition-all h-full py-4"
              >
                <Plus className="w-5 h-5" />
                Collect
              </button>
              <button 
                onClick={() => setShowReportModal(true)}
                className="flex-1 flex items-center justify-center gap-2 font-black uppercase text-xs tracking-widest bg-white/20 hover:bg-white/30 rounded-2xl transition-all h-full py-4"
              >
                <FileText className="w-5 h-5" />
                Report
              </button>
            </div>
          </div>

          {showForm && (
            <div className="bg-white p-8 rounded-[2.5rem] border border-blue-100 shadow-xl animate-in zoom-in duration-300">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                  <CreditCard className="w-7 h-7 text-blue-600" />
                  Fee Collection Registry
                </h3>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                   <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              <form onSubmit={handleCollectFee} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Student Selection</label>
                  <select 
                    required
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-gray-900"
                    value={formData.studentId}
                    onChange={e => setFormData({...formData, studentId: e.target.value})}
                  >
                    <option value="">Choose Student...</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.firstName} {s.lastName} (Std {s.grade})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Amount (₹)</label>
                  <input 
                    required
                    type="number"
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-black text-gray-900"
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Fee Category</label>
                  <select 
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-gray-700"
                    value={formData.feeType}
                    onChange={e => setFormData({...formData, feeType: e.target.value as FeeRecord['feeType']})}
                  >
                    <option>Tuition Fee</option>
                    <option>Admission Fee</option>
                    <option>Exam Fee</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Payment Method</label>
                  <select 
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-gray-700"
                    value={formData.paymentMethod}
                    onChange={e => setFormData({...formData, paymentMethod: e.target.value as FeeRecord['paymentMethod']})}
                  >
                    <option>UPI</option>
                    <option>Cash</option>
                    <option>Bank Transfer</option>
                    <option>Cheque</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Receipt Date</label>
                  <input 
                    type="date"
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-gray-900"
                    value={formData.paymentDate}
                    onChange={e => setFormData({...formData, paymentDate: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Received By (Staff)</label>
                  <select 
                    required
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-gray-900"
                    value={formData.collectedBy}
                    onChange={e => setFormData({...formData, collectedBy: e.target.value})}
                  >
                    <option value="Super Admin">Super Admin</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end pt-1.5 lg:col-span-3">
                  <button 
                    type="submit"
                    className="w-full p-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Generate Receipt & Print
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Records Table */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-50/30">
              <div>
                <h3 className="text-xl font-black text-gray-900">Transaction History</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Audit Log of all collections</p>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search receipts or students..."
                  className="pl-12 pr-6 py-3 bg-white border border-gray-200 rounded-full text-sm w-full md:w-80 focus:ring-4 focus:ring-blue-500/10 outline-none font-medium transition-all"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white border-b border-gray-50">
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Receipt No</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Fee Type</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Staff</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredFees.sort((a,b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()).map((fee) => {
                    const student = students.find(s => s.id === fee.studentId);
                    return (
                      <tr key={fee.id} className="hover:bg-blue-50/20 transition-colors group">
                        <td className="px-8 py-5 font-mono text-xs font-black text-blue-600">{fee.receiptNo}</td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-black text-xs shadow-sm">
                              {student?.firstName[0]}
                            </div>
                            <div>
                              <p className="text-sm font-black text-gray-900 leading-none mb-1">{student?.firstName} {student?.lastName}</p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Std {student?.grade}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-[10px] font-black text-gray-600 px-3 py-1 bg-gray-100 rounded-lg border border-gray-200 uppercase">
                            {fee.feeType}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                            <span className="text-xs font-bold text-gray-700">{fee.collectedBy}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-sm font-medium text-gray-500">{fee.paymentDate}</td>
                        <td className="px-8 py-5 text-sm font-black text-gray-900">₹{fee.amount.toLocaleString()}</td>
                        <td className="px-8 py-5 text-right">
                          <button 
                            onClick={() => student && generateIndividualReceipt(student, fee)}
                            className="p-2.5 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-gray-100"
                            title="Print Receipt"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm animate-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between mb-10">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-900 text-white rounded-2xl shadow-lg">
                  <Settings2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">Course-Wise Fee Configuration</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Set annual pricing for each grade and course</p>
                </div>
             </div>
             <button 
              onClick={handleSaveFeeStructure}
              className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>

          <div className="space-y-12">
            {feeStructure.map((f) => (
              <div key={f.grade} className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 relative overflow-hidden">
                <div className="flex items-center gap-3 mb-8 relative z-10">
                   <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                      <GraduationCap className="w-6 h-6" />
                   </div>
                   <h4 className="text-xl font-black text-gray-900">{f.grade} Standard</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      Base Fee (Admission)
                    </label>
                    <div className="relative">
                      <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input 
                        type="number"
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-gray-900"
                        value={f.baseAmount}
                        onChange={(e) => updateBaseFee(f.grade, parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  {f.courseFees.map((cf) => (
                    <div key={cf.name} className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                         {cf.name}
                      </label>
                      <div className="relative">
                        <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-400" />
                        <input 
                          type="number"
                          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-gray-900"
                          value={cf.amount}
                          onChange={(e) => updateCourseFee(f.grade, cf.name, parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex items-start gap-4 mt-10">
            <Info className="w-6 h-6 text-blue-600 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-blue-900">How this works:</p>
              <p className="text-xs text-blue-700 leading-relaxed">
                When you admit a student, the "Total Fees" is automatically calculated as: <strong>Base Fee + (Sum of selected courses' fees)</strong>.
                You can still manually override the final total during the admission process if a special discount is needed.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
              <div className="p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                       <FileText className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Generate Class Audit</h3>
                  </div>
                  <button onClick={() => setShowReportModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X className="w-6 h-6 text-gray-400" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Select Academic Standard</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['5th', '6th', '7th', '8th', '9th', '10th'].map(grade => (
                        <button
                          key={grade}
                          onClick={() => setReportGrade(grade)}
                          className={`py-3 rounded-xl font-black text-sm transition-all border ${
                            reportGrade === grade 
                              ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' 
                              : 'bg-gray-50 border-gray-100 text-gray-400 hover:bg-white hover:border-blue-200'
                          }`}
                        >
                          {grade}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-amber-50 p-5 rounded-3xl border border-amber-100 flex items-start gap-4">
                     <Printer className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                     <p className="text-[10px] font-bold text-amber-800 leading-relaxed uppercase">
                       This report will include names, courses, payment history, outstanding balances, and parent contact information for all students in the {reportGrade} Standard.
                     </p>
                  </div>

                  <button 
                    disabled={isGenerating}
                    onClick={generateClassFeeReport}
                    className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-lg shadow-xl shadow-gray-200 hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isGenerating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Download className="w-6 h-6" />}
                    {isGenerating ? 'Compiling PDF...' : 'Download Class PDF'}
                  </button>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default FeeManagement;
