import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import Resume from '../models/resume.model.js';
import { ChatGoogle } from '@langchain/google';
import Interview from '../models/interview.model.js';
import User from '../models/user.model.js';
import Question from '../models/question.model.js';
import History from '../models/history.model.js';
import mongoose from 'mongoose';
import { callAIJson } from '../utils/aiClient.js';
import {
    buildQuestionGenerationPrompt,
    buildTransitionPrompt,
    buildIntentClassificationPrompt,
    buildExplainPrompt,
    buildAnswerEvaluationPrompt,
    buildFinalEvaluationPrompt,
    buildReAskPrompt,
} from '../utils/interviewPrompts.js'


const generateInterviewQuestions = asyncHandler(async (req, res, next) => {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, 'Invalid userId');
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    const resume = await Resume.findOne({ userId }).sort({ createdAt: -1 });
    if (!resume) {
        throw new ApiError(404, 'No resume found for this user');
    }

    const alreadyActive = await Interview.findOne({
        resumeId: resume._id,
        status: { $in: ['created', 'in_progress'] },
    });
    if (alreadyActive) {
        throw new ApiError(409, 'An active interview already exists for this resume');
    }

    const { systemPrompt, userPrompt } = buildQuestionGenerationPrompt(resume, user);
    const aiPlan = await callAIJson(systemPrompt, userPrompt);

    if (!aiPlan?.questions || !Array.isArray(aiPlan.questions) || aiPlan.questions.length === 0) {
        throw new ApiError(502, 'AI failed to generate interview questions');
    }

    const questionsPayload = aiPlan.questions
        .filter((q) => q && q.question && q.simplifiedQuestion && q.section)
        .slice(0, 10)
        .sort((a, b) => a.number - b.number);

    if (questionsPayload.length === 0) {
        throw new ApiError(502, 'AI returned no usable questions');
    }

    const sectionCounts = new Map();
    for (const q of questionsPayload) {
        sectionCounts.set(q.section, (sectionCounts.get(q.section) || 0) + 1);
    }
    const sections = Array.from(sectionCounts.entries()).map(([section, count]) => ({
        section,
        count,
    }));

    const session = await mongoose.startSession();
    let interview;

    try {
        await session.withTransaction(async () => {
            const created = await Interview.create(
                [
                    {
                        resumeId: resume._id,
                        status: 'created',
                        maxQuestions: questionsPayload.length,
                        currentQuestionNumber: 0,
                        questionsAsked: 0,
                        questionsSkipped: 0,
                        plan: {
                            totalQuestions: questionsPayload.length,
                            sections,
                        },
                    },
                ],
                { session }
            );
            interview = created[0];

            await History.create(
                [
                    {
                        userId: user._id,
                        interviewId: interview._id,
                        typeOfHistory: 'interview',
                    },
                ],
                { session }
            );

            const questionDocs = questionsPayload.map((q, idx) => ({
                interviewId: interview._id,
                number: idx + 1,
                section: q.section,
                topic: q.topic || q.section,
                question: q.question,
                simplifiedQuestion: q.simplifiedQuestion,
                difficulty: q.difficulty || 'medium',
                expectedTopics: Array.isArray(q.expectedTopics) ? q.expectedTopics : [],
                status: 'pending',
            }));

            await Question.insertMany(questionDocs, { session });
        });
    } finally {
        await session.endSession();
    }

    const savedQuestions = await Question.find({ interviewId: interview._id }).sort({ number: 1 });

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                { interview, questions: savedQuestions },
                'Interview questions generated successfully'
            )
        );
});


const sendQuestionsToCandidate = asyncHandler(async (req, res, next) => {
    const { interviewId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
        throw new ApiError(400, 'Invalid interviewId');
    }

    const interview = await Interview.findById(interviewId);
    if (!interview) {
        throw new ApiError(404, 'Interview not found');
    }

    if (interview.status === 'completed') {
        throw new ApiError(400, 'This interview has already been completed');
    }

    if (interview.currentQuestionNumber > 0) {
        const currentQuestion = await Question.findOne({
            interviewId: interview._id,
            number: interview.currentQuestionNumber,
        });

        if (currentQuestion && currentQuestion.status === 'asked') {
            const reAskPrompt = buildReAskPrompt(currentQuestion);
            const aiReAsk = await callAIJson(reAskPrompt.systemPrompt, reAskPrompt.userPrompt);

            return res.status(200).json(
                new ApiResponse(
                    200,
                    {
                        full_context: aiReAsk.full_context,
                        question: aiReAsk.question || currentQuestion.simplifiedQuestion,
                        questionNumber: currentQuestion.number,
                        totalQuestions: interview.maxQuestions,
                        section: currentQuestion.section,
                        repeated: true,
                    },
                    'Re-presented the current unresolved question'
                )
            );
        }
    }

    const nextNumber = interview.currentQuestionNumber + 1;

    if (nextNumber > interview.maxQuestions) {
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { done: true },
                    'All questions have been asked. Call the evaluate endpoint to get the final result.'
                )
            );
    }

    const nextQuestion = await Question.findOne({ interviewId: interview._id, number: nextNumber });
    if (!nextQuestion) {
        throw new ApiError(404, 'Next question not found');
    }

    let previousQuestion = null;
    if (interview.currentQuestionNumber > 0) {
        previousQuestion = await Question.findOne({
            interviewId: interview._id,
            number: interview.currentQuestionNumber,
        });
    }

    const resume = await Resume.findById(interview.resumeId);

    const { systemPrompt, userPrompt } = buildTransitionPrompt({
        previousQuestion,
        nextQuestion,
        resume,
        isFirst: nextNumber === 1,
    });
    const aiTransition = await callAIJson(systemPrompt, userPrompt);

    nextQuestion.status = 'asked';
    await nextQuestion.save();

    interview.currentQuestionNumber = nextNumber;
    interview.questionsAsked += 1;
    if (interview.status === 'created') {
        interview.status = 'in_progress';
        interview.startedAt = new Date();
    }
    await interview.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                full_context: aiTransition.full_context,
                question: aiTransition.question || nextQuestion.simplifiedQuestion,
                questionNumber: nextQuestion.number,
                totalQuestions: interview.maxQuestions,
                section: nextQuestion.section,
            },
            'Question sent to candidate'
        )
    );
});


