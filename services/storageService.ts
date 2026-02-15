
import { Student, Teacher, GradeRecord, FeeRecord, Note, AttendanceRecord, User, AcademicSession, FeeStructure, SchoolProfile } from '../types';

const KEYS = {
  STUDENTS: 'edusync_students',
  TEACHERS: 'edusync_teachers',
  GRADES: 'edusync_grades',
  FEES: 'edusync_fees',
  NOTES: 'edusync_notes',
  ATTENDANCE: 'edusync_attendance_logs',
  USERS: 'edusync_registered_users',
  SESSIONS: 'edusync_sessions',
  FEE_STRUCTURE: 'edusync_fee_structure',
  SCHOOL_PROFILE: 'edusync_school_profile'
};

const INITIAL_PROFILE: SchoolProfile = {
  name: 'Manikgad Cbse classes',
  contactNumbers: ['9309521598', '7666254983', '9561334669']
};

const INITIAL_SESSIONS: AcademicSession[] = [
  { id: 's1', name: '2023-24', startDate: '2023-04-01', endDate: '2024-03-31', isCurrent: false },
  { id: 's2', name: '2024-25', startDate: '2024-04-01', endDate: '2025-03-31', isCurrent: true }
];

const INITIAL_FEE_STRUCTURE: FeeStructure[] = [
  { 
    grade: '5th', 
    baseAmount: 2000, 
    courseFees: [
      { name: 'Mathematics', amount: 3000 },
      { name: 'Science', amount: 3000 },
      { name: 'English', amount: 2000 }
    ] 
  },
  { 
    grade: '6th', 
    baseAmount: 2500, 
    courseFees: [
      { name: 'Mathematics', amount: 4000 },
      { name: 'Science', amount: 4000 },
      { name: 'English', amount: 2500 }
    ] 
  },
  { 
    grade: '7th', 
    baseAmount: 3000, 
    courseFees: [
      { name: 'Mathematics', amount: 5000 },
      { name: 'Science', amount: 5000 },
      { name: 'English', amount: 3000 }
    ] 
  },
  { 
    grade: '8th', 
    baseAmount: 3500, 
    courseFees: [
      { name: 'Mathematics', amount: 5500 },
      { name: 'Science', amount: 5500 },
      { name: 'English', amount: 3500 }
    ] 
  },
  { 
    grade: '9th', 
    baseAmount: 4000, 
    courseFees: [
      { name: 'Mathematics', amount: 6000 },
      { name: 'Science', amount: 6000 },
      { name: 'English', amount: 4000 }
    ] 
  },
  { 
    grade: '10th', 
    baseAmount: 5000, 
    courseFees: [
      { name: 'Mathematics', amount: 7000 },
      { name: 'Science', amount: 7000 },
      { name: 'English', amount: 5000 }
    ] 
  },
];

