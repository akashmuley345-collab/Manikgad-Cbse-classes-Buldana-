
import React, { useState, useRef, useEffect } from 'react';
import { UserPlus, CheckCircle2, Camera, Upload, X, RefreshCw, Phone, MessageCircle, Home, BookOpen, Check, Calendar, IndianRupee } from 'lucide-react';
import { storageService } from '../services/storageService';
import { Student, FeeStructure } from '../types';

interface AdmissionFormProps {
  onSuccess: () => void;
}

const AdmissionForm: React.FC<AdmissionFormProps> = ({ onSuccess }) => {
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    grade: '5th',
    address: '',
    parentMobile: '',
    whatsappNo: '',
    enrolledCourses: [] as string[],
    admissionDate: new Date().toISOString().split('T')[0],
    totalFees: 0
  });
  const [photo, setPhoto] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const structures = storageService.getFeeStructure();
    setFeeStructures(structures);
  }, []);

  // Sync total fees when grade or enrolled courses changes
  useEffect(() => {
    const gradeStructure = feeStructures.find(f => f.grade === formData.grade);
    if (gradeStructure) {
      const courseTotal = gradeStructure.courseFees
        .filter(cf => formData.enrolledCourses.includes(cf.name))
        .reduce((sum, cf) => sum + cf.amount, 0);
      
      const grandTotal = gradeStructure.baseAmount + courseTotal;
      setFormData(prev => ({ ...prev, totalFees: grandTotal }));
    }
  }, [formData.grade, formData.enrolledCourses, feeStructures]);

  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setIsCameraActive(false);
      alert("Could not access camera. Please check permissions.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/png');
        setPhoto(dataUrl);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleCourse = (course: string) => {
    setFormData(prev => ({
      ...prev,
      enrolledCourses: prev.enrolledCourses.includes(course)
        ? prev.enrolledCourses.filter(c => c !== course)
        : [...prev.enrolledCourses, course]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.enrolledCourses.length === 0) {
      alert("Please select at least one course.");
      return;
    }
    setLoading(true);
    
    const newStudent: Student = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      ...formData,
      photoUrl: photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.firstName}`,
      status: 'active',
      attendance: 100,
      gpa: 0,
    };

    setTimeout(() => {
      storageService.saveStudent(newStudent);
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setFormData({ 
          firstName: '', 
          lastName: '', 
          email: '', 
          grade: '5th',
          address: '',
          parentMobile: '',
          whatsappNo: '',
          enrolledCourses: [],
          admissionDate: new Date().toISOString().split('T')[0],
          totalFees: 0
        });
        setPhoto(null);
        onSuccess();
      }, 1500);
    }, 800);
  };

  const currentGradeStructure = feeStructures.find(f => f.grade === formData.grade);
  const grades = ['5th', '6th', '7th', '8th', '9th', '10th'];

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden animate-in zoom-in duration-500 mb-12">
      <div className="bg-blue-600 p-8 text-white">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <UserPlus className="w-8 h-8" />
          Student Admission Form
        </h2>
        <p className="text-blue-100 mt-2">New Enrollment for Standards 5th to 10th</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        {/* Photo Section */}
        <div className="space-y-4">
          <label className="text-sm font-bold text-gray-700 block">Student Identity Photo</label>
          <div className="flex flex-col items-center gap-4 bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-200">
            <div className="relative w-40 h-40 bg-white rounded-2xl overflow-hidden border-2 border-gray-100 flex items-center justify-center shadow-inner">
              {isCameraActive ? (
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              ) : photo ? (
                <img src={photo} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-4">
                  <UserPlus className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Awaiting Photo</p>
                </div>
              )}
              
              {photo && !isCameraActive && (
                <button 
                  type="button"
                  onClick={() => setPhoto(null)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex gap-3">
              {!isCameraActive ? (
                <>
                  <button 
                    type="button"
                    onClick={startCamera}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    <Camera className="w-4 h-4" />
                    Open Camera
                  </button>
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Image
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileUpload}
                  />
                </>
              ) : (
                <>
                  <button 
                    type="button"
                    onClick={capturePhoto}
                    className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-xl text-xs font-bold hover:bg-green-600 transition-colors shadow-sm"
                  >
                    <Camera className="w-4 h-4" />
                    Snap Photo
                  </button>
                  <button 
                    type="button"
                    onClick={stopCamera}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-300 transition-colors shadow-sm"
                  >
                    <X className="w-4 h-4" />
                    Stop
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b pb-2">Student Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">First Name</label>
              <input 
                required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                value={formData.firstName}
                onChange={e => setFormData({...formData, firstName: e.target.value})}
                placeholder="John"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Last Name</label>
              <input 
                required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                value={formData.lastName}
                onChange={e => setFormData({...formData, lastName: e.target.value})}
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Email Address</label>
              <input 
                required
                type="email"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="student@school.edu"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" /> Admission Date
              </label>
              <input 
                required
                type="date"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                value={formData.admissionDate}
                onChange={e => setFormData({...formData, admissionDate: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Home className="w-4 h-4 text-gray-400" /> Residential Address
            </label>
            <textarea 
              required
              rows={3}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
              placeholder="Full Street Address, City, State, Zip"
            />
          </div>
        </div>

        {/* Contact & Enrollment Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b pb-2">Parent Contact & Enrollment</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" /> Parent Mobile No.
              </label>
              <input 
                required
                type="tel"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                value={formData.parentMobile}
                onChange={e => setFormData({...formData, parentMobile: e.target.value})}
                placeholder="+1 234 567 890"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-green-500" /> WhatsApp No.
              </label>
              <input 
                required
                type="tel"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                value={formData.whatsappNo}
                onChange={e => setFormData({...formData, whatsappNo: e.target.value})}
                placeholder="+1 234 567 890"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Assigned Grade</label>
                <select 
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  value={formData.grade}
                  onChange={e => setFormData({...formData, grade: e.target.value})}
                >
                  {grades.map(g => (
                    <option key={g} value={g}>{g} Standard</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-gray-400" /> Total Annual Fees
                </label>
                <div className="relative">
                   <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 font-bold">₹</div>
                   <input 
                    required
                    type="number"
                    className="w-full pl-8 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-black text-blue-600"
                    value={formData.totalFees}
                    onChange={e => setFormData({...formData, totalFees: parseFloat(e.target.value)})}
                    placeholder="Auto-calculated"
                  />
                </div>
                <p className="text-[10px] text-gray-400 font-bold uppercase ml-1 italic">Auto-calculated based on courses + Base Fee</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gray-400" /> Courses to Join (Select Multiple)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {currentGradeStructure?.courseFees.map(course => (
                  <label 
                    key={course.name} 
                    className={`flex flex-col p-4 rounded-2xl border transition-all cursor-pointer ${
                      formData.enrolledCourses.includes(course.name) 
                        ? 'bg-blue-50 border-blue-600 shadow-sm' 
                        : 'bg-gray-50 border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                        formData.enrolledCourses.includes(course.name) 
                          ? 'bg-blue-600 border-blue-600 text-white' 
                          : 'bg-white border-gray-300'
                      }`}>
                        {formData.enrolledCourses.includes(course.name) && <Check className="w-3 h-3" />}
                      </div>
                      <input 
                        type="checkbox"
                        className="hidden"
                        checked={formData.enrolledCourses.includes(course.name)}
                        onChange={() => toggleCourse(course.name)}
                      />
                      <span className={`text-sm font-bold ${formData.enrolledCourses.includes(course.name) ? 'text-blue-700' : 'text-gray-600'}`}>
                        {course.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                       <span className="text-[10px] font-black text-gray-400 uppercase">Cost</span>
                       <span className={`text-xs font-black ${formData.enrolledCourses.includes(course.name) ? 'text-blue-600' : 'text-gray-400'}`}>₹{course.amount.toLocaleString()}</span>
                    </div>
                  </label>
                ))}
              </div>
              {!currentGradeStructure && <p className="text-xs text-red-500 italic">Fee structure for this grade is not yet configured by admin.</p>}
            </div>
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading || success}
          className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
            success ? 'bg-green-500 text-white shadow-green-200' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
          }`}
        >
          {loading ? (
            <span className="flex items-center gap-2"><RefreshCw className="w-5 h-5 animate-spin" /> Finalizing Admission...</span>
          ) : success ? (
            <span className="flex items-center gap-2"><CheckCircle2 className="w-6 h-6" /> Enrollment Complete!</span>
          ) : (
            <span className="flex items-center gap-2">Submit Admission Form</span>
          )}
        </button>
      </form>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default AdmissionForm;
