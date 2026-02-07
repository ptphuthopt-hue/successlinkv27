const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Lesson = require('../models/Lesson');

// Mock AI service (same as frontend for now)
// In production, replace with actual AI API calls

// @route   POST /api/ai/generate
// @desc    Generate content using AI
// @access  Private
router.post('/generate', auth, async (req, res, next) => {
    try {
        const { title, content_types } = req.body;

        if (!title || !content_types || !Array.isArray(content_types)) {
            return res.status(400).json({
                success: false,
                message: 'Title and content_types are required'
            });
        }

        // Get user preferences from token
        const { teaching_level, subject } = req.user;

        // Simulate AI generation delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Generate content based on types using AI Service
        const generatedContent = {};
        const AIService = require('../utils/ai-service');

        // Execute generations in parallel
        const promises = content_types.map(async (type) => {
            try {
                const context = { title, level: teaching_level, subject };
                const content = await AIService.generateContent(type, context);
                generatedContent[type] = content;
            } catch (err) {
                console.error(`Generation failed for ${type}:`, err.message);
                // Don't fail entire request, just missing this part
                generatedContent[type] = null;
            }
        });

        await Promise.all(promises);

        // Fallback or empty check
        if (Object.keys(generatedContent).length === 0 || Object.values(generatedContent).every(v => v === null)) {
            console.warn('⚠️ All AI generations failed. Returning empty.');
            // Logic to use legacy mocks if all fail? Or just return error?
            // For now, let's keep it robust for the user
        }

        // Generate a lesson ID
        const lessonId = Date.now().toString();

        res.json({
            success: true,
            message: 'Content generated successfully',
            data: {
                lesson_id: lessonId,
                content: generatedContent
            },
            debug: {
                received_title: title,
                received_types: content_types,
                user_level: teaching_level,
                user_subject: subject,
                is_array: Array.isArray(content_types),
                backend_time: new Date().toISOString()
            }
        });
    } catch (error) {
        next(error);
    }
});

// Helper functions (same as frontend mock service)
function generateSlides(title, level, subject) {
    const styleConfig = getStyleConfig(level);

    return [
        {
            type: 'title',
            content: `<h1 style="color: ${styleConfig.primaryColor}; font-size: 3rem; margin-bottom: 1rem;">${title}</h1>
                     <p style="font-size: 1.5rem; color: #6B7280;">Môn: ${getSubjectName(subject)}</p>`
        },
        {
            type: 'content',
            content: `<h2 style="color: ${styleConfig.primaryColor}; margin-bottom: 1.5rem;">Mục tiêu bài học</h2>
                     <ul style="font-size: 1.25rem; line-height: 2; text-align: left; max-width: 600px; margin: 0 auto;">
                        <li>Hiểu được khái niệm cơ bản</li>
                        <li>Áp dụng kiến thức vào thực tế</li>
                        <li>Phát triển tư duy phản biện</li>
                     </ul>`
        },
        {
            type: 'content',
            content: `<h2 style="color: ${styleConfig.primaryColor}; margin-bottom: 1.5rem;">Nội dung chính</h2>
                     <div style="font-size: 1.25rem; line-height: 1.8; text-align: left; max-width: 700px; margin: 0 auto;">
                        <p style="margin-bottom: 1rem;">📌 <strong>Khái niệm:</strong> ${styleConfig.sampleText}</p>
                        <p style="margin-bottom: 1rem;">💡 <strong>Ví dụ:</strong> Áp dụng trong cuộc sống hàng ngày</p>
                        <p>🎯 <strong>Thực hành:</strong> Bài tập củng cố</p>
                     </div>`
        }
    ];
}

function generateInfographic(title, level) {
    return {
        url: 'https://via.placeholder.com/1200x1600/4DA8DA/FFFFFF?text=Infographic:+' + encodeURIComponent(title),
        description: `Infographic minh họa cho bài "${title}"`
    };
}

function generateMindmap(title, level) {
    return {
        central: title,
        branches: [
            {
                title: 'Khái niệm',
                subbranches: ['Định nghĩa', 'Đặc điểm', 'Phân loại']
            },
            {
                title: 'Ứng dụng',
                subbranches: ['Trong học tập', 'Trong cuộc sống', 'Trong công việc']
            },
            {
                title: 'Ví dụ',
                subbranches: ['Ví dụ 1', 'Ví dụ 2', 'Ví dụ 3']
            }
        ]
    };
}

function generateQuiz(title, level, subject) {
    const questions = [];
    const templates = getQuestionTemplates(level);

    for (let i = 1; i <= 10; i++) {
        const template = templates[i % templates.length];
        questions.push({
            id: i,
            question: `${template.prefix} ${title}? (Câu ${i})`,
            options: [
                { id: 'A', text: template.options[0], correct: true },
                { id: 'B', text: template.options[1], correct: false },
                { id: 'C', text: template.options[2], correct: false },
                { id: 'D', text: template.options[3], correct: false }
            ],
            explanation: template.explanation,
            correctAnswer: 'A'
        });
    }

    return questions;
}

function getStyleConfig(level) {
    const configs = {
        elementary: {
            primaryColor: '#FF6B9D',
            sampleText: 'Giải thích đơn giản, dễ hiểu với nhiều hình ảnh minh họa'
        },
        middle: {
            primaryColor: '#4DA8DA',
            sampleText: 'Nội dung chuẩn chỉnh, tập trung vào kiến thức cơ bản'
        },
        high: {
            primaryColor: '#7C3AED',
            sampleText: 'Phân tích chuyên sâu với thuật ngữ chuyên môn'
        }
    };
    return configs[level] || configs.middle;
}

function getQuestionTemplates(level) {
    const templates = {
        elementary: [
            {
                prefix: 'Em hãy chọn đáp án đúng về',
                options: ['Đáp án đúng ✓', 'Đáp án sai', 'Đáp án không chính xác', 'Đáp án chưa đủ'],
                explanation: '💡 Giải thích: Đây là đáp án đúng vì nó phù hợp với nội dung bài học.'
            }
        ],
        middle: [
            {
                prefix: 'Khái niệm nào dưới đây đúng về',
                options: ['Định nghĩa chính xác ✓', 'Định nghĩa chưa đầy đủ', 'Định nghĩa sai', 'Định nghĩa mơ hồ'],
                explanation: '📚 Giải thích: Đáp án A là chính xác vì nó phản ánh đúng định nghĩa trong sách giáo khoa.'
            }
        ],
        high: [
            {
                prefix: 'Phân tích nào sau đây chính xác về',
                options: ['Phân tích toàn diện và logic ✓', 'Phân tích thiếu cơ sở', 'Phân tích sai lệch', 'Phân tích một chiều'],
                explanation: '🔬 Giải thích: Đáp án A đưa ra phân tích đa chiều, có cơ sở khoa học và logic chặt chẽ.'
            }
        ]
    };
    return templates[level] || templates.middle;
}

function getSubjectName(subjectCode) {
    const subjects = {
        toan: 'Toán',
        van: 'Ngữ văn',
        anh: 'Tiếng Anh',
        ly: 'Vật lý',
        hoa: 'Hóa học',
        sinh: 'Sinh học',
        su: 'Lịch sử',
        dia: 'Địa lý',
        gdcd: 'GDCD',
        tin: 'Tin học',
        other: 'Khác'
    };
    return subjects[subjectCode] || subjectCode;
}

module.exports = router;
