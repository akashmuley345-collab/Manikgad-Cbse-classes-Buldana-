
import { User, UserRole, Student, Teacher } from '../types';
import { storageService } from './storageService';

const HARDCODED_USERS: User[] = [
  { id: 'u1', username: 'Manikgad-Classess', role: 'owner', name: 'Manikgad Cbse classes', password: 'Manikgad@123' },
];

export const authService = {
  login: (username: string, password: string, role: UserRole = 'owner', grade?: string): User | null => {
    const trimmedUsername = username.trim();
    
    // 1. Staff/Teacher Login Flow
    if (role !== 'student') {
      // Check hardcoded admin first
      // We look for the user. If the username matches (case-sensitive as per request), we then check the password.
      const hardcodedUser = HARDCODED_USERS.find(u => u.username === trimmedUsername);
      if (hardcodedUser && password === hardcodedUser.password) {
        localStorage.setItem('edusync_user', JSON.stringify(hardcodedUser));
        return hardcodedUser;
      }

      // Check dynamically registered teachers/staff
      // Staff/Admin tab in UI sets role to 'owner', but teachers are saved as 'teacher'
      // We check all registered non-student users
      const registeredUsers = storageService.getRegisteredUsers();
      const normalizedInput = trimmedUsername.toLowerCase();
      
      const dynamicUser = registeredUsers.find(u => 
        u.username.toLowerCase() === normalizedInput && 
        (u.role === 'teacher' || u.role === 'owner')
      );

      if (dynamicUser && password === dynamicUser.password) {
        localStorage.setItem('edusync_user', JSON.stringify(dynamicUser));
        return dynamicUser;
      }
      return null;
    }

    // 2. Student Login Flow (Name + Class)
    const students = storageService.getStudents();
    const normalizedStudentName = trimmedUsername.toLowerCase();
    const student = students.find(s => 
      `${s.firstName} ${s.lastName}`.toLowerCase() === normalizedStudentName && 
      s.grade === grade
    );
    
    if (student) {
      if (student.isRegistered) {
        const registeredUsers = storageService.getRegisteredUsers();
        const registeredUser = registeredUsers.find(u => u.linkedId === student.id);
        if (registeredUser && password === registeredUser.password) {
           localStorage.setItem('edusync_user', JSON.stringify(registeredUser));
           return registeredUser;
        }
      } else {
        // First time student login - create session to allow registration
        const newUser: User = {
          id: `usr_${student.id}`,
          username: student.id,
          role: 'student',
          name: `${student.firstName} ${student.lastName}`,
          linkedId: student.id,
          isRegistered: false
        };
        localStorage.setItem('edusync_user', JSON.stringify(newUser));
        return newUser;
      }
    }

    return null;
  },

  registerTeacher: (teacher: Teacher, password: string): User => {
    const username = teacher.name.toLowerCase().replace(/\s+/g, '_').replace(/[^\w]/g, '');
    
    const newUser: User = {
      id: `usr_${teacher.id}`,
      username: username,
      role: 'teacher',
      name: teacher.name,
      linkedId: teacher.id,
      password: password,
      isRegistered: true
    };
    
    storageService.saveRegisteredUser(newUser);
    return newUser;
  },
  
  registerStudent: (studentId: string, password: string): User | null => {
    const students = storageService.getStudents();
    const studentIndex = students.findIndex(s => s.id === studentId);
    
    if (studentIndex > -1) {
      const student = students[studentIndex];
      student.isRegistered = true;
      student.registrationDate = new Date().toISOString().split('T')[0];
      storageService.saveStudent(student);

      const newUser: User = {
        id: `usr_${student.id}`,
        username: student.id,
        role: 'student',
        name: `${student.firstName} ${student.lastName}`,
        linkedId: student.id,
        password: password,
        isRegistered: true
      };
      
      storageService.saveRegisteredUser(newUser);
      localStorage.setItem('edusync_user', JSON.stringify(newUser));
      return newUser;
    }
    return null;
  },

  logout: () => {
    localStorage.removeItem('edusync_user');
  },
  
  getCurrentUser: (): User | null => {
    const data = localStorage.getItem('edusync_user');
    return data ? JSON.parse(data) : null;
  }
};
