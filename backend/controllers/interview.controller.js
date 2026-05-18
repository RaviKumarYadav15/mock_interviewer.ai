import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { askAi } from "../services/openRouter.service.js";

export const analyzeResume = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "Resume is required." });
    }

    const filepath = req.file.path;

    try {
        const fileBuffer = await fs.promises.readFile(filepath);
        const uint8Array = new Uint8Array(fileBuffer);

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

    } finally {
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
        }
    }
};