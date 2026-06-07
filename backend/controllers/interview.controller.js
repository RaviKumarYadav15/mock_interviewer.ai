import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { askAi } from "../services/openRouter.service.js";
import User from "../models/user.model.js";
import Interview from "../models/interview.model.js";

export const analyzeResume = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "Resume is required." });
    }

    const filepath = req.file.path;

    try {
        const uint8Array = new Uint8Array(req.file.buffer);

        const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;

        let resumeText = "";

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const content = await page.getTextContent();

            const pageText = content.items.map(item => item.str).join(" ");
            resumeText += pageText + "\n";
        }

        resumeText = resumeText
            .replace(/ +/g, " ")
            .replace(/\n+/g, "\n")
            .trim();

        const messages = [
            {
                role: "system",
                content: `Extract structured data from the provided candidate resume.

Return STRICTLY a raw JSON object. Do not include markdown formatting (like \`\`\`json) or any introductory text.
Use this exact structure:
{
    "role": "Suggested job role based on experience (string)",
    "experience": "Total years or level of experience (string)",
    "projects": ["project1", "project2"],
    "skills": ["skill1", "skill2"]
}`
            },
            {
                role: "user",
                content: resumeText
            }
        ];

        const aiResponse = await askAi(messages);

        const cleanedResponse = aiResponse.replace(/```json/gi, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanedResponse);

        return res.status(200).json({
            role: parsed.role,
            experience: parsed.experience,
            projects: parsed.projects,
            skills: parsed.skills,
            resumeText: resumeText
        });

    } catch (error) {
        console.error("Resume Analysis Error:", error);
        return res.status(500).json({ message: error.message || "Failed to analyze resume." });

    }
};

export const generateQuestion = async (req, res) => {
    try {
        let { role, experience, mode, resumeText, projects, skills } = req.body;

        role = role?.trim();
        experience = experience?.trim();
        mode = mode?.trim();

        if (!role || !experience || !mode) {
            return res.status(400).json({ message: "Role, Experience and Mode are required." });
        }

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (user.credits < 50) {
            return res.status(400).json({ message: "Not enough credits. Minimum 50 required." });
        }

        const projectText = Array.isArray(projects) && projects.length ? projects.join(", ") : "None";
        const skillsText = Array.isArray(skills) && skills.length ? skills.join(", ") : "None";
        const safeResume = resumeText?.trim() || "None";

        const userPrompt = `
Role: ${role}
Experience: ${experience}
InterviewMode: ${mode}
Projects: ${projectText}
Skills: ${skillsText}
Resume: ${safeResume}`.trim();

        const messages = [
            {
                role: "system",
                content: `You are a real human interviewer conducting a professional interview.
Generate exactly 5 interview questions.

Strict Rules:
- Each question must contain between 15 and 25 words.
- Each question must be a single complete sentence.
- Do NOT number them.
- Do NOT add explanations or extra text.
- One question per line only.

Difficulty progression:
Question 1 -> easy
Question 2 -> easy
Question 3 -> medium
Question 4 -> medium
Question 5 -> hard

Make questions based on the candidate's profile.
"CRITICAL RULE: The candidate's resume includes information about 
their education (college/university). 
DO NOT ask questions about their university life, 
college professors, or campus projects. 
Focus exclusively on professional skills, technical project implementation, 
and role-specific scenarios."`
            },
            { role: "user", content: userPrompt }
        ];

        const aiResponse = await askAi(messages);

        if (!aiResponse || !aiResponse.trim()) {
            return res.status(500).json({ message: "AI returned empty response." });
        }

        // remove any accidental numbering AI adds
        const questionsArray = aiResponse
            .split("\n")
            .map(q => q.replace(/^\d+[\.\-\)]\s*/, '').trim()) 
            .filter(q => q.length > 0)
            .slice(0, 5);

        if (questionsArray.length === 0) {
            return res.status(500).json({ message: "AI failed to generate questions." });
        }

        const interview = await Interview.create({
            userId: user._id,
            role,
            experience,
            mode,
            resumeText: safeResume,
            questions: questionsArray.map((q, index) => ({
                question: q,
                difficulty: ["easy", "easy", "medium", "medium", "hard"][index],
                timeLimit: [60, 60, 90, 90, 120][index]
            }))
        });

        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            { $inc: { credits: -50 } },
            { new: true }
        );

        return res.json({
            interviewId: interview._id,
            creditsLeft: user.credits,
            userName: updatedUser.name,
            questions: interview.questions
        });

    } catch (error) {
        console.error("Generate Question Error:", error);
        return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};

