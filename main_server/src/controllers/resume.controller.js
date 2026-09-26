import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { PDFParse } from "pdf-parse";
import { deleteFromImageKit, uploadToImageKit } from '../utils/imageKit.js';
import Resume from '../models/resume.model.js';
import { ChatGoogle } from '@langchain/google';
import mongoose from 'mongoose';
import User from '../models/user.model.js';
import History from '../models/history.model.js';

const parsePDF = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    if (!userId) {
        throw new ApiError(401, "Unauthorized");
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }
    if (!req.file) {
        throw new ApiError(400, "No file uploaded");
    }

    const { buffer, mimetype, originalname, size } = req.file;
    if (!buffer || !mimetype || !originalname || !size) {
        throw new ApiError(400, "Invalid file upload");
    }
    if (mimetype !== "application/pdf") {
        throw new ApiError(400, "Only PDF files are supported");
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const fileName = originalname;

    const uploadResult = await uploadToImageKit(buffer, fileName);
    const { url, fileId } = uploadResult ?? {};
    if (!url || !fileId) {
        throw new ApiError(500, "Failed to upload resume");
    }
    const resume = await Resume.findOne({ userId: user._id });
    if (resume?.fileId) {
        await deleteFromImageKit(resume.fileId);
    }

    const parser = new PDFParse({
        data: buffer
    });

    const result = await parser.getText();
    const extractedText = result.text?.trim();
    if (!extractedText) {
        throw new ApiError(422, "The PDF does not contain extractable text");
    }

    // console.log("Parsed text:", extractedText);

    const model = new ChatGoogle({
        model: "gemini-2.5-flash",
        temperature: 0,
        apiKey: process.env.GOOGLE_API_KEY,
    });

    const systemPrompt = `You are a resume parsing assistant. You will be given raw text extracted from a resume PDF.
        Extract the information and return ONLY a valid JSON object (no markdown, no code fences, no explanations) matching EXACTLY this structure:

        {
        "candidate": {
            "name": string or null,
            "email": string or null,
            "phone": string or null
        },
        "skills": [string],
        "experience": [
            {
            "company": string or null,
            "role": string or null,
            "duration": string or null,
            "description": string or null,
            "technologies": [string]
            }
        ],
        "education": [
            {
            "institution": string or null,
            "degree": string or null,
            "field": string or null,
            "duration": string or null,
            "description": string or null
            }
        ],
        "projects": [
            {
            "name": string or null,
            "description": string or null,
            "technologies": [string],
            "responsibilities": string or null
            }
        ],
        "achievements": [string],
        "certificates": [string],
        "atsScore": number
        }

        Rules:
        - Use null for any field you cannot find, never use empty strings.
        - If a list has no items, return an empty array.
        - Do not invent information not present in the resume text.
        - "duration" should be formatted as a readable date range if possible (e.g. "Jan 2022 - Present").
        - "atsScore" is an integer from 0 to 100 estimating how well this resume would perform against an Applicant Tracking System. Base it on: presence of clear contact info, standard section headings, quantified achievements, relevant skills/keywords, absence of complex formatting artifacts, and overall completeness. If the text is too sparse to judge well, return a conservative low score.
        - Return ONLY the JSON object, nothing else.
    `;

    const userPrompt = `Resume text:\n\n${extractedText}`;

    const aiResponse = await model.invoke([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
    ]);

    let parsedData;
    try {
        let rawContent = aiResponse.content;
        if (typeof rawContent !== "string") {
            rawContent = JSON.stringify(rawContent);
        }
        const cleaned = rawContent
            .trim()
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/```$/i, "")
            .trim();

        parsedData = JSON.parse(cleaned);
    } catch (err) {
        throw new ApiError(500, "Failed to parse AI response into structured data");
    }

    let atsScore = Number(parsedData?.atsScore);
    if (!Number.isFinite(atsScore) || atsScore < 0 || atsScore > 100) {
        atsScore = 0;
    }
    delete parsedData.atsScore;

    const newResume = await Resume.findOneAndUpdate(
        { userId: user._id },
        {
            userId: user._id,
            fileId,
            url,
            fileName,
            extractedText,
            parsedData,
            atsScore
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    if (!newResume) {
        throw new ApiError(500, "Failed to save resume");
    }

    await History.create({
        userId: user._id,
        resumeId: newResume._id,
        typeOfHistory: 'resume',
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                null,
                "PDF parsed successfully"
            )
        )
})

const isResumeUploaded = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    if (!userId) {
        throw new ApiError(401, "Unauthorized");
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }
    const resume = await Resume.findOne({ userId: userId });
    if (!resume) {
        return res.status(200).json(new ApiResponse(200, false, "Resume not uploaded"));
    }
    return res.status(200).json(new ApiResponse(200, true, "Resume uploaded"));
})

export { parsePDF, isResumeUploaded };