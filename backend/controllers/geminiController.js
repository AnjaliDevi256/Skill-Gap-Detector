import { GoogleGenerativeAI } from '@google/generative-ai';
import asyncHandler from 'express-async-handler';

export const analyzeJob = asyncHandler(async (req, res) => {
  if (!process.env.GEMINI_API_KEY) {
    res.status(500);
    throw new Error('GEMINI_API_KEY is missing in your .env file');
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  try {
    // UPDATED TO CURRENT 2026 MODEL
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    
    const { prompt } = req.body;
    if (!prompt) {
      res.status(400);
      throw new Error('No job description provided');
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean and split the AI response into a clean array
    const skillsArray = text
      .replace(/[*\-•]/g, '') 
      .split(/,|\n/)          
      .map(s => s.trim())
      .filter(s => s.length > 0 && s.length < 35); 

    res.json({ skills: skillsArray });
  } catch (error) {
    console.error("GEMINI SYSTEM ERROR:", error.message);
    res.status(500);
    throw new Error(`Gemini API Error: ${error.message}`);
  }
});