export const submitAnswer = async (req, res) => {
    try {
        const { interviewId, questionIndex, answer, timeTaken } = req.body;
        const interview = await Interview.findById(interviewId);
        if (!interview) return res.status(404).json({ message: "Interview not found" });

        const question = interview.questions[questionIndex];
        if (!question)return res.status(400).json({ message: "Invalid question index" });
        question.answer = answer;

        if (
            !answer ||
            !answer.trim() ||
            answer === "Time limit exceeded. No response provided."
        ) {
            question.score = 0;
            question.feedback = "Time limit exceeded or no answer submitted.";

            await interview.save();

            return res.status(200).json({
                message: "Answer recorded."
            });
        }
        const gracePeriod = 5;
        if (timeTaken > question.timeLimit + gracePeriod) {
            question.score = 0;
            question.feedback = "Time limit exceeded. Answer not evaluated.";
            await interview.save();
            return res.status(200).json({
                message: "Answer recorded."
            });
        }
        await interview.save();
        res.status(200).json({
            message: "Answer recorded."
        });
        processAIGrading(interviewId, questionIndex, answer);
    } catch (error) {
        console.error("Submit Answer Error:", error);
        return res.status(500).json({
            message: error.message || "Failed to submit answer"
        });
    }
};

const processAIGrading = async (interviewId, questionIndex, answer) => {
    try {
        const messages = [
            {
                role: "system",
                content: `You are a professional human interviewer evaluating a candidate answer.

Score the answer in these areas (0 to 10):
1. Clarity: Is the language clear, concise, and easy to understand?
2. Structure: Is the answer organized and logically presented?
3. Correctness: Is the answer accurate, relevant, and reasonably complete?

Calculate:
finalScore = average of clarity, structure, and correctness.

Feedback Rules:
- Write natural interviewer-style feedback in 10 to 20 words.
- Highlight one strong point and one area for improvement.
- Do NOT repeat the question or explain scoring.
- This feedback is for a written report, do NOT use conversational transitions like "moving on".

Return ONLY valid JSON:
{
    "clarity": number,
    "structure": number,
    "correctness": number,
    "finalScore": number,
    "feedback": "short report-style feedback"
}`
            },
            {
                role: "user",
                content: `Question: ${question.question}\nAnswer: ${answer}`
            }
        ];

        const aiResponse = await askAi(messages);
        const cleanedResponse = aiResponse.replace(/```json/gi, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanedResponse);

        const interview = await Interview.findById(interviewId);
        if (!interview) return;

        const question = interview.questions[questionIndex];
        question.communication = parsed.clarity || 0;
        question.confidence = parsed.structure || 0;
        question.correctness = parsed.correctness || 0;
        question.score = parsed.finalScore || 0;
        question.feedback = parsed.feedback || "Answer evaluated.";

        await interview.save();

    } catch (error) {
        console.error("Background AI Grading Error:", error);
    }
};

export const finishInterview = async (req, res) => {
    try {
        const { interviewId } = req.body;

        const interview = await Interview.findById(interviewId);
        if (!interview) return res.status(404).json({ message: "Failed to find Interview" });

        const totalQuestions = interview.questions.length;
        if (totalQuestions === 0) return res.status(400).json({ message: "No questions to evaluate" });

        let totalScore = 0, totalConfidence = 0, totalCommunication = 0, totalCorrectness = 0;
        
        // 1  Build a text transcript of entire interview for AI 
        let transcript = `Candidate Role: ${interview.role} | Experience: ${interview.experience}\n\n`;

        interview.questions.forEach((q, index) => {
            totalScore += q.score || 0;
            totalConfidence += q.confidence || 0;
            totalCommunication += q.communication || 0;
            totalCorrectness += q.correctness || 0;
            
            transcript += `Question ${index + 1}: ${q.question}\nCandidate Answer: ${q.answer || "No answer provided"}\n\n`;
        });

        const finalScore = totalScore / totalQuestions;

        // 2 Ask AI to analyze transcript for Strengths and Weaknesses
        const messages = [
            {
                role: "system",
                content: `You are an expert technical recruiter reviewing an interview transcript.
Based on the candidate's answers, identify exactly 3 core strengths and exactly 3 areas for improvement (weaknesses).
Keep each point concise (under 15 words).

Return STRICTLY a raw JSON object. Do not include markdown formatting (like \`\`\`json).
Use this exact structure:
{
    "strengths": ["Strength 1", "Strength 2", "Strength 3"],
    "weaknesses": ["Weakness 1", "Weakness 2", "Weakness 3"]
}`
            },
            {
                role: "user",
                content: transcript
            }
        ];

        let aiStrengths = [];
        let aiWeaknesses = [];

        try {
            const aiResponse = await askAi(messages);
            const cleanedResponse = aiResponse.replace(/```json/gi, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(cleanedResponse);
            
            aiStrengths = parsed.strengths || [];
            aiWeaknesses = parsed.weaknesses || [];
        } catch (aiError) {
            console.error("AI Final Evaluation Failed, using defaults:", aiError);
            // Fallback so  app doesn't crash if AI fail
            aiStrengths = ["Completed interview assessment"];
            aiWeaknesses = ["Insufficient data to generate specific weaknesses."];
        }

        // 3. Save everything to database
        interview.finalScore = finalScore;
        interview.strengths = aiStrengths;
        interview.weaknesses = aiWeaknesses;
        interview.status = "completed";
        
        await interview.save();

        // 4. Return complete package to frontend
        return res.status(200).json({
            finalScore: Number(finalScore.toFixed(1)),
            confidence: Number((totalConfidence / totalQuestions).toFixed(1)),
            communication: Number((totalCommunication / totalQuestions).toFixed(1)),
            correctness: Number((totalCorrectness / totalQuestions).toFixed(1)),
            strengths: aiStrengths,
            weaknesses: aiWeaknesses,
            questions: interview.questions.map((q) => ({
                question: q.question,
                answer: q.answer,
                score: q.score || 0,
                feedback: q.feedback || "",
                confidence: q.confidence || 0,
                communication: q.communication || 0,
                correctness: q.correctness || 0,
            }))
        });

    } catch (error) {
        console.error("Finish Interview Error:", error);
        return res.status(500).json({ message: `Failed to finish Interview: ${error.message}` });
    }
};

export const getUserInterviews = async (req, res) => {
    try {
        const userId = req.userId; 

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized. User ID missing." });
        }

        const interviews = await Interview.find({ userId: userId }).sort({ createdAt: -1 });

        return res.status(200).json(interviews);
    } catch (error) {
        console.error("Fetch User Interviews Error:", error);
        return res.status(500).json({ message: "Failed to fetch interviews" });
    }
};

export const getInterviewById = async (req, res) => {
    try {
        const { id } = req.params;
        const interview = await Interview.findById(id);
        
        if (!interview) {
            return res.status(404).json({ message: "Interview not found" });
        }
        if (interview.userId.toString() !== req.userId.toString()) {
            return res.status(403).json({ message: "Unauthorized access to this report." });
        }
        return res.status(200).json(interview);
    } catch (error) {
        console.error("Get Interview By ID Error:", error);
        return res.status(500).json({ message: "Failed to fetch interview report" });
    }
};

export const deleteInterview = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const deletedInterview = await Interview.findOneAndDelete({ 
            _id: id, 
            userId: userId 
        });
        if (!deletedInterview) {
            return res.status(404).json({ message: "Interview not found or unauthorized" });
        }
        return res.status(200).json({ message: "Interview successfully deleted" });
    } catch (error) {
        console.error("Delete Interview Error:", error);
        return res.status(500).json({ message: "Failed to delete interview" });
    }
};