const INITIAL_STUDENTS: Student[] = [
  { id: '1', firstName: 'Alice', lastName: 'Johnson', email: 'alice.j@school.edu', grade: '10th', status: 'active', attendance: 95, gpa: 3.8, totalFees: 24000, photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice', enrolledCourses: ['Mathematics', 'Science', 'English'], isRegistered: true, registrationDate: '2023-01-15', admissionDate: '2023-04-10' },
  { id: '2', firstName: 'Bob', lastName: 'Smith', email: 'bob.s@school.edu', grade: '10th', status: 'active', attendance: 82, gpa: 2.9, totalFees: 12000, photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob', enrolledCourses: ['English'], isRegistered: false, admissionDate: '2023-05-12' },
  { id: '3', firstName: 'Charlie', lastName: 'Davis', email: 'charlie.d@school.edu', grade: '7th', status: 'active', attendance: 91, gpa: 3.5, totalFees: 13000, photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie', enrolledCourses: ['Mathematics', 'English'], isRegistered: false, admissionDate: '2024-04-15' },
];

const INITIAL_TEACHERS: Teacher[] = [
  { id: 'T1', name: 'Dr. Sarah Wilson', subject: 'Science', email: 's.wilson@school.edu', joinDate: '2020-08-15' },
  { id: 'T2', name: 'Mr. John Miller', subject: 'Mathematics', email: 'j.miller@school.edu', joinDate: '2019-01-10' },
];

const INITIAL_GRADES: GradeRecord[] = [
  { id: 'g1', studentId: '1', subject: 'Science', testName: 'Unit Test 1', score: 92, maxScore: 100, date: '2023-10-01', feedback: 'Excellent work on the biology unit.' },
];

const INITIAL_FEES: FeeRecord[] = [
  { id: 'f1', studentId: '1', amount: 5000, paymentDate: '2023-09-15', paymentMethod: 'UPI', feeType: 'Tuition Fee', receiptNo: 'RCP-8821', collectedBy: 'Super Admin' },
];

export const storageService = {
  getSchoolProfile: (): SchoolProfile => {
    const data = localStorage.getItem(KEYS.SCHOOL_PROFILE);
    if (!data) {
      localStorage.setItem(KEYS.SCHOOL_PROFILE, JSON.stringify(INITIAL_PROFILE));
      return INITIAL_PROFILE;
    }
    return JSON.parse(data);
  },

  saveSchoolProfile: (profile: SchoolProfile) => {
    localStorage.setItem(KEYS.SCHOOL_PROFILE, JSON.stringify(profile));
  },

  getSessions: (): AcademicSession[] => {
    const data = localStorage.getItem(KEYS.SESSIONS);
    if (!data) {
      localStorage.setItem(KEYS.SESSIONS, JSON.stringify(INITIAL_SESSIONS));
      return INITIAL_SESSIONS;
    }
    return JSON.parse(data);
  },

  getFeeStructure: (): FeeStructure[] => {
    const data = localStorage.getItem(KEYS.FEE_STRUCTURE);
    if (!data) {
      localStorage.setItem(KEYS.FEE_STRUCTURE, JSON.stringify(INITIAL_FEE_STRUCTURE));
      return INITIAL_FEE_STRUCTURE;
    }
    return JSON.parse(data);
  },

  saveFeeStructure: (structure: FeeStructure[]) => {
    localStorage.setItem(KEYS.FEE_STRUCTURE, JSON.stringify(structure));
  },

  saveSession: (session: AcademicSession) => {
    const sessions = storageService.getSessions();
    if (session.isCurrent) {
      sessions.forEach(s => s.isCurrent = false);
    }
    const index = sessions.findIndex(s => s.id === session.id);
    if (index > -1) {
      sessions[index] = session;
    } else {
      sessions.push(session);
    }
    localStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions));
  },

  getStudents: (): Student[] => {
    const data = localStorage.getItem(KEYS.STUDENTS);
    if (!data) {
      localStorage.setItem(KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
      return INITIAL_STUDENTS;
    }
    return JSON.parse(data);
  },
  
  saveStudent: (student: Student) => {
    const students = storageService.getStudents();
    const index = students.findIndex(s => s.id === student.id);
    if (index > -1) {
      students[index] = student;
    } else {
      students.push(student);
    }
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
  },

  getTeachers: (): Teacher[] => {
    const data = localStorage.getItem(KEYS.TEACHERS);
    if (!data) {
      localStorage.setItem(KEYS.TEACHERS, JSON.stringify(INITIAL_TEACHERS));
      return INITIAL_TEACHERS;
    }
    return JSON.parse(data);
  },

  saveTeacher: (teacher: Teacher) => {
    const teachers = storageService.getTeachers();
    const index = teachers.findIndex(t => t.id === teacher.id);
    if (index > -1) {
      teachers[index] = teacher;
    } else {
      teachers.push(teacher);
    }
    localStorage.setItem(KEYS.TEACHERS, JSON.stringify(teachers));
  },

  getGrades: (): GradeRecord[] => {
    const data = localStorage.getItem(KEYS.GRADES);
    if (!data) {
      localStorage.setItem(KEYS.GRADES, JSON.stringify(INITIAL_GRADES));
      return INITIAL_GRADES;
    }
    return JSON.parse(data);
  },

  getFees: (): FeeRecord[] => {
    const data = localStorage.getItem(KEYS.FEES);
    if (!data) {
      localStorage.setItem(KEYS.FEES, JSON.stringify(INITIAL_FEES));
      return INITIAL_FEES;
    }
    return JSON.parse(data);
  },

  addFeeRecord: (fee: FeeRecord) => {
    const fees = storageService.getFees();
    fees.push(fee);
    localStorage.setItem(KEYS.FEES, JSON.stringify(fees));
  },

  addGrade: (grade: GradeRecord) => {
    const grades = storageService.getGrades();
    grades.push(grade);
    localStorage.setItem(KEYS.GRADES, JSON.stringify(grades));
  },

  getNotes: (userId: string, role?: string, grade?: string): Note[] => {
    const data = localStorage.getItem(KEYS.NOTES);
    const allNotes: Note[] = data ? JSON.parse(data) : [];
    
    if (role === 'student' && grade) {
      return allNotes.filter(n => n.userId === userId || (n.isClassNote && n.targetGrade === grade));
    }
    
    if (role === 'teacher' || role === 'owner') {
      return allNotes.filter(n => n.userId === userId);
    }

    return allNotes.filter(n => n.userId === userId);
  },

  saveNote: (note: Note) => {
    const data = localStorage.getItem(KEYS.NOTES);
    const allNotes: Note[] = data ? JSON.parse(data) : [];
    const index = allNotes.findIndex(n => n.id === note.id);
    if (index > -1) {
      allNotes[index] = note;
    } else {
      allNotes.push(note);
    }
    localStorage.setItem(KEYS.NOTES, JSON.stringify(allNotes));
  },

  deleteNote: (id: string) => {
    const data = localStorage.getItem(KEYS.NOTES);
    const allNotes: Note[] = data ? JSON.parse(data) : [];
    const filtered = allNotes.filter(n => n.id !== id);
    localStorage.setItem(KEYS.NOTES, JSON.stringify(filtered));
  },

  getAttendanceLogs: (): AttendanceRecord[] => {
    const data = localStorage.getItem(KEYS.ATTENDANCE);
    return data ? JSON.parse(data) : [];
  },

  saveAttendanceRecord: (record: AttendanceRecord) => {
    const logs = storageService.getAttendanceLogs();
    logs.push(record);
    localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(logs));
    
    const students = storageService.getStudents();
    record.presentIds.forEach(id => {
      const s = students.find(st => st.id === id);
      if (s) s.attendance = Math.min(100, s.attendance + 0.1);
    });
    record.absentIds.forEach(id => {
      const s = students.find(st => st.id === id);
      if (s) s.attendance = Math.max(0, s.attendance - 0.5);
    });
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
  },

  getRegisteredUsers: (): User[] => {
    const data = localStorage.getItem(KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },

  saveRegisteredUser: (user: User) => {
    const users = storageService.getRegisteredUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index > -1) {
      users[index] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  }
};
