
export type UserRole = 'owner' | 'teacher' | 'student';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
  linkedId?: string; // Links to Student ID or Teacher ID
  password?: string;
  isRegistered?: boolean;
}

export interface SchoolProfile {
  name: string;
  logoUrl?: string; // Base64 string for the class logo
  contactNumbers: string[];
}

export interface AcademicSession {
  id: string;
  name: string; // e.g., "2023-24"
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  date: string;
  color?: string;
  isClassNote?: boolean;
  targetGrade?: string;
  authorName?: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  grade: string;
  course: string;
  presentIds: string[];
  absentIds: string[];
  takenBy: string;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  grade: string;
  status: 'active' | 'inactive';
  attendance: number;
  gpa: number;
  totalFees: number; // Track assigned total fees (Sum of course fees + base)
  photoUrl?: string;
  address?: string;
  parentMobile?: string;
  whatsappNo?: string;
  enrolledCourses?: string[];
  isRegistered?: boolean;
  registrationDate?: string;
  admissionDate: string; // Required for session filtering
}

export interface CourseFee {
  name: string;
  amount: number;
}

export interface FeeStructure {
  grade: string;
  baseAmount: number; // Registration/Admin fee
  courseFees: CourseFee[]; // Individual pricing for Math, Science, etc.
}

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  email: string;
  joinDate: string;
}

export interface GradeRecord {
  id: string;
  studentId: string;
  subject: string;
  testName: string;
  score: number;
  maxScore: number;
  date: string;
  feedback?: string;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque';
  feeType: 'Tuition Fee' | 'Admission Fee' | 'Exam Fee' | 'Other';
  receiptNo: string;
  collectedBy: string; // Name of the staff who processed the payment
}

export type ViewType = 'dashboard' | 'students' | 'teachers' | 'grades' | 'attendance' | 'admission' | 'fees' | 'ai-assistant' | 'settings' | 'my-profile' | 'notes' | 'registration-report' | 'test-generator';

export interface AIAnalysis {
  summary: string;
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
}
