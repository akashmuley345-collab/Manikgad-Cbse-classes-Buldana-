
import { Student } from '../types';

export const notificationService = {
  sendAbsenteeSMS: async (student: Student, date: string): Promise<boolean> => {
    // In a real production app, this would call an API like Twilio or TextLocal
    // Here we simulate the network delay and logic
    const message = `Alert: Your ward ${student.firstName} ${student.lastName} was marked ABSENT today (${date}) at Manikgad CBSE Classes Buldana. Please contact the office for any queries.`;
    
    console.group(`📱 SMS Dispatch: ${student.parentMobile || 'No Mobile Registered'}`);
    console.log(`To: ${student.firstName}'s Parent`);
    console.log(`Content: ${message}`);
    console.groupEnd();

    // Simulate network latency
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(!!student.parentMobile);
      }, 600);
    });
  }
};
