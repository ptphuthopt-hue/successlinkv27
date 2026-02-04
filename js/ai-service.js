// AI Service - Mock implementation with level-based customization

const AIService = {
    // Generate content based on user's teaching level and selected types
    async generateContent(lessonTitle, contentTypes, userPreferences) {
        // Simulate API delay
        await this._delay(2000);

        const { level, subject } = userPreferences;
        const result = {};

        // Generate each selected content type
        if (contentTypes.includes('slide')) {
            result.slides = this._generateSlides(lessonTitle, level, subject);
        }

        if (contentTypes.includes('infographic')) {
            result.infographic = this._generateInfographic(lessonTitle, level);
        }

        if (contentTypes.includes('mindmap')) {
            result.mindmap = this._generateMindmap(lessonTitle, level);
        }

        if (contentTypes.includes('quiz')) {
            result.quiz = this._generateQuiz(lessonTitle, level, subject);
        }

        return result;
    },

    // Generate slides based on teaching level
    _generateSlides(title, level, subject) {
        const styleConfig = this._getStyleConfig(level);

        const slides = [
            {
                type: 'title',
                content: `<h1 style="color: ${styleConfig.primaryColor}; font-size: 3rem; margin-bottom: 1rem;">${title}</h1>
                         <p style="font-size: 1.5rem; color: #6B7280;">Môn: ${this._getSubjectName(subject)}</p>`
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

        // Add more slides based on level
        if (level === 'elementary') {
            slides.push({
                type: 'activity',
                content: `<h2 style="color: ${styleConfig.primaryColor}; margin-bottom: 1.5rem;">🎮 Hoạt động vui</h2>
                         <div style="font-size: 1.5rem; line-height: 2;">
                            <p>🌟 Trò chơi nhóm</p>
                            <p>🎨 Vẽ tranh minh họa</p>
                            <p>🎵 Hát theo nhạc</p>
                         </div>`
            });
        }

        slides.push({
            type: 'summary',
            content: `<h2 style="color: ${styleConfig.primaryColor}; margin-bottom: 1.5rem;">Tổng kết</h2>
                     <p style="font-size: 1.5rem; line-height: 2;">✅ Đã học được gì hôm nay?</p>
                     <p style="font-size: 1.25rem; color: #6B7280; margin-top: 2rem;">Cảm ơn các em đã tham gia! 👏</p>`
        });

        return slides;
    },

    // Generate infographic placeholder
    _generateInfographic(title, level) {
        return {
            url: 'https://via.placeholder.com/1200x1600/4DA8DA/FFFFFF?text=Infographic:+' + encodeURIComponent(title),
            description: `Infographic minh họa cho bài "${title}" - Phong cách ${level}`
        };
    },

    // Generate mindmap structure
    _generateMindmap(title, level) {
        const styleConfig = this._getStyleConfig(level);

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
                },
                {
                    title: 'Bài tập',
                    subbranches: ['Cơ bản', 'Nâng cao', 'Thực hành']
                }
            ],
            style: styleConfig
        };
    },

    // Generate quiz with 10 questions, 4 answers each, with explanations
    _generateQuiz(title, level, subject) {
        const questions = [];
        const questionTemplates = this._getQuestionTemplates(level);

        for (let i = 1; i <= 10; i++) {
            const template = questionTemplates[i % questionTemplates.length];
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
    },

    // Get style configuration based on teaching level
    _getStyleConfig(level) {
        const configs = {
            elementary: {
                primaryColor: '#FF6B9D',
                style: 'chibi',
                fontStyle: 'rounded',
                slideLength: 'short',
                language: 'simple',
                sampleText: 'Giải thích đơn giản, dễ hiểu với nhiều hình ảnh minh họa'
            },
            middle: {
                primaryColor: '#4DA8DA',
                style: 'modern',
                fontStyle: 'clean',
                slideLength: 'medium',
                language: 'standard',
                sampleText: 'Nội dung chuẩn chỉnh, tập trung vào kiến thức cơ bản'
            },
            high: {
                primaryColor: '#7C3AED',
                style: 'minimalist',
                fontStyle: 'professional',
                slideLength: 'detailed',
                language: 'academic',
                sampleText: 'Phân tích chuyên sâu với thuật ngữ chuyên môn'
            }
        };

        return configs[level] || configs.middle;
    },

    // Get question templates based on level
    _getQuestionTemplates(level) {
        const templates = {
            elementary: [
                {
                    prefix: 'Em hãy chọn đáp án đúng về',
                    options: ['Đáp án đúng ✓', 'Đáp án sai', 'Đáp án không chính xác', 'Đáp án chưa đủ'],
                    explanation: '💡 Giải thích: Đây là đáp án đúng vì nó phù hợp với nội dung bài học. Các em cần nhớ kỹ kiến thức này nhé!'
                },
                {
                    prefix: 'Điều nào sau đây là đúng về',
                    options: ['Hoàn toàn chính xác ✓', 'Chưa chính xác', 'Sai hoàn toàn', 'Thiếu thông tin'],
                    explanation: '🌟 Giải thích: Câu trả lời này đúng vì nó mô tả chính xác khái niệm trong bài. Hãy ghi nhớ để áp dụng nhé!'
                }
            ],
            middle: [
                {
                    prefix: 'Khái niệm nào dưới đây đúng về',
                    options: ['Định nghĩa chính xác ✓', 'Định nghĩa chưa đầy đủ', 'Định nghĩa sai', 'Định nghĩa mơ hồ'],
                    explanation: '📚 Giải thích: Đáp án A là chính xác vì nó phản ánh đúng định nghĩa trong sách giáo khoa. Các đáp án khác thiếu yếu tố quan trọng hoặc có sai sót.'
                },
                {
                    prefix: 'Đặc điểm nào sau đây thuộc về',
                    options: ['Đặc điểm cơ bản và quan trọng nhất ✓', 'Đặc điểm phụ', 'Không phải đặc điểm', 'Đặc điểm không liên quan'],
                    explanation: '🎯 Giải thích: Đây là đặc điểm cốt lõi, giúp phân biệt với các khái niệm khác. Cần nắm vững để hiểu sâu hơn về chủ đề.'
                }
            ],
            high: [
                {
                    prefix: 'Phân tích nào sau đây chính xác về',
                    options: ['Phân tích toàn diện và logic ✓', 'Phân tích thiếu cơ sở', 'Phân tích sai lệch', 'Phân tích một chiều'],
                    explanation: '🔬 Giải thích: Đáp án A đưa ra phân tích đa chiều, có cơ sở khoa học và logic chặt chẽ. Các đáp án khác hoặc thiếu tính toàn diện hoặc có sai sót về mặt lý thuyết.'
                },
                {
                    prefix: 'Trong bối cảnh nào sau đây, khái niệm về',
                    options: ['Áp dụng chính xác và hiệu quả ✓', 'Áp dụng chưa phù hợp', 'Không thể áp dụng', 'Áp dụng sai mục đích'],
                    explanation: '💼 Giải thích: Đáp án này thể hiện sự hiểu biết sâu sắc về điều kiện và ngữ cảnh áp dụng. Cần phân tích kỹ các yếu tố ảnh hưởng để đưa ra quyết định đúng đắn.'
                }
            ]
        };

        return templates[level] || templates.middle;
    },

    // Get subject name in Vietnamese
    _getSubjectName(subjectCode) {
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
    },

    // Simulate network delay
    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};
