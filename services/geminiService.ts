
import { GoogleGenAI, Type } from "@google/genai";
import { Student, GradeRecord } from '../types';

// Fix: Always use the exact initialization pattern as per Google GenAI guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  analyzeStudentPerformance: async (student: Student, grades: GradeRecord[]): Promise<string> => {
    const prompt = `
      Analyze the performance of student: ${student.firstName} ${student.lastName}.
      GPA: ${student.gpa}, Attendance: ${student.attendance}%.
      Grade Records: ${JSON.stringify(grades)}
      Provide a brief 3-sentence summary of their current standing and potential areas for improvement.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          temperature: 0.7,
        }
      });
      return response.text || "Analysis unavailable at this time.";
    } catch (error) {
      console.error("AI Analysis Error:", error);
      return "Error communicating with AI service.";
    }
  },

  generateLessonPlan: async (subject: string, topic: string, gradeLevel: string): Promise<string> => {
    const prompt = `Create a brief lesson plan for ${gradeLevel} ${subject} on the topic of "${topic}". 
    Include:
    1. Objectives
    2. Key Vocabulary
    3. A 15-minute activity description.
    Keep it concise and practical.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          temperature: 0.8,
        }
      });
      return response.text || "Lesson plan could not be generated.";
    } catch (error) {
      console.error("Lesson Plan Error:", error);
      return "Failed to generate lesson plan.";
    }
  },

  generateCBSETest: async (grade: string, subject: string, topic: string, difficulty: string): Promise<string> => {
    const prompt = `Generate a formal examination paper for ${grade} standard ${subject} on the topic "${topic}".
    The test must follow the CBSE 10th Standard Pattern regardless of the target grade.
    Difficulty Level: ${difficulty}.
    
    Structure:
    1. Header: School Name (Manikgad CBSE Classes Buldana), Subject, Grade, Time (2 Hours), Max Marks (40).
    2. General Instructions.
    3. Section A: 10 Objective Type Questions (MCQs/Fill in blanks) - 1 Mark each.
    4. Section B: 5 Very Short Answer Type Questions - 2 Marks each.
    5. Section C: 4 Short Answer Type Questions - 3 Marks each.
    6. Section D: 2 Long Answer Type Questions - 4 Marks each.
    
    Ensure questions are pedagogically sound for the ${grade} level but structured in this rigorous pattern.
    Format the output as a clean, printable document.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          temperature: 0.7,
        }
      });
      return response.text || "Test paper could not be generated.";
    } catch (error) {
      console.error("CBSE Test Generation Error:", error);
      return "Failed to generate AI test paper.";
    }
  }
};