const getCandidateResponses = asyncHandler(async (req, res, next) => {
    const { interviewId } = req.params;
    const { message } = req.body;

    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
        throw new ApiError(400, 'Invalid interviewId');
    }
    if (!message || typeof message !== 'string' || !message.trim()) {
        throw new ApiError(400, 'message is required');
    }

    const interview = await Interview.findById(interviewId);
    if (!interview) {
        throw new ApiError(404, 'Interview not found');
    }

    if (interview.currentQuestionNumber === 0) {
        throw new ApiError(400, 'No question has been sent to the candidate yet');
    }

    const currentQuestion = await Question.findOne({
        interviewId: interview._id,
        number: interview.currentQuestionNumber,
    });
    if (!currentQuestion) {
        throw new ApiError(404, 'Current question not found');
    }

    if (currentQuestion.status === 'answered' || currentQuestion.status === 'skipped') {
        throw new ApiError(400, 'This question has already been resolved. Request the next question.');
    }

    const intentPrompt = buildIntentClassificationPrompt(currentQuestion.question, message);
    const intentResult = await callAIJson(intentPrompt.systemPrompt, intentPrompt.userPrompt);
    const intent = intentResult?.intent;

    if (intent === 'explain') {
        const explainPrompt = buildExplainPrompt(currentQuestion);
        const explanation = await callAIJson(explainPrompt.systemPrompt, explainPrompt.userPrompt);

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    type: 'explain',
                    explanation: explanation.explanation,
                    question: currentQuestion.simplifiedQuestion,
                },
                'Question explained'
            )
        );
    }

    if (intent === 'skip') {
        currentQuestion.status = 'skipped';
        await currentQuestion.save();

        interview.questionsSkipped += 1;
        await interview.save();

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    type: 'skip',
                    message: "No problem, we'll skip this one.",
                },
                'Question skipped'
            )
        );
    }

    const resume = await Resume.findById(interview.resumeId);

    const evalPrompt = buildAnswerEvaluationPrompt({
        question: currentQuestion,
        answer: message,
        resume,
    });
    const evaluation = await callAIJson(evalPrompt.systemPrompt, evalPrompt.userPrompt);

    currentQuestion.answer = message;
    currentQuestion.status = 'answered';
    currentQuestion.evaluation = {
        score: evaluation.score,
        relevance: evaluation.relevance,
        technicalAccuracy: evaluation.technicalAccuracy,
        clarity: evaluation.clarity,
        strengths: Array.isArray(evaluation.strengths) ? evaluation.strengths : [],
        weaknesses: Array.isArray(evaluation.weaknesses) ? evaluation.weaknesses : [],
        missingPoints: Array.isArray(evaluation.missingPoints) ? evaluation.missingPoints : [],
        followUpNeeded: !!evaluation.followUpNeeded,
    };
    await currentQuestion.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                type: 'answer',
                feedback: evaluation.feedback,
                evaluation: currentQuestion.evaluation,
            },
            'Answer recorded and evaluated'
        )
    );
});


const evaluateCandidateResponses = asyncHandler(async (req, res, next) => {
    const { interviewId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
        throw new ApiError(400, 'Invalid interviewId');
    }

    const interview = await Interview.findById(interviewId);
    if (!interview) {
        throw new ApiError(404, 'Interview not found');
    }

    const questions = await Question.find({ interviewId: interview._id }).sort({ number: 1 });
    if (questions.length === 0) {
        throw new ApiError(404, 'No questions found for this interview');
    }

    const resume = await Resume.findById(interview.resumeId);

    const { systemPrompt, userPrompt } = buildFinalEvaluationPrompt({ questions, resume });
    const finalEval = await callAIJson(systemPrompt, userPrompt);

    interview.finalEvaluation = {
        overallScore: finalEval.overallScore,
        technicalScore: finalEval.technicalScore,
        communicationScore: finalEval.communicationScore,
        problemSolvingScore: finalEval.problemSolvingScore,
        resumeKnowledgeScore: finalEval.resumeKnowledgeScore,
        strengths: Array.isArray(finalEval.strengths) ? finalEval.strengths : [],
        weaknesses: Array.isArray(finalEval.weaknesses) ? finalEval.weaknesses : [],
        recommendations: Array.isArray(finalEval.recommendations) ? finalEval.recommendations : [],
        summary: finalEval.summary,
    };
    interview.status = 'completed';
    interview.completedAt = new Date();
    await interview.save();

    return res
        .status(200)
        .json(new ApiResponse(200, { interview, questions }, 'Interview evaluated successfully'));
});

export {
    generateInterviewQuestions,
    sendQuestionsToCandidate,
    getCandidateResponses,
    evaluateCandidateResponses
}